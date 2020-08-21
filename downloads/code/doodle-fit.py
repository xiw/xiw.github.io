#!/usr/bin/env python
#
# A Doodle Fit solver.
# http://kqueue.org/blog/2012/01/13/solving-doodle-fit/
#

from itertools import izip
import logging, sys

def width(block): return len(block[0])
def height(block): return len(block)

# read a block from input
# convert characters to 0/1
def getblock(fp):
	lines = []
	for line in sys.stdin:
		s = line.rstrip()
		if s == "---":
			break
		lines.append(s)
	if not lines:
		return None
	block = []
	width = max([len(e) for e in lines])
	for e in lines:
		block.append([int(not c == ' ') for c in e]
			+ [0] * (width - len(e)))
	return block

# can block be placed at (row, col) in shape?
def canplaceat(row, col, block, shape):
	for bline, sline in izip(block, shape[row:]):
		mask = [bc & sc for bc, sc in izip(bline, sline[col:])]
		if mask != bline:
			return False
	return True

# return all locations at which block can be placed in shape
def place(block, shape):
	locs = []
	for row in range(1 + height(shape) - height(block)):
		for col in range(1 + width(shape) - width(block)):
			if canplaceat(row, col, block, shape):
				locs.append((row, col))
	return locs

# return all cells that block cover
def coverat(row, col, block):
	cells = []
	for i, line in enumerate(block):
		for j, c in enumerate(line):
			if c:
				cells.append((row + i, col + j))
	return cells
	
# generate lp constraints
def gen(plan, shape, out):
	coverset = {}
	fmt = "b%s_%s%s"
	# declare variables
	idx = 0
	for block, p in plan:
		for row, col in p:
			out.write("var %s binary;\n" % (fmt % (idx, row, col)))
		idx = idx + 1
	out.write("\n")
	# only one placement is possible for a given block.
	idx = 0
	for block, p in plan:
		out.write("s.t. b%s : %s = 1;\n" % (idx,  " + ".join(
			[fmt % (idx, row, col) for row, col in p])));
		for row, col in p:
			for cell in coverat(row, col, block):
				coverset.setdefault(cell, []).append(fmt % (idx, row, col))
		idx = idx + 1
	out.write("\n");
	# only one block to cover a given cell.
	for k in sorted(coverset.keys()):
		out.write("s.t. %s : %s = 1;\n" % ("c%s%s" % k, " + ".join(coverset[k])))
	out.write("\n");
	out.write("end;\n");

def fill(ch, row, col, block, shape):
	for i, line in enumerate(block):
		for j, c in enumerate(line):
			if c:
				shape[row + i][col + j] = ch

def show(sol, plan, shape, out):
	keys = []
	for (block, locs) in plan:
		keys.extend([(block, row, col) for (row, col) in locs])
	sol = sol.split()[-len(keys):]
	log.info("solution: %s", sol)
	ch = '0'
	for i, a in enumerate(sol):
		a = int(a)
		if not a:
			continue
		(block, row, col) = keys[i]
		fill(ch, row, col, block, shape)
		ch = chr(ord(ch) + 1)
	for line in shape:
		out.write("".join([c or ' ' for c in line]))
		out.write("\n")

def main(fp, out, log):
	shape = getblock(fp)
	blockstr = lambda block: "".join(["\n\t" + str(line) for line in block])
	log.info("shape: %s x %s%s", width(shape), height(shape), blockstr(shape))
	plan = []
	while True:
		block = getblock(fp)
		if block is None:
			break
		log.info("block: %s x %s%s", width(block), height(block), blockstr(block))
		locs = place(block, shape)
		log.info("place: %s", locs)
		plan.append((block, place(block, shape)))
	if len(sys.argv) == 1:
		gen(plan, shape, out)
	else:
		show(open(sys.argv[1]).read(), plan, shape, out)


if __name__ == "__main__":
	logging.basicConfig()
	log = logging.getLogger()
#	log.setLevel(logging.DEBUG)
	main(sys.stdin, sys.stdout, log)
