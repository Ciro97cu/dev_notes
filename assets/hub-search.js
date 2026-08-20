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
    { k: 'code',       n: 'Code',       a: '#059669' },
    { k: 'glossario',  n: 'Glossario',  a: '#6366f1' }
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
  function search(q) {
    var toks = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!toks.length || !index) return [];
    var hits = [];
    index.forEach(function (d) {
      var titleLc = d.title.toLowerCase(), score = 0, ok = true;
      for (var i = 0; i < toks.length; i++) {
        var t = toks[i], s = 0;
        if (titleLc.indexOf(t) >= 0) s = 8;
        else if (d.h.some(function (x) { return x.t.toLowerCase().indexOf(t) >= 0; })) s = 4;
        else if (d.body.toLowerCase().indexOf(t) >= 0) s = 2;
        if (!s) { ok = false; break; }
        score += s;
      }
      if (!ok) return;
      if (titleLc.indexOf(q.toLowerCase()) === 0) score += 5;   // bonus prefisso titolo
      hits.push({ d: d, score: score, toks: toks });
    });
    hits.sort(function (a, b) {
      return b.score - a.score || ORDER[a.d.k] - ORDER[b.d.k] || a.d.title.localeCompare(b.d.title);
    });
    return hits;
  }

  function bestAnchor(d, toks) {              // prima intestazione che contiene un token → deep-link
    for (var i = 0; i < d.h.length; i++) {
      var lc = d.h[i].t.toLowerCase();
      if (toks.some(function (t) { return lc.indexOf(t) >= 0; })) return d.h[i].id;
    }
    return '';
  }

  function snippet(d, toks) {
    var body = d.body, lc = body.toLowerCase(), idx = -1;
    for (var i = 0; i < toks.length; i++) {
      var p = lc.indexOf(toks[i]);
      if (p >= 0 && (idx < 0 || p < idx)) idx = p;
    }
    if (idx < 0) {                            // match solo nel titolo/intestazioni
      var h0 = d.h.find(function (x) { return toks.some(function (t) { return x.t.toLowerCase().indexOf(t) >= 0; }); });
      return { text: h0 ? h0.t : body.slice(0, 90), pre: false, post: !!body };
    }
    var start = Math.max(0, idx - 42), end = Math.min(body.length, idx + 90);
    return { text: body.slice(start, end), pre: start > 0, post: end < body.length };
  }

  function highlight(text, toks) {
    if (!toks.length) return esc(text);
    var re = new RegExp('(' + toks.map(escRe).join('|') + ')', 'ig'), out = '', last = 0, m;
    while ((m = re.exec(text))) {
      out += esc(text.slice(last, m.index)) + '<mark>' + esc(m[0]) + '</mark>';
      last = m.index + m[0].length;
      if (re.lastIndex === m.index) re.lastIndex++;
    }
    return out + esc(text.slice(last));
  }

  // ─────────────────────────── rendering ─────────────────────────────────
  function setStatus(msg) {
    if (!statusEl) return;
    statusEl.textContent = msg || '';
    statusEl.hidden = !msg;
  }

  function render(q) {
    rows = []; active = -1;
    if (!q) { listEl.innerHTML = ''; setStatus(building ? 'Indicizzo gli appunti…' : 'Scrivi per cercare in tutti i vault.'); syncActive(); return; }
    if (!index) { listEl.innerHTML = ''; setStatus('Indicizzo gli appunti…'); syncActive(); return; }
    var hits = search(q);
    if (!hits.length) { listEl.innerHTML = ''; setStatus('Nessun risultato per «' + esc(q) + '».'); syncActive(); return; }
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
        var d = hit.d, anchor = bestAnchor(d, hit.toks), sn = snippet(d, hit.toks);
        var url = d.route + (anchor ? '?id=' + anchor : '');
        var id = 'dn-opt-' + (uid++);
        var snHtml = (sn.pre ? '…' : '') + highlight(sn.text, hit.toks) + (sn.post ? '…' : '');
        html += '<a class="dn-pal-opt" role="option" id="' + id + '" href="' + esc(url) + '" data-i="' + rows.length + '">'
             +    '<span class="dn-pal-opt-title">' + highlight(d.title, hit.toks) + '</span>'
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
          '<kbd>esc</kbd>' +
        '</div>' +
        '<div class="dn-pal-status" hidden></div>' +
        '<div class="dn-pal-list" id="dn-pal-list" role="listbox"></div>' +
        '<div class="dn-pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> naviga</span><span><kbd>↵</kbd> apri</span><span><kbd>esc</kbd> chiudi</span></div>' +
      '</div>';
    document.body.appendChild(overlay);
    backdrop = overlay.querySelector('.dn-pal-backdrop');
    input = overlay.querySelector('.dn-pal-input');
    listEl = overlay.querySelector('.dn-pal-list');
    statusEl = overlay.querySelector('.dn-pal-status');

    backdrop.addEventListener('click', close);
    input.addEventListener('input', function () {
      clearTimeout(debTimer);
      var q = input.value.trim();
      debTimer = setTimeout(function () { render(q); }, DEBOUNCE);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
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
  }

  function isOpen() { return overlay && overlay.classList.contains('open'); }

  function open() {
    if (!overlay) build();
    if (isOpen()) return;
    lastFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    overlay.classList.add('open');
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
    document.body.style.overflow = '';
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
