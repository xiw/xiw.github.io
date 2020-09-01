---
layout: post
title: "More randomness or less"
comments: true
tags: security optimization
keywords: "srandomdev, uninitialized memory, undefined behavior"
---
[CVE-2008-0166](http://www.debian.org/security/2008/dsa-1571)
is an infamous example of using uninitialized memory for random
number generation.  A Debian maintainer commented out
[two lines of code](http://anonscm.debian.org/viewvc/pkg-openssl/openssl/trunk/rand/md_rand.c?r1=140&r2=141&pathrev=141)
to silence Valgrind, which complained about the uses of uninitialized
memory as a "bonus" source of entropy, and this change caused
OpenSSL to generate bogus keys on Debian-based systems.

Actually, using uninitialized memory has always been a very bad
idea, not only because it confuses developers and tools like Valgrind,
but because a smart C compiler will kick you in the teeth.  Here is
one example in FreeBSD and Mac OS X libc.

The [`srandomdev()` function](http://svnweb.freebsd.org/base/head/lib/libc/stdlib/random.c?revision=165903&view=markup#l286) is used to seed `random()`, according
to its manpage, "suitable for cryptographic use."  It first
tries `/dev/random`, which is non-blocking on FreeBSD and Mac OS X;
if that fails, it falls back to using current time and pid, with
some amazing extra bits.

```c
struct timeval tv;
unsigned long junk;

gettimeofday(&tv, NULL);
srandom((getpid() << 16) ^ tv.tv_sec ^ tv.tv_usec ^ junk);
```

You can see that the seed is computed using results from `gettimeofday()`
and `getpid()`, mixed with the value of an uninitialized stack
variable `junk`.  Here's the corresponding assembly code (`/usr/lib/libSystem.B.dylib`)
from Mac OS X 10.6 (Snow Leopard).

```nasm
leaq    0xe0(%rbp),%rdi
xorl    %esi,%esi
callq   0x001422ca      ; symbol stub for: _gettimeofday
callq   0x00142270      ; symbol stub for: _getpid
movq    0xe0(%rbp),%rdx
movl    0xe8(%rbp),%edi
xorl    %edx,%edi
shll    $0x10,%eax
xorl    %eax,%edi
xorl    %ebx,%edi
callq   0x00142d68      ; symbol stub for: _srandom
```

Everything looks good so far.

Now let's look at the same code
(`/usr/lib/system/libsystem_c.dylib`)
from 10.7 (Lion) and 10.8 (Mountain Lion).

```nasm
leaq    0xd8(%rbp),%rdi
xorl    %esi,%esi
callq   0x000a427e      ; symbol stub for: _gettimeofday
callq   0x000a3882      ; symbol stub for: _getpid
callq   0x000a4752      ; symbol stub for: _srandom
```

Wait, the entire seed computation is gone!  The results of
`gettimeofday()` and `getpid()` are not used at all; `srandom()`
is called with some "garbage" value.

I guess Apple has switched from GCC to LLVM for compiling libc in
newer Mac OS X.  Since the C code contains undefined behavior, the
use of uninitialized variable `junk`, LLVM optimizes away the
computation more aggressively.  You should see the same assembly
if compiling FreeBSD using LLVM.

There are several interesting questions to explore.

- Is it possible to trigger this by somehow failing `/dev/random`
on FreeBSD and Mac OS X?

- How random is the `srandom()` seed now compiled using
LLVM, which is just the value of `%edi`?  Looks like it's the
lower 32 bits of the address of the stack variable `tv`.

- Does GCC generate "correct" code?  Probably not.  The
last `xorl` instruction uses `%ebx`, which is unlikely to correspond
to the value of `junk` but the file descriptor of `/dev/random`.

```nasm
movl    %ebx,%edi
callq   0x00141d48      ; symbol stub for: _close$NOCANCEL
```

In short, just don't use uninitialized memory for more randomness.

The use of `junk`
[was introduced](http://svnweb.freebsd.org/base/head/lib/libc/stdlib/random.c?r1=26665&r2=26664&pathrev=26665)
in 1997.  Google shows a bunch of similar usages and fixes.

- `sranddev()` shares the [same fall-back code](http://svnweb.freebsd.org/base/head/lib/libc/stdlib/rand.c?revision=174541&view=markup#l111).

- DragonFly BSD developers
[added comments](http://gitweb.dragonflybsd.org/dragonfly.git/commitdiff/8ad9d800f127f035a32004f8ba2b90bc63b527fc)
"XXX left uninitialized on purpose" for `junk`.

- OpenBSD developers
[removed the code](http://www.openbsd.org/cgi-bin/cvsweb/src/lib/libc/stdlib/random.c.diff?r1=1.14;r2=1.15;f=h)
in 2005.

- Varnish developers [fixed a similar usage](https://www.varnish-cache.org/trac/changeset/51b5e0be21c8f82110c9de0624524fccd570a600), though the code is still being
[used by others](https://github.com/servalproject/serval-dna/blob/1eb4c34015b69675832d450348421b9b6b13ce07/srandomdev.c#L63).
BTW, you can find an interesting comparison `fd >= 0` there, where `fd` is a pointer!
