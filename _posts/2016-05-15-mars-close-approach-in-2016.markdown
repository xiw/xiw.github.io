---
layout: post
title: "Mars close approach in 2016"
date: 2016-05-15 19:59:06 -0700
comments: true
tags: astronomy
d3: true
---

According to NASA,
[Mars Close Approach](http://mars.nasa.gov/allaboutmars/nightsky/mars-close-approach/)
this year is May 30 (or wait until 2018).
So I re-ran my program from the earlier post
[_Mars or UFO_]({% post_url 2013-08-21-mars-or-ufo %})
to compute the locations of Mars in the night sky in 2016,
including retrograde from April to June, as shown below:

<center>
<div id="mars2016" title="Mars (2016)"></div>
</center>

One thing still missing is updating the size of Mars.
Feel free to send me a patch.

<script src="/{{ site.code_dir }}/ti/ti.js"></script>
<script>
ti.load("#mars2016", {
  width: 800,
  height: 450,
  margin: {top: 10, left: 10},
  stars: {
    src: "/{{ site.code_dir }}/ti/stars.txt",
    map: ["Libra", "Scorpius", "Sagittarius", "Capricornus"],
  },
  planets: [{
    src: "/{{ site.code_dir }}/ti/mars2016.txt",
    attr: ti.marsAttr,
  }],
  duration: 20,
});
</script>
