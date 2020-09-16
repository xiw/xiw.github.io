---
layout: post
title: "Automated geometry bashing"
author: "Xi Wang"
tags: geometry
cindy: true
latex: true
highlight: [maxima, maxima-console]
---

The [IMO Grand Challenge] aims to "build an AI that can win a gold
medal in the (International Mathematical Olympiad) competition."
Geometry problems are an attractive target
(e.g., see [this MathOverflow discussion](https://mathoverflow.net/questions/337558/automatically-solving-olympiad-geometry-problems) or
[this Lean's Zulip stream](https://leanprover-community.github.io/archive/stream/208328-IMO-grand-challenge/)),
given the rich literature on
[automated theorem proving in geometry](http://www.mat.uc.pt/~pedro/cientificos/presentationUrbino2019.pdf).

Olympiad participants have long been using well-known _computational_ techniques
(i.e., "bashing") to solve geometry problems, such as complex numbers or barycentric coordinates.
How much can we automate these techniques?
As a case study,
I write programs to solve the two geometry problems in [IMO 2019].
For this post, I use [Maxima], a computer algebra system
(easy to install via apt-get on Debian/Ubuntu or Homebrew on macOS).
The focus is to explore how to encode these geometry problems such that
they can be solved by Maxima within a reasonable amount of time.

NB: I also tried several SMT solvers that support
[nonlinear real arithmetic](https://smt-comp.github.io/2020/results/qf-nra-single-query).
I was able to prove [Napoleon's theorem][] (the first example below),
but not the other two IMO 2019 problems (with a 30-minute timeout).
If you have success in finding the right SMT encodings, please let me know!


## Complex numbers

There are many good notes on encoding geometry problems using complex numbers.
Search for "complex bashing" or refer to Evan Chen's
"[Bashing Geometry with Complex Numbers](https://web.evanchen.cc/handouts/cmplx/en-cmplx.pdf)".
The high-level idea is to represent each point with Cartesian coordinate $$(x, y)$$
as complex number $$z = x + yi$$. This often leads to simpler calculation.

The rest of the post uses $$a$$ (in lower case) to denote
the complex number of the corresponding point $$A$$ (in upper case).
Below are a few examples.
- The reflection of point $$A$$ over the real axis is:
  $$\overline{a}$$ (i.e., the conjugate of $$a$$).
- The rotation of point $$A$$ about point $$B$$ by counterclockwise angle $$\theta$$ is:
  $$(a - b) \exp(i\theta) + b$$.
- The centroid of triangle $$ABC$$ is:
  $${(a + b + c)}/{3}$$.

See the file [geometry.mac] for more results (e.g., collinearity, concyclicity, and intersection)
coded up in Maxima, which will be used for later proofs.

As a simple example, let's prove [Napoleon's theorem]:
the centers of equilateral triangles constructed outward on the sides of a triangle
form an equilateral triangle (known as the _outer Napoleon triangle_).

<p>
<div id="napoleon" title="Napoleon's theorem" class="cindy-canvas"></div>
</p>

<script type="text/javascript">
CindyJS({
  ports: [{id: "napoleon"}],
  defaultAppearance: defaultAppearance,
  geometry: [
    {name: "A", type: "Free", pos: [ 1,  3], color: [1, 1, 1], labeled: true, printname: "$A$"},
    {name: "B", type: "Free", pos: [-1, -3], color: [1, 1, 1], labeled: true, printname: "$B$"},
    {name: "C", type: "Free", pos: [ 5, -3], color: [1, 1, 1], labeled: true, printname: "$C$"},
    {name: "BC", type: "Segment", args: ["B", "C"]},
    {name: "CA", type: "Segment", args: ["C", "A"]},
    {name: "AB", type: "Segment", args: ["A", "B"]},
    {name: "l_BL", type: "LineByFixedAngle", angle: -60 * Math.PI / 180, args: ["BC", "B"], visible: false},
    {name: "l_CL", type: "LineByFixedAngle", angle:  60 * Math.PI / 180, args: ["BC", "C"], visible: false},
    {name: "L", type: "Meet", args: ["l_BL", "l_CL"], labeled: true, printname: "$M_1$"},
    {name: "BL", type: "Segment", args: ["B", "L"]},
    {name: "CL", type: "Segment", args: ["C", "L"]},
    {name: "c_BCL", type: "CircleBy3", args: ["B", "C", "L"], visible: false},
    {name: "D", type: "CenterOfConic", args: ["c_BCL"], labeled: true, printname: "$N_1$"},
    {name: "l_CM", type: "LineByFixedAngle", angle: -60 * Math.PI / 180, args: ["CA", "C"], visible: false},
    {name: "l_AM", type: "LineByFixedAngle", angle:  60 * Math.PI / 180, args: ["CA", "A"], visible: false},
    {name: "M", type: "Meet", args: ["l_CM", "l_AM"], labeled: true, printname: "$M_2$"},
    {name: "CM", type: "Segment", args: ["C", "M"]},
    {name: "AM", type: "Segment", args: ["A", "M"]},
    {name: "c_CAM", type: "CircleBy3", args: ["C", "A", "M"], visible: false},
    {name: "E", type: "CenterOfConic", args: ["c_CAM"], labeled: true, printname: "$N_2$"},
    {name: "l_AN", type: "LineByFixedAngle", angle: -60 * Math.PI / 180, args: ["AB", "A"], visible: false},
    {name: "l_BN", type: "LineByFixedAngle", angle:  60 * Math.PI / 180, args: ["AB", "B"], visible: false},
    {name: "N", type: "Meet", args: ["l_AN", "l_BN"], labeled: true, printname: "$M_3$"},
    {name: "AN", type: "Segment", args: ["A", "N"]},
    {name: "BN", type: "Segment", args: ["B", "N"]},
    {name: "c_ABN", type: "CircleBy3", args: ["A", "B", "N"], visible: false},
    {name: "F", type: "CenterOfConic", args: ["c_ABN"], labeled: true, printname: "$N_3$"},
    {name: "DEF", type: "Poly", fillcolor: [0, 1, 0], fillalpha: 0.5, args: ["D", "E", "F"], alpha: 0.2}
  ]
});
</script>

Let's do the calculation manually first. $$A, B, C$$ are free points.

$$M_1$$ is the rotation of $$B$$ about $$C$$ by $$60\degree$$ (i.e., $$\pi/3$$):

$$m_1 = (b - c)\exp(i\pi/3) + c = \dfrac{(\sqrt{3}i + 1)b - (\sqrt{3}i - 1)c}{2}.$$

$$N_1$$ is the center (centroid) of equilateral triangle $$M_1BC$$, $$(m_1 + b + c) / 3$$.
Therefore, we have:

$$n_1 = \dfrac{(\sqrt{3}i + 3)b - (\sqrt{3}i - 3)c}{6}.$$

Similarly,

$$\begin{aligned}
n_2 & = \dfrac{(\sqrt{3}i + 3)c - (\sqrt{3}i - 3)a}{6} \\
n_3 & = \dfrac{(\sqrt{3}i + 3)a - (\sqrt{3}i - 3)b}{6}.
\end{aligned}$$

With all the points calculated, it's straightforward to show that triangle $$N_1N_2N_3$$ is
equilateral using any of the following encodings for equilaterality:
- $$(n_3 - n_2)\exp(i\pi/3) + n_2 = n_1$$,
- $$\lvert n_1 - n_2\rvert = \lvert n_2 - n_3\rvert = \lvert n_3 - n_1\rvert$$,
- $$n_1^2 + n_2^2 + n_3^2 = n_1n_2 + n_2n_3 + n_3n_1$$ (see [proof](https://proofwiki.org/wiki/Vertices_of_Equilateral_Triangle_in_Complex_Plane)).

Now let's automate the calculation using the following Maxima program:

```maxima
load("geometry.mac");
  
/* Declare triangle ABC. */
declare([a, b, c], complex);

/* Compute the outer Napoleon triangle. */
p(x, y) := centroid(x, y, rotate(x, y, %pi/3));
[n1, n2, n3] : [p(b, c), p(c, a), p(a, b)];

/* Prove that the outer Napoleon triangle is equilateral. */
prove(equilateral(n1, n2, n3));

quit();
```

The `prove` function (defined in [geometry.mac]) calls
Maxima's built-in `is` function to determine whether a predicate is _provably_ true.
Below is the execution trace of this program:
```maxima-console
% maxima -b napoleon.mac
Maxima 5.44.0 http://maxima.sourceforge.net
using Lisp SBCL 2.0.5
Distributed under the GNU Public License. See the file COPYING.
Dedicated to the memory of William Schelter.
The function bug_report() provides bug reporting information.
(%i1) batch("napoleon.mac")

read and interpret napoleon.mac
(%i2) load("geometry.mac")
(%o2)                             geometry.mac
(%i3) declare([a,b,c],complex)
(%o3)                                done
(%i4) p(x,y):=centroid(x,y,rotate(x,y,%pi/3))
                                                        %pi
(%o4)            p(x, y) := centroid(x, y, rotate(x, y, ---))
                                                         3
(%i5) [n1,n2,n3]:[p(b,c),p(c,a),p(a,b)]
              sqrt(3) %i   1                sqrt(3) %i   1
       2 c + (---------- + -) (b - c) + b  (---------- + -) (c - a) + c + 2 a
                  2        2                    2        2
(%o5) [----------------------------------, ----------------------------------, 
                       3                                   3
                                                   sqrt(3) %i   1
                                            2 b + (---------- + -) (a - b) + a
                                                       2        2
                                            ----------------------------------]
                                                            3
(%i6) prove(equilateral(n1,n2,n3))
(%o6)                                true
(%i7) quit()
```

If we attempt to prove something false, such as $$N_1N_2C$$ equilateral,
the execution fails:

```maxima-console
(%i6) prove(equilateral(n1,n2,c))
prove(equilateral(n1,n2,c))
Unable to evaluate predicate errexp1
...
 -- an error. To debug this try: debugmode(true);
```

**Exercise 1**: Extend the above program to prove that the center of
the outer Napoleon triangle $$N_1N_2N_3$$ corresponds to the centroid
of triangle $$ABC$$.

**Exercise 2**: Prove Napoleon’s theorem using an SMT solver or Gröbner bases.

- For SMT, you may find Leonardo de Moura's
"[Complex Numbers in Z3](https://leodemoura.github.io/blog/2013/01/26/complex.html)" useful.
To make the code work in Python 3,
change `__div__` to `__truediv__` and `__rdiv__` to `__rtruediv__`.

- For Gröbner bases, you may find Dan Roozemond's
"[Gröbner Bases in Practice](http://magma.maths.usyd.edu.au/~danr/site/pubs/0310ProvingCinderella.pdf)"
chapter useful.  The paper uses the <span style="font-variant:small-caps;">[Singular]</span>
computer algebra system.  [Maxima] and [SymPy] should also work.


## IMO 2019, problem 2

In triangle $$ABC$$, point $$A_1$$ lies on side $$BC$$ and
point $$B_1$$ lies on side $$AC$$.
Let $$P$$ and $$Q$$ be points on segments $$AA_1$$ and $$BB_1$$, respectively,
such that $$PQ$$ is parallel to $$AB$$.
Let $$P_1$$ be a point on line $$PB_1$$, such that $$B_1$$ lies strictly between
$$P$$ and $$P_1$$, and $$\angle PP_1C = \angle BAC$$.
Similarly, let $$Q_1$$ be a point on line $$QA_1$$, such that $$A_1$$ lies strictly between
$$Q$$ and $$Q_1$$, and $$\angle CQ_1Q = \angle CBA$$.

Prove that points $$P$$, $$Q$$, $$P_1$$, and $$Q_1$$ are concyclic.

<p>
<div id="imo2019p2" title="IMO 2019, problem 2" class="cindy-canvas"></div>
</p>

<script type="text/javascript">
CindyJS({
  ports: [{id: "imo2019p2"}],
  defaultAppearance: defaultAppearance,
  geometry: [
    // ABC
    {name: "A", type: "Free", pos: [-4, -8], color: [1, 1, 1], labeled: true, printname: "$A$"},
    {name: "B", type: "Free", pos: [ 8, -8], color: [1, 1, 1], labeled: true, printname: "$B$"},
    {name: "C", type: "Free", pos: [ 1,  0], color: [1, 1, 1], labeled: true, printname: "$C$"},
    {name: "c0", type: "ArcBy3", args: ["B", "C", "A"], visible: false},
    {name: "BC", type: "Segment", args: ["B", "C"]},
    {name: "CA", type: "Segment", args: ["C", "A"]},
    {name: "AB", type: "Segment", args: ["A", "B"]},
    // A1
    {name: "A1", type: "PointOnLine", args: ["BC"], pos: [6, -2.5], labeled: true, printname: "$A_1$"},
    {name: "AA1", type: "Segment", args: ["A", "A1"]},
    {name: "A2", type: "OtherIntersectionCL", args: ["c0", "AA1", "A"], visible: false},
    // B1
    {name: "B1", type: "PointOnLine", args: ["CA"], pos: [-2.5, -3.5], labeled: true, printname: "$B_1$"},
    {name: "BB1", type: "Segment", args: ["B", "B1"]},
    {name: "B2", type: "OtherIntersectionCL", args: ["c0", "BB1", "B"], visible: false},
    // PQ
    {name: "K", type: "Free", pos: [ 1.6, -6.5], color: [1, 1, 1], labeled: true, printname: "$K$"},
    {name: "l_PQ", type: "Parallel", args: ["AB", "K"], alpha: .2},
    {name: "l_AA2", type: "Join", args: ["A", "A2"], visible: false},
    {name: "l_BB2", type: "Join", args: ["B", "B2"], visible: false},
    {name: "P", type: "Meet", args: ["l_AA2", "l_PQ"], labeled: true, printname: "$P$"},
    {name: "Q", type: "Meet", args: ["l_BB2", "l_PQ"], labeled: true, printname: "$Q$"},
    {name: "PQ", type: "Segment", args: ["P", "Q"]},
    // P1
    {name: "c_P", type: "CircleBy3", args: ["C", "B1", "B2"], visible: false},
    {name: "l_PB1", type: "Join", args: ["P", "B1"], visible: false},
    {name: "P1", type: "OtherIntersectionCL", args: ["c_P", "l_PB1", "B1"], labeled: true, printname: "$P_1$"},
    {name: "PP1", type: "Segment", args: ["P", "P1"]},
    {name: "CP1", type: "Segment", args: ["C", "P1"]},
    // Q1
    {name: "c_Q", type: "CircleBy3", args: ["C", "A1", "A2"], visible: false},
    {name: "l_QA1", type: "Join", args: ["Q", "A1"], visible: false},
    {name: "Q1", type: "OtherIntersectionCL", args: ["c_Q", "l_QA1", "A1"], labeled: true, printname: "$Q_1$"},
    {name: "QP1", type: "Segment", args: ["Q", "Q1"]},
    {name: "CQ1", type: "Segment", args: ["C", "Q1"]},
    // P1PQQ1
    {name: "c_PQ", type: "CircleBy3", args: ["P1", "P", "Q1"], alpha: .2},
  ]
});
</script>

See the solution in Maxima [imo2019p2.mac].

Here's the high-level flow.
$$A, B, C$$ are free points,
from which we derive $$A_1$$ and $$B_1$$.
We derive $$P$$ and $$Q$$ by introducing another free point $$K$$,
the line through which parallel to $$AB$$
intersects $$AA_1$$ and $$BB_1$$ at $$P$$ and $$Q$$, respectively.
The remaining question is how to encode $$P_1$$ and $$Q_1$$.

First,
$$P_1$$ on $$PB_1$$ may translate to:

$$\frac{p_1 - b_1}{b_1 - p} = \overline{\left(\frac{p_1 - b_1}{b_1 - p}\right)}.$$

$$\angle PP_1C = \angle BAC$$ may translate to:

$$\frac{p_1 - c}{p_1 - p} / \frac{a - c}{a - b} =
\overline{\left(\frac{p_1 - c}{p_1 - p} / \frac{a - c}{a - b}\right)}.$$

Since $$a, b, c, p$$ are known at this point,
one may solve $$p_1$$ by eliminating $$\overline{p_1}$$ from the above two equations
(by hand or using Maxima's `solve` function).
One may solve $$q_1$$ similarly.

Next, it's straightforward to prove that $$P, Q, P_1, Q_1$$ are concyclic by testing the following:

$$\frac{p_1 - p}{p_1 - q} / \frac{q_1 - p}{q_1 - q} =
\overline{\left(\frac{p_1 - p}{p_1 - q} / \frac{q_1 - p}{q_1 - q}\right)}.$$

Maxima reported the following error on my first attempt:
```
PQUOTIENT: Quotient by a polynomial of higher degree (case 2b)
 -- an error. To debug this try: debugmode(true);
```

I worked around this error by choosing $$C$$ as the origin (i.e., $$c = 0$$),
with which Maxima is able to finish the proof.

Notice that the problem description is not _constructive_:
it asserts the existence of points $$P_1$$ and $$Q_1$$ but doesn't say
how to construct them---imagine how to draw the figure without solving polynomials.
Below is one way to rephrase the problem (in fact, that's how I drew the above figure),
inspired by "solution 1" of this problem's [reference solutions][IMO 2019].

Problem 2\*:
Points $$A_2$$ and $$B_2$$ are on the circumcircle of triangle $$ABC$$.
$$AA_2$$ intersects $$BC$$ at $$A_1$$.
$$BB_2$$ intersects $$CA$$ at $$B_1$$.
Let $$P$$ and $$Q$$ be points on segments $$AA_1$$ and $$BB_1$$, respectively,
such that $$PQ$$ is parallel to $$AB$$.
$$PB_1$$ intersects the circumcircle of triangle $$CB_1B_2$$ again at $$P_1$$.
$$QA_1$$ intersects the circumcircle of triangle $$CA_1A_2$$ again at $$Q_1$$.

Prove that points $$A_2, B_2, P, Q, P_1, Q_1$$ are concyclic.

<p>
<div id="imo2019p2e3" title="IMO 2019, problem 2" class="cindy-canvas"></div>
</p>

<script type="text/javascript">
CindyJS({
  ports: [{id: "imo2019p2e3"}],
  defaultAppearance: defaultAppearance,
  geometry: [
    // ABC
    {name: "A", type: "Free", pos: [-4, -8], color: [1, 1, 1], labeled: true, printname: "$A$"},
    {name: "B", type: "Free", pos: [ 8, -8], color: [1, 1, 1], labeled: true, printname: "$B$"},
    {name: "C", type: "Free", pos: [ 1,  0], color: [1, 1, 1], labeled: true, printname: "$C$"},
    {name: "c0", type: "ArcBy3", args: ["B", "C", "A"], alpha: .2},
    {name: "BC", type: "Segment", args: ["B", "C"]},
    {name: "CA", type: "Segment", args: ["C", "A"]},
    {name: "AB", type: "Segment", args: ["A", "B"]},
    // A1
    {name: "A2", type: "PointOnCircle", args: ["c0"], pos: [7, -2], color: [1, 1, 1], labeled: true, printname: "$A_2$"},
    {name: "AA2", type: "Segment", args: ["A", "A2"]},
    {name: "A1", type: "Meet", args: ["BC", "AA2"], labeled: true, printname: "$A_1$"},
    // B1
    {name: "B2", type: "PointOnCircle", args: ["c0"], pos: [-3, -3], color: [1, 1, 1], labeled: true, printname: "$B_2$"},
    {name: "BB2", type: "Segment", args: ["B", "B2"]},
    {name: "B1", type: "Meet", args: ["CA", "BB2"], labeled: true, printname: "$B_1$"},
    // PQ
    {name: "K", type: "Free", pos: [ 1.6, -6.5], color: [1, 1, 1]},
    {name: "l_PQ", type: "Parallel", args: ["AB", "K"], alpha: .2},
    {name: "l_AA2", type: "Join", args: ["A", "A2"], visible: false},
    {name: "l_BB2", type: "Join", args: ["B", "B2"], visible: false},
    {name: "P", type: "Meet", args: ["l_AA2", "l_PQ"], labeled: true, printname: "$P$"},
    {name: "Q", type: "Meet", args: ["l_BB2", "l_PQ"], labeled: true, printname: "$Q$"},
    {name: "PQ", type: "Segment", args: ["P", "Q"]},
    // P1
    {name: "c_P", type: "CircleBy3", args: ["C", "B1", "B2"], alpha: .2},
    {name: "l_PB1", type: "Join", args: ["P", "B1"], visible: false},
    {name: "P1", type: "OtherIntersectionCL", args: ["c_P", "l_PB1", "B1"], labeled: true, printname: "$P_1$"},
    {name: "PP1", type: "Segment", args: ["P", "P1"]},
    {name: "CP1", type: "Segment", args: ["C", "P1"]},
    // Q1
    {name: "c_Q", type: "CircleBy3", args: ["C", "A1", "A2"], alpha: .2},
    {name: "l_QA1", type: "Join", args: ["Q", "A1"], visible: false},
    {name: "Q1", type: "OtherIntersectionCL", args: ["c_Q", "l_QA1", "A1"], labeled: true, printname: "$Q_1$"},
    {name: "QP1", type: "Segment", args: ["Q", "Q1"]},
    {name: "CQ1", type: "Segment", args: ["C", "Q1"]},
    // P1PQQ1
    {name: "c_PQ", type: "CircleBy3", args: ["P1", "P", "Q1"], alpha: .2},
    {name: "CA2", type: "Segment", args: ["C", "A2"], alpha: .2},
    {name: "CB2", type: "Segment", args: ["C", "B2"], alpha: .2},
  ]
});
</script>

It's easy to see that this constructive version is equivalent to the original problem,
given $$\angle PP_1C = \angle B_1B_2C = \angle CAB$$
and $$\angle QQ_1C = \angle A_1A_2C = \angle CBA$$.

**Exercise 3**: Write a Maxima program to prove problem 2\*.


## IMO 2019, problem 6

Let $$I$$ be the incenter of acute triangle $$ABC$$ with $$AB \neq AC$$.
The incircle $$\omega$$ of $$ABC$$ is tangent to sides $$BC$$, $$CA$$, and $$AB$$
at $$D$$, $$E$$, and $$F$$, respectively.
The line through $$D$$ perpendicular to $$EF$$ meets $$\omega$$ again at $$R$$.
Line $$AR$$ meets $$\omega$$ again at $$P$$.
The circumcircles of triangles $$PCE$$ and $$PBF$$ meet again at $$Q$$.

Prove that lines $$DI$$ and $$PQ$$ meet on the line through $$A$$
perpendicular to $$AI$$.

<p>
<div id="imo2019p6" title="IMO 2019, problem 6" class="cindy-canvas"></div>
</p>

<script type="text/javascript">
CindyJS({
  ports: [{id: "imo2019p6"}],
  defaultAppearance: defaultAppearance,
  geometry: [
    // ABC
    {name: "A", type: "Free", pos: [5.2, 3], color: [1, 1, 1], labeled: true, printname: "$A$"},
    {name: "B", type: "Free", pos: [-4, -6], color: [1, 1, 1], labeled: true, printname: "$B$"},
    {name: "C", type: "Free", pos: [ 8, -6], color: [1, 1, 1], labeled: true, printname: "$C$"},
    {name: "BC", type: "Segment", args: ["B", "C"]},
    {name: "CA", type: "Segment", args: ["C", "A"]},
    {name: "AB", type: "Segment", args: ["A", "B"]},
    // I
    {name: "ls_B", type: "AngularBisector", args: ["AB", "BC", "B"]},
    {name: "l_B", type: "SelectL", args: ["ls_B"], index: 2, visible: false},
    {name: "ls_C", type: "AngularBisector", args: ["BC", "CA", "C"]},
    {name: "l_C", type: "SelectL", args: ["ls_C"], visible: false},
    {name: "I", type: "Meet", args: ["l_B", "l_C"], labeled: true, printname: "$I$"},
    // DEF
    {name: "l_ID", type: "Orthogonal", args: ["BC", "I"], visible: false},
    {name: "D", type: "Meet", args: ["l_ID", "BC"], labeled: true, printname: "$D$"},
    {name: "l_IE", type: "Orthogonal", args: ["CA", "I"], visible: false},
    {name: "E", type: "Meet", args: ["l_IE", "CA"], labeled: true, printname: "$E$"},
    {name: "l_IF", type: "Orthogonal", args: ["AB", "I"], visible: false},
    {name: "F", type: "Meet", args: ["l_IF", "AB"], labeled: true, printname: "$F$"},
    {name: "c0", type: "CircleBy3", args: ["D", "E", "F"]},
    // R
    {name: "EF", type: "Segment", args: ["E", "F"]},
    {name: "l_DR", type: "Orthogonal", args: ["EF", "D"], visible: false},
    {name: "R", type: "OtherIntersectionCL", args: ["c0", "l_DR", "D"], labeled: true, printname: "$R$"},
    {name: "DR", type: "Segment", args: ["D", "R"]},
    // P
    {name: "l_AR", type: "Join", args: ["A", "R"], visible: false},
    {name: "P", type: "OtherIntersectionCL", args: ["c0", "l_AR", "R"], labeled: true, printname: "$P$"},
    {name: "AP", type: "Segment", args: ["A", "P"]},
    // Q
    {name: "c_B", type: "CircleBy3", args: ["P", "B", "F"], alpha: .2},
    {name: "c_C", type: "CircleBy3", args: ["P", "C", "E"], alpha: .2},
    {name: "Q", type: "OtherIntersectionCC", args: ["c_B", "c_C", "P"], labeled: true, printname: "$Q$"},
    // DI, PQ, AL
    {name: "l_DI", type: "Join", args: ["D", "I"], visible: false},
    {name: "l_PQ", type: "Join", args: ["P", "Q"], visible: false},
    {name: "L", type: "Meet", args: ["l_DI", "l_PQ"], labeled: true, printname: "$L$"},
    {name: "IA", type: "Segment", args: ["A", "I"]},
    {name: "LD", type: "Segment", args: ["L", "D"]},
    {name: "LP", type: "Segment", args: ["L", "P"]},
    {name: "l_AL", type: "Orthogonal", args: ["IA", "A"], alpha: .2},
  ]
});
</script>

See the solution in Maxima [imo2019p6.mac].

The problem description is constructive, and it's fairly straightforward to calculate each point.
Two optimizations are worth mentioning.

First,
to avoid calculating the incenter, a standard approach is to choose $$I$$ as the origin
and $$D, E, F$$ as points on a unit circle.
Let's introduce angle $$\theta_d$$ such that $$D$$ is $$\exp(i\theta_d)$$;
$$E$$ and $$F$$ are calculated similarly.
The rest of the points can be derived from $$D, E, F$$.

Second, choose $$IA$$ as the real axis (i.e., $$\theta_f = -\theta_e$$),
which exploits the symmetry of $$E$$ and $$F$$.
Without this optimization, the program timed out (in 30 minutes).

One may notice the complexity in calculating $$L$$,
the intersection of $$DI$$ and $$PQ$$,
which is due to the complexity in $$P$$ and $$Q$$.
One possible optimization to calculate $$L$$
from points with simpler coordinates,
$$DI$$ and the line through $$A$$ perpendicular to $$AI$$,
and instead prove that $$P, Q, L$$ are collinear.

**Exercise 4**: Optimize the Maxima code using the above approach.


## Summary

Below is a list of the Maxima files used in this post.
- Common library: [geometry.mac]
- IMO 2019, problem 2: [imo2019p2.mac]
- IMO 2019, problem 6: [imo2019p6.mac]
- Solution to exercise 3: [imo2019p2e3.mac]
- Solution to exercise 4: [imo2019p6e4.mac]

The proofs described in this post are close to those written by hand using complex numbers.
The optimizations are fairly standard, such as choosing a point as the origin or
choosing the real axis to exploit symmetry, which might be possible to automate
in the future.

The [IMO Grand Challenge] expects an AI to produce mechanical proofs that
can be checked by the [Lean] theorem prover.
Some of the other IMO 2019 problems are already formalized in Lean
(e.g., [problem 1](https://xenaproject.wordpress.com/2019/08/01/imo-2019-q1/) by Kevin Buzzard
and [problem 4](https://gist.github.com/fpvandoorn/e0bd9d116a59a5f01d1d661f3677b72f) by Floris van Doorn).
Maxima doesn't produce Lean-checkable proofs, so it requires further work
(e.g., building on efforts such as [GeoCoq](https://geocoq.github.io/GeoCoq/)).
Another important factor is [how these problems will be encoded formally](https://github.com/IMO-grand-challenge/formal-encoding).

**Acknowledgments**: Luke Nelson, Emina Torlak, and Zhilei Xu
provided feedback on a draft of this post.

[geometry.mac]: https://github.com/xiw/geometry/blob/master/lib/geometry.mac
[imo2019p2.mac]: https://github.com/xiw/geometry/blob/master/imo2019/imo2019p2.mac
[imo2019p2e3.mac]: https://github.com/xiw/geometry/blob/master/imo2019/imo2019p2e3.mac
[imo2019p6.mac]: https://github.com/xiw/geometry/blob/master/imo2019/imo2019p6.mac
[imo2019p6e4.mac]: https://github.com/xiw/geometry/blob/master/imo2019p6e4.mac
[IMO 2019]: https://www.imo2019.uk/
[IMO Grand Challenge]: https://imo-grand-challenge.github.io/
[Lean]: https://leanprover.github.io/
[Maxima]: http://maxima.sourceforge.net/
[Napoleon's theorem]: https://en.wikipedia.org/wiki/Napoleon%27s_theorem
[Singular]: https://www.singular.uni-kl.de/
[SymPy]: https://www.sympy.org/
