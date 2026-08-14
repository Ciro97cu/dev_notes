// ── Evidenziatore (modalità pennarello, stile macOS Preview) ──────────────────
// Scegli un colore UNA volta: poi ogni selezione di testo si evidenzia in quel
// colore finché non cambi colore o esci (Esc); tap = parola, ritocca per togliere. Rendering con
// CSS Custom Highlight API (nessuna mutazione del DOM → non rompe copy-code né i
// re-render). Persistenza robusta: ogni evidenziazione è {colore, heading, quote,
// testo-prima, testo-dopo}, ri-localizzata a ogni render (modello W3C
// TextQuoteSelector); se il testo esatto viene editato l'evidenziazione diventa
// orfana — conservata, non persa né crash. Storage cancellato → Esporta/Importa.
// Colori in OKLCH a luminosità uniforme (L 0.80): vividi ma tutti abbastanza chiari
// da reggere testo scuro. Opachi (niente shift di tono tra tema chiaro/scuro). Il
// testo evidenziato è forzato scuro nella regola ::highlight() → leggibile in entrambi
// i temi. L'accent prende tinta/saturazione del vault ma con la stessa L (relative color).
var DN_COLORS = [
  { k: 'yellow', label: 'Giallo',  bg: 'oklch(0.8 0.185 100)' },
  { k: 'green',  label: 'Verde',   bg: 'oklch(0.8 0.16 150)' },
  { k: 'blue',   label: 'Azzurro', bg: 'oklch(0.8 0.11 245)' },
  { k: 'pink',   label: 'Rosa',    bg: 'oklch(0.8 0.13 2)' },
  { k: 'purple', label: 'Viola',   bg: 'oklch(0.8 0.13 305)' },
  { k: 'orange', label: 'Arancio', bg: 'oklch(0.8 0.17 66)' },
  { k: 'accent', label: 'Tinta del vault', bg: 'oklch(from var(--link) 0.8 c h)' }
];
var DN_PEN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>';

