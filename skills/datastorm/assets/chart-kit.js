/**
 * The report's chart runtime. Ships as-is; charts.js is the only file you write.
 *
 * Everything here exists because the same thing was needed by the fourth chart on the page.
 * It reads color from the page's CSS tokens rather than holding hexes of its own, which is
 * what makes one chart file serve light and dark without a second palette.
 *
 *   var K = window.VZ, P = K.P;                  // P is mutated in place, never reassigned,
 *   var R = {};                                  // so charts may capture it at load time
 *   R.c1 = function (el) { ...draw into el... };
 *   K.boot(R);                                   // last line of charts.js
 */
window.VZ = (function () {
  'use strict';

  function cv(name) {
    return getComputedStyle(document.documentElement).getPropertyValue('--' + name).trim();
  }

  var TOKENS = ['ink', 'ink-2', 'ink-3', 'line', 'line-2', 'grid', 'surface', 'surface-2',
    'surface-3', 'nodata', 'accent', 'accent-2', 'warm', 'indigo', 'olive', 'flag', 'good',
    'seq0', 'seq1', 'dneg', 'dpos', 'dmid', 'bv0', 'bvA', 'bvB'];
  var SHORT = { 'ink-2': 'ink2', 'ink-3': 'ink3', 'line-2': 'line2', surface: 'surf',
    'surface-2': 'surf2', 'surface-3': 'surf3', accent: 'acc', 'accent-2': 'acc2' };

  var P = {};
  function tokens() {
    TOKENS.forEach(function (t) { P[SHORT[t] || t] = cv(t); });
    P.seq = function (t) { return d3.interpolateLab(P.seq0, P.seq1)(Math.max(0, Math.min(1, t))); };
    // t in [-1,1]. Two hues meeting at a neutral, never a hue at the midpoint.
    P.div = function (t) {
      t = Math.max(-1, Math.min(1, t));
      return t >= 0 ? d3.interpolateLab(P.dmid, P.dpos)(t) : d3.interpolateLab(P.dmid, P.dneg)(-t);
    };
  }

  // Text sitting ON a saturated fill needs contrast against that fill, not against the surface.
  // A fixed threshold gets this wrong on the middle steps of every ramp.
  function fgOn(bg) { return d3.lab(bg).l > 62 ? '#0E1317' : '#F4F6F8'; }

  function frame(el, w, h, m) {
    var svg = d3.select(el).append('svg').attr('viewBox', '0 0 ' + w + ' ' + h)
      .attr('width', w).attr('height', h).attr('role', 'img');
    return {
      svg: svg,
      g: svg.append('g').attr('transform', 'translate(' + m.l + ',' + m.t + ')'),
      iw: w - m.l - m.r, ih: h - m.t - m.b, w: w, h: h
    };
  }

  // Canvas is for the three or four charts with thousands of marks. Everything else is SVG.
  function canvas(el, w, h) {
    var node = d3.select(el).append('canvas').node();
    var r = Math.min(2, devicePixelRatio || 1);
    node.width = w * r; node.height = h * r;
    node.style.width = w + 'px'; node.style.height = h + 'px';
    var cx = node.getContext('2d');
    cx.setTransform(r, 0, 0, r, 0, 0);
    return { node: node, cx: cx };
  }

  var tip;
  function show(html, ev) {
    tip.innerHTML = html;
    tip.style.opacity = 1;
    var r = tip.getBoundingClientRect(), x = ev.clientX + 14, y = ev.clientY + 14;
    if (x + r.width > innerWidth - 8) x = ev.clientX - r.width - 14;
    if (y + r.height > innerHeight - 8) y = ev.clientY - r.height - 14;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function hide() { tip.style.opacity = 0; }
  function hov(sel, fn) {
    sel.style('cursor', 'crosshair')
      .on('pointerenter pointermove', function (ev, d) { show(fn(d), ev); })
      .on('pointerleave', hide);
  }

  function ctrl(el) { return d3.select(el).append('div').attr('class', 'ctrl'); }

  // items: [{key, label}]. Returns {set} so a chart can drive the pressed state from elsewhere.
  function btns(bar, label, items, cur, cb) {
    if (label) bar.append('span').attr('class', 'lbl').text(label);
    var nodes = items.map(function (it) {
      return bar.append('button').attr('type', 'button').text(it.label)
        .attr('aria-pressed', it.key === cur ? 'true' : 'false')
        .on('click', function () { set(it.key); cb(it.key); });
    });
    function set(key) {
      nodes.forEach(function (b, i) { b.attr('aria-pressed', items[i].key === key ? 'true' : 'false'); });
    }
    return { set: set };
  }

  // items: [{c, t}]. c === 'none' draws an outline swatch, for no-data and structural zeros.
  // The label is a text node, not a <text> element — <text> is SVG, and in HTML the browser
  // keeps the element AND renders its content, so every label appears twice.
  function legend(el, items) {
    var L = d3.select(el).append('div').attr('class', 'legend');
    items.forEach(function (it) {
      var s = L.append('span');
      s.append('i')
        .style('background', it.c === 'none' ? 'transparent' : it.c)
        .style('border', it.c === 'none' ? '1px solid ' + P.ink3 : null);
      s.node().appendChild(document.createTextNode(it.t));
    });
    return L;
  }

  function rampKey(el, lo, hi, fn, n) {
    n = n || 24;
    var R = d3.select(el).append('div').attr('class', 'legend').append('span').attr('class', 'ramp');
    R.append('span').text(lo);
    var bar = R.append('span').attr('class', 'bar').style('display', 'flex').style('overflow', 'hidden');
    for (var i = 0; i < n; i++) bar.append('span').style('flex', '1').style('background', fn(i / (n - 1)));
    R.append('span').text(hi);
    return R;
  }

  function axisBottom(g, sc, ih, ticks, fmt) {
    var a = g.append('g').attr('class', 'ax').attr('transform', 'translate(0,' + ih + ')');
    a.append('line').attr('x2', sc.range()[1]);
    (ticks || sc.ticks(6)).forEach(function (t) {
      a.append('line').attr('x1', sc(t)).attr('x2', sc(t)).attr('y2', 4);
      a.append('text').attr('x', sc(t)).attr('y', 15).attr('text-anchor', 'middle').text(fmt ? fmt(t) : t);
    });
    return a;
  }

  function axisLeft(g, sc, ticks, fmt) {
    var a = g.append('g').attr('class', 'ax');
    (ticks || sc.ticks(6)).forEach(function (t) {
      a.append('line').attr('x1', -4).attr('y1', sc(t)).attr('y2', sc(t));
      a.append('text').attr('x', -8).attr('y', sc(t) + 3).attr('text-anchor', 'end').text(fmt ? fmt(t) : t);
    });
    return a;
  }

  function grid(g, sc, ih, ticks) {
    (ticks || sc.ticks(6)).forEach(function (t) {
      g.append('line').attr('class', 'gl').attr('x1', sc(t)).attr('x2', sc(t)).attr('y2', ih);
    });
  }

  /**
   * Renders every [data-chart] node from the registry, then re-renders on a theme change —
   * the charts read CSS tokens once at draw time, so a flip to dark needs a redraw.
   * One chart that throws prints in its own figure instead of blanking the page.
   */
  function boot(registry) {
    tip = document.getElementById('tip');
    var nodes = [].slice.call(document.querySelectorAll('[data-chart]'));
    function renderAll() {
      tokens();
      nodes.forEach(function (n) {
        var key = n.getAttribute('data-chart');
        if (!registry[key]) return;
        n.innerHTML = '';
        try {
          registry[key](n);
        } catch (e) {
          n.innerHTML = '<p class="mono" style="font-size:11px;color:#a33">chart ' + key +
            ' failed: ' + e.message + '</p>';
          console.error(key, e);
        }
      });
    }
    renderAll();
    var mq = matchMedia('(prefers-color-scheme: dark)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(renderAll);
    new MutationObserver(renderAll)
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  return {
    P: P, tokens: tokens, fgOn: fgOn,
    frame: frame, canvas: canvas,
    show: show, hide: hide, hov: hov,
    ctrl: ctrl, btns: btns, legend: legend, rampKey: rampKey,
    axisBottom: axisBottom, axisLeft: axisLeft, grid: grid,
    boot: boot
  };
})();
