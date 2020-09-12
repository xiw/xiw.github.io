---
layout: post
title: "The shifting range in RISC-V"
author: "Xi Wang"
tags: RISC-V
---

There are several commonly used RISC-V
[instruction pairs](https://arxiv.org/pdf/1607.02318.pdf)
with 32-bit immediates.
Below is an example of loading a 32-bit immediate
into a register using `lui`/`addi`:
```
lui	rd,imm[31:12]
addi	rd,rd,imm[11:0]
```
Here `lui` places
a (_sign_-extended) 20-bit immediate into register `rd`
and fills the lowest 12 bits with zeros,
and `addi` adds a _sign_-extended 12-bit immediate
to register `rd`.

**Question**: does this work for any 32-bit immediate?
It may be trickier than you think.

Clearly, on _32-bit_ systems,
this instruction pair can be used to load any 32-bit immediate
in the range [-2<sup>31</sup>, 2<sup>31</sup>-1].
For example,
to load `0x7fffff00`,
one may use `lui` with a 20-bit `0x80000` and
`addi` with a 12-bit `0xf00`,
as adding `0x8000000` and `0xffffff00` (sign-extended from `0xf00`) produces `0x7fffff00`.

How about _64-bit_ systems?
Specifically,
let's look at loading the 32-bit immediate `0x7fffff00` again.
Note that the same 20-bit and 12-bit values used on 32-bit systems won't work,
as adding `0xffffffff_8000000` (sign-extended from `0x80000000`) and
`0xffffffff_ffffff00` (sign-extended from `0xf00`) produces `0x0fffffff_f7ffff00`.
Does there exist any 20-bit and 12-bit values
that make `lui`/`addi` work on 64-bit systems?

Similar questions can be asked about other instruction pairs,
such as `lui`/`ld` for loading a value at a 32-bit address,
or `auipc`/`jalr` for jumping to a 32-bit pc-relative offset.

The short answer is _no_.
You may be interested in
the [discussion in the RISC-V ISA Dev group](https://groups.google.com/a/groups.riscv.org/forum/#!topic/isa-dev/bwWFhBnnZFQ) started by Luke Nelson,
which prompted the RISC-V ISA specification to clarify the range
in the "RV64I Base Integer Instruction Set" chapter:

> Note that the set of address offsets that can be formed by pairing
> LUI with LD, AUIPC with JALR, etc. in RV64I is
> [−2<sup>31</sup>−2<sup>11</sup>, 2<sup>31</sup>−2<sup>11</sup>−1].

In other words,
the 32-bit range reachable by such instruction pairs
in 64-bit RISC-V is shifted by -2<sup>11</sup>
from [-2<sup>31</sup>, 2<sup>31</sup>-1].
Therefore, `0x7fffff00` doesn't fall in the range.

Intuitively, the shifting is caused by the choice of the
sign extension of immediates in the RISC-V ISA.
See examples of issues
reported in [coreboot](https://blogs.coreboot.org/blog/2016/06/13/gsoc-better-risc-v-support-week-3/)
and [the BPF JIT for RV64 in the Linux kernel](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=489553dd13a88d8a882db10622ba8b9b58582ce4),
as well as our upcoming [Jitterbug paper](https://unsat.cs.washington.edu/papers/#nelson:jitterbug).

To check the correctness of the range,
I wrote a simple [Rosette](https://emina.github.io/rosette/) program,
as follows:

```racket
#lang rosette

; integer register width in bits
(define XLEN 64)

; symbolic 20-bit and 12-bit values
(define-symbolic imm20 (bitvector 20))
(define-symbolic imm12 (bitvector 12))

; mimic the result of an instruction pair
(define v (bvadd (sign-extend (concat imm20 (bv 0 12)) (bitvector XLEN))
                 (sign-extend imm12 (bitvector XLEN))))

; lower and upper bounds
(define-symbolic lower upper (bitvector XLEN))

; find the lower and upper bounds via optimization
(optimize #:maximize (list lower)
          #:minimize (list upper)
          #:guarantee (assert (forall (list imm12 imm20)
                                      (&& (bvsge v lower)
                                          (bvsle v upper)))))
```

Rosette invokes the [Z3 SMT solver](https://rise4fun.com/Z3/tutorial/optimization)
to find the lower and upper bounds of the reachable range
(you may also use SMT or the Z3 API directly).
The output of the above program is:

```
(model
 [lower (bv #xffffffff7ffff800 64)]
 [upper (bv #x000000007ffff7ff 64)])
```

This is consistent with the clarification in the RISC-V ISA specification.

Exercise:
if you were asked to make one change in the 64-bit RISC-V ISA
(e.g., the semantics of an instruction)
to make the range remain
[-2<sup>31</sup>, 2<sup>31</sup>-1],
what would you do?
The above Rosette program may be helpful.
You may also want to check the `addiw` instruction.

**Acknowledgments**: James Bornholt, Luke Nelson, and Emina Torlak
provided feedback on a draft of this post.
