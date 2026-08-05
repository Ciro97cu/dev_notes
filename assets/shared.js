/*
 * Codice CONDIVISO da tutti i vault dell'hub — una sola fonte di verità.
 * Contiene l'anti-flash del tema e i plugin docsify riusabili (tema, mermaid,
 * callout collassabili, "Riprendi", puntini della cover). Quando qualcosa cambia
 * qui, cambia per tutti i vault.
 *
 * Ogni vault lo carica con <script src="../assets/shared.js"> PRIMA del proprio
 * assets/app.js (che definisce le parti specifiche: wikilink e window.$docsify).
 * La chiave di "Riprendi" è per-vault: il vault imposta window.__VAULT in app.js.
 */

// Anti-flash: imposta il tema il prima possibile, prima del render di docsify.
(function () {
  try {
    var saved = localStorage.getItem('dev-notes-theme');
    var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();

// Espansione fluida delle sezioni "Come funziona" sulla cover: il click sull'header
// commuta la classe .open sul contenitore (l'animazione è CSS, grid-template-rows).
document.addEventListener('click', function (e) {
  var h = e.target && e.target.closest && e.target.closest('.about-head');
  if (!h) return;
  var col = h.parentNode;
  var open = col.classList.toggle('open');
  h.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// Toggle tema chiaro/scuro, persistito in localStorage (key: dev-notes-theme).
// Il ramo mermaid è no-op nei vault che non caricano mermaid.
function themeTogglePlugin(hook) {
  hook.mounted(function () {
    var KEY = 'dev-notes-theme';
    var btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Cambia tema chiaro/scuro');
    var saved = localStorage.getItem(KEY);
    var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    function apply() {
      document.documentElement.classList.toggle('dark', dark);
      btn.textContent = dark ? '☀' : '☾';
      btn.title = dark ? 'Passa al tema chiaro' : 'Passa al tema scuro';
      if (window.mermaid && window.__mermaidInit) {
        mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'neutral' });
      }
    }
    apply();
    btn.addEventListener('click', function () {
      dark = !dark;
      localStorage.setItem(KEY, dark ? 'dark' : 'light');
      apply();
    });
    document.body.appendChild(btn);
  });
}

// Renderizza i diagrammi mermaid dopo ogni cambio pagina (attivo solo se mermaid è caricato).
function mermaidPlugin(hook) {
  hook.doneEach(function () {
    if (!window.mermaid) return;
    if (!window.__mermaidInit) {
      var darkNow = document.documentElement.classList.contains('dark');
      mermaid.initialize({ startOnLoad: false, theme: darkNow ? 'dark' : 'neutral' });
      window.__mermaidInit = true;
    }
    try { mermaid.run({ querySelector: '.markdown-section .mermaid' }); } catch (e) { /* già renderizzati */ }
  });
}

// Rende collassabili i callout "Risposta" (Obsidian [!success]- / [!success]+) sul sito.
function collapsibleAnswersPlugin(hook) {
  hook.doneEach(function () {
    var callouts = document.querySelectorAll('.markdown-section .alert.callout-answer');
    callouts.forEach(function (el) {
      if (el.dataset.collapsibleReady) return;
      var heading = el.querySelector('p:first-child, .alert-heading, strong');
      if (!heading) return;
      var raw = (heading.textContent || '').trim();
      var startsCollapsed = true;
      if (/^[-+]/.test(raw)) {
        startsCollapsed = raw.charAt(0) === '-';
        heading.textContent = raw.replace(/^[-+]\s*/, '');
      }
      el.classList.add('is-collapsible');
      el.dataset.collapsibleReady = '1';
      var body = [];
      var n = heading.nextSibling;
      while (n) { body.push(n); n = n.nextSibling; }
      var wrap = document.createElement('div');
      wrap.className = 'answer-body';
      body.forEach(function (node) { wrap.appendChild(node); });
      el.appendChild(wrap);
      heading.classList.add('answer-toggle');
      heading.setAttribute('role', 'button');
      heading.setAttribute('tabindex', '0');
      function setState(open) {
        el.classList.toggle('open', open);
        heading.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      setState(!startsCollapsed);
      heading.addEventListener('click', function () { setState(!el.classList.contains('open')); });
      heading.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setState(!el.classList.contains('open')); }
      });
    });
  });
}

// "Riprendi": memorizza l'ultima posizione di lettura (pagina + sotto-sezione) e popola
// la card #nav-resume sulla cover (nascosta finché non c'è cronologia). La sotto-sezione
// è l'ultima heading superata durante lo scroll → si riapre esattamente lì (?id=…).
// Chiave per-vault via window.__VAULT.
function resumePlugin(hook, vm) {
  var KEY = (window.__VAULT || 'dev-notes') + '-last-page';
  var SKIP = { '/': 1, '/00-index': 1, '/README': 1, '/_coverpage': 1 };
  var current = null, timer = null;

  // id dell'ultima heading (h1..h4) il cui bordo superiore è sopra la soglia = sezione corrente
  function currentId() {
    var hs = document.querySelectorAll('.markdown-section h1[id], .markdown-section h2[id], .markdown-section h3[id], .markdown-section h4[id]');
    var id = '';
    for (var i = 0; i < hs.length; i++) {
      if (hs[i].getBoundingClientRect().top <= 120) id = hs[i].id; else break;
    }
    return id;
  }
  function persist() {
    if (!current) return;
    try { localStorage.setItem(KEY, JSON.stringify({ p: current, id: currentId() })); } catch (e) {}
  }
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      if (raw.charAt(0) === '{') return JSON.parse(raw);
      return { p: raw, id: '' };   // retro-compatibilità con la vecchia chiave (solo path)
    } catch (e) { return null; }
  }

  hook.doneEach(function () {
    var path = (vm.route && vm.route.path) || '';
    current = (path && !SKIP[path]) ? path : null;
    if (current) persist();   // salva almeno la pagina appena arrivati

    var card = document.getElementById('nav-resume');
    if (!card) return;
    var rec = read();
    if (rec && rec.p && !SKIP[rec.p]) {
      card.setAttribute('href', '#' + rec.p + (rec.id ? '?id=' + rec.id : ''));
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });

  // mentre si scorre, aggiorna la sotto-sezione salvata (debounced); capture per intercettare
  // lo scroll su qualsiasi contenitore.
  document.addEventListener('scroll', function () {
    if (!current) return;
    clearTimeout(timer);
    timer = setTimeout(persist, 200);
  }, true);
}

