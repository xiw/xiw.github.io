---
layout: post
title: "Solving Doodle Fit"
comments: true
tags: game
keywords: "Doodle Fit"
latex: true
---
A year ago I introduced this
[Doodle Fit](http://www.google.com/search?q=doodle+fit) game
to my roommate [Victor](http://www.costan.us/).
We were playing it all day long.  To stop the addiction, we then
wrote a  program to find the answers, which successfully destroyed
the interest in playing the game.  Got some time to rethink
the problem last night.  Here goes an interesting alternative to
solve Doodle Fit, using 0-1 integer programming.

The rule of the game is simple: fit a set of given blocks into
a given shape (no rotation).  For example, try to fit the three
blocks into the two-square shape:
<center>
<svg width="180" height="120" viewBox="-.1 -.1 6.1 3.1">
	<g stroke-width="0.05" fill="lightgrey" stroke="black">
		<rect x="0" y="0" width="1" height="1" />
		<rect x="1" y="0" width="1" height="1" />
		<rect x="0" y="1" width="1" height="1" />
		<rect x="1" y="1" width="1" height="1" />
		<rect x="2" y="1" width="1" height="1" />
		<rect x="3" y="1" width="1" height="1" />
		<rect x="2" y="2" width="1" height="1" />
		<rect x="3" y="2" width="1" height="1" />
	</g>
</svg>
<svg width="210" height="120" viewBox="-.1 0 7.5 2">
	<g stroke-width="0.05" fill="red" stroke="black">
		<rect x="1" y="0" width="1" height="1" />
		<rect x="0" y="1" width="1" height="1" />
		<rect x="1" y="1" width="1" height="1" />
	</g>
	<g stroke-width="0.05" fill="green" stroke="black">
		<rect x="3" y="0" width="1" height="1" />
		<rect x="3" y="1" width="1" height="1" />
	</g>
	<g stroke-width="0.05" fill="blue" stroke="black">
		<rect x="5" y="0" width="1" height="1" />
		<rect x="5" y="1" width="1" height="1" />
		<rect x="6" y="1" width="1" height="1" />
	</g>
</svg>
</center>

This solution is pretty easy.  Put the red block to the bottom-right
corner and the green block to the left-most, leaving the blue block
in the middle:
<center>
<svg width="180" height="120" viewBox="-.1 -.1 6.1 3.1">
	<g stroke-width="0.05" stroke="black">
		<rect x="0" y="0" width="1" height="1" fill="green" />
		<rect x="1" y="0" width="1" height="1" fill="blue" />
		<rect x="0" y="1" width="1" height="1" fill="green" />
		<rect x="1" y="1" width="1" height="1" fill="blue" />
		<rect x="2" y="1" width="1" height="1" fill="blue" />
		<rect x="3" y="1" width="1" height="1" fill="red" />
		<rect x="2" y="2" width="1" height="1" fill="red" />
		<rect x="3" y="2" width="1" height="1" fill="red" />
	</g>
</svg>
</center>

Let's see how to model the game using a set of constraints.
We use $$p_{color}(row, col)$$ to denote whether to place the
top-left corner of the $$color$$ block at $$(row, col)$$: 1 for yes
and 0 for no.  Take the red block for an example.  Since it can
only be placed at two cells, $$(1, 1)$$ or $$(2, 3)$$, this means
that one and only one of $$p_r(1, 1)$$ and $$p_r(2, 3)$$ is 1.
In other words, their sum must be 1.  We have similar constraints
for the other two blocks.

$$
\begin{aligned}
& p_r(1, 1) + p_r(2, 3)                        & = 1 \\
& p_g(1, 1) + p_g(1, 2) + p_g(2,3) + p_g(2, 4) & = 1 \\
& p_b(1, 1) + p_b(1, 2) + p_b(2, 3)            & = 1 \\
\end{aligned}
$$

Additionally, each cell will be covered by one and only one block.
For example, the top-left cell $$(1, 1)$$ can be covered by either
the green block placed at $$(1, 1)$$, or the blue block placed at
$$(1, 1)$$; it cannot be covered by the red block.  So the sum of
$$p_g(1, 1)$$ and $$p_b(1, 1)$$ must be 1.  We have such a constraint
for each cell, as follows.

$$
\begin{aligned}
\text{row 1:}\\
& p_g(1, 1) + p_b(1, 1)                         & = 1 \\
& p_r(1, 1) + p_g(1, 2) + p_b(1, 2)             & = 1 \\
\text{row 2:}\\
& p_r(1, 1) + p_g(1, 1) + p_b(1, 1)             & = 1 \\
& p_r(1, 1) + p_g(1, 2) + p_b(1, 1) + p_b(1, 2) & = 1 \\
& p_g(2, 3) + p_b(1, 2) + p_b(2, 3)             & = 1 \\
& p_r(2, 3) + p_g(2, 4)                         & = 1 \\
\text{row 3:}\\
& p_r(2, 3) + p_g(2, 3) + p_b(2, 3)             & = 1 \\
& p_r(2, 3) + p_g(2, 4) + p_b(2, 3)             & = 1 \\
\end{aligned}
$$

That's all we need.  Feed these constraints into a solver
that supports 0-1 integer programming, e.g.,
[GLPK](http://www.gnu.org/software/glpk/) and
[lp_solve](http://lpsolve.sourceforge.net/),
and you can get the answer back like
$$p_r(2, 3) = p_g(1, 1) = p_b(1, 2) = 1$$,
indicating where to put these blocks.

I wrote a script [doodle-fit.py](/{{site.code_dir}}/doodle-fit.py)
to automate the steps.
Prepare an input file `two` specifying the shape and the
blocks, split by `---`, as follows.

	##
	####
	  ##
	---
	 *
	**
	---
	*
	*
	---
	*
	**

Then generate the constraints using the script,
which writes them to `two.mod` in the GNU MathProg language.

	$ python3 doodle-fit.py < two > two.mod

Invoke a solver to get a solution.  I use GLPK here.
You may try to add `--minisat` to `glpsol` to solve the constraints
with the SAT solver instead.

```
$ glpsol --math two.mod -w two.sol
GLPSOL: GLPK LP/MIP Solver, v4.65
Parameter(s) specified in the command line:
 --math two.mod -w two.sol
Reading model section from two.mod...
24 lines were read
Generating b0...
Generating b1...
Generating b2...
Generating c00...
Generating c01...
Generating c10...
Generating c11...
Generating c12...
Generating c13...
Generating c22...
Generating c23...
Model has been successfully generated
GLPK Integer Optimizer, v4.65
11 rows, 9 columns, 32 non-zeros
9 integer variables, all of which are binary
Preprocessing...
11 rows, 9 columns, 32 non-zeros
9 integer variables, all of which are binary
Scaling...
 A: min|aij| =  1.000e+00  max|aij| =  1.000e+00  ratio =  1.000e+00
Problem data seem to be well scaled
Constructing initial basis...
Size of triangular part is 8
Solving LP relaxation...
GLPK Simplex Optimizer, v4.65
11 rows, 9 columns, 32 non-zeros
*     0: obj =   0.000000000e+00 inf =   0.000e+00 (0)
OPTIMAL LP SOLUTION FOUND
Integer optimization begins...
Long-step dual simplex will be used
+     0: mip =     not found yet >=              -inf        (1; 0)
+     0: >>>>>   0.000000000e+00 >=   0.000000000e+00   0.0% (1; 0)
+     0: mip =   0.000000000e+00 >=     tree is empty   0.0% (0; 1)
INTEGER OPTIMAL SOLUTION FOUND
Time used:   0.0 secs
Memory used: 0.1 Mb (119119 bytes)
Writing MIP solution to 'two.sol'...
29 lines were written
```

Make sure you see something like `OPTIMAL SOLUTION FOUND`
in the output.  If the SAT solver is used, you should see
`SATISFIABLE`.  Otherwise, go back to check the input file,
or send me a bug report.

Finally, display the solution `two.sol` using the script again.

	$ python3 doodle-fit.py two.sol < two
	12  
	1220
	  00

Now you can "enjoy" the game.

Aug 23, 2020: updated to Python 3 and GLPK 4.65.
