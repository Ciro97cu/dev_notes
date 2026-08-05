// ── Evidenziatore (modalità pennarello, stile macOS Preview) ──────────────────
// Scegli un colore UNA volta: poi ogni selezione di testo si evidenzia in quel
// colore finché non cambi colore, passi alla gomma o esci (Esc). Rendering con
// CSS Custom Highlight API (nessuna mutazione del DOM → non rompe copy-code né i
// re-render). Persistenza robusta: ogni evidenziazione è {colore, heading, quote,
// testo-prima, testo-dopo}, ri-localizzata a ogni render (modello W3C
// TextQuoteSelector); se il testo esatto viene editato l'evidenziazione diventa
// orfana — conservata, non persa né crash. Storage cancellato → Esporta/Importa.
var DN_COLORS = [
  { k: 'yellow', label: 'Giallo',  bg: 'rgba(255,214,0,.45)' },
  { k: 'green',  label: 'Verde',   bg: 'rgba(52,199,89,.42)' },
  { k: 'blue',   label: 'Azzurro', bg: 'rgba(10,132,255,.38)' },
  { k: 'pink',   label: 'Rosa',    bg: 'rgba(255,55,120,.38)' },
  { k: 'purple', label: 'Viola',   bg: 'rgba(175,82,222,.40)' },
  { k: 'orange', label: 'Arancio', bg: 'rgba(255,149,0,.45)' },
  { k: 'accent', label: 'Tinta del vault', bg: 'color-mix(in srgb, var(--link) 42%, transparent)' }
];
var DN_PEN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>';
var DN_ERASER = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>';

var dnMode = 'off';   // 'off' | 'color' | 'erase'
var dnColor = 'yellow';
var dnHL = null;      // { colorKey: Highlight }
var dnRendered = [];  // [{range, item}] della pagina corrente (per la gomma)
var dnInited = false;

function dnSupported() { return !!(window.CSS && CSS.highlights && window.Highlight); }
function dnPath() { return window.__dnPath || ''; }

