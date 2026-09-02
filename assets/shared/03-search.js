// ── Ricerca avanzata (stile VS Code: match case · parola intera · regex) ──────
// Riusa l'indice full-text che docsify costruisce in localStorage
// (`docsify.search.index` = { [path]: { [headingId]: {slug,title,body} } }) e ci
// mette sopra un matcher configurabile. Overlay aperto con «/» o cliccando la
// casella di ricerca della sidebar; il dropdown fuzzy di docsify è nascosto.
var dnSearchState = { case: false, word: false, regex: false };

function dnSearchReadIndex() {
  // I vault condividono l'origine → localStorage condiviso e docsify namespacizza
  // l'indice per path: possono esistere più chiavi `docsify.search.index*`, una
  // per vault. Si sceglie quella del vault CORRENTE = l'indice che contiene la
  // pagina attuale (fallback: l'ultima trovata).
  var vault = window.__VAULT || '';
  var curPath = (location.hash || '').replace(/^#/, '').split('?')[0] || '/';
  var candidates = [];
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    if (!k || k.indexOf('docsify.search.index') !== 0) continue;
    var obj; try { obj = JSON.parse(localStorage.getItem(k)); } catch (e) { continue; }
    if (obj && typeof obj === 'object') candidates.push({ k: k, o: obj });
  }
  if (!candidates.length) return [];
  var chosen = null;
  // 1) chiave namespacizzata col vault corrente (deterministico)
  if (vault) candidates.forEach(function (c) { if (c.k.indexOf('dev-notes-' + vault) >= 0) chosen = c.o; });
  // Se il vault è noto (window.__VAULT) ma il suo indice non è (ancora) in
  // localStorage, NON si ripiega sull'indice di un altro vault: meglio "indice non
  // pronto" che risultati presi da un vault diverso. È il bug che si vedeva su
  // mobile, dove la quota più stretta di localStorage può non aver salvato l'indice
  // di questo vault mentre restano quelli dei vault visitati prima → il fallback
  // pescava da lì. Le euristiche 2-3 valgono solo quando __VAULT non è impostato.
  if (!chosen && !vault) {
    candidates.forEach(function (c) { if (c.o[curPath]) chosen = c.o; });   // 2) indice con la pagina attuale
    if (!chosen) chosen = candidates[candidates.length - 1].o;              // 3) fallback all'ultimo
  }
  if (!chosen) return [];   // vault noto ma indice non ancora salvato → nessun risultato (mostra "indice non pronto")
  var out = [];
  Object.keys(chosen).forEach(function (path) {
    var secs = chosen[path]; if (!secs || typeof secs !== 'object') return;
    Object.keys(secs).forEach(function (hid) {
      var s = secs[hid];
      if (s && s.slug) out.push({ slug: s.slug, title: s.title || '', body: s.body || '', path: path });
    });
  });
  return out;
}
function dnSearchRe(q) {
  var pat = dnSearchState.regex ? q : q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (dnSearchState.word) { var L = '[A-Za-z0-9_À-ÿ]'; pat = '(?<!' + L + ')(?:' + pat + ')(?!' + L + ')'; }
  return new RegExp(pat, 'g' + (dnSearchState.case ? '' : 'i'));
}
function dnSearchCount(text, re) { re.lastIndex = 0; var n = 0, m; while ((m = re.exec(text))) { n++; if (m.index === re.lastIndex) re.lastIndex++; if (n > 999) break; } return n; }
function dnSearchSnippet(text, re) {
  re.lastIndex = 0; var m = re.exec(text); if (!m) return '';
  var i = m.index, start = Math.max(0, i - 55), end = Math.min(text.length, i + m[0].length + 90);
  var slice = text.slice(start, end), out = '', last = 0, mm; re.lastIndex = 0;
  while ((mm = re.exec(slice))) {
    out += dnEscHtml(slice.slice(last, mm.index)) + '<mark>' + dnEscHtml(mm[0]) + '</mark>';
    last = mm.index + mm[0].length; if (mm.index === re.lastIndex) re.lastIndex++;
  }
  out += dnEscHtml(slice.slice(last));
  return (start > 0 ? '… ' : '') + out + (end < text.length ? ' …' : '');
}
function dnSearchRun() {
  var box = document.getElementById('dn-search'); if (!box) return;
  var q = box.querySelector('.dn-s-input').value.trim();
  var res = box.querySelector('.dn-s-results');
  if (!q) { res.innerHTML = '<div class="dn-s-empty">Digita per cercare in questo vault.</div>'; return; }
  var re; try { re = dnSearchRe(q); } catch (e) { res.innerHTML = '<div class="dn-s-empty">Espressione regolare non valida.</div>'; return; }
  var idx = dnSearchReadIndex();
  if (!idx.length) { res.innerHTML = '<div class="dn-s-empty">Indice non ancora pronto: apri qualche pagina e riprova.</div>'; return; }
  var hits = [];
  idx.forEach(function (s) {
    var ct = dnSearchCount(s.title, new RegExp(re.source, re.flags));
    var cb = dnSearchCount(s.body, new RegExp(re.source, re.flags));
    if (ct + cb === 0) return;
    hits.push({ s: s, score: ct * 8 + cb });
  });
  if (!hits.length) { res.innerHTML = '<div class="dn-s-empty">Nessun risultato per «' + dnEscHtml(q) + '».</div>'; return; }
  hits.sort(function (a, b) { return b.score - a.score; });
  var html = '';
  hits.slice(0, 60).forEach(function (h, ix) {
    var snip = dnSearchSnippet(h.s.body || h.s.title, new RegExp(re.source, re.flags));
    var page = h.s.path.split('/').filter(Boolean).pop() || h.s.path;
    var slug = h.s.slug.charAt(0) === '#' ? h.s.slug : '#' + h.s.slug;   // assicura la rotta hash
    html += '<a class="dn-s-item' + (ix === 0 ? ' sel' : '') + '" href="' + dnEscHtml(slug) + '">' +
      '<span class="dn-s-title">' + dnEscHtml(h.s.title || '(senza titolo)') + '<span class="dn-s-path">' + dnEscHtml(page) + '</span></span>' +
      (snip ? '<div class="dn-s-snip">' + snip + '</div>' : '') + '</a>';
  });
  res.innerHTML = html;
}
function dnSearchClose() {
  var b = document.getElementById('dn-search'); if (b) b.classList.remove('open');
  document.body.classList.remove('dn-search-open');   // sblocca lo scroll della pagina
  document.documentElement.classList.remove('dn-search-open');
}
function dnSearchOpen() {
  var box = dnSearchBuild();
  box.classList.add('open');
  document.body.classList.add('dn-search-open');       // blocca lo scroll della pagina sotto
  document.documentElement.classList.add('dn-search-open');
  var inp = box.querySelector('.dn-s-input');
  inp.focus(); inp.select();
  dnSearchRun();
}
function dnSearchBuild() {
  var box = document.getElementById('dn-search');
  if (box) return box;
  box = document.createElement('div');
  box.id = 'dn-search';
  box.innerHTML = '<div class="dn-s-box" role="dialog" aria-label="Ricerca">' +
    '<div class="dn-s-top">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="opacity:.55;flex:0 0 auto"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' +
      '<input class="dn-s-input" type="text" placeholder="Cerca nel vault…" autocomplete="off" spellcheck="false" aria-label="Cerca">' +
      '<div class="dn-s-toggles">' +
        '<button class="dn-s-tog" type="button" data-t="case" title="Maiuscole/minuscole" aria-pressed="false">Aa</button>' +
        '<button class="dn-s-tog" type="button" data-t="word" title="Parola intera" aria-pressed="false">W</button>' +
        '<button class="dn-s-tog" type="button" data-t="regex" title="Espressione regolare" aria-pressed="false">.*</button>' +
      '</div>' +
    '</div>' +
    '<div class="dn-s-results"></div>' +
    '<div class="dn-s-hint">Invio: apri il primo risultato · ↑↓: scorri · Esc: chiudi</div>' +
  '</div>';
  document.body.appendChild(box);
  var inp = box.querySelector('.dn-s-input'), timer = null;
  inp.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(dnSearchRun, 110); });
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { var sel = box.querySelector('.dn-s-item.sel') || box.querySelector('.dn-s-item'); if (sel) sel.click(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      var items = [].slice.call(box.querySelectorAll('.dn-s-item')); if (!items.length) return;
      e.preventDefault();
      var cur = box.querySelector('.dn-s-item.sel'), ci = items.indexOf(cur);
      if (cur) cur.classList.remove('sel');
      var ni = e.key === 'ArrowDown' ? (ci + 1) % items.length : (ci - 1 + items.length) % items.length;
      items[ni].classList.add('sel'); items[ni].scrollIntoView({ block: 'nearest' });
    }
  });
  box.querySelector('.dn-s-toggles').addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.dn-s-tog'); if (!b) return;
    var t = b.getAttribute('data-t'); dnSearchState[t] = !dnSearchState[t];
    b.classList.toggle('active', dnSearchState[t]); b.setAttribute('aria-pressed', dnSearchState[t] ? 'true' : 'false');
    dnSearchRun(); inp.focus();
  });
  box.querySelector('.dn-s-results').addEventListener('click', function (e) {
    var item = e.target.closest && e.target.closest('.dn-s-item');
    if (!item) return;
    var href = item.getAttribute('href') || '';
    var idMatch = href.match(/[?&]id=([^&]+)/);
    var id = idMatch ? decodeURIComponent(idMatch[1]) : '';
    // Se l'hash di destinazione è identico a quello corrente, il browser non lancia
    // hashchange → docsify non scrolla. Preveniamo il default e scrolliamo a mano.
    if (href && location.hash === href) {
      e.preventDefault();
      if (id) {
        var el = document.getElementById(id);
        if (el) setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
      }
    }
    if (id) {                    // lampeggio sul testo trovato (fallback: l'intestazione)
      var qEl = box.querySelector('.dn-s-input');
      dnFlashMatch(id, qEl ? qEl.value.trim() : '');
    }
    setTimeout(dnSearchClose, 0);
  });
  box.addEventListener('click', function (e) { if (e.target === box) dnSearchClose(); });
  return box;
}
// Evidenzia per un istante l'elemento di destinazione (l'heading con quell'id): dopo
// il click su un risultato la pagina ci naviga, ma il punto esatto può sfuggire, così
// un breve lampeggio lo fa saltare all'occhio. Attende che l'elemento esista, perché
// la navigazione/rendering di docsify è asincrona.
function dnFlashTarget(id) {
  if (!id) return;
  var tries = 0;
  (function look() {
    var el = document.getElementById(id);
    if (el) {
      el.classList.remove('dn-flash');
      void el.offsetWidth;                // forza il restart dell'animazione se ri-cliccato
      el.classList.add('dn-flash');
      clearTimeout(el.__dnFlashT);
      el.__dnFlashT = setTimeout(function () { el.classList.remove('dn-flash'); }, 2000);
      return;
    }
    if (tries++ < 40) setTimeout(look, 60);   // ~2.4s di attesa max
  })();
}
// Come sopra, ma mira al TESTO che ha fatto match (non solo alla sezione): trova la
// prima occorrenza della query dentro la sezione, ci scrolla sopra e la fa lampeggiare.
// Se non c'è un match evidenziabile (o l'API non è supportata), ripiega sull'intestazione.
function dnFlashMatch(id, query) {
  var tries = 0;
  (function look() {
    var heading = document.getElementById(id);
    if (!heading) { if (tries++ < 40) setTimeout(look, 60); return; }
    var done = false;
    if (query && window.Highlight && window.CSS && CSS.highlights) {
      try { done = dnHighlightMatch(heading, query); } catch (e) { done = false; }
    }
    if (!done) dnFlashTarget(id);   // niente match evidenziabile: lampeggia la sezione
  })();
}
// Evidenzia+lampeggia la prima occorrenza della query nella sezione, via CSS Custom
// Highlight API (nessuna mutazione del DOM, così non interferisce con l'evidenziatore).
function dnHighlightMatch(heading, query) {
  var re; try { re = dnSearchRe(query); } catch (e) { return false; }
  var nodes = [heading], sib = heading.nextElementSibling;   // sezione = heading + fratelli fino al prossimo heading
  while (sib && !/^H[1-6]$/.test(sib.tagName)) { nodes.push(sib); sib = sib.nextElementSibling; }
  var range = null;
  for (var i = 0; i < nodes.length && !range; i++) {
    var w = document.createTreeWalker(nodes[i], NodeFilter.SHOW_TEXT, null), tn;
    while ((tn = w.nextNode())) {
      re.lastIndex = 0; var m = re.exec(tn.nodeValue);
      if (m && m[0].length) {
        range = document.createRange();
        range.setStart(tn, m.index); range.setEnd(tn, m.index + m[0].length);
        break;
      }
    }
  }
  if (!range) return false;
  var host = range.startContainer.parentElement || heading;
  setTimeout(function () { host.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 50);
  var hl = new Highlight(range);
  CSS.highlights.set('dn-search-flash', hl);
  var n = 0; clearInterval(dnHighlightMatch._iv);
  dnHighlightMatch._iv = setInterval(function () {
    if (CSS.highlights.has('dn-search-flash')) CSS.highlights.delete('dn-search-flash');
    else CSS.highlights.set('dn-search-flash', hl);
    if (++n >= 6) { clearInterval(dnHighlightMatch._iv); CSS.highlights.delete('dn-search-flash'); }
  }, 300);
  return true;
}
// init: CSS + intercetta la casella di docsify (apre l'overlay) + nasconde il dropdown fuzzy
(function () {
  var css = [
    '#dn-search{position:fixed;inset:0;z-index:2147483500;display:flex;justify-content:center;align-items:flex-start;background:rgba(0,0,0,.45);opacity:0;visibility:hidden;transition:opacity .18s ease,visibility 0s linear .18s}',
    '#dn-search.open{opacity:1;visibility:visible;transition:opacity .18s ease}',
    '#dn-search .dn-s-box{margin-top:8vh;width:min(680px,92vw);max-height:80vh;display:flex;flex-direction:column;background:var(--bg-soft);color:var(--text);border:1px solid var(--border);border-radius:14px;box-shadow:0 24px 70px rgba(0,0,0,.45);overflow:hidden;transform:translateY(-10px) scale(.98);transition:transform .2s cubic-bezier(.34,1.5,.64,1)}',
    '#dn-search.open .dn-s-box{transform:none}',
    '@media (prefers-reduced-motion: reduce){#dn-search{transition:none}#dn-search .dn-s-box{transition:none;transform:none}}',
    '@keyframes dn-flash{from{background-color:color-mix(in srgb,var(--link) 34%,transparent)}to{background-color:transparent}}',
    '.dn-flash{animation:dn-flash .6s ease-out 3;border-radius:6px}',
    '@media (prefers-reduced-motion: reduce){.dn-flash{animation:none;background-color:color-mix(in srgb,var(--link) 22%,transparent);transition:background-color .5s ease .9s}}',
    '::highlight(dn-search-flash){background-color:color-mix(in srgb,var(--link) 42%,transparent);color:inherit}',
    '#dn-search .dn-s-top{display:flex;align-items:center;gap:.5rem;padding:.6rem .7rem;border-bottom:1px solid var(--border)}',
    '#dn-search .dn-s-input{flex:1;min-width:0;border:0;background:transparent;color:var(--text);font:inherit;font-size:1rem;outline:none}',
    '#dn-search .dn-s-toggles{display:flex;gap:.25rem;flex:0 0 auto}',
    '#dn-search .dn-s-tog{width:30px;height:28px;border:1px solid var(--border);border-radius:7px;background:transparent;color:var(--text);cursor:pointer;font-size:.78rem;font-weight:700;display:flex;align-items:center;justify-content:center;opacity:.7}',
    '#dn-search .dn-s-tog:hover{opacity:1;border-color:var(--link)}',
    '#dn-search .dn-s-tog.active{opacity:1;color:var(--link);border-color:var(--link);background:color-mix(in srgb,var(--link) 12%,transparent)}',
    '#dn-search .dn-s-results{overflow:auto;overscroll-behavior:contain;padding:.35rem}',
    'html.dn-search-open,body.dn-search-open{overflow:hidden !important}',
    '#dn-search .dn-s-item{display:block;padding:.5rem .6rem;border-radius:9px;text-decoration:none;color:inherit}',
    '#dn-search .dn-s-item:hover,#dn-search .dn-s-item.sel{background:rgba(127,127,127,.14)}',
    '#dn-search .dn-s-title{font-weight:650;font-size:.92rem}',
    '#dn-search .dn-s-path{font-size:.72rem;opacity:.5;margin-left:.45rem;font-weight:400}',
    '#dn-search .dn-s-snip{font-size:.82rem;opacity:.8;margin-top:.15rem;line-height:1.4}',
    '#dn-search .dn-s-snip mark{background:color-mix(in srgb,var(--link) 32%,transparent);color:inherit;border-radius:3px;padding:0 .1em}',
    '#dn-search .dn-s-empty{padding:1.1rem;opacity:.6;font-size:.9rem;text-align:center}',
    '#dn-search .dn-s-hint{padding:.4rem .7rem;border-top:1px solid var(--border);font-size:.72rem;opacity:.5}',
    '.search .results-panel{display:none !important}'   // via il dropdown fuzzy di docsify
  ].join('');
  var st = document.createElement('style'); st.id = 'dn-search-styles'; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
  document.addEventListener('focusin', function (e) {
    var t = e.target;
    if (t && t.matches && t.matches('.search input')) { t.blur(); dnSearchOpen(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') dnSearchClose(); });

  // Pulizia quota localStorage (fix mobile): la ricerca usa solo l'indice del vault
  // CORRENTE (namespace dev-notes-<vault>), ma docsify lascia in localStorage anche
  // gli indici degli altri vault visitati prima. Su Safari mobile la quota è stretta
  // (~5 MB): riempiendola, il salvataggio dell'indice di QUESTO vault può fallire →
  // la ricerca ripiegava sull'indice di un altro vault (risultati sbagliati). Ogni
  // vault ricostruisce il proprio indice al load, quindi rimuovere gli indici estranei
  // (e i legacy senza namespace) è sicuro e libera spazio per il vault corrente.
  // Deferito con setTimeout(0): gira dopo che app.js ha impostato window.__VAULT e
  // prima che docsify-search finisca di costruire l'indice (build asincrona via fetch).
  setTimeout(function () {
    var vault = window.__VAULT;
    if (!vault) return;   // solo l'hub non lo imposta: lì non si tocca nulla
    var keep = 'dev-notes-' + vault, drop = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf('docsify.search.') === 0 && k.indexOf(keep) < 0) drop.push(k);
    }
    drop.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
  }, 0);
})();

