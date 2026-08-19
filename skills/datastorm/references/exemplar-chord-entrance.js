/* Report-dialect exemplar: a directed chord over animated time, with an interruption-safe
 * draw-in entrance riding on K.transport. Copy the pattern, not the data — the demo dataset
 * below stands in for your chartdata.json.
 *
 * What it demonstrates:
 *   - K.transport composes an entrance with playback via opts.entranceMs: replay runs the
 *     entrance at frame 0, then playback waits for it. Nothing autoplays; loop is a toggle.
 *   - Interruption-safe tweens: attrTween over geometry cached on the element (__g, __c),
 *     writing the interpolated value back each tick, so an interrupted animation hands its
 *     true on-screen geometry to the next one instead of snapping.
 *   - Entrance grammar for the chord family: arcs sweep angularly from zero width, staggered
 *     by group; then ribbons unfurl from a sliver at the source midpoint out to the target.
 *   - Entrance delays and durations divide by K.spd(el), so the speed select scales them too.
 */
var K = window.VZ, P = K.P;
var R = {};

/* demo data: 4 groups, 3 frames of directed matrices (matrix[s][t] = flow s -> t) */
var DEMO = {
  labels: ['North', 'East', 'South', 'West'],
  frames: ['2023', '2024', '2025'],
  matrices: [
    [[0, 12, 5, 8], [9, 0, 11, 3], [4, 10, 0, 6], [7, 2, 9, 0]],
    [[0, 15, 6, 9], [10, 0, 14, 4], [5, 12, 0, 7], [8, 3, 11, 0]],
    [[0, 19, 8, 11], [12, 0, 18, 5], [6, 15, 0, 9], [10, 4, 14, 0]]
  ]
};

R.chord = function (el) {
  var F = K.frame(el, 720, 520, { t: 10, r: 10, b: 10, l: 10 });
  var cx = F.iw / 2, cy = F.ih / 2, r0 = Math.min(cx, cy) - 60;
  var g = F.g.append('g').attr('transform', 'translate(' + cx + ',' + cy + ')');
  var chordGen = d3.chordDirected().padAngle(0.04).sortSubgroups(d3.descending);
  var arc = d3.arc().innerRadius(r0).outerRadius(r0 + 12);
  var ribbon = d3.ribbonArrow().radius(r0 - 2);
  var rbG = g.append('g'), grpG = g.append('g');
  var cat = [P.acc, P.warm, P.indigo, P.olive];
  var curF = DEMO.frames.length - 1;

  function grpA(d) { return { startAngle: d.startAngle, endAngle: d.endAngle }; }
  function ribA(d) {
    return { source: { startAngle: d.source.startAngle, endAngle: d.source.endAngle },
             target: { startAngle: d.target.startAngle, endAngle: d.target.endAngle } };
  }
  // Both tweens write the interpolated angles back to the element each tick, so an
  // interrupted animation hands the next one its true on-screen geometry.
  function arcTween(d) {
    var self = this, i = d3.interpolateObject(self.__g, grpA(d));
    return function (tt) { self.__g = i(tt); return arc(self.__g); };
  }
  function ribTween(d) {
    var self = this, i = d3.interpolateObject(self.__c, ribA(d));
    return function (tt) { self.__c = i(tt); return ribbon(self.__c); };
  }

  function draw(f, animate, entrance) {
    curF = f;
    var chords = chordGen(DEMO.matrices[f]);
    var sf = K.spd(el);
    var t = d3.transition().duration(animate ? K.tdur(el, 480, 620) : 0).ease(d3.easeCubicInOut);

    var gr = grpG.selectAll('path').data(chords.groups, function (d) { return d.index; });
    gr = gr.enter().append('path')
      .attr('fill', function (d) { return cat[d.index]; })
      .attr('d', arc)
      .each(function (d) { this.__g = grpA(d); })
      .merge(gr);
    if (entrance) { // each arc sweeps angularly from zero width to its full extent
      gr.interrupt()
        .each(function (d) { this.__g = { startAngle: d.startAngle, endAngle: d.startAngle }; })
        .attr('d', function () { return arc(this.__g); })
        .transition().delay(function (d) { return d.index * 60 / sf; })
        .duration(480 / sf).ease(d3.easeCubicOut)
        .attrTween('d', arcTween);
    } else {
      gr.transition(t).attrTween('d', arcTween);
    }

    var rb = rbG.selectAll('path').data(chords, function (d) {
      return d.source.index + '-' + d.target.index;
    });
    rb.enter().append('path')
      .attr('fill', function (d) { return cat[d.source.index]; })
      .attr('stroke', P.surf).attr('stroke-width', 0.4)
      .attr('fill-opacity', 0)
      .attr('d', ribbon)
      .each(function (d) { this.__c = ribA(d); })
      .transition(t).attr('fill-opacity', 0.68);
    if (entrance) { // ribbons collapse onto their source arc, then unfurl across to the target
      rb.exit().remove();
      rbG.selectAll('path').interrupt()
        .each(function (d) {
          var m = (d.source.startAngle + d.source.endAngle) / 2;
          this.__c = { source: { startAngle: d.source.startAngle, endAngle: d.source.endAngle },
                       target: { startAngle: m - 0.003, endAngle: m + 0.003 } };
        })
        .attr('d', function () { return ribbon(this.__c); })
        .attr('fill-opacity', 0.12)
        .transition().delay(function (d, i) { return (420 + d.source.index * 120 + i * 8) / sf; })
        .duration(560 / sf).ease(d3.easeCubicOut)
        .attr('fill-opacity', 0.68)
        .attrTween('d', ribTween);
    } else {
      rb.exit().transition(t).attr('fill-opacity', 0).remove();
      rb.transition(t).attr('fill-opacity', 0.68).attrTween('d', ribTween);
    }

    K.hov(rbG.selectAll('path'), function (d) {
      var s = d.source.index, tt = d.target.index;
      return '<b>' + DEMO.labels[s] + ' &#8594; ' + DEMO.labels[tt] + '</b> ' + DEMO.frames[curF] +
        '<br>' + DEMO.matrices[curF][s][tt] + ' flows';
    });
  }
  // entranceMs = last ribbon delay + its unfurl duration, at 1x
  K.transport(el, DEMO.frames.length, draw, {
    label: function (f) { return DEMO.frames[f]; }, step: 620, entranceMs: 1400
  });
};

K.boot(R);
