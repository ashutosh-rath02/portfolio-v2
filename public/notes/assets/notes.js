/*
 * Notes runtime. Shared by every page under /notes.
 *
 *  - Renders page chrome (top bar, rail, footer, pager) from window.NOTES_LIBRARY
 *  - Theme toggle, pointer lift, scroll spy
 *  - Helpers and builders for figures: Notes.se, Notes.drag, Notes.tween,
 *    Notes.radial, Notes.mindmap, Notes.flashcards
 *
 * Figure scripts register with Notes.figure(name, fn). Everything runs on
 * DOMContentLoaded, each figure guarded so one failure cannot break the page.
 */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var queue = [];

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function se(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function sp(svg, e) {
    var p = svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function setPressed(btns, on) {
    btns.forEach(function (b) { b.setAttribute('aria-pressed', b === on ? 'true' : 'false'); });
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function guard(name, fn) {
    try { fn(); } catch (err) { console.error('[notes] ' + name, err); }
  }
  function figure(name, fn) { queue.push([name, fn]); }

  /* ---------- pointer helpers ---------- */

  /* Drag surface. handler(e) runs on pointerdown and while dragging.
     opts.hover also calls it for plain mouse movement. */
  function drag(svg, handler, opts) {
    var down = false;
    svg.addEventListener('pointerdown', function (e) {
      down = true; svg.setPointerCapture(e.pointerId); handler(e);
    });
    svg.addEventListener('pointermove', function (e) {
      if (down || (opts && opts.hover && e.pointerType === 'mouse')) handler(e);
    });
    svg.addEventListener('pointerup', function () { down = false; });
    svg.addEventListener('pointercancel', function () { down = false; });
  }

  /* Tween an array of numbers. Returns a cancel function. */
  function tween(from, to, ms, cb) {
    var id = 0, t0 = performance.now();
    function step(now) {
      var p = clamp((now - t0) / ms, 0, 1), e = 1 - Math.pow(1 - p, 3);
      cb(from.map(function (v, i) { return v + (to[i] - v) * e; }));
      if (p < 1) id = requestAnimationFrame(step);
    }
    id = requestAnimationFrame(step);
    return function () { cancelAnimationFrame(id); };
  }

  /* ---------- pointer lift ---------- */

  var intensity = reduce ? 0 : 60, lifts = [], raf = 0, px = -9999, py = -9999;
  function liftTick() {
    raf = 0;
    var k = intensity / 100, H = innerHeight;
    for (var i = 0; i < lifts.length; i++) {
      var n = lifts[i], r = n.getBoundingClientRect();
      if (r.bottom < -200 || r.top > H + 200) continue;
      var d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
      var R = 190, f = d < R ? 1 - d / R : 0;
      n.style.setProperty('--lift', (f * f * 10 * k).toFixed(2));
    }
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(liftTick); }
  function initLift() {
    lifts = $$('.lift');
    var r = $('#lift');
    if (r) {
      if (reduce) { r.disabled = true; r.value = 0; }
      r.addEventListener('input', function () { intensity = +r.value; schedule(); });
    }
    if (!lifts.length) return;
    addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      px = e.clientX; py = e.clientY; schedule();
    }, { passive: true });
    addEventListener('scroll', schedule, { passive: true });
    root.addEventListener('pointerleave', function () { px = py = -9999; schedule(); });
  }

  /* ---------- theme ---------- */

  function initTheme() {
    var btn = $('#theme');
    if (!btn) return;
    var order = ['auto', 'light', 'dark'], i = 0;
    try {
      var s = localStorage.getItem('notes-theme');
      if (order.indexOf(s) > -1) i = order.indexOf(s);
      else {
        var site = localStorage.getItem('theme');
        if (site === 'light' || site === 'dark') i = order.indexOf(site);
      }
    } catch (e) {}
    function apply() {
      var m = order[i];
      if (m === 'auto') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', m);
      btn.textContent = 'Theme: ' + m;
    }
    btn.addEventListener('click', function () {
      i = (i + 1) % 3; apply();
      try { localStorage.setItem('notes-theme', order[i]); } catch (e) {}
    });
    apply();
  }

  /* ---------- chrome ---------- */

  var LIB = window.NOTES_LIBRARY || [];
  var body = document.body;
  var page = body.getAttribute('data-page') || 'chapter';
  var book = null, chapter = null;
  LIB.forEach(function (b) { if (b.slug === body.getAttribute('data-book')) book = b; });
  if (book) {
    var cn = body.getAttribute('data-chapter');
    book.chapters.forEach(function (c) { if (String(c.n) === cn) chapter = c; });
  }
  function bookHref(b) { return '/notes/' + b.slug; }
  function chHref(b, c) { return '/notes/' + b.slug + '/ch' + c.n; }

  function renderTop() {
    var el = $('#notes-top');
    if (!el) return;
    el.className = 'top';
    var sub = page === 'library' ? 'library' : (book ? book.title : '');
    if (chapter) sub += ' · chapter ' + chapter.n;
    var chips = '';
    if (page === 'chapter') {
      chips = '<nav class="chips" aria-label="Sections">' +
        $$('main > section[data-nav]').map(function (s) {
          return '<a href="#' + s.id + '">' + esc(s.getAttribute('data-chip') || s.getAttribute('data-nav')) + '</a>';
        }).join('') + '</nav>';
    }
    el.innerHTML =
      '<div class="top-in"><a class="brand" href="/notes"><span class="b1">Reading notes</span><span class="b2">' + esc(sub) + '</span></a>' +
      '<div class="ctrls">' +
      (page === 'chapter' ? '<label class="lift-ctl" for="lift">Lift <input id="lift" type="range" min="0" max="100" value="60"></label>' : '') +
      '<a class="btn lnk" href="/">Portfolio</a><button class="btn" id="theme" type="button">Theme: auto</button></div></div>' + chips;
  }

  function renderRail() {
    var el = $('#notes-rail');
    if (!el || !book || !chapter) return;
    var secs = $$('main > section[data-nav]');
    el.innerHTML =
      '<h2>Chapter ' + chapter.n + '</h2><ol>' +
      secs.map(function (s) { return '<li><a href="#' + s.id + '">' + esc(s.getAttribute('data-nav')) + '</a></li>'; }).join('') +
      '</ol><h2><a href="' + bookHref(book) + '" style="text-decoration:none">Book</a></h2><ol>' +
      book.chapters.map(function (c) {
        var t = esc(c.n + ' ' + c.title);
        if (c.status !== 'live') return '<li><span class="soon">' + t + '</span></li>';
        return '<li><a class="' + (c.n === chapter.n ? 'here' : '') + '" href="' + chHref(book, c) + '">' + t + '</a></li>';
      }).join('') + '</ol>';
  }

  function renderPager() {
    var m = $('main');
    if (!m || page !== 'chapter' || !book || !chapter) return;
    var live = book.chapters.filter(function (c) { return c.status === 'live'; });
    var idx = live.indexOf(chapter), prev = live[idx - 1], next = live[idx + 1];
    var nav = document.createElement('nav');
    nav.className = 'pager';
    nav.setAttribute('aria-label', 'Chapters');
    nav.innerHTML =
      (prev ? '<a href="' + chHref(book, prev) + '">Previous: ' + esc(prev.title) + '</a>' : '<span></span>') +
      '<a href="' + bookHref(book) + '">All chapters</a>' +
      (next ? '<a href="' + chHref(book, next) + '">Next: ' + esc(next.title) + '</a>' : '<span></span>');
    m.appendChild(nav);
  }

  function renderFoot() {
    var el = $('#notes-foot');
    if (!el) return;
    if (!book) {
      el.innerHTML = '<p>Personal reading notes. The text is paraphrased and the figures are original. The ideas belong to the authors, so read the books for the full treatment.</p>';
      return;
    }
    var intro = chapter
      ? 'Personal study notes on chapter ' + chapter.n + ' of <em>' + esc(book.title) + '</em> by ' + esc(book.author) +
        ' (' + esc(book.publisher) + ', ' + book.year + ')' + (chapter.pages ? ', printed pages ' + esc(chapter.pages) : '') + '. '
      : 'Personal study notes on <em>' + esc(book.title) + '</em> by ' + esc(book.author) + ' (' + esc(book.publisher) + ', ' + book.year + '). ';
    el.innerHTML = '<p>' + intro + esc(book.credit) + '</p>';
  }

  function tocRows(b, withTopics) {
    return '<ol class="toc">' + b.chapters.map(function (c) {
      var live = c.status === 'live';
      var title = live ? '<a href="' + chHref(b, c) + '">' + esc(c.title) + '</a>' : esc(c.title);
      return '<li class="' + (live ? 'live' : 'soon') + '"><span class="n">' + c.n + '</span><span class="tt">' + title +
        '</span><span class="st ' + (live ? 'live' : '') + '">' + (live ? 'notes live' : 'not written yet') + '</span>' +
        (withTopics && c.topics && c.topics.length ? '<span class="tp">' + esc(c.topics.join(', ')) + '</span>' : '') + '</li>';
    }).join('') + '</ol>';
  }

  function renderLists() {
    var books = $('#notes-books');
    if (books) {
      books.innerHTML = LIB.map(function (b) {
        var live = b.chapters.filter(function (c) { return c.status === 'live'; }).length, total = b.chapters.length;
        return '<a class="bk lift" href="' + bookHref(b) + '">' +
          '<span class="bk-meta">' + esc(b.author) + ' · ' + b.year + '</span>' +
          '<h2>' + esc(b.title) + '</h2>' +
          '<p>' + esc(b.summary) + '</p>' +
          '<span class="bk-prog"><i style="width:' + Math.round(live / total * 100) + '%"></i></span>' +
          '<span class="bk-foot"><span>' + live + ' of ' + total + ' chapters</span><span class="bk-go">Open notes</span></span></a>';
      }).join('') + '<div class="bk bk-next" aria-label="Upcoming books"><span class="bk-meta">Next</span><h2>More books</h2><p>New books join this shelf as I finish them. Each one gets the same treatment.</p></div>';
    }
    var chs = $('#notes-chapters');
    if (chs && book) chs.innerHTML = tocRows(book, true);
  }

  function initSpy() {
    var links = $$('.rail a[href^="#"], .chips a'), secs = $$('main > section[id]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('cur', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    secs.forEach(function (s) { io.observe(s); });
  }

  /* ---------- builders ---------- */

  /* Radial question map with a readout and a phone-friendly list.
     opts: {items:[[name,text]], read:'#id', list:'#id', center:['Your','product']} */
  function radial(svg, opts) {
    var items = opts.items, n = items.length, cx = 360, cy = 225, rx = 262, ry = 158;
    var gl = se('g', {}, svg), gn = se('g', {}, svg), nodes = [], lbs = [];
    var read = $(opts.read), list = $(opts.list);
    function show(i) {
      nodes.forEach(function (g, j) { g.classList.toggle('on', j === i); });
      lbs.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      $('h4', read).textContent = items[i][0];
      $('p', read).textContent = items[i][1];
    }
    items.forEach(function (it, i) {
      var a = (i * 360 / n - 90) * Math.PI / 180, x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
      se('path', {
        'class': 'ln draw', pathLength: 1, style: '--s:' + (i * 4) + '%',
        d: 'M' + (cx + Math.cos(a) * 50).toFixed(1) + ' ' + (cy + Math.sin(a) * 50).toFixed(1) + ' L' + x.toFixed(1) + ' ' + y.toFixed(1)
      }, gl);
      var g = se('g', { 'class': 'node lift', tabindex: 0, role: 'button', 'aria-label': it[0] }, gn);
      se('rect', { x: x - 85, y: y - 20, width: 170, height: 40, rx: 2 }, g);
      se('text', { 'class': 'tb', x: x, y: y + 5, 'text-anchor': 'middle' }, g).textContent = it[0];
      nodes.push(g);
      g.addEventListener('mouseenter', function () { show(i); });
      g.addEventListener('focus', function () { show(i); });
      g.addEventListener('click', function () { show(i); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); } });
      if (list) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'btn'; b.textContent = it[0];
        b.addEventListener('click', function () { show(i); });
        list.appendChild(b); lbs.push(b);
      }
    });
    var c = se('g', { 'class': 'node on' }, gn);
    se('circle', { cx: cx, cy: cy, r: 50 }, c);
    se('text', { 'class': 'tb', x: cx, y: cy - 3, 'text-anchor': 'middle' }, c).textContent = opts.center[0];
    se('text', { 'class': 'tb', x: cx, y: cy + 15, 'text-anchor': 'middle' }, c).textContent = opts.center[1];
    show(0);
  }

  /* Left-to-right mind map. tree: [[branchLabel,[leafLabel,...]],...] */
  function mindmap(svg, tree, rootLabel) {
    var leaves = 0, idx = 0, ys = [];
    tree.forEach(function (b) { leaves += b[1].length; });
    svg.setAttribute('viewBox', '0 0 720 ' + (leaves * 40 + 20));
    var gl = se('g', {}, svg), gn = se('g', {}, svg);
    tree.forEach(function (b) {
      var first = 30 + idx * 40, last = 30 + (idx + b[1].length - 1) * 40;
      ys.push((first + last) / 2); idx += b[1].length;
    });
    var rootY = (ys[0] + ys[ys.length - 1]) / 2;
    idx = 0;
    tree.forEach(function (b, k) {
      var by = ys[k];
      se('path', { 'class': 'ln a draw', pathLength: 1, style: '--s:' + (k * 3) + '%', d: 'M140 ' + rootY + ' C175 ' + rootY + ' 175 ' + by + ' 205 ' + by }, gl);
      var g = se('g', { 'class': 'node acc lift' }, gn);
      se('rect', { x: 205, y: by - 17, width: 150, height: 34, rx: 2 }, g);
      se('text', { 'class': 'tb', x: 280, y: by + 5, 'text-anchor': 'middle' }, g).textContent = b[0];
      b[1].forEach(function (l) {
        var ly = 30 + idx * 40; idx++;
        se('path', { 'class': 'ln soft draw', pathLength: 1, style: '--s:' + (8 + k * 3) + '%', d: 'M355 ' + by + ' C378 ' + by + ' 378 ' + ly + ' 400 ' + ly }, gl);
        var h = se('g', { 'class': 'node lift' }, gn);
        se('rect', { x: 400, y: ly - 14, width: 310, height: 28, rx: 2 }, h);
        var t = se('text', { 'class': 'ts', x: 412, y: ly + 4 }, h);
        t.setAttribute('style', 'fill:var(--ink)');
        t.textContent = l;
      });
    });
    var r = se('g', { 'class': 'node on lift' }, gn);
    se('rect', { x: 15, y: rootY - 24, width: 125, height: 48, rx: 2 }, r);
    se('text', { 'class': 'tb', x: 77.5, y: rootY + 5, 'text-anchor': 'middle' }, r).textContent = rootLabel;
  }

  /* Question and answer cards. cards: [[question, answer],...] */
  function flashcards(box, cards) {
    cards.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'fc lift'; b.setAttribute('aria-pressed', 'false');
      var s1 = document.createElement('small'); s1.textContent = 'Question ' + (i + 1) + ' of ' + cards.length;
      var q = document.createElement('span'); q.className = 'q'; q.textContent = c[0];
      var a = document.createElement('span'); a.className = 'a'; a.textContent = c[1];
      b.appendChild(s1); b.appendChild(q); b.appendChild(a);
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') === 'true';
        b.setAttribute('aria-pressed', on ? 'false' : 'true');
        s1.textContent = (on ? 'Question ' : 'Answer ') + (i + 1) + ' of ' + cards.length;
      });
      box.appendChild(b);
    });
  }


  /* ---------- data driven builders ---------- */

  var uid = 0;
  var fmt = {
    n: function (v, d) { return Number(v).toLocaleString('en-US', { maximumFractionDigits: d || 0, minimumFractionDigits: d || 0 }); },
    pct: function (v) { return Math.round(v * 100) + '%'; }
  };

  /* Flowchart on a grid with animated flow and a readout.
     spec: {cols, nodes:[{id,t,s,c,r,w,kind,info}], edges:[{a,b,label,kind,loop}],
            read:'#id', play:[ids], playBtn:'#id', particles:true, rowH, nodeH}
     kind on a node: 'acc' or 'warn'. kind on an edge: 'a' or 'w'. */
  function flow(svg, spec) {
    var id = 'ah' + (++uid), W = 720, cols = spec.cols || 3, colW = W / cols;
    var nh = spec.nodeH || 54, rh = spec.rowH || 92, y0 = 24, rows = 0, map = {};
    spec.nodes.forEach(function (n) {
      n.w = n.w || Math.min(colW - 40, 200);
      n.cx = (n.c + .5) * colW; n.cy = y0 + nh / 2 + n.r * rh;
      rows = Math.max(rows, n.r + 1); map[n.id] = n;
    });
    var extra = spec.extra || 0;
    svg.setAttribute('viewBox', '0 0 720 ' + (y0 * 2 + nh + (rows - 1) * rh + extra));
    var defs = se('defs', {}, svg);
    var mk = se('marker', { id: id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    se('path', { d: 'M2 1L8 5L2 9', fill: 'none', stroke: 'context-stroke', 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, mk);
    var ge = se('g', {}, svg), gp = se('g', {}, svg), gn = se('g', {}, svg);
    spec.edges.forEach(function (e, i) {
      var a = map[e.a], b = map[e.b], hh = nh / 2, d, lx, ly, anchor = 'middle';
      if (e.loop) {
        var x = Math.max(a.cx + a.w / 2, b.cx + b.w / 2) + (e.gap || 24);
        d = 'M' + (a.cx + a.w / 2) + ' ' + a.cy + ' H' + x + ' V' + b.cy + ' H' + (b.cx + b.w / 2 + 3);
        lx = x + 6; ly = (a.cy + b.cy) / 2; anchor = 'start';
      } else if (Math.abs(a.cy - b.cy) < 1) {
        var dir = b.cx > a.cx ? 1 : -1;
        d = 'M' + (a.cx + dir * a.w / 2) + ' ' + a.cy + ' H' + (b.cx - dir * (b.w / 2 + 3));
        lx = (a.cx + b.cx) / 2; ly = a.cy - 8;
      } else if (Math.abs(a.cx - b.cx) < 1) {
        var dv = b.cy > a.cy ? 1 : -1;
        d = 'M' + a.cx + ' ' + (a.cy + dv * hh) + ' V' + (b.cy - dv * (hh + 3));
        lx = a.cx + 8; ly = (a.cy + b.cy) / 2 + 4; anchor = 'start';
      } else {
        var dy = b.cy > a.cy ? 1 : -1, sy = a.cy + dy * hh, ey = b.cy - dy * (hh + 3), my = (sy + ey) / 2;
        d = 'M' + a.cx + ' ' + sy + ' V' + my + ' H' + b.cx + ' V' + ey;
        lx = (a.cx + b.cx) / 2; ly = my - 6;
      }
      se('path', { 'class': 'ln flow' + (e.kind ? ' ' + e.kind : ''), d: d, 'marker-end': 'url(#' + id + ')' }, ge);
      if (e.label) se('text', { 'class': 'tm' + (e.kind === 'w' ? ' tw' : e.kind === 'a' ? ' ta' : ''), x: lx, y: ly, 'text-anchor': anchor }, ge).textContent = e.label;
      if (spec.particles && !reduce) {
        var c = se('circle', { r: 3, 'class': 'req' + (e.kind === 'w' ? ' w' : '') }, gp);
        var am = se('animateMotion', { dur: (2.6 + (i % 3) * .5) + 's', repeatCount: 'indefinite', path: d, begin: (i * .35) + 's' }, c);
      }
    });
    var els = {}, read = spec.read ? $(spec.read) : null;
    function show(nid) {
      for (var k in els) els[k].classList.toggle('on', k === nid);
      if (read && map[nid]) { $('h4', read).textContent = map[nid].t; $('p', read).textContent = map[nid].info || map[nid].s || ''; }
    }
    spec.nodes.forEach(function (n) {
      var g = se('g', { 'class': 'node lift' + (n.kind ? ' ' + n.kind : ''), tabindex: 0, role: 'button', 'aria-label': n.t }, gn);
      se('rect', { x: n.cx - n.w / 2, y: n.cy - nh / 2, width: n.w, height: nh, rx: 2 }, g);
      se('text', { 'class': 'tb', x: n.cx, y: n.s ? n.cy - 6 : n.cy + 5, 'text-anchor': 'middle' }, g).textContent = n.t;
      if (n.s) se('text', { 'class': 'ts', x: n.cx, y: n.cy + 13, 'text-anchor': 'middle' }, g).textContent = n.s;
      els[n.id] = g;
      g.addEventListener('mouseenter', function () { show(n.id); });
      g.addEventListener('focus', function () { show(n.id); });
      g.addEventListener('click', function () { show(n.id); });
      g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); show(n.id); } });
    });
    if (spec.play && spec.playBtn) {
      var btn = $(spec.playBtn), timer = 0;
      btn.addEventListener('click', function () {
        clearInterval(timer); var i = 0; show(spec.play[0]);
        timer = setInterval(function () { i++; if (i >= spec.play.length) { clearInterval(timer); return; } show(spec.play[i]); }, 1000);
      });
    }
    show(spec.start || spec.nodes[0].id);
    return { show: show };
  }

  /* Sliders (or option buttons) that drive computed outputs.
     spec: {inputs:[{k,label,min,max,step,value,fmt} | {k,label,opts:[{l,v}],value}],
            outputs:[{label,fn(v),fmt,sub}], bars:[{label,fn(v),max,kind,fmt}],
            read:function(v,o)->[heading,text,warn?]} */
  function calc(el, spec) {
    var vals = {}, inEls = {};
    var ctl = document.createElement('div'); ctl.className = 'ctl';
    spec.inputs.forEach(function (inp) {
      var wrap = document.createElement('div'); vals[inp.k] = inp.value;
      if (inp.opts) {
        var lab = document.createElement('label'); lab.innerHTML = '<span>' + esc(inp.label) + '</span>';
        var row = document.createElement('div'); row.className = 'row'; row.style.marginTop = '6px';
        var bs = inp.opts.map(function (o) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = o.l;
          b.setAttribute('aria-pressed', o.v === inp.value ? 'true' : 'false');
          b.addEventListener('click', function () { vals[inp.k] = o.v; setPressed(bs, b); upd(); });
          row.appendChild(b); return b;
        });
        wrap.appendChild(lab); wrap.appendChild(row);
      } else {
        var id = 'c' + (++uid), f = inp.fmt || fmt.n;
        wrap.innerHTML = '<label for="' + id + '"><span>' + esc(inp.label) + '</span><output></output></label><input id="' + id + '" type="range" min="' + inp.min + '" max="' + inp.max + '" step="' + (inp.step || 1) + '" value="' + inp.value + '">';
        var r = $('input', wrap), o = $('output', wrap);
        o.textContent = f(inp.value);
        r.addEventListener('input', function () { vals[inp.k] = +r.value; o.textContent = f(+r.value); upd(); });
      }
      ctl.appendChild(wrap);
    });
    el.appendChild(ctl);
    var barsEl = null, barRows = [];
    if (spec.bars) {
      barsEl = document.createElement('div'); barsEl.className = 'bars';
      spec.bars.forEach(function (b) {
        var r = document.createElement('div'); r.className = 'bar sm';
        r.innerHTML = '<span>' + esc(b.label) + '</span><span class="bar-t"><i class="bar-fill' + (b.kind === 'w' ? ' w' : '') + '"></i></span><span class="bar-val"></span>';
        barsEl.appendChild(r); barRows.push(r);
      });
      el.appendChild(barsEl);
    }
    var statsEl = null, statEls = [];
    if (spec.outputs) {
      statsEl = document.createElement('div'); statsEl.className = 'stats';
      spec.outputs.forEach(function (o) {
        var s = document.createElement('div'); s.className = 'stat';
        s.innerHTML = '<small>' + esc(o.label) + '</small><b></b><span>' + esc(o.sub || '') + '</span>';
        statsEl.appendChild(s); statEls.push(s);
      });
      el.appendChild(statsEl);
    }
    var read = null;
    if (spec.read) {
      read = document.createElement('div'); read.className = 'read'; read.setAttribute('aria-live', 'polite');
      read.innerHTML = '<h4></h4><p></p>'; el.appendChild(read);
    }
    function upd() {
      var out = [];
      if (spec.outputs) spec.outputs.forEach(function (o, i) {
        var v = o.fn(vals); out.push(v); $('b', statEls[i]).textContent = (o.fmt || fmt.n)(v);
      });
      if (spec.bars) spec.bars.forEach(function (b, i) {
        var v = b.fn(vals); $('.bar-fill', barRows[i]).style.width = clamp(v / b.max * 100, 0, 100) + '%';
        $('.bar-val', barRows[i]).textContent = (b.fmt || fmt.n)(v);
      });
      if (read) {
        var r = spec.read(vals, out);
        $('h4', read).textContent = r[0]; $('p', read).textContent = r[1]; read.classList.toggle('warn', !!r[2]);
      }
    }
    upd();
    return { update: upd, values: vals };
  }

  /* Option toggle with animated metric bars and a readout.
     spec: {metrics:[{label,kind}], options:[{label,vals:[0..1],text:[...],h,p}], initial:0} */
  function compare(el, spec) {
    var row = document.createElement('div'); row.className = 'row'; row.style.marginBottom = '12px';
    var bars = document.createElement('div'); bars.className = 'bars';
    var rows = spec.metrics.map(function (m) {
      var r = document.createElement('div'); r.className = 'bar sm';
      r.innerHTML = '<span>' + esc(m.label) + '</span><span class="bar-t"><i class="bar-fill' + (m.kind === 'w' ? ' w' : '') + '"></i></span><span class="bar-val"></span>';
      bars.appendChild(r); return r;
    });
    var read = document.createElement('div'); read.className = 'read'; read.setAttribute('aria-live', 'polite'); read.innerHTML = '<h4></h4><p></p>';
    var btns = spec.options.map(function (o, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = o.label;
      b.addEventListener('click', function () { show(i); }); row.appendChild(b); return b;
    });
    function show(i) {
      var o = spec.options[i]; setPressed(btns, btns[i]);
      rows.forEach(function (r, j) { $('.bar-fill', r).style.width = (o.vals[j] * 100) + '%'; $('.bar-val', r).textContent = o.text ? o.text[j] : fmt.pct(o.vals[j]); });
      $('h4', read).textContent = o.h || o.label; $('p', read).textContent = o.p || '';
    }
    el.appendChild(row); el.appendChild(bars); el.appendChild(read);
    show(spec.initial || 0);
    return { show: show };
  }

  /* Horizontal bar chart that fills when scrolled into view.
     spec: {rows:[{label,value,text,kind,info}], max, read:'#id'} */
  function barchart(el, spec) {
    var max = spec.max || Math.max.apply(null, spec.rows.map(function (r) { return r.value; }));
    var box = document.createElement('div'); box.className = 'bars';
    var read = spec.read ? $(spec.read) : null;
    var rows = spec.rows.map(function (r) {
      var d = document.createElement('div'); d.className = 'bar sm'; if (read) { d.tabIndex = 0; d.style.cursor = 'default'; }
      d.innerHTML = '<span>' + esc(r.label) + '</span><span class="bar-t"><i class="bar-fill' + (r.kind === 'w' ? ' w' : '') + '"></i></span><span class="bar-val">' + esc(r.text || r.value) + '</span>';
      function show() { if (read && r.info) { $('h4', read).textContent = r.label; $('p', read).textContent = r.info; } }
      d.addEventListener('mouseenter', show); d.addEventListener('focus', show);
      box.appendChild(d); return d;
    });
    el.appendChild(box);
    function fill() { rows.forEach(function (d, i) { $('.bar-fill', d).style.width = (spec.rows[i].value / max * 100) + '%'; }); }
    if (!('IntersectionObserver' in window) || reduce) fill();
    else {
      rows.forEach(function (d) { $('.bar-fill', d).style.width = '0%'; });
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { fill(); io.disconnect(); } }, { threshold: .2 });
      io.observe(box);
    }
  }

  /* Tabbed explanations. items: [{label, html}] (html is trusted, authored in the page). */
  function tabs(el, items) {
    var row = document.createElement('div'); row.className = 'row'; row.style.marginBottom = '14px';
    var panel = document.createElement('div'); panel.className = 'tabpanel'; panel.setAttribute('aria-live', 'polite');
    var btns = items.map(function (it, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = it.label;
      b.addEventListener('click', function () { show(i); }); row.appendChild(b); return b;
    });
    function show(i) {
      setPressed(btns, btns[i]);
      panel.innerHTML = items[i].html;
      panel.classList.remove('in'); void panel.offsetWidth; panel.classList.add('in');
    }
    el.appendChild(row); el.appendChild(panel); show(0);
  }

  /* Count numbers up when they scroll into view. Markup: <b data-count="1600">1,600</b> */
  function initCounts() {
    var els = $$('[data-count]');
    if (!els.length || reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, to = +el.getAttribute('data-count'), final = el.textContent, t0 = performance.now();
        (function step(now) {
          var p = clamp((now - t0) / 900, 0, 1), v = to * (1 - Math.pow(1 - p, 3));
          el.textContent = p < 1 ? Math.round(v).toLocaleString('en-US') : final;
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: .6 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* Thin reading progress bar under the top edge. */
  function initProgress() {
    var bar = document.createElement('div'); bar.className = 'progress'; bar.innerHTML = '<i></i>';
    document.body.appendChild(bar);
    var i = bar.firstChild, ticking = false;
    function upd() {
      ticking = false;
      var h = document.documentElement.scrollHeight - innerHeight;
      i.style.transform = 'scaleX(' + (h > 0 ? clamp(scrollY / h, 0, 1) : 0) + ')';
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* ---------- start ---------- */

  function start() {
    guard('top', renderTop);
    guard('lists', renderLists);
    guard('rail', renderRail);
    guard('pager', renderPager);
    guard('foot', renderFoot);
    guard('theme', initTheme);
    queue.forEach(function (f) { guard(f[0], f[1]); });
    guard('lift', initLift);
    guard('spy', initSpy);
    guard('counts', initCounts);
    guard('progress', initProgress);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.Notes = {
    $: $, $$: $$, se: se, sp: sp, clamp: clamp, setPressed: setPressed, esc: esc,
    reduce: reduce, figure: figure, drag: drag, tween: tween,
    radial: radial, mindmap: mindmap, flashcards: flashcards,
    flow: flow, calc: calc, compare: compare, barchart: barchart, tabs: tabs, fmt: fmt
  };
})();
