---
layout: post
title: "Overflow builtins"
date: 2012-03-19 02:11
comments: true
tags: clang security
---
Since it's non-trivial to do integer overflow checking correctly
and efficiently (see my
[email to cfe-dev](http://lists.cs.uiuc.edu/pipermail/cfe-dev/2012-March/020246.html)
and [previous post]({{page.previous.url}}) on libo),
let's try compiler support.  Just gave it a shot in Clang.
My patch is available on the
[builtin-overflow branch](https://github.com/xiw/clang/tree/builtin-overflow).
It introduces `bool __overflow_*(T *, T, T)` builtin functions,
which are easier to understand, less error-prone, and have better
performance (e.g., only one more `jno` instruction on x86 for most cases).
Here is an example.

``` c
void *malloc_array(size_t n, size_t size)
{
	size_t bytes;
	if (__overflow_umul(&bytes, n, size))
		return NULL;
	return malloc(bytes);
}
```

One more example: signed addition overflow detection mentioned
in the [previous post]({{page.previous.url}}).  Below is the
implementation from CERT's IntegerLib.

``` c
signed long addsl(signed long lhs, signed long rhs)
{
	errno = 0;
	if( (((lhs+rhs)^lhs)&((lhs+rhs)^rhs)) >> (sizeof(int)*CHAR_BIT-1) ) {
		error_handler("OVERFLOW ERROR", NULL, EOVERFLOW);
		errno = EINVAL;
	}
	return lhs+rhs;
}
```

Anything suspicious?  Despite the clever bit trick, the code is
undefined because signed overflow can happen before the check.
It also doesn't work on 64-bit platform: `sizeof(int)` should be
`sizeof(long)`.  But now you can simply write `__overflow_sadd`,
without worrying about undefined behavior nor performance.

Interested in overflow builtins, found any bugs,
or got better ideas about the interface and function names?
Leave your comments or join the discussions at
[bugzilla](http://llvm.org/bugs/show_bug.cgi?id=12290)
and [cfe-dev](http://lists.cs.uiuc.edu/pipermail/cfe-dev/2012-March/020246.html).
