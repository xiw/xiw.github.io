---
layout: post
title: "Memory allocator security revisited"
author: "Xi Wang"
comments: true
tags: security
---
C/C++ 101:

* What does `malloc(n)` return if `n` is a big number (e.g., `-1` or `SIZE_MAX`)?
* What does `calloc(n, size)` return if `n` and `size` are big numbers?
* What does `new T[n]` return if `n` is a big number (assuming `-fno-exception`)?

I believe everyone expects the answer `NULL` for all the questions,
as `NULL` is used to indicate out of memory.
Unfortunately, in reality many memory allocators break (or used to
break) these expectations, which could lead to memory corruption and
security vulnerabilities, especially if the allocation size
can be controlled by an adversary.

Here goes a summary of some known and unknown vulnerabilities
(notably multiplication, rounding, and pointer overflows)
in popular memory allocators.


## GLIBC malloc

An infamous multiplication overflow used to exist in the `calloc`
implementation in GNU libc and Microsoft's C runtime, as detailed
in
[RUS-CERT Advisory 2002-08:02](https://seclists.org/bugtraq/2002/Aug/91).
This overflow vulnerability can be easily misused to mount buffer
overflow attacks.  It was
[fixed](http://sourceware.org/git/?p=glibc.git;a=commit;h=0950889b810736fe7ad340a13a5ecf76672e1a84)
in GLIBC in 2002.


## Hoard

I cannot find the revision log of the [Hoard](http://www.hoard.org/)
allocator, so it's hard to say what vulnerabilities it used to have.
Though it's easy to exploit the current version (3.8) via a rounding
overflow.  Below is the buggy code snippet in `tlab.h`.

```c++
// ThreadLocalAllocationBuffer::malloc(size_t sz)
sz = align (sz); // (sz + (sizeof(double) - 1)) & ~(sizeof(double) - 1);
// Get memory from the local heap,
// and deduct that amount from the local heap bytes counter.
if (sz <= LargestObject) {
  int c = getSizeClass (sz);
  void * ptr = _localHeap(c).get();
  if (ptr) {
    assert (_localHeapBytes >= sz);
    _localHeapBytes -= sz;
    assert (getSize(ptr) >= sz);
    return ptr;
  }
}
```

When `sz` is `(size_t)-1`, a big value, the `align` call overflows
and rounds `sz` up to 0.  Thus, `malloc(-1)` is basically `malloc(0)`,
which could lead to a buffer overflow.

Hoard's `calloc` implementation is also vulnerable to multiplication
overflow.  With glibc Hoard is injected via `__malloc_hook`,
and its `calloc` won't be used.  However, the vulnerability can
be triggered on platforms that do not use glibc, such as Mac OS X.


## jemalloc

The [jemalloc](http://www.canonware.com/jemalloc/) allocator is
used by the libc of FreeBSD and NetBSD, as well as Mozilla Firefox.

It used to have the `calloc` multiplication overflow vulnerability.
The bug was
[fixed](http://svnweb.freebsd.org/base?view=revision&revision=161263) in 2006.

A rounding overflow bug was
[fixed](http://svnweb.freebsd.org/base?view=revision&revision=167872)
in 2007.

Another interesting signedness bug was
[fixed](http://svnweb.freebsd.org/base?diff_format=l&view=revision&revision=178645)
in 2008.  Below is the simplified code snippet in `jemalloc.c`.

```c
/* chunk_alloc_dss(size_t size) */
/* assert(size != 0);                    */
/* assert((size & chunksize_mask) == 0); */
intptr_t incr;
void *ret;

/* Get the current end of the DSS. */
dss_max = sbrk(0);

/*
 * Calculate how much padding is necessary to
 * chunk-align the end of the DSS.
 */
incr = (intptr_t)size - (intptr_t)CHUNK_ADDR2OFFSET(dss_max);
if (incr == (intptr_t)size)
    ret = dss_max;
else {
    ret = (void *)((intptr_t)dss_max + incr);
    incr += size;
}

sbrk(incr);
return (ret);
```

Note that `size` is unsigned and `incr` is signed.
When `size` is big enough,  `incr` is misinterpreted as negative
and causes the `sbrk` system call to shrink the memory.


## Bionic malloc

Bionic, the Android libc, is derived from the BSD libc.  When
`libc.debug.malloc` is set, allocation calls will be rerouted to
its own debugging library.

Again, the debugging library had `calloc` multiplication overflows
([CVE-2009-0607](http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2009-0607)).

Also, its `malloc` implementation still has multiple rounding
overflows, at least in in `chk_malloc` and `leak_malloc`.

Hope that no production phone ships the debugging library.


## TCMalloc

Google's [TCMalloc](http://goog-perftools.sourceforge.net/doc/tcmalloc.html)
repeated the `calloc` multiplication overflow bug and got it
[fixed](http://code.google.com/p/gperftools/source/detail?r=15&path=/trunk/src/tcmalloc.cc)
in 2005.

I didn't spot any serious rounding issues in TCMalloc,
but just a slip in `ReportLargeAlloc`:
the error message says "tcmalloc: large alloc _0_ bytes == (nil)"
given `malloc(-1)`, because the size to be output overflows.


## APR pool

[APR pool](http://apr.apache.org/docs/apr/group__apr__pools.html) is
developed for the Apache web server.  It is also adopted by other
projects such as Subversion.  The interface is similar to
allocate-and-free allocators, but takes one extra parameter specifying
which pool to allocate from.

APR pool had a series of interesting pointer arithmetic fixes,
listed as follows.

In Aug 2002, the sanity check `p + size < q` was
[changed](http://svn.apache.org/viewvc?view=revision&revision=63806)
to `size < q - p`, where
the two pointers `p` (i.e., `node->first_evail`) and `q` (i.e.,
`node->endp`) point to the start and the end of a memory block,
respectively.

``` diff r63806 http://svn.apache.org/viewvc/apr/apr/trunk/memory/unix/apr_pools.c?r1=63806&r2=63805
-    endp = node->first_avail + size;
-    if (endp < node->endp) {
+    if (size < node->endp - node->first_avail) { 
```
Over a month later (Sep 2002), the check was
[reverted](http://svn.apache.org/viewvc?view=revision&revision=63887)
to `p + size < q`.

```diff
-    if (size < node->endp - node->first_avail) {
+    if (node->first_avail + size < node->endp) {
```

One week later (Oct 2002), the check was again
[changed](http://svn.apache.org/viewvc?view=revision&revision=63894)
to `size < q - p`.

```diff
-    if (node->first_avail + size < node->endp) {
+    if (size < (apr_size_t)(node->endp - node->first_avail)) {
```

After over five years (Apr 2008), the check was
[revised](http://svn.apache.org/viewvc?view=revision&revision=645436)
to `size <= q - p` with an off-by-one fix.

```diff
+/* Returns the amount of free space in the given node. */
+#define node_free_space(node_) ((apr_size_t)(node_->endp - node_->first_avail))
...
-    if (size < (apr_size_t)(node->endp - node->first_avail)) {
+    if (size <= node_free_space(node)) {
```

Here `p + size < q` is more dangerous than `size < q - p`.  One obvious
reason is that `p + size` could wrap around to a small pointer given
a big `size`, while the latter check doesn't have the pointer
overflow issue.

But how about adding a wrap check `p + size < p`?  A subtle
problem is that pointer overflow (or more precisely, out-of-bounds
pointer) is undefined in C, which means that the compiler can do
anything to the wrap check `p + size < p`, such as optimizing it
away ([VU#162289](http://www.kb.cert.org/vuls/id/162289)).
I tried to compile the wrap check using GCC 4.6 and Clang 3.0 on x86:
it's optimized as extracting the sign of `size`, without even looking
at the value of `p`.

```nasm
movl	8(%esp), %eax
shrl	$31, %eax
ret
```

The size rounding vulnerability was also discovered and fixed in APR pool
([CVE-2009-2412](http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2009-2412))
in 2009.


## boost::pool

[Boost Pool](http://www.boost.org/libs/pool/) has the multiplication overflow
issue in its `ordered_malloc` implementation.

``` c++
template <typename UserAllocator>
void * pool<UserAllocator>::ordered_malloc(const size_type n)
{
  const size_type partition_size = alloc_size();
  const size_type total_req_size = n * requested_size;
  const size_type num_chunks = total_req_size / partition_size +
      ((total_req_size % partition_size) ? true : false);

  void * ret = store().malloc_n(num_chunks, partition_size);
  ...
]
```

We can see that `total_req_size` may wrap around to a small number
given a big `n`.


## Boehm GC

[Boehm GC](http://www.hpl.hp.com/personal/Hans_Boehm/gc/) is probably
the most popular open-source garbage collector.  It provides C
allocation calls and overloads the C++ `new` operator.

Boehm GC's `calloc` implementation, in both `malloc.c` and its
[documentation](http://www.hpl.hp.com/personal/Hans_Boehm/gc/leak.html),
simply redirects `calloc(n, size)` to `GC_MALLOC((n) * (size))`,
thus is vulnerable to multiplication overflow.

It also has the size rounding vulnerability, so `GC_MALLOC(-1)`
doesn't return a null pointer either.


## Safe by Design

Some allocators are designed to be used in "safe"
environment.  For example, LLVM's `BumpPtrAllocator`
doesn't consider out-of-memory or overflow issues.

[kLIBC](http://git.kernel.org/?p=libs/klibc/klibc.git;a=blob;f=usr/klibc/calloc.c;hb=HEAD) is another example.

```c
/* FIXME: This should look for multiplication overflow */

void *calloc(size_t nmemb, size_t size)
{
	void *ptr;

	size *= nmemb;
	ptr = malloc(size);
	if (ptr)
		memset(ptr, 0, size);

	return ptr;
}
```

## Compiler

The C++ array allocation `new T[n]` has a potential integer overflow
vulnerability if `n` is not limited correctly, which could lead to
a buffer overflow.  This is similar to `calloc(n, sizeof(T))`.

The code generated by GCC simply calculates the
allocation size as `n * sizeof(T)` without any overflow checks,
though GCC developers have been
[discussing the problem](http://gcc.gnu.org/bugzilla/show_bug.cgi?id=19351)
for a long time.

Clang
[generates "safe" code](http://blog.llvm.org/2011/05/what-every-c-programmer-should-know_21.html)
that defends against integer overflow attacks, via setting the
allocation size to -1 if any multiplication overflow happens.  This
implies an assumption that the underlying allocator must return a
null pointer given a large size.  As we have seen, this assumption
doesn't hold well in practice.