var dnMode = 'off';   // 'off' | 'color'
var dnColor = 'yellow';
var dnHL = null;      // { colorKey: Highlight }
var dnRendered = [];  // [{range, item}] evidenziazioni rese nella pagina corrente
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
// Offset globali [start,end] di un'evidenziazione salvata, dal suo testo-ancora.
function dnItemOffsets(index, hl) {
  var needle = (hl.pre || '') + hl.q + (hl.suf || '');
  var at = index.text.indexOf(needle);
  if (at >= 0) { var qs = at + (hl.pre || '').length; return [qs, qs + hl.q.length]; }
  at = index.text.indexOf(hl.q);
  return at >= 0 ? [at, at + hl.q.length] : null;
}
// Caret sotto il punto (x,y), con fallback tra i due standard.
function dnCaretAt(x, y) {
  if (document.caretRangeFromPoint) { var r = document.caretRangeFromPoint(x, y); return r ? { node: r.startContainer, offset: r.startOffset } : null; }
  if (document.caretPositionFromPoint) { var p = document.caretPositionFromPoint(x, y); return p ? { node: p.offsetNode, offset: p.offset } : null; }
  return null;
}
// Range della PAROLA sotto il punto (per il tap singolo su mobile).
function dnWordRangeAt(x, y) {
  var pos = dnCaretAt(x, y); if (!pos || pos.node.nodeType !== 3) return null;
  var sec = document.querySelector('.markdown-section');
  if (!sec || !sec.contains(pos.node)) return null;
  var t = pos.node.nodeValue, off = pos.offset, isW = function (ch) { return ch && /[\p{L}\p{N}_]/u.test(ch); };
  if (off >= t.length) off = t.length - 1;
  if (off < 0) return null;
  if (!isW(t[off])) { if (off > 0 && isW(t[off - 1])) off--; else return null; }
  var s = off, e = off + 1;
  while (s > 0 && isW(t[s - 1])) s--;
  while (e < t.length && isW(t[e])) e++;
  if (e <= s) return null;
  var r = document.createRange(); r.setStart(pos.node, s); r.setEnd(pos.node, e); return r;
}
// Evidenzia (o toglie) la parola sotto il punto, riusando dnCapture (toggle).
function dnHighlightWordAt(x, y) {
  var r = dnWordRangeAt(x, y); if (!r) return;
  var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
  dnCapture(dnColor);
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
  var all = window.NotesStore.read('highlights', {}), p = dnPath();
  if (!all || typeof all !== 'object') all = {};
  if (!Array.isArray(all[p])) all[p] = [];
  // Toggle: se la nuova selezione tocca evidenziazioni esistenti, le RIMUOVE (niente gomma).
  var removed = false;
  for (var i = all[p].length - 1; i >= 0; i--) {
    var off = dnItemOffsets(index, all[p][i]); if (!off) continue;
    if (gs < off[1] && off[0] < ge) { all[p].splice(i, 1); removed = true; }
  }
  if (!removed) {
    all[p].push({ c: color, scope: dnScopeFor(range.startContainer), q: quote,
                  pre: index.text.slice(Math.max(0, gs - 32), gs), suf: index.text.slice(ge, ge + 32) });
  }
  window.NotesStore.write('highlights', all);
  sel.removeAllRanges();
  dnRender(p);
}
function dnSetMode(mode, color) {
  dnMode = mode;
  if (color) dnColor = color;
  document.body.classList.toggle('dn-hl-mode', mode === 'color');
  var btn = document.getElementById('dn-hl-btn');
  if (btn) btn.classList.toggle('is-on', mode !== 'off');
  var pop = document.querySelector('.dn-hl-pop');
  if (pop) {
    [].forEach.call(pop.querySelectorAll('.dn-swatch'), function (s) { s.classList.toggle('active', mode === 'color' && s.getAttribute('data-c') === dnColor); });
  }
}
function dnInit() {
  if (dnInited || !dnSupported()) return;
  dnInited = true;
  var rules = [
    '#dn-hl{position:fixed;bottom:232px;right:16px;z-index:100}',
    '#dn-hl-btn{width:44px;height:44px;border-radius:50%;border:1px solid var(--border);background:var(--bg-soft);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}',
    '#dn-hl-btn:hover{border-color:var(--link);color:var(--link)}',
    '#dn-hl-btn.is-on{border-color:var(--link)}',
    '.dn-hl-pop{position:absolute;bottom:0;right:48px;width:214px;background:var(--bg-soft);border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 34px rgba(0,0,0,.2);padding:.55rem;opacity:0;visibility:hidden;transform:scale(.94);transform-origin:bottom right;transition:opacity .16s ease,transform .2s cubic-bezier(.34,1.56,.64,1),visibility 0s linear .2s}',
    '.dn-hl-pop.open{opacity:1;visibility:visible;transform:none;transition:opacity .16s ease,transform .2s cubic-bezier(.34,1.56,.64,1)}',
    '@media (prefers-reduced-motion: reduce){.dn-hl-pop{transition:none;transform:none}.dn-hl-pop.open{transition:none}}',
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
    'body.dn-hl-mode .markdown-section,body.dn-hl-mode .markdown-section *{cursor:text}'
  ];
  // color:#1a1a1a → testo evidenziato sempre scuro, leggibile su ogni tinta in chiaro e scuro
  DN_COLORS.forEach(function (c) { rules.push('::highlight(dn-hl-' + c.k + '){background-color:' + c.bg + ';color:#1a1a1a}'); });
  var st = document.createElement('style'); st.id = 'dn-hl-styles'; st.textContent = rules.join('');
  (document.head || document.documentElement).appendChild(st);

  dnHL = {};
  DN_COLORS.forEach(function (c) { var h = new Highlight(); dnHL[c.k] = h; CSS.highlights.set('dn-hl-' + c.k, h); });

  document.addEventListener('mouseup', function () { if (dnMode === 'color') setTimeout(function () { dnCapture(dnColor); }, 0); });
  // Mobile/touch: dopo la selezione con le maniglie native non arriva un 'mouseup'
  // affidabile → si cattura quando la selezione si ASSESTA (selectionchange con
  // debounce), ma solo se l'ultima interazione era touch/pen: su mouse resta il
  // percorso 'mouseup' (niente doppie evidenziazioni). Dopo dnCapture la selezione si
  // svuota → il selectionchange successivo la trova collassata e non fa nulla.
  var dnLastTouch = false, dnSelTimer = null;
  document.addEventListener('pointerdown', function (e) { dnLastTouch = e.pointerType === 'touch' || e.pointerType === 'pen'; }, true);
  document.addEventListener('selectionchange', function () {
    if (dnMode !== 'color' || !dnLastTouch) return;
    clearTimeout(dnSelTimer);
    dnSelTimer = setTimeout(function () {
      var sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.rangeCount) dnCapture(dnColor);
    }, 400);
  });
  // Tap singolo (touch/pen) in modalità colore → evidenzia/toglie la PAROLA toccata.
  // La pressione lunga fa partire la selezione nativa (estendibile con le maniglie),
  // catturata invece dal selectionchange qui sopra.
  document.addEventListener('click', function (e) {
    if (dnMode !== 'color' || !dnLastTouch) return;
    if (!(e.target.closest && e.target.closest('.markdown-section'))) return;
    var sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.rangeCount) return;   // selezione da long-press → la gestisce il selectionchange
    dnHighlightWordAt(e.clientX, e.clientY);
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
      '<div class="dn-hl-actions"><button type="button" data-act="off">Chiudi</button></div>' +
      '<div class="dn-hl-hint">Scegli un colore, poi tocca una parola o seleziona il testo. Ripassaci sopra per togliere l\'evidenziazione.</div>' +
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
    if (a) dnSetMode('off');
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
