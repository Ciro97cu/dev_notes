/*
 * Ricerca dell'hub — command palette (⌘K / Ctrl+K) che cerca in TUTTI i vault.
 *
 * Come funziona, zero-build e tutto lato client:
 *  1. alla prima apertura fa fetch di ogni <vault>/_sidebar.md (il manifesto delle
 *     pagine + titoli), poi degli .md linkati, ne estrae testo/intestazioni;
 *  2. costruisce un indice full-text unico e lo mette in cache in localStorage con
 *     chiave legata a DN_VERSION → si ricostruisce da solo quando bumpi la versione;
 *  3. i risultati sono raggruppati per vault e colorati col colore-brand di ciascuno.
 * Nessuna dipendenza esterna, nessuna modifica alla CSP (fetch same-origin).
 */
(function () {
  var VAULTS = [
    { k: 'html',       n: 'HTML',       a: '#e34f26' },
    { k: 'css',        n: 'CSS',        a: '#1572b6' },
    { k: 'javascript', n: 'JavaScript', a: '#e6c200' },
    { k: 'typescript', n: 'TypeScript', a: '#3178c6' },
    { k: 'angular',    n: 'Angular',    a: '#dd0031' },
    { k: 'git',        n: 'Git',        a: '#f05133' },
    { k: 'terminale',  n: 'Terminale',  a: '#64748b' },
    { k: 'code',       n: 'Code',       a: '#059669' },
    { k: 'glossario',  n: 'Glossario',  a: '#78716c' }
  ];
  var META = {}, ORDER = {};
  VAULTS.forEach(function (v, i) { META[v.k] = v; ORDER[v.k] = i; });

  var CACHE_KEY = 'dn-hub-search-index';
  var MAX_PER_VAULT = 8, DEBOUNCE = 110;
  var isMac = /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent || '');

  var host, pill;
  var overlay, backdrop, input, listEl, statusEl;
  var index = null, building = null;
  var rows = [];            // risultati selezionabili (in ordine di lista)
  var active = -1;
  var lastFocus = null, debTimer = null, uid = 0;
  var state = { 'case': false, word: false, regex: false };   // toggle: Aa (maiuscole) · W (parola intera) · .* (regex)

  // ─────────────────────────── util ──────────────────────────────────────
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function slugify(s) {                       // approssima lo slug delle intestazioni docsify
    return String(s).toLowerCase().trim()
      .replace(/`/g, '').replace(/[<>]/g, '')
      .replace(/[\s ]+/g, '-')
      .replace(/[^\wÀ-ɏ-]/g, '')
      .replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  function cleanTitle(s) {                    // testo del link di sidebar → titolo leggibile
    return String(s).replace(/`/g, '').replace(/\s+/g, ' ').trim();
  }

  function plain(md) {                        // markdown → testo piano cercabile
    return md
      .replace(/^---\n[\s\S]*?\n---\n/, '')   // frontmatter
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')  // blocchi SVG interi
      .replace(/```[^\n]*\n?/g, ' ')          // righe di fence (```html … e chiusura)
      .replace(/`([^`]+)`/g, '$1')            // code inline → contenuto
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')  // immagini
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')// link → testo
      .replace(/<[^>]+>/g, ' ')               // tag html rimasti
      .replace(/&[a-z]+;/gi, ' ')             // entità (&lt; ecc.)
      .replace(/[#>*_~|]+/g, ' ')             // punteggiatura markdown
      .replace(/\s+/g, ' ').trim();
  }

  function headings(md) {                     // [{t, id}] dalle intestazioni ## …
    var out = [], re = /^(#{1,6})\s+(.+?)\s*#*$/gm, m;
    while ((m = re.exec(md))) {
      var t = cleanTitle(m[2].replace(/<[^>]+>/g, ''));
      if (t) out.push({ t: t, id: slugify(t) });
    }
    return out;
  }

  // ───────────────────────── costruzione indice ──────────────────────────
  function parseSidebar(md, k) {
    var re = /\[([^\]]+)\]\(([^)]+)\)/g, m, seen = {}, pages = [];
    while ((m = re.exec(md))) {
      var href = m[2].split('#')[0].split('?')[0].trim();
      if (!/\.md$/i.test(href)) continue;                 // solo pagine .md (salta /README, esterni)
      var rel = href.replace(/^\//, '');                  // path nel vault, senza slash iniziale
      if (seen[rel]) continue; seen[rel] = 1;
      pages.push({
        title: cleanTitle(m[1]),
        fetchPath: k + '/' + rel,
        route: k + '/#/' + rel.replace(/\.md$/i, '')
      });
    }
    return pages;
  }

  function makeDoc(k, p, text) {
    var body = plain(text).slice(0, 3500);
    return { k: k, title: p.title, route: p.route, h: headings(text), body: body };
  }

  function indexVault(v) {
    return fetch(v.k + '/_sidebar.md')
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (md) {
        return Promise.all(parseSidebar(md, v.k).map(function (p) {
          return fetch(p.fetchPath)
            .then(function (r) { return r.ok ? r.text() : ''; })
            .then(function (t) { return t ? makeDoc(v.k, p, t) : null; })
            .catch(function () { return null; });
        }));
      })
      .then(function (docs) { return docs.filter(Boolean); })
      .catch(function () { return []; });
  }

  function hydrate(docs) {
    docs.forEach(function (d) {
      d._hay = (d.title + ' ' + d.h.map(function (x) { return x.t; }).join(' ') + ' ' + d.body).toLowerCase();
    });
    return docs;
  }

  function ensureIndex() {
    if (index) return Promise.resolve(index);
    if (building) return building;
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        var c = JSON.parse(raw);
        if (c && c.v === (window.DN_VERSION || '?') && c.docs && c.docs.length) {
          index = hydrate(c.docs);
          return Promise.resolve(index);
        }
      }
    } catch (e) {}
    setStatus('Indicizzo gli appunti…');
    building = Promise.all(VAULTS.map(indexVault)).then(function (arr) {
      var docs = [].concat.apply([], arr);
      index = hydrate(docs);
      building = null;
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          v: window.DN_VERSION || '?', t: Date.now(),
          docs: docs.map(function (d) { return { k: d.k, title: d.title, route: d.route, h: d.h, body: d.body }; })
        }));
      } catch (e) {}
      return index;
    });
    return building;
  }

  // ─────────────────────────── ricerca ───────────────────────────────────
  // I toggle (Aa · W · .*) trasformano la query in una lista di matcher RegExp,
  // stessa logica della ricerca dei vault: flag `i` salvo case-sensitive,
  // lookbehind/lookahead per la parola intera, pattern grezzo in modalità regex.
  function compile(q) {
    var flags = 'g' + (state['case'] ? '' : 'i');
    var L = '[A-Za-z0-9_À-ÿ]';
    function wrap(src) { return state.word ? '(?<!' + L + ')(?:' + src + ')(?!' + L + ')' : src; }
    if (state.regex) return [new RegExp(wrap(q), flags)];       // tutta la query come UN solo regex
    return q.split(/\s+/).filter(Boolean).map(function (t) {    // altrimenti: un matcher per token
      return new RegExp(wrap(escRe(t)), flags);
    });
  }
  function reHits(re, text) { re.lastIndex = 0; return re.test(text); }

  function search(reList) {
    if (!reList.length || !index) return [];
    var hits = [];
    index.forEach(function (d) {
      var score = 0, ok = true;
      for (var i = 0; i < reList.length; i++) {
        var re = reList[i], s = 0;
        if (reHits(re, d.title)) s = 8;
        else if (d.h.some(function (x) { return reHits(re, x.t); })) s = 4;
        else if (reHits(re, d.body)) s = 2;
        if (!s) { ok = false; break; }
        score += s;
      }
      if (!ok) return;
      reList[0].lastIndex = 0;                                  // bonus: primo matcher a inizio titolo
      var m0 = reList[0].exec(d.title);
      if (m0 && m0.index === 0) score += 5;
      hits.push({ d: d, score: score });
    });
    hits.sort(function (a, b) {
      return b.score - a.score || ORDER[a.d.k] - ORDER[b.d.k] || a.d.title.localeCompare(b.d.title);
    });
    return hits;
  }

  function bestAnchor(d, reList) {             // prima intestazione che matcha → deep-link
    for (var i = 0; i < d.h.length; i++) {
      var t = d.h[i].t;
      if (reList.some(function (re) { return reHits(re, t); })) return d.h[i].id;
    }
    return '';
  }

  function snippet(d, reList) {
    var body = d.body, idx = -1;
    reList.forEach(function (re) { re.lastIndex = 0; var m = re.exec(body); if (m && (idx < 0 || m.index < idx)) idx = m.index; });
    if (idx < 0) {                            // match solo nel titolo/intestazioni
      var h0 = d.h.find(function (x) { return reList.some(function (re) { return reHits(re, x.t); }); });
      return { text: h0 ? h0.t : body.slice(0, 90), pre: false, post: !!body };
    }
    var start = Math.max(0, idx - 42), end = Math.min(body.length, idx + 90);
    return { text: body.slice(start, end), pre: start > 0, post: end < body.length };
  }

  function highlight(text, reList) {
    if (!reList || !reList.length) return esc(text);
    var ranges = [];
    reList.forEach(function (re) {
      re.lastIndex = 0; var m;
      while ((m = re.exec(text))) {
        if (m[0]) ranges.push([m.index, m.index + m[0].length]);
        if (re.lastIndex === m.index) re.lastIndex++;           // evita il loop sui match a larghezza zero
      }
    });
    if (!ranges.length) return esc(text);
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [ranges[0]];
    for (var i = 1; i < ranges.length; i++) {
      var last = merged[merged.length - 1];
      if (ranges[i][0] <= last[1]) last[1] = Math.max(last[1], ranges[i][1]);
      else merged.push(ranges[i]);
    }
    var out = '', pos = 0;
    merged.forEach(function (r) {
      out += esc(text.slice(pos, r[0])) + '<mark>' + esc(text.slice(r[0], r[1])) + '</mark>';
      pos = r[1];
    });
    return out + esc(text.slice(pos));
  }

  // ─────────────────────────── rendering ─────────────────────────────────
  function setStatus(msg) {
    if (!statusEl) return;
    statusEl.textContent = msg || '';
    statusEl.hidden = !msg;
  }
  // Variante con HTML fidato (solo markup nostro + esc(q)) per gli stati con azione di recupero.
  function setStatusHTML(html) {
    if (!statusEl) return;
    statusEl.innerHTML = html || '';
    statusEl.hidden = !html;
  }
  function anyTog() { return !!(state['case'] || state.word || state.regex); }

  function render(q) {
    rows = []; active = -1;
    if (!q) { listEl.innerHTML = ''; setStatus(building ? 'Indicizzo gli appunti…' : 'Scrivi per cercare in tutti i vault.'); syncActive(); return; }
    if (!index) { listEl.innerHTML = ''; setStatus('Indicizzo gli appunti…'); syncActive(); return; }
    var reBtn = overlay.querySelector('.dn-pal-tog[data-t="regex"]');
    if (reBtn) reBtn.classList.remove('is-error');            // ripulisci l'evidenziazione errore a ogni giro
    var reList;
    try { reList = compile(q); }
    catch (e) {
      listEl.innerHTML = '';
      setStatusHTML('Espressione regolare non valida. <button type="button" class="dn-pal-fix" data-fix="offregex" title="Disattiva la modalità regex (Alt+R)">Disattiva <code>.*</code></button>');
      if (reBtn) reBtn.classList.add('is-error');
      syncActive(); return;
    }
    if (!reList.length) { listEl.innerHTML = ''; setStatus('Scrivi per cercare in tutti i vault.'); syncActive(); return; }
    var hits = search(reList);
    if (!hits.length) {
      listEl.innerHTML = '';
      setStatusHTML('Nessun risultato per «' + esc(q) + '».' + (anyTog() ? ' <button type="button" class="dn-pal-fix" data-fix="clear" title="Azzera i filtri (Alt+0)">Rimuovi i filtri</button>' : ''));
      syncActive(); return;
    }
    setStatus('');

    var groups = {}, order = [];
    hits.forEach(function (hit) {
      var k = hit.d.k;
      if (!groups[k]) { groups[k] = []; order.push(k); }
      if (groups[k].length < MAX_PER_VAULT) groups[k].push(hit);
    });
    order.sort(function (a, b) { return ORDER[a] - ORDER[b]; });

    var html = '';
    order.forEach(function (k) {
      var v = META[k];
      html += '<div class="dn-pal-group"><span class="dn-pal-dot" style="background:' + v.a + '"></span>' + esc(v.n) + '</div>';
      groups[k].forEach(function (hit) {
        var d = hit.d, anchor = bestAnchor(d, reList), sn = snippet(d, reList);
        var url = d.route + (anchor ? '?id=' + anchor : '');
        var id = 'dn-opt-' + (uid++);
        var snHtml = (sn.pre ? '…' : '') + highlight(sn.text, reList) + (sn.post ? '…' : '');
        html += '<a class="dn-pal-opt" role="option" tabindex="-1" id="' + id + '" href="' + esc(url) + '" data-i="' + rows.length + '">'
             +    '<span class="dn-pal-opt-title">' + highlight(d.title, reList) + '</span>'
             +    '<span class="dn-pal-opt-snip">' + snHtml + '</span>'
             +  '</a>';
        rows.push({ url: url, id: id });
      });
    });
    listEl.innerHTML = html;
    if (rows.length) { active = 0; syncActive(); }
  }

  function syncActive() {
    var opts = listEl.querySelectorAll('.dn-pal-opt');
    for (var i = 0; i < opts.length; i++) {
      var on = (+opts[i].getAttribute('data-i') === active);
      opts[i].classList.toggle('is-active', on);
      opts[i].setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) {
        input.setAttribute('aria-activedescendant', opts[i].id);
        opts[i].scrollIntoView({ block: 'nearest' });
      }
    }
    if (active < 0) input.removeAttribute('aria-activedescendant');
  }

  function move(delta) {
    if (!rows.length) return;
    active = (active + delta + rows.length) % rows.length;
    syncActive();
  }

  function go(i) {
    var r = rows[i];
    if (r) { close(); location.href = r.url; }
  }

  // ─────────────────────────── overlay ───────────────────────────────────
  function build() {
    overlay = document.createElement('div');
    overlay.id = 'dn-pal-wrap';
    overlay.innerHTML =
      '<div class="dn-pal-backdrop"></div>' +
      '<div class="dn-pal" role="dialog" aria-modal="true" aria-label="Cerca negli appunti">' +
        '<div class="dn-pal-head">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>' +
          '<input class="dn-pal-input" type="text" role="combobox" aria-expanded="true" aria-controls="dn-pal-list" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="Cerca in tutti gli appunti…">' +
          '<div class="dn-pal-toggles">' +
            '<button class="dn-pal-tog" type="button" data-t="case" title="Maiuscole/minuscole (Alt+C)" aria-label="Maiuscole/minuscole" aria-keyshortcuts="Alt+C" aria-pressed="false">Aa</button>' +
            '<button class="dn-pal-tog" type="button" data-t="word" title="Parola intera (Alt+W)" aria-label="Parola intera" aria-keyshortcuts="Alt+W" aria-pressed="false">W</button>' +
            '<button class="dn-pal-tog" type="button" data-t="regex" title="Espressione regolare (Alt+R)" aria-label="Espressione regolare" aria-keyshortcuts="Alt+R" aria-pressed="false">.*</button>' +
          '</div>' +
          '<kbd>esc</kbd>' +
        '</div>' +
        '<div class="dn-pal-status" hidden></div>' +
        '<div class="dn-pal-live" aria-live="polite"></div>' +
        '<div class="dn-pal-list" id="dn-pal-list" role="listbox"></div>' +
        '<div class="dn-pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> naviga</span><span><kbd>↵</kbd> apri</span><span><kbd>esc</kbd> chiudi</span></div>' +
      '</div>';
    document.body.appendChild(overlay);
    backdrop = overlay.querySelector('.dn-pal-backdrop');
    input = overlay.querySelector('.dn-pal-input');
    listEl = overlay.querySelector('.dn-pal-list');
    statusEl = overlay.querySelector('.dn-pal-status');
    var liveEl = overlay.querySelector('.dn-pal-live');
    var TOG_NAMES = { 'case': 'Maiuscole/minuscole', word: 'Parola intera', regex: 'Espressione regolare' };
    function toggleTog(t) {                       // flip di un toggle: da click o da scorciatoia Alt+…
      if (!TOG_NAMES[t]) return;
      var b = overlay.querySelector('.dn-pal-tog[data-t="' + t + '"]');
      state[t] = !state[t];
      if (b) { b.classList.toggle('is-on', state[t]); b.setAttribute('aria-pressed', state[t] ? 'true' : 'false'); }
      if (liveEl) { liveEl.textContent = ''; liveEl.textContent = TOG_NAMES[t] + ': ' + (state[t] ? 'attivo' : 'disattivato'); }
      render(input.value.trim());
    }
    function syncTogButtons() {                   // riallinea i bottoni allo stato (dopo un reset via azione di recupero)
      ['case', 'word', 'regex'].forEach(function (t) {
        var b = overlay.querySelector('.dn-pal-tog[data-t="' + t + '"]');
        if (b) { b.classList.toggle('is-on', !!state[t]); b.setAttribute('aria-pressed', state[t] ? 'true' : 'false'); }
      });
    }
    function clearTogs() { state['case'] = false; state.word = false; state.regex = false; syncTogButtons(); }

    backdrop.addEventListener('click', close);
    input.addEventListener('input', function () {
      clearTimeout(debTimer);
      var q = input.value.trim();
      debTimer = setTimeout(function () { render(q); }, DEBOUNCE);
    });
    input.addEventListener('keydown', function (e) {
      if (e.altKey && e.code === 'KeyC') { e.preventDefault(); toggleTog('case'); }
      else if (e.altKey && e.code === 'KeyW') { e.preventDefault(); toggleTog('word'); }
      else if (e.altKey && e.code === 'KeyR') { e.preventDefault(); toggleTog('regex'); }
      else if (e.altKey && e.code === 'Digit0') { e.preventDefault(); if (anyTog()) { clearTogs(); render(input.value.trim()); } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Tab') { e.preventDefault(); move(e.shiftKey ? -1 : 1); }   // trap: Tab non lascia l'input
      else if (e.key === 'Enter') { e.preventDefault(); go(active < 0 ? 0 : active); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
    listEl.addEventListener('mousemove', function (e) {
      var opt = e.target.closest('.dn-pal-opt');
      if (opt) { active = +opt.getAttribute('data-i'); syncActive(); }
    });
    listEl.addEventListener('click', function (e) {
      var opt = e.target.closest('.dn-pal-opt');
      if (opt) { e.preventDefault(); go(+opt.getAttribute('data-i')); }
    });
    overlay.querySelector('.dn-pal-toggles').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.dn-pal-tog'); if (!b) return;
      toggleTog(b.getAttribute('data-t')); input.focus();
    });
    statusEl.addEventListener('click', function (e) {          // azioni di recupero negli stati vuoto/errore
      var b = e.target.closest && e.target.closest('.dn-pal-fix'); if (!b) return;
      var fix = b.getAttribute('data-fix');
      if (fix === 'clear') clearTogs();
      else if (fix === 'offregex') { state.regex = false; syncTogButtons(); }
      render(input.value.trim()); input.focus();
    });
  }

  function isOpen() { return overlay && overlay.classList.contains('open'); }

  // Blocca lo scroll della pagina sotto: su questo hub lo scroller è <html>
  // (documentElement), non <body> — quindi il solo body:overflow non basta.
  var _ovHtml = '', _ovBody = '';
  function scrollLock(on) {
    var h = document.documentElement, b = document.body;
    if (on) {
      _ovHtml = h.style.overflow; _ovBody = b.style.overflow;
      h.style.overflow = 'hidden'; b.style.overflow = 'hidden';
    } else {
      h.style.overflow = _ovHtml; b.style.overflow = _ovBody;
    }
  }

  // Rende inerte (non focalizzabile, fuori dal tab order e dall'albero a11y) tutto
  // il resto della pagina mentre la palette è aperta → il focus resta intrappolato.
  var _inerted = [];
  function bgInert(on) {
    if (on) {
      _inerted = [];
      [].forEach.call(document.body.children, function (el) {
        if (el !== overlay && !el.hasAttribute('inert')) { el.setAttribute('inert', ''); _inerted.push(el); }
      });
    } else {
      _inerted.forEach(function (el) { el.removeAttribute('inert'); });
      _inerted = [];
    }
  }

  function open() {
    if (!overlay) build();
    if (isOpen()) return;
    lastFocus = document.activeElement;
    scrollLock(true);
    overlay.classList.add('open');
    bgInert(true);
    input.value = '';
    render('');
    input.focus();
    ensureIndex().then(function () {
      if (isOpen() && input.value.trim()) render(input.value.trim());   // se ha già scritto durante l'indicizzazione
      else if (isOpen()) setStatus('Scrivi per cercare in tutti i vault.');
    });
  }

  function close() {
    if (!isOpen()) return;
    overlay.classList.remove('open');
    bgInert(false);
    scrollLock(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function toggle() { isOpen() ? close() : open(); }

  // ─────────────────────────── init ──────────────────────────────────────
  function isTyping(e) {
    var t = e.target;
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  }
  function init() {
    host = document.getElementById('hub-search');
    if (!host) return;
    pill = host.querySelector('.search-pill');
    var kbd = host.querySelector('.search-kbd');
    if (kbd) kbd.textContent = isMac ? '⌘K' : 'Ctrl K';
    host.hidden = false;
    if (pill) pill.addEventListener('click', open);
    document.addEventListener('keydown', function (e) {
      var k = (e.key || '').toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === 'k') { e.preventDefault(); toggle(); }
      else if (k === '/' && !isOpen() && !isTyping(e)) { e.preventDefault(); open(); }
      else if (k === 'escape' && isOpen()) { close(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
