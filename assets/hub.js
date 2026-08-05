// Script dell'hub: toggle tema, banner "Riprendi", % di lettura sulle card, puntini di sfondo.

(function () {
  var KEY = 'dev-notes-theme';
  var btn = document.getElementById('theme-toggle');
  var isDark = function () { return document.documentElement.classList.contains('dark'); };
  var SUN = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
  var MOON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
  var paint = function () { btn.innerHTML = isDark() ? SUN : MOON; btn.title = isDark() ? 'Passa al tema chiaro' : 'Passa al tema scuro'; };
  paint();
  btn.addEventListener('click', function () {
    var d = !isDark();
    document.documentElement.classList.toggle('dark', d);
    try { localStorage.setItem(KEY, d ? 'dark' : 'light'); } catch (e) {}
    paint();
  });
})();


// "Continua a leggere": legge le ultime posizioni salvate da ogni vault
// (chiavi <vault>-last-page in localStorage, condiviso sulla stessa origine)
// e mostra il banner verso quella col timestamp più recente.
(function () {
  var VAULTS = {
    git: { n: 'Git', a: '#f05133' }, javascript: { n: 'JavaScript', a: '#e6c200' },
    typescript: { n: 'TypeScript', a: '#3178c6' }, angular: { n: 'Angular', a: '#dd0031' },
    css: { n: 'CSS', a: '#1572b6' }, glossario: { n: 'Glossario', a: '#6366f1' }
  };
  var SKIP = { '/': 1, '/README': 1, '/_coverpage': 1, '': 1 };
  var best = null;
  Object.keys(VAULTS).forEach(function (v) {
    var raw; try { raw = localStorage.getItem(v + '-last-page'); } catch (e) { return; }
    if (!raw) return;
    var rec; try { rec = JSON.parse(raw); } catch (e) { rec = { p: raw, id: '', t: 0 }; }
    if (!rec || typeof rec.p !== 'string' || SKIP[rec.p]) return;
    var t = rec.t || 0;
    if (!best || t > best.t) best = { v: v, p: rec.p, id: rec.id || '', t: t };
  });
  if (!best) return;
  var el = document.getElementById('hub-resume');
  if (!el) return;
  var meta = VAULTS[best.v];
  var seg = best.p.split('/').filter(Boolean).pop() || '';
  var title = seg.replace(/^\d+[-.]*/, '').replace(/[-_]/g, ' ').trim();
  title = title ? title.charAt(0).toUpperCase() + title.slice(1) : '';
  el.href = best.v + '/#' + best.p + (best.id ? '?id=' + best.id : '');
  el.style.setProperty('--accent', meta.a);
  el.querySelector('.resume-v').textContent = meta.n + (title ? ' · ' + title : '');
  el.hidden = false;
})();


// % di lettura per ogni card (a livello di capitolo), scritta da ogni vault in
// dev-notes-<vault>-progress = {d,t}. Fiamma animata nel colore del vault.
(function () {
  [].forEach.call(document.querySelectorAll('.card'), function (card) {
    var vault = (card.getAttribute('href') || '').replace(/\/+$/, '').replace(/^.*\//, '');
    if (!vault) return;
    var rec; try { rec = JSON.parse(localStorage.getItem('dev-notes-' + vault + '-progress')); } catch (e) { rec = null; }
    if (!rec || !rec.t) return;
    var pct = Math.round((rec.d || 0) / rec.t * 100);
    var bar = document.createElement('span');
    bar.className = 'card-prog';
    bar.title = pct + '% letto';
    var fill = document.createElement('span');
    fill.className = 'fill';
    fill.style.width = pct + '%';
    bar.appendChild(fill);
    var lbl = document.createElement('span');
    lbl.className = 'card-pct';
    lbl.textContent = pct + '%';
    var wrap = document.createElement('span');
    wrap.className = 'card-prog-wrap';
    wrap.appendChild(bar);
    wrap.appendChild(lbl);                                     // % inline accanto alla barra
    (card.querySelector('.body') || card).appendChild(wrap);  // riga barra+% sotto la descrizione
  });
})();


// Puntini di sfondo con dispersione al cursore (canvas fisso alla viewport).
// rAF solo mentre il cursore si muove (a riposo zero CPU); reduced-motion → statici.
(function () {
  var canvas = document.getElementById('bg-dots');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var GAP = 30, R = 1.6, INFLU = 130, PUSH = 30, EASE = 0.15;
  var dots = [], W = 0, H = 0, mx = -9999, my = -9999, raf = null, color = '#0f172a';

  function readColor() {
    color = (getComputedStyle(document.documentElement).getPropertyValue('--fg') || '#0f172a').trim();
  }
  function build() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = [];
    for (var y = GAP / 2; y < H; y += GAP)
      for (var x = GAP / 2; x < W; x += GAP)
        dots.push({ x: x, y: y, ox: x, oy: y });
    draw();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = color;
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      ctx.beginPath();
      ctx.arc(d.x, d.y, R, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function tick() {
    var moving = false;
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i], tx = d.ox, ty = d.oy;
      var dx = d.ox - mx, dy = d.oy - my, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < INFLU && dist > 0.001) {
        var f = 1 - dist / INFLU;
        tx = d.ox + (dx / dist) * f * PUSH;
        ty = d.oy + (dy / dist) * f * PUSH;
      }
      d.x += (tx - d.x) * EASE;
      d.y += (ty - d.y) * EASE;
      if (Math.abs(tx - d.x) > 0.1 || Math.abs(ty - d.y) > 0.1) moving = true;
    }
    draw();
    raf = moving ? requestAnimationFrame(tick) : null;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }

  readColor();
  build();
  window.addEventListener('resize', build);
  new MutationObserver(function () { readColor(); draw(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  if (reduce) return;   // reduced-motion: griglia statica
  window.addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; kick(); });
  window.addEventListener('pointerleave', function () { mx = my = -9999; kick(); });
})();
