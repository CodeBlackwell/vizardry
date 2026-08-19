/* Report-dialect exemplar: an animated treemap on K.transport. Copy the pattern, not the
 * data — the demo dataset below stands in for your chartdata.json.
 *
 * What it demonstrates:
 *   - K.transport as the whole playback surface: play/pause, scrubber, replay, opt-in loop,
 *     speed select, frame label. The chart only writes draw(frame, animate).
 *   - Fixed frames of reference: the cell set is fixed across all frames and colors are
 *     frozen, so frames are comparable and object constancy holds — cells tween position,
 *     never rebuild.
 *   - K.tdur clamps the position tween to the frame interval, so it never outlives its
 *     frame at any speed.
 *   - Labels on saturated fills: bold ink chosen per cell at the L* ~51 crossover, computed
 *     once from the frozen fill, and set as inline style — the shell's svg text rule
 *     outranks a fill presentation attribute and would silently eat it.
 */
var K = window.VZ, P = K.P;
var R = {};

/* demo data: 6 cells, 4 frames. v[f] is the cell's value at frame f. */
var DEMO = {
  frames: ['Q1', 'Q2', 'Q3', 'Q4'],
  cells: [
    { k: 'alpha', v: [40, 52, 61, 75] },
    { k: 'beta', v: [30, 28, 24, 21] },
    { k: 'gamma', v: [22, 26, 30, 33] },
    { k: 'delta', v: [14, 15, 19, 24] },
    { k: 'epsilon', v: [9, 11, 10, 12] },
    { k: 'zeta', v: [6, 5, 7, 6] }
  ]
};

R.treemap = function (el) {
  var F = K.frame(el, 720, 400, { t: 4, r: 4, b: 4, l: 4 });
  var cat = [P.acc, P.warm, P.indigo, P.olive, P.acc2, P.good];
  // colors frozen once, per cell, never per frame — object constancy across playback
  var fill = {};
  DEMO.cells.forEach(function (c, i) { fill[c.k] = cat[i]; });
  var rectG = F.g.append('g'), labG = F.g.append('g');
  var curF = DEMO.frames.length - 1;

  function layout(f) {
    var root = d3.hierarchy({ children: DEMO.cells })
      .sum(function (d) { return d.v ? d.v[f] : 0; })
      .sort(function (a, b) { return b.value - a.value; });
    d3.treemap().size([F.iw, F.ih]).paddingInner(2).round(true)(root);
    return root;
  }
  function draw(f, animate) {
    curF = f;
    var root = layout(f), total = root.value;
    var leaves = root.leaves();
    var t = d3.transition().duration(animate ? K.tdur(el, 460, 560) : 0).ease(d3.easeCubicInOut);
    var r = rectG.selectAll('rect').data(leaves, function (d) { return d.data.k; });
    r = r.enter().append('rect')
      .attr('fill', function (d) { return fill[d.data.k]; })
      .attr('stroke', P.surf).attr('stroke-width', 1)
      .attr('x', function (d) { return d.x0; }).attr('y', function (d) { return d.y0; })
      .attr('width', function (d) { return Math.max(0, d.x1 - d.x0); })
      .attr('height', function (d) { return Math.max(0, d.y1 - d.y0); })
      .merge(r);
    r.transition(t)
      .attr('x', function (d) { return d.x0; }).attr('y', function (d) { return d.y0; })
      .attr('width', function (d) { return Math.max(0, d.x1 - d.x0); })
      .attr('height', function (d) { return Math.max(0, d.y1 - d.y0); });
    var fits = leaves.filter(function (d) { // 6.9 px/char: bold glyphs run ~8% wider
      return d.y1 - d.y0 > 17 && d.x1 - d.x0 > 6.9 * d.data.k.length + 8;
    });
    var lb = labG.selectAll('text').data(fits, function (d) { return d.data.k; });
    // inline style, not attr: the page's `svg text{fill:var(--ink-2)}` rule outranks a
    // presentation attribute and would silently gray these out
    lb = lb.enter().append('text').style('font-size', '10px').style('font-weight', '700')
      .style('fill', function (d) { return K.fgOn(fill[d.data.k]); })
      .attr('x', function (d) { return d.x0 + 4; }).attr('y', function (d) { return d.y0 + 13; })
      .text(function (d) { return d.data.k; })
      .merge(lb);
    lb.transition(t)
      .attr('x', function (d) { return d.x0 + 4; }).attr('y', function (d) { return d.y0 + 13; });
    labG.selectAll('text').data(fits, function (d) { return d.data.k; }).exit().remove();
    K.hov(r, function (d) {
      return '<b>' + d.data.k + '</b> ' + DEMO.frames[curF] + '<br>' + d.data.v[curF] +
        ' (' + (total ? (d.data.v[curF] / total * 100).toFixed(1) : '0') + '%)';
    });
  }
  K.transport(el, DEMO.frames.length, draw, {
    label: function (f) { return DEMO.frames[f]; }, step: 560
  });
};

K.boot(R);
