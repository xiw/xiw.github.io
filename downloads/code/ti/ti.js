var ti = ti || {};

ti.load = function(id, conf) {
  conf.margin = conf.margin || {};
  conf.margin.top = conf.margin.top || 0;
  conf.margin.right = conf.margin.right || 0;
  conf.margin.bottom = conf.margin.bottom || 0;
  conf.margin.left = conf.margin.left || 0;

  conf.offset = conf.offset || {};
  conf.offset.ra = conf.offset.ra || 0;

  conf.font = conf.font || {};
  conf.font.constellation = conf.font.constellation || "font-family: sans-serif;";
  conf.font.star = conf.font.star || "font-size: 80%; font-family: sans-serif;";
  conf.font.time = conf.font.time || "font-size: 90%; font-family: sans-serif;";

  var svg = d3.select(id)
    .append("svg:svg")
    .attr("viewBox", [0, 0, conf.width, conf.height].join(" "))
    .attr("width", conf.width)
    .attr("height", conf.height)
    .attr("preserveAspectRatio", "xMinYMin")
    .style("background-color", "black")
    ;

  var onresize = function() {
    var w = document.querySelector(id).offsetWidth;
    svg.attr("width", w);
    svg.attr("height", Math.round(w / (conf.width / conf.height)));
  };
  window.onresize = onresize;
  onresize();

  var q = queue();
  [conf.stars].concat(conf.planets).forEach(function(e) {
    q.defer(d3.text, e.src, "text/plain");
  });
  q.awaitAll(function (error, results) {
    ti.ready(svg, conf, results);
  });
}

ti.parseStars = function(c, map) {
  var state = 0, starMap = {};
  var stars = [], links = [], constellations = [];

  d3.tsv.parseRows(c, function(d) {
    if (d[0] === "") {
      state = 0;
      return;
    }
    if (d[0].indexOf("---") == 0) {
      ++state;
      return;
    }
    switch (state) {
    case 0:
      if (!map.has(d[0])) {
        state = -1;
        break;
      }
      constellations.push({
        name: d[0],
        ra:   15 * ti.fromBase60(d[1]),
        dec:  ti.fromBase60(d[2]),
      });
      break;
    case 1:
      var n = {
        name: d[0],
        ra:   15 * ti.fromBase60(d[1]),
        dec:  ti.fromBase60(d[2]),
        note: d[3],
      };
      if (n.name[0] != '#') {
        starMap[n.name] = n;
        stars.push(n);
      }
      break;
    case 2:
      links.push(
        d.map(function(k) { return starMap[k]; })
      );
      break;
    }
  });
  return {
    stars: stars,
    links: links,
    constellations: constellations,
  };
}

ti.ready = function(svg, conf, results) {
  var g = ti.parseStars(results[0], d3.set(conf.stars.map));

  var planetCoords = results.slice(1).map(function (p) {
    return d3.dsv(" ", "text/plain").parseRows(p, function(d) {
      d = d.filter(function(s) { return s; });
      return {
        time: d[0],
        ra:   (+d[2]) * 3600,
        dec:  (+d[3]) * 3600,
      };
    });
  });

  var ra = function(d) {
    return (d.ra + conf.offset.ra * 3600) % (360 * 3600);
  };
  var dec = function(d) { return d.dec; }

  var xs = d3.scale.linear()
    .range([conf.width - conf.margin.right, conf.margin.left]);
  var ys = d3.scale.linear()
    .range([conf.height - conf.margin.bottom, conf.margin.top]);

  var scale = {
    x: function(d) { return xs(ra(d)); },
    y: function(d) { return ys(dec(d)); },
  };

  var mainCoords = planetCoords[0];
  xs.domain(d3.extent(g.stars.concat(mainCoords), ra));
  ys.domain(d3.extent(g.stars.concat(mainCoords), dec));

  var polyline = d3.svg.line()
    .x(scale.x)
    .y(scale.y)
    .interpolate("linear");

  svg.selectAll("link")
    .data(g.links)
    .enter()
    .append("svg:path")
    .attr("d", polyline)
    .attr("fill", "none")
    .attr("stroke", "lightblue")
    .attr("stroke-width", 1)
    ;

  svg.selectAll("constellation")
    .data(g.constellations)
    .enter()
    .append("svg:text")
    .attr("x", scale.x)
    .attr("y", scale.y)
    .attr("fill", "lightblue")
    .attr("style", conf.font.constellation)
    .text(function(d) { return d.name.toUpperCase(); })
    ;

  var starNode = svg.selectAll("star")
    .data(g.stars)
    .enter()
    .append("g");

  starNode.append("svn:text")
    .attr("x", scale.x)
    .attr("y", scale.y)
    .attr("dx", 5)
    .attr("dy", 5)
    .attr("fill", "grey")
    .attr("style", conf.font.star)
    .text(function(d) { return d.note; })

  starNode.append("svn:circle")
    .attr("cx", scale.x)
    .attr("cy", scale.y)
    .attr("r", 3)
    .attr("fill", "white")
    ;

  svg.append("svg:path")
    .datum(mainCoords)
    .attr("d", polyline)
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "5 3")
  ;

  var time = svg.append("svg:text")
    .attr("x", conf.width - 60)
    .attr("y", conf.height - 20)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .attr("style", conf.font.time)
    ;

  var planetNodes = conf.planets.map(function(p) {
    return p.attr(svg.append("svg:circle"));
  });

  ti.move(planetNodes, planetCoords, scale, time, conf.duration * 1000);
}

ti.fromBase60 = function(s) {
  var arr = s.split(" ");
  return (+arr[0]) * 60 * 60 + (+arr[1]) * 60 + (+arr[2]);
}

ti.ratioOf = function(arr, ratio) {
  return arr[Math.floor(ratio * (arr.length - 1))];
}

ti.interpolateRatioOf = function(arr, ratio) {
  var idx = ratio * (arr.length - 1);
  var lo = Math.floor(idx);
  if (lo >= arr.length - 1)
    return arr[lo];
  var hi = lo + 1;
  return d3.interpolate(arr[lo], arr[hi])(idx - lo);
}

ti.move = function(ns, coords, scale, time, duration) {
    ns[0].transition()
     .duration(duration)
     .ease("linear")
     .each("end", function() { return ti.move(ns, coords, scale, time, duration); })
     .attrTween("transform", function() { return function(t) {
       for (var i = 1; i < ns.length; ++i) {
         var p = ti.ratioOf(coords[i], t);
         ns[i].attr("transform", "translate(" + scale.x(p) + "," + scale.y(p) + ")");
       }
       var p = ti.ratioOf(coords[0], t);
       time.text(p.time);
       p = ti.interpolateRatioOf(coords[0], t);
       return "translate(" + scale.x(p) + "," + scale.y(p) + ")";
     }});
}

ti.marsAttr = function(c) {
  return c.attr("r", 5).attr("fill", "red");
};

ti.jupiterAttr = function(c) {
  return c.attr("r", 7).attr("fill", "#e36e4b");
};

ti.saturnAttr = function(c) {
  return c.attr("r", 6).attr("fill", "#f8f8d8");
};