// Puntini interattivi sulla cover: griglia su <canvas>, respinta dal cursore.
// A riposo non consuma CPU (rAF solo mentre i puntini si muovono/riassestano).
// Il colore dei puntini e lo sfondo sono definiti in CSS per ciascun vault.
function coverDotsPlugin(hook) {
  hook.ready(function () {
    var cover = document.querySelector('section.cover');
    if (!cover || cover.querySelector('#cover-dots')) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canvas = document.createElement('canvas');
    canvas.id = 'cover-dots';
    cover.insertBefore(canvas, cover.firstChild);
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var GAP = 28, R = 1.5, INFLU = 120, PUSH = 26, EASE = 0.15;
    var dots = [], W = 0, H = 0, mx = -9999, my = -9999, raf = null;

    function build() {
      var r = cover.getBoundingClientRect();
      W = Math.ceil(r.width); H = Math.ceil(r.height);
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
      ctx.fillStyle = 'rgba(255,255,255,.16)';
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        ctx.beginPath();
        ctx.arc(d.x, d.y, R, 0, 6.2832);
        ctx.fill();
      }
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

    build();
    if ('ResizeObserver' in window) new ResizeObserver(build).observe(cover);
    else window.addEventListener('resize', build);
    if (reduce) return;   // reduced-motion: griglia statica, niente animazione
    cover.addEventListener('pointermove', function (e) {
      var r = cover.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top; kick();
    });
    cover.addEventListener('pointerleave', function () { mx = my = -9999; kick(); });
  });
}
