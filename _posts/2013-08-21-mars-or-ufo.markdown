---
layout: post
title: "Mars or UFO: The DIY night sky"
date: 2013-08-21T17:13:16-04:00
comments: true
tags: astronomy history
d3: true
---
Came across a funny book titled _5000 years of UFOs_ (1997) last weekend.
The author claims that a number of ancient astronomical records from Chinese
history books are actually about UFOs.
Here's one example, where the author cites the chronicle
[_Zizhi Tongjian_][zztj] (1084):

> In the 9th lunar month of the year 415, Mars looped the loop in the constellation Gemini, sometimes forward, sometime backward, sometimes left, sometimes right.

The author questions "how can Mars move like this"[^1] and
suspects a UFO.

Well, Mars can move like this.
That's why Mars is called a [_planet_](http://en.wikipedia.org/wiki/Planet)
("wandering stars" in Greek).
Here's the last retrograde motion of Mars in 2011--2012,
plotted using [D3.js](http://d3js.org/) (JavaScript+SVG required) and data from NASA.

<center>
<div id="mars2011" title="Mars (2011-2012)"></div>
</center>

Compare it with the
[actual photos from NASA](http://apod.nasa.gov/apod/ap120809.html),
and you can see how Mars brakes, changes its direction, and moves forward again.
Mars appears to move backward in the sky
when Earth overtakes Mars, since Earth moves faster around the sun
(see more explanations from
[NASA](http://mars.nasa.gov/allaboutmars/nightsky/nightsky04/)
and
[BBC](http://www.youtube.com/watch?v=kbynKfNfHk4)).

However,
according to either my plots or other historical records,
Mars did _not_ loop the loop in Gemini in late 415 at all.
In fact, it is nowhere near Gemini at that time.
I suspect that the actual date of this record is late 414 or early 415;
the chronicle [_Zizhi Tongjian_][zztj] may make a mistake here.
I'll explain this later.


Plotting the night sky
----------------------

Here are some technical details.
The x-y coordinates of my plots are
[right ascension (RA)](http://en.wikipedia.org/wiki/Right_ascension) and
[declination (dec)](http://en.wikipedia.org/wiki/Declination),
"longitude" and "latitude" of the celestial sphere, respectively.
For stars, I got their RA/dec data
(see [stars.txt](/{{ site.code_dir }}/ti/stars.txt))
from Wikipedia (e.g.,
[Gemini](http://en.wikipedia.org/wiki/List_of_stars_in_Gemini)),
which are assumed not to change.

The key part is to get the RA/dec of Mars over time.
There are a few options:

* Use [Stellarium][stellarium], but it's hard to export the coordinates from there;
* Calculate the coordinates using
[lower accuracy formulae](http://ssd.jpl.nasa.gov/?planet_pos);
* NASA's [HORIZONS](http://ssd.jpl.nasa.gov/?horizons) provides a nice web service
for generating coordinates, but it doesn't work for dates earlier than 1900.

I ended up with writing a small program (see
[coordgen.c](/{{ site.code_dir }}/ti/coordgen.c))
using NASA's [SPICE toolkit](http://naif.jpl.nasa.gov/),
along with the ephemeris data
[DE431](http://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/)
that covers dates back to 13210BC.

	$ ./coordgen "MARS BARYCENTER" 2011-SEP-01 2012-AUG-31
	2011-SEP-01 00:00 110.18800  22.84568
	2011-SEP-02 00:00 110.87321  22.77037
	...
	2012-AUG-31 00:00 212.12717 -13.52374

Now we have the RA/dec of Mars for that time span
(see [mars2011.txt](/{{ site.code_dir }}/ti/mars2011.txt)).
Similarly, we can get those of Mars in the year 415
(and even those of other planets such as Saturn),
as I'll show later. 

Note that these coordinates may not be exactly the same as seen from Earth.
They are of the Mars barycenter, not the mass center.
Also, they don't take into account atmospheric refraction nor the
light time from Mars to an observer on Earth.
They are accurate enough for our purpose though.

I wrapped up my plotting code in [ti.js](/{{ site.code_dir }}/ti/ti.js).
To generate a plot, simply call `ti.load()` with your data and configuration.
See the source code of this webpage for details.

The fall of a kingdom
---------------------

Mars in the year 415 played an interesting role in history.
According to [_Zizhi Tongjian_][zztj],
in the 9th lunar month of 415,
an astronomical officer of the [Northern Wei](http://en.wikipedia.org/wiki/Northern_Wei)
dynasty reported that Mars was "gone," which was a serious issue at that time.
The emperor then called for a meeting.
A high-level official [Cui Hao][cuihao]
predicted that another kingdom, [Later Qin][houqin], would fall soon,
as indicated by the motion of Mars,
though others didn't believe him.
About 80 days later, Mars appeared looping the loop in Gemini.
The emperor of Later Qin, [Yao Xing][yaoxing],
died the next year (416), and Later Qin did collapse the year after (417).[^2]

Let's plot the motion of Mars from late 415 to early 416.

<center>
<div id="mars415" title="Mars (415-416)"></div>
</center>

Clearly, Mars was traveling between Virgo and Aquarius, way far away from Gemini.

I also looked up the astronomical records from
[_Book of Jin_][jinshu] (648), which mentioned the following:

* Jul 13th, 415, Mars moved to Virgo.[^3]
(Note that all the dates in this article are converted from the original
[lunar dates](http://en.wikipedia.org/wiki/Chinese_calendar)
and should be considered approximate.)

We can confirm the accuracy of this record using the plot above.
Based on this record, since Mars was in Virgo around July,
we can also infer that it wouldn't reach Gemini soon.

415 or 414?
-----------

So, what went wrong?

Later, I found one record for the previous year 414,
also from [_Book of Jin_][jinshu] (648):

* Aug 19th, 414, Mars approached Gemini and Saturn approached Cancer, 
looping the loop.[^4]

Hmm, let's plug in the data.

<center>
<div id="mars414" title="Mars and Saturn (414-415)"></div>
</center>

This plot shows Mars (in Gemini) and Saturn (in Cancer) in late 414 and early 415,
both in retrograde motion.
This is consistent with the ancient records.

So, is it possible that [_Zizhi Tongjian_][zztj] (1084) made a mistake on the actual date?

From [Book of Wei][weishu] (554),
I found an earlier version of the story
that [Cui Hao][cuihao] predicted the fall of [Later Qin][houqin]
based on the motion of Mars.
It is basically the same story, but the date recorded in that book is
"qian sui" before [Yao Xing][yaoxing], the emperor of Later Qin, died in 416.[^5]

Well, "qian sui" is a confusing term in Chinese.  It could mean
one year before (415), two years before (414), or even
several years before.
Based on the plot above,
I suspect the actual date of the story is 414, while the author
of [_Zizhi Tongjian_][zztj] misread the date,
possibly due to the ambiguity of the term "qian sui."

To sum up, this is what I believe happened:

* Aug 414, Mars started retrograde motion in Gemini.
* Late 414, [Cui Hao][cuihao] predicted the fall of [Later Qin][houqin].
* Early 415, Mars ended retrograde motion and moved out of Gemini.
* 416, [Yao Xing][yaoxing], the emperor of Later Qin, died.
* 417, Later Qin collapsed.
* 554, [_Book of Wei_][weishu] was published;
it says the prediction was made "qian sui" before Yao Xing died.
* 1084, [_Zizhi Tongjian_][zztj] was published;
it says the prediction was made in late 415,
which should have been late 414.

[zztj]: http://en.wikipedia.org/wiki/Zizhi_Tongjian
[zztj-415]: http://zh.wikisource.org/wiki/%E8%B3%87%E6%B2%BB%E9%80%9A%E9%91%92_(%E8%83%A1%E4%B8%89%E7%9C%81%E9%9F%B3%E6%B3%A8)/%E5%8D%B7117
[stellarium]: http://www.stellarium.org/
[cuihao]: http://en.wikipedia.org/wiki/Cui_Hao
[houqin]: http://en.wikipedia.org/wiki/Later_Qin
[yaoxing]: http://en.wikipedia.org/wiki/Yao_Xing
[jinshu]: http://en.wikipedia.org/wiki/Book_of_Jin
[jinshu-tianwen3]: http://zh.wikisource.org/wiki/%E6%99%89%E6%9B%B8/%E5%8D%B7013
[weishu]: http://en.wikipedia.org/wiki/Book_of_Wei

Footnotes
---------

[^1]: Excerpts from _5000 years of UFOs_: "415年，《資治通鑑》「東晉安帝十一年九月，熒惑出東井（雙子座），留守句己，久之乃去。去而復來，乍前乍後，乍左乍右」，熒惑火星會如此飛來飛去嗎？" While the first half of the cited piece does appear in [_Zizhi Tongjian_][zztj], the second half doesn't.  It is actually from [_Book of Jin_][jinshu] ([晉書·志第二·天文中)](http://zh.wikisource.org/wiki/%E6%99%89%E6%9B%B8/%E5%8D%B7012), talking about observing Mars in general.  The author mixed them up, probably due to using a [commented version][zztj-415] of _Zizhi Tongjian_.

[^2]: [資治通鑑·卷第一百一十七·晉紀三十九][zztj-415]: "義熙十一年...九月...魏太史奏..."

[^3]: [晉書·志第三·天文下][jinshu-tianwen3]: "義熙...十一年三月...己卯 熒惑入輿鬼... 五月癸卯 熒惑入太微..."

[^4]: [晉書·志第三·天文下][jinshu-tianwen3]: "義熙...十年...七月庚辰...熒惑犯井鉞 填星犯輿鬼 遂守之..."

[^5]: [魏書·列傳第二十三·崔浩](http://zh.wikisource.org/wiki/%E9%AD%8F%E6%9B%B8/%E5%8D%B735): "初 姚興死之前歲也..."

<script src="/{{ site.code_dir }}/ti/ti.js"></script>
<script>
ti.load("#mars2011", {
  width: 800,
  height: 450,
  margin: {top: 10, left: 10},
  stars: {
    src: "/{{ site.code_dir }}/ti/stars.txt",
    map: ["Cancer", "Leo", "Virgo", "Sextans"],
  },
  planets: [{
    src: "/{{ site.code_dir }}/ti/mars2011.txt",
    attr: ti.marsAttr,
  }],
  duration: 20,
});

ti.load("#mars415", {
  width: 800,
  height: 350,
  margin: {top: 10, bottom: 10},
  offset: {ra: 200},
  stars: {
    src: "/{{site.code_dir}}/ti/stars.txt",
    map: ["Virgo", "Libra", "Scorpius", "Sagittarius", "Capricornus", "Aquarius"],
  },
  planets: [{
    src: "/{{site.code_dir}}/ti/mars415.txt",
    attr: ti.marsAttr,
  }],
  duration: 10,
  font: {
    constellation: "font-size: 80%; font-family: sans-serif;",
    star: "font-size: 70%; font-family: sans-serif;",
  },
});

ti.load("#mars414", {
  width: 800,
  height: 450,
  margin: {top: 10, bottom: 10},
  stars: {
    src: "/{{site.code_dir}}/ti/stars.txt",
    map: ["Gemini", "Cancer"],
  },
  planets: [{
    src: "/{{site.code_dir}}/ti/mars414.txt",
    attr: ti.marsAttr,
  }, {
    src: "/{{site.code_dir}}/ti/saturn414.txt",
    attr: ti.saturnAttr,
  }],
  duration: 18,
});
</script>
