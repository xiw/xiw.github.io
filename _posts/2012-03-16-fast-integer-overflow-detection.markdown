---
layout: post
title: "Fast integer overflow detection"
comments: true
tags: security
keywords: libo
---

Writing efficient overflow checks in C is very challenging
(but good brain exercise).  Even libraries written by security
experts, such as Microsoft's SafeInt and CERT's IntegerLib, could
contain [broken overflow checks](http://blog.regehr.org/archives/593).

For another example, I have seen a lot of bit tricks for detecting
`int` + `int` overflow, many of which are actually questionable
because they rely on undefined behavior.  At C-language level one
cannot compute the signed addition first before overflow checking
since signed integer overflow is undefined.  Guess what C compilers
would do to the following code.

``` c
int sum(int a, int b)
{
	int c;
	assert(a >= 0);
	assert(b >= 0);
	c = a + b; /* both a and b are non-negative */
	if (c < 0) /* overflow? */
		abort();
	return c;
}
```

GCC will optimize away the check `c < 0`, while Clang keeps
it.  You may try another (broken) form `c < a`:
this time GCC keeps the check, while Clang removes it.

I am proposing an overflow detection library,
[libo](https://github.com/xiw/libo).
Unlike previous ones, it consists of assembly code, and due to the
fact that I am lazy, the assembly code is generated automatically
from a short program.

Let's start with a simple task: writing an array allocator
`malloc_array(n, size)`, where `n` is the number of elements
and `size` is the element size
(i.e., the non-zeroing version of `calloc`).

Here's a popular way.

``` c
void *malloc_array(size_t n, size_t size)
{
	if (size && n > SIZE_MAX / size)
		return NULL;
	return malloc(n * size);
}
```

Unfortunately neither GCC nor Clang is able to optimize away the
division (dunno why though; looks like a straightforward transformation).

```nasm
malloc_array:                           # @malloc_array
	.cfi_startproc
# BB#0:                                 # %entry
	testq	%rsi, %rsi
	je	.LBB0_3
# BB#1:                                 # %land.rhs
	movq	$-1, %rax
	xorl	%edx, %edx
	divq	%rsi
	cmpq	%rdi, %rax
	jae	.LBB0_3
# BB#2:                                 # %return
	xorl	%eax, %eax
	ret
.LBB0_3:                                # %if.end
	imulq	%rdi, %rsi
	movq	%rsi, %rdi
	jmp	malloc                  # TAILCALL
.Ltmp0:
	.size	malloc_array, .Ltmp0-malloc_array
	.cfi_endproc
```

If you are crazy about performance, try this
[trick](https://github.com/ivmai/bdwgc/commit/83231d0ab5ed60015797c3d1ad9056295ac3b2bb)
from the Boehm GC guys.

``` c
#define SQRT_SIZE_MAX ((1U << (sizeof(size_t) * 8 / 2)) - 1)

	if ((size | n) > SQRT_SIZE_MAX /* fast test */
	    && size && n > SIZE_MAX / size)
		return NULL;
```

Another way is to promote the integer operation to a wider type,
such as 128-bit (assuming `size_t` is 64-bit); just don't
[forget to do the type cast before multiplication](http://git.kernel.org/linus/8a783896).
I am not sure how portable this is.  The
[grsecurity](http://grsecurity.net/) patch uses something similar
to modify `kmalloc`.

``` c
void *malloc_array(size_t n, size_t size)
{
	__uint128_t bytes = (__uint128_t)n * (__uint128_t)bytes;
	if (bytes > SIZE_MAX)
		return NULL;
	return malloc((size_t)bytes);
}
```

With the new libo, `malloc_array` could be implemented as follows.

``` c
void *malloc_array(size_t n, size_t size)
{
	size_t bytes;
	if (umuloz(n, size, &bytes))
		return NULL;
	return malloc(bytes);
}
```

With link-time optimization, Clang produces very nice code:
compared to the baseline code (without overflow checking),
it has only one more `jno`.

```nasm
malloc_array:                           # @malloc_array
	.cfi_startproc
# BB#0:                                 # %entry
	movq	%rdi, %rax
	mulq	%rsi
	jno	.LBB0_2
# BB#1:                                 # %return
	xorl	%eax, %eax
	ret
.LBB0_2:                                # %if.end
	movq	%rax, %rdi
	jmp	malloc                  # TAILCALL
.Ltmp0:
	.size	malloc_array, .Ltmp0-malloc_array
	.cfi_endproc
```

Here is the trick.  LLVM internally supports
[arithmetic with overflow operations](http://llvm.org/docs/LangRef.html#int_overflow),
based on which the libo generator builds up functions like this:

``` llvm
define i32 @umulo64(i64, i64, i64*) alwaysinline {
entry:
  %3 = call { i64, i1 } @llvm.umul.with.overflow.i64(i64 %0, i64 %1)
  %4 = extractvalue { i64, i1 } %3, 0
  store i64 %4, i64* %2
  %5 = extractvalue { i64, i1 } %3, 1
  %6 = sext i1 %5 to i32
  ret i32 %6
}
```

To use libo with Clang (and link-time optimization), one can just
use the IR.  To use libo with GCC, one can invoke LLVM's backends
to generate assembly.  Assuming LLVM is implemented correctly, we
get a correct and efficient libo implementation for all architectures
LLVM supports.

One downside is that it may be difficult to do link-time optimization
when using GCC; this would end up with having a call to `umulo64`,
rather than inlining it.  How to "inline" a function purely written
in assembly code using GCC?  Or is it possible to have LLVM generate
inline assembly instead?  Of course it would be nicer if compilers
provide built-in functions for overflow detection.
