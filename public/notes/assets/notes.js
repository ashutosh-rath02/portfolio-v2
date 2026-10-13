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
        var live = b.chapters.filter(function (c) { return c.status === 'live'; }).length;
        return '<article class="book"><h2><a href="' + bookHref(b) + '" style="text-decoration:none">' + esc(b.title) + '</a></h2>' +
          '<p class="meta">' + esc(b.author) + ' · ' + esc(b.publisher) + ' · ' + b.year + ' · ' + live + ' of ' + b.chapters.length + ' chapters written</p>' +
          '<p>' + esc(b.summary) + '</p>' + tocRows(b, false) + '</article>';
      }).join('');
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
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.Notes = {
    $: $, $$: $$, se: se, sp: sp, clamp: clamp, setPressed: setPressed, esc: esc,
    reduce: reduce, figure: figure, drag: drag, tween: tween,
    radial: radial, mindmap: mindmap, flashcards: flashcards
  };
})();
