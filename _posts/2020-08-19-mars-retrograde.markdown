---
layout: post
title: "Mars retrograde in 2020"
tags: astronomy
---

There is a [Mars retrograde](https://mars.nasa.gov/all-about-mars/night-sky/retrograde/)
this year, from September 9 to November 13.
Mars appears to move backwards as Earth overtakes Mars.
Below is a plot of the positions in the sky using [d3.js](https://d3js.org/).
It also includes Jupiter and Saturn retrogrades,
both from mid May to mid September.

<p>
<center>
<div id="mars2020" title="Mars (2020)"></div>
</center>
</p>

As described in earlier posts
[_Mars close approach in 2016_]({% post_url 2016-05-15-mars-close-approach-in-2016 %})
and
[_Mars or UFO_]({% post_url 2013-08-21-mars-or-ufo %}),
the coordinates of the planets
([Mars](/{{ site.code_dir }}/ti/mars2020.txt),
 [Jupiter](/{{ site.code_dir }}/ti/jupiter2020.txt), and
 [Saturn](/{{ site.code_dir }}/ti/saturn2020.txt))
are computed via a [small program](/{{ site.code_dir }}/ti/coordgen.c)
using NASA's [SPICE toolkit](http://naif.jpl.nasa.gov/),
and the coordinates of the [stars](/{{ site.code_dir }}/ti/stars.txt) are retrieved from Wikipedia
(e.g., [Pisces](https://en.wikipedia.org/wiki/List_of_stars_in_Pisces)).

You may notice a sudden change in position of Mars around mid July.
I suspect the bug is caused by some rounding errors in my code,
but I didn't investigate further.

<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
<script src="http://d3js.org/queue.v1.min.js"></script>
<script src="/{{ site.code_dir }}/ti/ti.js"></script>
<script>
ti.load("#mars2020", {
  width: 800,
  height: 450,
  margin: {top: 10, bottom: 10},
  offset: {ra: 300},
  stars: {
    src: "/{{ site.code_dir }}/ti/stars.txt",
    map: ["Sagittarius", "Capricornus", "Aquarius", "Pisces", "Aries",
          "Sculptor", "Pegasus", "Aquila", "Cetus"],
  },
  planets: [{
    src: "/{{ site.code_dir }}/ti/mars2020.txt",
    attr: ti.marsAttr,
  }, {
    src: "/{{ site.code_dir }}/ti/jupiter2020.txt",
    attr: ti.jupiterAttr,
  }, {
    src: "/{{ site.code_dir }}/ti/saturn2020.txt",
    attr: ti.saturnAttr,
  }],
  duration: 15,
});
</script>
