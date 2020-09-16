---
layout: post
title: "Areas of Napoleon triangles"
author: "Xi Wang"
tags: geometry
cindy: true
latex: true
---

NB: I came across a survey paper ([Zhao, 2011](#zhao-2011)) on
some plane geometry problems that a group of friends and I explored around 2000.
It's a nice trip down the memory lane.
I played with
[computer-aided proofs using Maxima]({% post_url 2020-08-31-automated-geometry-bashing %})
recently and thought it might be fun to write down the results.

Consider triangle $$ABC$$.
The centers of equilateral triangles constructed outward on the sides
form the _outer_ Napoleon triangle, $$DEF$$.
Similarly,
the centers of equilateral triangles constructed inward on the sides
form the _inner_ Napoleon triangle, $$D'E'F'$$.
[Napoleon's theorem](https://en.wikipedia.org/wiki/Napoleon%27s_theorem) says that
both $$DEF$$ and $$D'E'F'$$ are equilateral, one counterclockwise and the other clockwise.

A particularly interesting property is that
the sum of the (signed) areas of $$DEF$$ and $$D'E'F'$$ equals the area of $$ABC$$
([Coxeter and Greitzer, 1967](#coxeter-and-greitzer-1967), §3.3).
A signed area is positive if the vertices are ordered counterclockwise,
and negative if clockwise.

<p>
<div id="napoleon" title="Napoleon's theorem" class="cindy-canvas"></div>
</p>

<script id="napdraw" type="text/x-cindyscript">
xlegend = -9.5;
ylegend = -8;
fmt(x) := format(x, 4);
abc = area(A, B, C);
def = area(D, E, F);
def' = area(D', E', F');
drawtext((xlegend, ylegend),
  "$\begin{array}{lllll}" +
  "\textrm{area}\ ABC \\" +
  fmt(abc) + " & & & = &" + fmt(abc) + "\\ \\" +
  "\textrm{area}\ DEF & & \textrm{area}\ D'E'F' \\" +
  fmt(def) + " & + & " + fmt(def') + " & = &" + fmt(def + def') +
  "\end{array}$", size->14);
</script>

<script type="text/javascript">
CindyJS({
  ports: [{id: "napoleon"}],
  defaultAppearance: defaultAppearance,
  scripts: "nap*",
  geometry: [
    {name: "A", type: "Free", pos: [-2,  3.5], color: [1, 1, 1], labeled: true, printname: "$A$"},
    {name: "B", type: "Free", pos: [-3, -4.5], color: [1, 1, 1], labeled: true, printname: "$B$"},
    {name: "C", type: "Free", pos: [10, -4.5], color: [1, 1, 1], labeled: true, printname: "$C$"},

    {name: "l_BC", type: "Join", args: ["B", "C"], visible: false},
    {name: "l_CA", type: "Join", args: ["C", "A"], visible: false},
    {name: "l_AB", type: "Join", args: ["A", "B"], visible: false},

    {name: "l_BD", type: "LineByFixedAngle", angle: -30 * Math.PI / 180, args: ["l_BC", "B"], visible: false},
    {name: "l_CD", type: "LineByFixedAngle", angle:  30 * Math.PI / 180, args: ["l_BC", "C"], visible: false},
    {name: "D", type: "Meet", args: ["l_BD", "l_CD"], labeled: true, printname: "$D$"},
    {name: "tr_BC", type: "TrReflection", args: ["l_BC"]},
    {name: "D'", type: "Transform", args: ["tr_BC", "D"], labeled: true, printname: "$D'$"},

    {name: "l_CE", type: "LineByFixedAngle", angle: -30 * Math.PI / 180, args: ["l_CA", "C"], visible: false},
    {name: "l_AE", type: "LineByFixedAngle", angle:  30 * Math.PI / 180, args: ["l_CA", "A"], visible: false},
    {name: "E", type: "Meet", args: ["l_CE", "l_AE"], labeled: true, printname: "$E$"},
    {name: "tr_CA", type: "TrReflection", args: ["l_CA"]},
    {name: "E'", type: "Transform", args: ["tr_CA", "E"], labeled: true, printname: "$E'$"},

    {name: "l_AF", type: "LineByFixedAngle", angle: -30 * Math.PI / 180, args: ["l_AB", "A"], visible: false},
    {name: "l_BF", type: "LineByFixedAngle", angle:  30 * Math.PI / 180, args: ["l_AB", "B"], visible: false},
    {name: "F", type: "Meet", args: ["l_AF", "l_BF"], labeled: true, printname: "$F$"},
    {name: "tr_AB", type: "TrReflection", args: ["l_AB"]},
    {name: "F'", type: "Transform", args: ["tr_AB", "F"], labeled: true, printname: "$F'$"},

    {name: "l_EF", type: "Join", args: ["E", "F"], visible: false},
    {name: "l_FD", type: "Join", args: ["F", "D"], visible: false},
    {name: "l_DE", type: "Join", args: ["D", "E"], visible: false},

    {name: "DD'", type: "Segment", args: ["D", "D'"], alpha: .2},
    {name: "EE'", type: "Segment", args: ["E", "E'"], alpha: .2},
    {name: "FF'", type: "Segment", args: ["F", "F'"], alpha: .2},

    {name: "ABC", type: "Poly", args: ["A", "B", "C"], fillcolor: [1,0,0], fillalpha: .2},
    {name: "DEF", type: "Poly", args: ["D", "E", "F"], fillcolor: [0,0,1], fillalpha: .2},
    {name: "D'E'F'", type: "Poly", args: ["D'", "E'", "F'"], fillcolor: [0,0,1], fillalpha: .2},

    {name: "l_A", type: "Orthogonal", args: ["l_EF", "A"], visible: false},
    {name: "l_B", type: "Orthogonal", args: ["l_FD", "B"], visible: false},
    {name: "X", type: "Meet", args: ["l_A", "l_B"]},
    {name: "AX", type: "Segment", args: ["A", "X"], alpha: .2},
    {name: "BX", type: "Segment", args: ["B", "X"], alpha: .2},
    {name: "CX", type: "Segment", args: ["C", "X"], alpha: .2},
  ]
});
</script>

Note that in Napoleon triangle, $$A', B', C'$$, the reflections
of $$A, B, C$$ across $$EF, FD, DE$$, respectively, coincide such that
$$\mathrm{area}\ A'B'C' = 0$$.
A general and symmetric form of the areal property is the following:

$$\mathrm{area}\ ABC + \mathrm{area}\ A'B'C' = \mathrm{area}\ DEF + \mathrm{area}\ D'E'F'.$$

This post focuses on generalizations of the areal property.


## Antisimilitude and involution

First, we would like to generalize how $$D, E, F$$ are chosen.
What's a necessary and sufficient condition for their reflections
$$D', E', F'$$ across $$BC, CA, AB$$, respectively,
to form a triangle inversely similar to $$DEF$$
(i.e., with the same shape and opposite rotations)?

[Zhonghao Ye and Gang Cao (1997)](#ye-and-cao-1997)
answered this question with the following theorem.

<div class="theorem" markdown="1">
**Theorem 1**:
Consider non-degenerate triangles $$ABC$$ and $$DEF$$.
Let $$A', B', C', D', E', F'$$ be the reflections of $$A, B, C, D, E, F$$ across
$$EF, FD, DE, BC, CA, AB$$, respectively.

Triangles $$DEF$$ and $$D'E'F'$$ 'are inversely similar
if and only if the Möbius transformation that maps $$A, B, C$$ to $$D, E, F$$ is an involution
(or simply, $$A, B, C, D, E, F$$ are involutoric).
</div>

<p>
<div id="inv" title="The areal property (involution)" class="cindy-canvas"></div>
</p>

<script id="drawArea" type="text/x-cindyscript">
xlegend = -9.5;
ylegend = -8;
fmt(x) := format(x, 4);
abc = area(A, B, C);
def = area(D, E, F);
abc' = area(A', B', C');
def' = area(D', E', F');
drawtext((xlegend, ylegend),
  "$\begin{array}{lllll}" +
  "\textrm{area}\ ABC & & \textrm{area}\ A'B'C' \\" +
  fmt(abc) + " & + & " + fmt(abc') + " & = &" + fmt(abc + abc') + "\\ \\" +
  "\textrm{area}\ DEF & & \textrm{area}\ D'E'F' \\" +
  fmt(def) + " & + & " + fmt(def') + " & = &" + fmt(def + def') +
  "\end{array}$", size->14);
</script>

<script id="invinit" type="text/x-cindyscript">
moveto(F, realF.xy);
</script>

<script id="invmousedrag" type="text/x-cindyscript">
if(mover()==A, moveto(F, realF.xy));
if(mover()==B, moveto(F, realF.xy));
if(mover()==C, moveto(F, realF.xy));
if(mover()==D, moveto(F, realF.xy));
if(mover()==E, moveto(F, realF.xy));
if(mover()==F, moveto(C, realC.xy));
</script>

<script type="text/javascript">
CindyJS({
  ports: [{id: "inv"}],
  scripts: "inv*",
  drawscript: "drawArea",
  defaultAppearance: defaultAppearance,
  geometry: [
    {name: "A", type: "Free", pos: [ 1,  3], color: [1, 1, 1], labeled: true, printname: "$A$"},
    {name: "B", type: "Free", pos: [-3, -4], color: [1, 1, 1], labeled: true, printname: "$B$"},
    {name: "C", type: "Free", pos: [10, -5], color: [1, 1, 1], labeled: true, printname: "$C$"},
    {name: "D", type: "Free", pos: [ 4, -8], color: [1, 1, 1], labeled: true, printname: "$D$"},
    {name: "E", type: "Free", pos: [ 7,  1], color: [1, 1, 1], labeled: true, printname: "$E$"},
    {name: "F", type: "Free", pos: [-2,  0], color: [1, 1, 1], labeled: true, printname: "$F$"},

    {name: "trA", type: "TrMoebius", args: ["B", "E", "C", "F", "F", "C"]},
    {name: "trB", type: "TrMoebius", args: ["C", "F", "A", "D", "D", "A"]},
    {name: "trC", type: "TrMoebius", args: ["A", "D", "B", "E", "E", "B"]},
    {name: "realA", type: "Transform", args: ["trA", "D"], visible: false},
    {name: "realB", type: "Transform", args: ["trB", "E"], visible: false},
    {name: "realC", type: "Transform", args: ["trC", "F"], visible: false},

    {name: "trD", type: "TrMoebius", args: ["E", "B", "F", "C", "C", "F"]},
    {name: "trE", type: "TrMoebius", args: ["F", "C", "D", "A", "A", "D"]},
    {name: "trF", type: "TrMoebius", args: ["D", "A", "E", "B", "B", "E"]},
    {name: "realD", type: "Transform", args: ["trD", "A"], visible: false},
    {name: "realE", type: "Transform", args: ["trE", "B"], visible: false},
    {name: "realF", type: "Transform", args: ["trF", "C"], visible: false},

    {name: "l_BC", type: "Join", args: ["B", "C"], visible: false},
    {name: "l_CA", type: "Join", args: ["C", "A"], visible: false},
    {name: "l_AB", type: "Join", args: ["A", "B"], visible: false},
    {name: "l_EF", type: "Join", args: ["E", "F"], visible: false},
    {name: "l_FD", type: "Join", args: ["F", "D"], visible: false},
    {name: "l_DE", type: "Join", args: ["D", "E"], visible: false},

    {name: "tr_BC", type: "TrReflection", args: ["l_BC"]},
    {name: "tr_CA", type: "TrReflection", args: ["l_CA"]},
    {name: "tr_AB", type: "TrReflection", args: ["l_AB"]},
    {name: "tr_EF", type: "TrReflection", args: ["l_EF"]},
    {name: "tr_FD", type: "TrReflection", args: ["l_FD"]},
    {name: "tr_DE", type: "TrReflection", args: ["l_DE"]},
    {name: "A'", type: "Transform", args: ["tr_EF", "A"], labeled: true, printname: "$A'$"},
    {name: "B'", type: "Transform", args: ["tr_FD", "B"], labeled: true, printname: "$B'$"},
    {name: "C'", type: "Transform", args: ["tr_DE", "C"], labeled: true, printname: "$C'$"},
    {name: "D'", type: "Transform", args: ["tr_BC", "D"], labeled: true, printname: "$D'$"},
    {name: "E'", type: "Transform", args: ["tr_CA", "E"], labeled: true, printname: "$E'$"},
    {name: "F'", type: "Transform", args: ["tr_AB", "F"], labeled: true, printname: "$F'$"},

    {name: "ABC", type: "Poly", args: ["A", "B", "C"], fillcolor: [1,0,0], fillalpha: .2},
    {name: "DEF", type: "Poly", args: ["D", "E", "F"], fillcolor: [0,0,1], fillalpha: .2},
    {name: "A'B'C'", type: "Poly", args: ["A'", "B'", "C'"], fillcolor: [1,0,0], fillalpha: .2},
    {name: "D'E'F'", type: "Poly", args: ["D'", "E'", "F'"], fillcolor: [0,0,1], fillalpha: .2},

    {name: "AA'", type: "Segment", args: ["A", "A'"], alpha: .2},
    {name: "BB'", type: "Segment", args: ["B", "B'"], alpha: .2},
    {name: "CC'", type: "Segment", args: ["C", "C'"], alpha: .2},
    {name: "DD'", type: "Segment", args: ["D", "D'"], alpha: .2},
    {name: "EE'", type: "Segment", args: ["E", "E'"], alpha: .2},
    {name: "FF'", type: "Segment", args: ["F", "F'"], alpha: .2},
  ]
});
</script>

Let's start with some definitions.
A [Möbius transformation](https://en.wikipedia.org/wiki/M%C3%B6bius_transformation)
is a linear fractional transformation in the following form:

$$\varphi(z) = \frac{\alpha z + \beta}{\gamma z + \delta}.$$

Here $$\alpha, \beta, \gamma, \delta$$ are complex numbers
such that $$\alpha\delta - \beta\gamma \neq 0$$.
We use a lowercase letter $$z$$ to represent the complex number of the corresponding
point $$Z$$.

A transformation $$\varphi$$ is an involution if $$\varphi(\varphi(z)) = z$$.
For example, if an involutoric transformation maps $$A$$ to $$D$$, then it also maps $$D$$ to $$A$$.

A Möbius transformation is uniquely determined by three pairs of points
([Deaux 1956](#deaux-1956), article 74).
When the transformation determined by $$(A, D), (B, E), (C, F)$$
is an involution,
these points satisfy the following ([Deaux 1956](#deaux-1956), article 102):

$$\begin{vmatrix}
ad & a + d & 1 \\
be & b + e & 1 \\
cf & c + f & 1
\end{vmatrix} = 0.$$

We use the above definition in the proofs.

A more intuitive way is to rewrite the determinant as:

$$\frac{(a - f)(b - d)(c - e)}{(f - b)(d - c)(e - a)} = -1.$$

Therefore, one may view an involution as
a hexagon that satisfy the following properties:

- $$\dfrac{AF}{FB} \cdot \dfrac{BD}{DC} \cdot \dfrac{CE}{EA} = 1$$;

- $$\angle AFB + \angle BDC + \angle CEA = 0$$.

We use $$\angle XYZ$$ to denote the
[directed angle](https://web.evanchen.cc/handouts/Directed-Angles/Directed-Angles.pdf)
from line $$XY$$ to line $$YZ$$.

With this view,
it's easy to see that below are a few examples of involution:

- A triangle $$ABC$$ and its outer (or inner) Napoleon triangle $$DEF$$;
- A triangle $$ABC$$ and points $$D, E, F$$ on $$BC, AC, AB$$, respectively,
such that $$AD, BE, CF$$ are concurrent
([Ceva's theorem](https://en.wikipedia.org/wiki/Ceva%27s_theorem));
- A triangle $$ABC$$ and points $$D, E, F$$ on $$BC, AC, AB$$, respectively,
such that $$D, E, F$$ are collinear
([Menelaus's theorem](https://en.wikipedia.org/wiki/Menelaus%27s_theorem));
- The three pairs of opposite vertices of a
[complete quadrilateral](https://mathworld.wolfram.com/CompleteQuadrilateral.html)
([Deaux 1956](#deaux-1956), article 103).

**Proof.** $$DEF$$ inversely similar to $$D'E'F'$$ translates to:

$$\begin{vmatrix}
d & \overline{d'} & 1 \\
e & \overline{e'} & 1 \\
f & \overline{f'} & 1
\end{vmatrix} = 0.$$

Since $$D'$$ is the reflection of $$D$$ across $$BC$$, we have
$$d' = \dfrac{(b - c)\overline{d} + \overline{b}c - b\overline{c}}{\overline{b} - \overline{c}}$$.
We obtain $$e'$$ and $$f'$$ similarly.
Plug $$d', e', f'$$ into the above equation, which simplifies to:

$$\begin{vmatrix}
ad & a + d & 1 \\
be & b + e & 1 \\
cf & c + f & 1
\end{vmatrix}
\begin{vmatrix}
a & \overline{a} & 1 \\
b & \overline{b} & 1 \\
c & \overline{c} & 1
\end{vmatrix} = 0.$$

Since $$ABC$$ is a non-degenerate triangle, the above reduces to:

$$\begin{vmatrix}
ad & a + d & 1 \\
be & b + e & 1 \\
cf & c + f & 1
\end{vmatrix} = 0.$$

Therefore, a necessary and sufficient condition
for $$DEF$$ and $$D'E'F'$$ to be inversely similar
is that $$A, B, C, D, E, F$$ are involutoric.
**Q.E.D.**

Note that by symmetry, this is also the necessary and sufficient condition for
triangles $$ABC$$ and $$A'B'C'$$ to be inversely similar.

How are antisimilitude and involution related to the areal property?
Below is my answer to this question in a letter to Zhonghao Ye
(personal communication, 1999; [Zhao, 2011](#zhao-2011)).

<div class="theorem" markdown="1">
**Theorem 2**:
Consider points $$A, B, C, D, E, F$$ in the plane.
Let $$A', B', C', D', E', F'$$ be the reflections of $$A, B, C, D, E, F$$ across
$$EF, FD, DE, BC, CA, AB$$, respectively.

If $$A, B, C, D, E, F$$ are involutoric,
the sum of the areas of $$ABC$$ and $$A'B'C'$$ equals
the sum of the areas of $$DEF$$ and $$D'E'F'$$:

$$\mathrm{area}\ ABC + \mathrm{area}\ A'B'C' = \mathrm{area}\ DEF + \mathrm{area}\ D'E'F'.$$

</div>

**Proof.**
Suppose the involution determined by $$A, B, C, D, E, F$$ is:

$$\varphi(z) = \frac{\alpha z + \beta}{\gamma z + \delta}.$$

This boils down to three cases.

If $$\gamma = 0$$, given $$\varphi(\varphi(z)) = z$$, this reduces
to one of the following:

- $$\alpha = \delta, \beta = 0$$.  In this case,
$$\varphi$$ reduces to the identity transformation $$\varphi(z) = z$$,
where $$DEF$$ coincides with $$ABC$$.
We have $$d = a, e = b, f = c$$.

- $$\alpha = -\delta$$.  In this case,
$$\varphi$$ reduces to $$\varphi(z) = -z + {\beta}/{\delta}$$,
where $$DEF$$ is the symmetry of $$ABC$$ with respect to point $$\dfrac{\beta/\delta}{2}$$.
Choose that point as the origin.
We have $$d = -a, e = -b, f = -c$$.

If $$\gamma \neq 0$$, $$\varphi$$ has two fixed points $$p_i$$ such that
$$\varphi(p_i) = p_i (i = 1, 2)$$:

- WLOG, choose the midpoint of $$p_1, p_2$$ as the origin and the unit such that
$$p_1 = 1, p_2 = -1$$.  In this case,
$$\varphi$$ reduces to $$\varphi(z) = 1/z$$.
We have $$d = 1/a, e = 1/b, f = 1/c$$.

The rest is calculation for each of the three cases.
See [area.mac] in Maxima.
**Q.E.D.**


## Concyclicity

Involution is necessary and sufficient for antisimilitude
(e.g., $$DEF$$ inversely similar to $$D'E'F'$$).
It is also sufficient for the areal property,
but not necessary,
as evidenced by the following theorem.

<div class="theorem" markdown="1">
**Theorem 3**:
Consider points $$A, B, C, D, E, F$$ in the plane.
Let $$A', B', C', D', E', F'$$ be the reflections of $$A, B, C, D, E, F$$ across
$$EF, FD, DE, BC, CA, AB$$, respectively.

If $$A, B, C, D, E, F$$ are concyclic,
the sum of the areas of $$ABC$$ and $$A'B'C'$$ equals
the sum of the areas of $$DEF$$ and $$D'E'F'$$:

$$\mathrm{area}\ ABC + \mathrm{area}\ A'B'C' = \mathrm{area}\ DEF + \mathrm{area}\ D'E'F'.$$

</div>

<p>
<div id="cyclic" title="The areal property (concyclicity)" class="cindy-canvas"></div>
</p>

<script type="text/javascript">
CindyJS({
  ports: [{id: "cyclic"}],
  drawscript: "drawArea",
  defaultAppearance: defaultAppearance,
  geometry: [
    {name: "O", type: "Free", pos: [4, -1], color: [1, 1, 1], visible: false},
    {name: "R", type: "Free", pos: [10, -1], color: [1, 1, 1], visible: false},
    {name: "c0", type: "CircleMP", args: ["O", "R"], alpha: .2},

    {name: "A", type: "PointOnCircle", args: ["c0"], pos: [ 2,  3], color: [1, 1, 1], labeled: true, printname: "$A$"},
    {name: "B", type: "PointOnCircle", args: ["c0"], pos: [-1, -4], color: [1, 1, 1], labeled: true, printname: "$B$"},
    {name: "C", type: "PointOnCircle", args: ["c0"], pos: [ 6, -3], color: [1, 1, 1], labeled: true, printname: "$C$"},
    {name: "D", type: "PointOnCircle", args: ["c0"], pos: [ 4, -6], color: [1, 1, 1], labeled: true, printname: "$D$"},
    {name: "E", type: "PointOnCircle", args: ["c0"], pos: [ 7,  1], color: [1, 1, 1], labeled: true, printname: "$E$"},
    {name: "F", type: "PointOnCircle", args: ["c0"], pos: [-1,  1], color: [1, 1, 1], labeled: true, printname: "$F$"},

    {name: "l_BC", type: "Join", args: ["B", "C"], visible: false},
    {name: "l_CA", type: "Join", args: ["C", "A"], visible: false},
    {name: "l_AB", type: "Join", args: ["A", "B"], visible: false},
    {name: "l_EF", type: "Join", args: ["E", "F"], visible: false},
    {name: "l_FD", type: "Join", args: ["F", "D"], visible: false},
    {name: "l_DE", type: "Join", args: ["D", "E"], visible: false},

    {name: "tr_BC", type: "TrReflection", args: ["l_BC"]},
    {name: "tr_CA", type: "TrReflection", args: ["l_CA"]},
    {name: "tr_AB", type: "TrReflection", args: ["l_AB"]},
    {name: "tr_EF", type: "TrReflection", args: ["l_EF"]},
    {name: "tr_FD", type: "TrReflection", args: ["l_FD"]},
    {name: "tr_DE", type: "TrReflection", args: ["l_DE"]},
    {name: "A'", type: "Transform", args: ["tr_EF", "A"], labeled: true, printname: "$A'$"},
    {name: "B'", type: "Transform", args: ["tr_FD", "B"], labeled: true, printname: "$B'$"},
    {name: "C'", type: "Transform", args: ["tr_DE", "C"], labeled: true, printname: "$C'$"},
    {name: "D'", type: "Transform", args: ["tr_BC", "D"], labeled: true, printname: "$D'$"},
    {name: "E'", type: "Transform", args: ["tr_CA", "E"], labeled: true, printname: "$E'$"},
    {name: "F'", type: "Transform", args: ["tr_AB", "F"], labeled: true, printname: "$F'$"},

    {name: "ABC", type: "Poly", args: ["A", "B", "C"], fillcolor: [1,0,0], fillalpha: .2},
    {name: "DEF", type: "Poly", args: ["D", "E", "F"], fillcolor: [0,0,1], fillalpha: .2},
    {name: "A'B'C'", type: "Poly", args: ["A'", "B'", "C'"], fillcolor: [1,0,0], fillalpha: .2},
    {name: "D'E'F'", type: "Poly", args: ["D'", "E'", "F'"], fillcolor: [0,0,1], fillalpha: .2},

    {name: "AA'", type: "Segment", args: ["A", "A'"], alpha: .2},
    {name: "BB'", type: "Segment", args: ["B", "B'"], alpha: .2},
    {name: "CC'", type: "Segment", args: ["C", "C'"], alpha: .2},
    {name: "DD'", type: "Segment", args: ["D", "D'"], alpha: .2},
    {name: "EE'", type: "Segment", args: ["E", "E'"], alpha: .2},
    {name: "FF'", type: "Segment", args: ["F", "F'"], alpha: .2},
  ]
});
</script>

**Proof.**
Choose the circle on which $$A, B, C, D, E, F$$ all lie as the unit circle.

We have $$\overline{a} = 1/a, \overline{b} = 1/b, \overline{c} = 1/c,
\overline{d} = 1/d, \overline{e} = 1/e, \overline{f} = 1/f$$.

The rest of the proof is similar to that of Theorem 2. See [area.mac].
**Q.E.D.**

Theorems 2 and 3 indicate that to unify the areal property
for both involutoric and cyclic cases,
a property "weaker" than antisimilitude is needed,
as detailed next.


## Hexagons with opposite sides parallel

[Yong Zhao (2011)](#zhao-2011) described several new results
regarding the areal property.

First, Yong Zhao considered the hexagon formed by $$A_1, B_1, C_1, D_1, E_1, F_1$$,
the feet of the altitudes from $$A, B, C, D, E, F$$ to $$EF, FD, DE, BC, CA, AB$$, respectively:
if $$A, B, C, D, E, F$$ are involutoric,
the opposite sides of hexagon $$A_1F_1B_1D_1C_1E_1$$ are parallel (not necessarily equal in length):
$$A_1F_1 \parallel D_1C_1, F_1B_1 \parallel C_1E_1, B_1D_1 \parallel E_1A_1$$.

<p>
<div id="parinv" title="Hexagons with opposite sides parallel (involution)" class="cindy-canvas"></div>
</p>

<script type="text/javascript">
CindyJS({
  ports: [{id: "parinv"}],
  scripts: "inv*",
  defaultAppearance: defaultAppearance,
  geometry: [
    {name: "A", type: "Free", pos: [ 1,  3], color: [1, 1, 1], labeled: true, printname: "$A$"},
    {name: "B", type: "Free", pos: [-3, -4], color: [1, 1, 1], labeled: true, printname: "$B$"},
    {name: "C", type: "Free", pos: [10, -5], color: [1, 1, 1], labeled: true, printname: "$C$"},
    {name: "D", type: "Free", pos: [ 3, -8], color: [1, 1, 1], labeled: true, printname: "$D$"},
    {name: "E", type: "Free", pos: [ 7,  3], color: [1, 1, 1], labeled: true, printname: "$E$"},
    {name: "F", type: "Free", pos: [-2,  0], color: [1, 1, 1], labeled: true, printname: "$F$"},

    {name: "trA", type: "TrMoebius", args: ["B", "E", "C", "F", "F", "C"]},
    {name: "trB", type: "TrMoebius", args: ["C", "F", "A", "D", "D", "A"]},
    {name: "trC", type: "TrMoebius", args: ["A", "D", "B", "E", "E", "B"]},
    {name: "realA", type: "Transform", args: ["trA", "D"], visible: false},
    {name: "realB", type: "Transform", args: ["trB", "E"], visible: false},
    {name: "realC", type: "Transform", args: ["trC", "F"], visible: false},

    {name: "trD", type: "TrMoebius", args: ["E", "B", "F", "C", "C", "F"]},
    {name: "trE", type: "TrMoebius", args: ["F", "C", "D", "A", "A", "D"]},
    {name: "trF", type: "TrMoebius", args: ["D", "A", "E", "B", "B", "E"]},
    {name: "realD", type: "Transform", args: ["trD", "A"], visible: false},
    {name: "realE", type: "Transform", args: ["trE", "B"], visible: false},
    {name: "realF", type: "Transform", args: ["trF", "C"], visible: false},

    {name: "l_BC", type: "Join", args: ["B", "C"], visible: false},
    {name: "l_CA", type: "Join", args: ["C", "A"], visible: false},
    {name: "l_AB", type: "Join", args: ["A", "B"], visible: false},
    {name: "l_EF", type: "Join", args: ["E", "F"], visible: false},
    {name: "l_FD", type: "Join", args: ["F", "D"], visible: false},
    {name: "l_DE", type: "Join", args: ["D", "E"], visible: false},

    {name: "l_A", type: "Orthogonal", args: ["l_EF", "A"], visible: false},
    {name: "A1", type: "Meet", args: ["l_A", "l_EF"], labeled: true, printname: "$A_1$"},
    {name: "l_B", type: "Orthogonal", args: ["l_FD", "B"], visible: false},
    {name: "B1", type: "Meet", args: ["l_B", "l_FD"], labeled: true, printname: "$B_1$"},
    {name: "l_C", type: "Orthogonal", args: ["l_DE", "C"], visible: false},
    {name: "C1", type: "Meet", args: ["l_C", "l_DE"], labeled: true, printname: "$C_1$"},
    {name: "l_D", type: "Orthogonal", args: ["l_BC", "D"], visible: false},
    {name: "D1", type: "Meet", args: ["l_D", "l_BC"], labeled: true, printname: "$D_1$"},
    {name: "l_E", type: "Orthogonal", args: ["l_CA", "E"], visible: false},
    {name: "E1", type: "Meet", args: ["l_E", "l_CA"], labeled: true, printname: "$E_1$"},
    {name: "l_F", type: "Orthogonal", args: ["l_AB", "F"], visible: false},
    {name: "F1", type: "Meet", args: ["l_F", "l_AB"], labeled: true, printname: "$F_1$"},

    {name: "ABC", type: "Poly", args: ["A", "B", "C"]},
    {name: "DEF", type: "Poly", args: ["D", "E", "F"]},
    {name: "Poly1", type: "Poly", args: ["A1", "F1", "B1", "D1", "C1", "E1"]},

    {name: "AA1", type: "Segment", args: ["A", "A1"], alpha: .2},
    {name: "BB1", type: "Segment", args: ["B", "B1"], alpha: .2},
    {name: "CC1", type: "Segment", args: ["C", "C1"], alpha: .2},
    {name: "DD1", type: "Segment", args: ["D", "D1"], alpha: .2},
    {name: "EE1", type: "Segment", args: ["E", "E1"], alpha: .2},
    {name: "FF1", type: "Segment", args: ["F", "F1"], alpha: .2},
  ]
});
</script>

Second, it's straightforward to show that
if $$A, B, C, D, E, F$$ are concyclic,
the opposite sides of hexagon $$A_1F_1B_1D_1C_1E_1$$ are also parallel.

<p>
<div id="parcyclic" title="Hexagons with opposite sides parallel (concyclicity)" class="cindy-canvas"></div>
</p>

<script type="text/javascript">
CindyJS({
  ports: [{id: "parcyclic"}],
  defaultAppearance: defaultAppearance,
  geometry: [
    {name: "O", type: "Free", pos: [3, -2], color: [1, 1, 1], visible: false},
    {name: "R", type: "Free", pos: [9, -1], color: [1, 1, 1], visible: false},
    {name: "c0", type: "CircleMP", args: ["O", "R"], alpha: .2},

    {name: "A", type: "PointOnCircle", args: ["c0"], pos: [ 2,  3], color: [1, 1, 1], labeled: true, printname: "$A$"},
    {name: "B", type: "PointOnCircle", args: ["c0"], pos: [-1, -4], color: [1, 1, 1], labeled: true, printname: "$B$"},
    {name: "C", type: "PointOnCircle", args: ["c0"], pos: [ 6, -3], color: [1, 1, 1], labeled: true, printname: "$C$"},
    {name: "D", type: "PointOnCircle", args: ["c0"], pos: [ 3, -6], color: [1, 1, 1], labeled: true, printname: "$D$"},
    {name: "E", type: "PointOnCircle", args: ["c0"], pos: [ 7,  1], color: [1, 1, 1], labeled: true, printname: "$E$"},
    {name: "F", type: "PointOnCircle", args: ["c0"], pos: [-1,  1], color: [1, 1, 1], labeled: true, printname: "$F$"},

    {name: "l_BC", type: "Join", args: ["B", "C"], visible: false},
    {name: "l_CA", type: "Join", args: ["C", "A"], visible: false},
    {name: "l_AB", type: "Join", args: ["A", "B"], visible: false},
    {name: "l_EF", type: "Join", args: ["E", "F"], visible: false},
    {name: "l_FD", type: "Join", args: ["F", "D"], visible: false},
    {name: "l_DE", type: "Join", args: ["D", "E"], visible: false},

    {name: "l_A", type: "Orthogonal", args: ["l_EF", "A"], visible: false},
    {name: "A1", type: "Meet", args: ["l_A", "l_EF"], labeled: true, printname: "$A_1$"},
    {name: "l_B", type: "Orthogonal", args: ["l_FD", "B"], visible: false},
    {name: "B1", type: "Meet", args: ["l_B", "l_FD"], labeled: true, printname: "$B_1$"},
    {name: "l_C", type: "Orthogonal", args: ["l_DE", "C"], visible: false},
    {name: "C1", type: "Meet", args: ["l_C", "l_DE"], labeled: true, printname: "$C_1$"},
    {name: "l_D", type: "Orthogonal", args: ["l_BC", "D"], visible: false},
    {name: "D1", type: "Meet", args: ["l_D", "l_BC"], labeled: true, printname: "$D_1$"},
    {name: "l_E", type: "Orthogonal", args: ["l_CA", "E"], visible: false},
    {name: "E1", type: "Meet", args: ["l_E", "l_CA"], labeled: true, printname: "$E_1$"},
    {name: "l_F", type: "Orthogonal", args: ["l_AB", "F"], visible: false},
    {name: "F1", type: "Meet", args: ["l_F", "l_AB"], labeled: true, printname: "$F_1$"},

    {name: "ABC", type: "Poly", args: ["A", "B", "C"]},
    {name: "DEF", type: "Poly", args: ["D", "E", "F"]},
    {name: "Poly1", type: "Poly", args: ["A1", "F1", "B1", "D1", "C1", "E1"]},

    {name: "AA1", type: "Segment", args: ["A", "A1"], alpha: .2},
    {name: "BB1", type: "Segment", args: ["B", "B1"], alpha: .2},
    {name: "CC1", type: "Segment", args: ["C", "C1"], alpha: .2},
    {name: "DD1", type: "Segment", args: ["D", "D1"], alpha: .2},
    {name: "EE1", type: "Segment", args: ["E", "E1"], alpha: .2},
    {name: "FF1", type: "Segment", args: ["F", "F1"], alpha: .2},
  ]
});
</script>

Third, the hexagon with opposite sides parallel has the following property:

$$\mathrm{area}\ A_1B_1C_1 = \mathrm{area}\ D_1E_1F_1.$$

Zhouxing Mao further derived an alternative proof of Theorem 2
using the above property, demonstrating the connection between the areal property
and the hexagon with opposite sides parallel.

Therefore, the key is to find a necessary and sufficient condition
for the opposite sides of hexagon $$A_1F_1B_1D_1C_1E_1$$ to be parallel.

Libing Huang conjectured the following:

<div class="theorem" markdown="1">
**Theorem 4.**
Consider distinct points $$A, B, C, D, E, F$$ in the plane.
Let $$A_1, B_1, C_1, D_1, E_1, F_1$$ be
the feet of the altitudes from $$A, B, C, D, E, F$$ to $$EF, FD, DE, BC, CA, AB$$, respectively.

The opposite sides of hexagon $$A_1F_1B_1D_1C_1E_1$$ are parallel
if and only if $$A, B, C, D, E, F$$ are either involutoric or concyclic.
</div>

Libing Huang mentioned that he had a computer-aided proof but didn't provide details.
Below I'll describe a proof in Maxima.

**Proof.**
The proof of the sufficient condition is similar to those of theorems 2 and 3.
Let's focus on the necessary condition.

Since $$A_1$$ is the midpoint of $$A$$ and $$A'$$ (the reflection of $$A$$ across $$EF$$), we have:

$$a_1 = \frac{a + a'}{2} =
\frac{a(\overline{e} - \overline{f}) + \overline{a}(e - f) + \overline{e}f - e\overline{f}}
     {2(\overline{e} - \overline{f})}.$$

We obtain $$b_1, c_1, d_1, e_1, f_1$$ similarly.

$$A_1F_1 \parallel D_1C_1$$ translates to:

$$(a_1 - f_1)(\overline{d_1} - \overline{c_1}) - (\overline{a_1} - \overline{f_1})(d_1 - c_1) = 0.$$

Plug $$a_1, c_1, d_1, f_1$$ into the above equation, we have:

$$\left[(a - b)(\overline{e} - \overline{f}) + (\overline{a} - \overline{b})(e - f)\right]
\left[(b - c)(\overline{d} - \overline{e}) + (\overline{b} - \overline{c})(d - e)\right]
p_1 = 0.$$

The detail of $$p_1$$ is omitted due to the complexity (120 subexpressions!).
The other two expressions correspond to the degenerate cases,
$$AB \bot EF$$ ($$A_1$$ coincides with $$F_1$$) and
$$BC \bot DE$$ ($$D_1$$ coincides with $$C_1$$),
which we don't consider.
Therefore, the above equation simplifies to $$p_1 = 0$$.

Similarly, from $$F_1B_1 \parallel C_1E_1$$ we obtain $$p_2 = 0$$
(details omitted).

Eliminating $$\overline{d}$$ from $$p_1 = 0, p_2 = 0$$
gives the following two cases:

$$\begin{vmatrix}
ad & a + d & 1 \\
be & b + e & 1 \\
cf & c + f & 1
\end{vmatrix} = 0$$

$$\left(c - a\right)\left(f - b\right)\left(\overline{c} - \overline{b}\right)\left(\overline{f} - \overline{a}\right) -
      \left(\overline{c} - \overline{a}\right)\left(\overline{f} - \overline{b}\right)\left(c - b\right)\left(f - a\right) = 0.$$

The first corresponds to the case where $$A, B, C, D, E, F$$ are involutoric.
The second corresponds to the case where $$A, B, C, F$$ are concyclic; similarly,
we obtain that $$A, B, C, D$$ and $$A, B, C, E$$ are concyclic,
together implying that $$A, B, C, D, E, F$$ are concyclic.
See [parallel.mac] in Maxima for the complete proof.
**Q.E.D.**


## Summary

Below is a list of the Maxima files used in this post.
- Common library: [geometry.mac]
(see [_Automated geometry bashing_]({% post_url 2020-08-31-automated-geometry-bashing %}))
- Proof of Theorems 2 and 3: [area.mac]
- Proof of Theorem 4: [parallel.mac]

**Acknowledgments**: Zhonghao Ye provided a copy of my original proof of Theorems 2 and 3.
Zhilei Xu provided feedback on a draft of this post.


## References

- <a id="coxeter-and-greitzer-1967"></a>H. S. M. Coxeter and S. L. Greitzer. (1967).
Geometry Revisited.
The Mathematical Association of America.

- <a id="deaux-1956"></a>Roland Deaux. 1956.
Introduction to the Geometry of Complex Numbers.
Translated by Howard Eves.

- <a id="ye-and-cao-1997"></a>Zhonghao Ye and Gang Cao. (1997, September). Solutions to Problem 165.
Bulletin of Mathematics, no. 9. 问题征解栏: 165题的解答. 数学通讯.

- <a id="zhao-2011"></a>Yong Zhao. (2011).
A Survey of Involutoric Hexagons.
完美六边形研究综述 ([draft](https://bbs.cnool.net/5443327.html)).

<style>
.theorem {
  padding-left: .5em;
  border-left: 1px solid;
}
</style>

[geometry.mac]: https://github.com/xiw/geometry/blob/master/lib/geometry.mac
[area.mac]: https://github.com/xiw/geometry/tree/master/napoleon/area.mac
[parallel.mac]: https://github.com/xiw/geometry/tree/master/napoleon/parallel.mac