// Indice piatto dei text node del contenuto (escludendo la UI iniettata) per
// mappare offset globali ⇄ Range.
function dnTextIndex(root) {
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: function (n) {
      var p = n.parentNode;
      if (p && p.closest && p.closest('.dn-read-toggle,.dn-star,button,#dn-progress,.dn-fav-list')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  var nodes = [], text = '', n;
  while ((n = walker.nextNode())) { nodes.push({ node: n, start: text.length, len: n.nodeValue.length }); text += n.nodeValue; }
  return { text: text, nodes: nodes };
}
function dnGlobalOffset(index, node, off) {
  for (var i = 0; i < index.nodes.length; i++) if (index.nodes[i].node === node) return index.nodes[i].start + off;
  return -1;
}
function dnRangeAt(index, gStart, gEnd) {
  var r = document.createRange(), set = 0;
  for (var i = 0; i < index.nodes.length; i++) {
    var e = index.nodes[i], s = e.start, en = e.start + e.len;
    if (set === 0 && gStart >= s && gStart <= en) { r.setStart(e.node, gStart - s); set = 1; }
    if (set === 1 && gEnd >= s && gEnd <= en) { r.setEnd(e.node, gEnd - s); return r; }
  }
  return null;
}
function dnLocate(index, hl) {
  var needle = (hl.pre || '') + hl.q + (hl.suf || '');
  var at = index.text.indexOf(needle);
  if (at >= 0) { var qs = at + (hl.pre || '').length; return dnRangeAt(index, qs, qs + hl.q.length); }
  at = index.text.indexOf(hl.q);                       // fallback: solo il quote
  return at >= 0 ? dnRangeAt(index, at, at + hl.q.length) : null;
}
function dnScopeFor(node) {
  var sec = document.querySelector('.markdown-section'); if (!sec) return '';
  var hs = [].slice.call(sec.querySelectorAll('h1[id],h2[id],h3[id],h4[id]'));
  var el = node.nodeType === 1 ? node : node.parentNode, best = '';
  for (var i = 0; i < hs.length; i++) {
    if (hs[i].compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) best = hs[i].id; else break;
  }
  return best;
}
function dnRender(path) {
  if (!dnSupported() || !dnHL) return;
  dnRendered = [];
  Object.keys(dnHL).forEach(function (c) { dnHL[c].clear(); });
  var sec = document.querySelector('.markdown-section'); if (!sec) return;
  var store = window.NotesStore.read('highlights', {});
  if (!store || typeof store !== 'object') return;
  var list = store[path];
  if (!Array.isArray(list) || !list.length) return;
  var index = dnTextIndex(sec);
  list.forEach(function (hl) {
    if (!hl || typeof hl.q !== 'string' || !hl.q) return;  // voce malformata: ignora
    var range = dnLocate(index, hl); if (!range) return;   // orfana: si conserva, si salta
    var c = dnHL[hl.c] ? hl.c : 'yellow';
    dnHL[c].add(range);
    dnRendered.push({ range: range, item: hl });
  });
}
function dnCapture(color) {
  var sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return;
  var range = sel.getRangeAt(0);
  var sec = document.querySelector('.markdown-section');
  if (!sec || !sec.contains(range.startContainer) || !sec.contains(range.endContainer)) return;
  var quote = sel.toString(); if (!quote.trim()) return;
  var index = dnTextIndex(sec);
  var gs = dnGlobalOffset(index, range.startContainer, range.startOffset);
  var ge = dnGlobalOffset(index, range.endContainer, range.endOffset);
  if (gs < 0 || ge < 0 || ge <= gs) return;
  var item = { c: color, scope: dnScopeFor(range.startContainer), q: quote,
               pre: index.text.slice(Math.max(0, gs - 32), gs), suf: index.text.slice(ge, ge + 32) };
  var all = window.NotesStore.read('highlights', {}), p = dnPath();
  if (!all || typeof all !== 'object') all = {};
  if (!Array.isArray(all[p])) all[p] = [];
  all[p].push(item);
  window.NotesStore.write('highlights', all);
  sel.removeAllRanges();
  dnRender(p);
}
function dnEraseAt(x, y) {
  for (var i = 0; i < dnRendered.length; i++) {
    var rects = dnRendered[i].range.getClientRects();
    for (var j = 0; j < rects.length; j++) {
      var r = rects[j];
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        var it = dnRendered[i].item, all = window.NotesStore.read('highlights', {}), p = dnPath();
        if (!all || typeof all !== 'object') all = {};
        var list = Array.isArray(all[p]) ? all[p] : [];
        for (var k = 0; k < list.length; k++) {
          if (list[k].q === it.q && list[k].pre === it.pre && list[k].suf === it.suf && list[k].c === it.c) { list.splice(k, 1); break; }
        }
        all[p] = list; window.NotesStore.write('highlights', all);
        dnRender(p); return true;
      }
    }
  }
  return false;
}
function dnSetMode(mode, color) {
  dnMode = mode;
  if (color) dnColor = color;
  document.body.classList.toggle('dn-hl-mode', mode === 'color');
  document.body.classList.toggle('dn-hl-erase', mode === 'erase');
  var btn = document.getElementById('dn-hl-btn');
  if (btn) btn.classList.toggle('is-on', mode !== 'off');
  var pop = document.querySelector('.dn-hl-pop');
  if (pop) {
    [].forEach.call(pop.querySelectorAll('.dn-swatch'), function (s) { s.classList.toggle('active', mode === 'color' && s.getAttribute('data-c') === dnColor); });
    var er = pop.querySelector('[data-act=erase]'); if (er) er.classList.toggle('active', mode === 'erase');
  }
}
function dnInit() {
  if (dnInited || !dnSupported()) return;
  dnInited = true;
  var rules = [
    '#dn-hl{position:fixed;top:206px;right:16px;z-index:100}',
    '#dn-hl-btn{width:40px;height:40px;border-radius:50%;border:1px solid var(--border);background:var(--bg-soft);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}',
    '#dn-hl-btn:hover{border-color:var(--link);color:var(--link)}',
    '#dn-hl-btn.is-on{border-color:var(--link)}',
    '.dn-hl-pop{position:absolute;top:0;right:48px;width:214px;background:var(--bg-soft);border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 34px rgba(0,0,0,.2);padding:.55rem;display:none}',
    '.dn-hl-pop.open{display:block}',
    '.dn-hl-pop .dn-title{font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;opacity:.6;padding:.1rem .25rem .45rem}',
    '.dn-swatches{display:grid;grid-template-columns:repeat(7,1fr);gap:.28rem}',
    '.dn-swatch{height:26px;border-radius:6px;border:2px solid transparent;cursor:pointer;padding:0;box-shadow:inset 0 0 0 1px rgba(127,127,127,.25)}',
    '.dn-swatch:hover{transform:scale(1.08)}',
    '.dn-swatch.active{border-color:var(--text)}',
    '.dn-hl-actions{display:flex;gap:.4rem;margin-top:.55rem}',
    '.dn-hl-actions button{flex:1;display:flex;align-items:center;justify-content:center;gap:.4rem;padding:.45rem;border:1px solid var(--border);border-radius:8px;background:transparent;color:var(--text);font:inherit;font-size:.82rem;cursor:pointer}',
    '.dn-hl-actions button:hover{border-color:var(--link)}',
    '.dn-hl-actions button.active{border-color:var(--link);color:var(--link)}',
    '.dn-hl-hint{font-size:.72rem;opacity:.6;margin-top:.5rem;padding:0 .25rem;line-height:1.4}',
    'body.dn-hl-mode .markdown-section,body.dn-hl-mode .markdown-section *{cursor:text}',
    'body.dn-hl-erase .markdown-section,body.dn-hl-erase .markdown-section *{cursor:crosshair}'
  ];
  DN_COLORS.forEach(function (c) { rules.push('::highlight(dn-hl-' + c.k + '){background-color:' + c.bg + '}'); });
  var st = document.createElement('style'); st.id = 'dn-hl-styles'; st.textContent = rules.join('');
  (document.head || document.documentElement).appendChild(st);

  dnHL = {};
  DN_COLORS.forEach(function (c) { var h = new Highlight(); dnHL[c.k] = h; CSS.highlights.set('dn-hl-' + c.k, h); });

  document.addEventListener('mouseup', function () { if (dnMode === 'color') setTimeout(function () { dnCapture(dnColor); }, 0); });
  document.addEventListener('click', function (e) {
    if (dnMode !== 'erase') return;
    if (e.target.closest && e.target.closest('.markdown-section')) dnEraseAt(e.clientX, e.clientY);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dnMode !== 'off') dnSetMode('off'); });
}
function dnBuildToolbar() {
  dnInit();
  if (!dnSupported() || document.getElementById('dn-hl')) return;
  var sw = '';
  DN_COLORS.forEach(function (c) { sw += '<button class="dn-swatch" type="button" data-c="' + c.k + '" title="' + c.label + '" aria-label="' + c.label + '" style="background:' + c.bg + '"></button>'; });
  var w = document.createElement('div'); w.id = 'dn-hl';
  w.innerHTML =
    '<button id="dn-hl-btn" type="button" title="Evidenziatore" aria-label="Evidenziatore" aria-expanded="false">' + DN_PEN + '</button>' +
    '<div class="dn-hl-pop" role="menu"><div class="dn-title">Evidenziatore</div>' +
      '<div class="dn-swatches">' + sw + '</div>' +
      '<div class="dn-hl-actions"><button type="button" data-act="erase">' + DN_ERASER + 'Gomma</button><button type="button" data-act="off">Chiudi</button></div>' +
      '<div class="dn-hl-hint">Scegli un colore, poi seleziona il testo. Gomma → clic per rimuovere.</div>' +
    '</div>';
  document.body.appendChild(w);
  var btn = w.querySelector('#dn-hl-btn'), pop = w.querySelector('.dn-hl-pop');
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var willOpen = !pop.classList.contains('open');
    dnCloseAllPops(pop);                        // chiudi gli altri popover
    pop.classList.toggle('open', willOpen);
    btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  });
  document.addEventListener('click', function (e) { if (!w.contains(e.target)) pop.classList.remove('open'); });
  pop.addEventListener('click', function (e) {
    var s = e.target.closest && e.target.closest('.dn-swatch');
    if (s) { dnSetMode('color', s.getAttribute('data-c')); return; }
    var a = e.target.closest && e.target.closest('[data-act]');
    if (a) dnSetMode(a.getAttribute('data-act') === 'erase' ? 'erase' : 'off');
  });
}
// Plugin: costruisce la toolbar (una volta) e ri-applica le evidenziazioni a ogni pagina.
function highlighterPlugin(hook, vm) {
  hook.mounted(function () { dnBuildToolbar(); });
  hook.doneEach(function () {
    window.__dnPath = (vm.route && vm.route.path) || '';
    dnRender(window.__dnPath);
  });
  document.addEventListener('notesstore:change', function (e) {
    if (e.detail && (e.detail.name === 'highlights' || e.detail.name === '*')) dnRender(window.__dnPath || '');
  });
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
