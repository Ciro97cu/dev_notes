// ── Feature di lettura (progresso, preferiti): CSS, icone e helper condivisi ──
(function () {
  var css = [
    // barra progresso in cima alla sidebar
    '#dn-progress{padding:.55rem .75rem .7rem}',
    '.dn-progress-label{font-size:.74rem;opacity:.75;margin-bottom:.35rem;display:flex;justify-content:space-between}',
    '.dn-progress-bar{height:6px;border-radius:4px;background:rgba(127,127,127,.22);overflow:hidden}',
    '.dn-progress-bar span{display:block;height:100%;width:0;background:var(--link);transition:width .5s cubic-bezier(.22,1,.36,1)}',
    // casella "letto" accanto a ogni voce-capitolo della sidebar
    '.sidebar-nav a .dn-check{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;flex:0 0 auto;margin-right:.5em;border:1.5px solid var(--border);border-radius:4px;vertical-align:-2px;cursor:pointer;transition:background .15s ease,border-color .15s ease}',
    '.sidebar-nav a .dn-check:hover{border-color:var(--link)}',
    '.sidebar-nav a .dn-check.checked{background:var(--link);border-color:var(--link)}',
    '.sidebar-nav a .dn-check.checked::after{content:"";width:4px;height:7px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg);margin-top:-2px}',
    // stella preferiti sulle sotto-sezioni: discreta, compare all'hover del titolo (o se è preferita)
    '.dn-star{margin-left:.4rem;vertical-align:baseline;border:0;background:transparent;color:inherit;cursor:pointer;opacity:0;padding:0 .15em;line-height:0;transition:opacity .15s ease,color .15s ease}',
    '.dn-star svg{width:.82em;height:.82em;vertical-align:-.06em}',
    '.markdown-section h2:hover .dn-star,.markdown-section h3:hover .dn-star,.markdown-section h4:hover .dn-star,.dn-star:focus-visible,.dn-star.is-fav{opacity:1}',
    '.dn-star:hover,.dn-star.is-fav{color:var(--link)}',
    // dock preferiti (stessa estetica del dock dati)
    '#dn-fav{position:fixed;bottom:178px;right:16px;z-index:100}',
    '#dn-fav-btn{width:44px;height:44px;border-radius:50%;border:1px solid var(--border);background:var(--bg-soft);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}',
    '#dn-fav-btn:hover,#dn-fav-btn.has-fav{border-color:var(--link);color:var(--link)}',
    '.dn-fav-list{position:absolute;bottom:0;right:48px;min-width:240px;max-width:320px;max-height:60vh;overflow:auto;background:var(--bg-soft);border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 34px rgba(0,0,0,.20);padding:.4rem;opacity:0;visibility:hidden;transform:scale(.94);transform-origin:bottom right;transition:opacity .16s ease,transform .2s cubic-bezier(.34,1.56,.64,1),visibility 0s linear .2s}',
    '.dn-fav-list.open{opacity:1;visibility:visible;transform:none;transition:opacity .16s ease,transform .2s cubic-bezier(.34,1.56,.64,1)}',
    '@media (prefers-reduced-motion: reduce){.dn-fav-list{transition:none;transform:none}.dn-fav-list.open{transition:none}}',
    '.dn-fav-list .dn-title{font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;opacity:.6;padding:.35rem .6rem}',
    '.dn-fav-list .dn-empty{padding:.5rem .6rem;opacity:.6;font-size:.86rem}',
    '.dn-fav-row{display:flex;align-items:center;gap:.4rem;border-radius:8px}',
    '.dn-fav-row:hover{background:rgba(127,127,127,.14)}',
    '.dn-fav-row a{flex:1 1 auto;padding:.5rem .6rem;color:var(--text);text-decoration:none;font-size:.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.dn-fav-del{flex:0 0 auto;border:0;background:transparent;color:inherit;opacity:.5;cursor:pointer;padding:.35rem .5rem;border-radius:8px;line-height:0}',
    '.dn-fav-del:hover{opacity:1;color:var(--link)}'
  ].join('');
  var el = document.createElement('style');
  el.id = 'dn-reading-styles';
  el.textContent = css;
  (document.head || document.documentElement).appendChild(el);
})();

// Icone (Lucide-style) per le feature di lettura.
var DN_ICON = {
  check: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
  circle: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/></svg>',
  starOut: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  starFull: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
};
// Pagine non-capitolo (cover/indice) escluse da progresso e preferiti.
var DN_SKIP = { '/': 1, '/README': 1, '/_coverpage': 1, '': 1 };
// "#/docs/x?id=y" → "/docs/x"
function dnPathOf(href) {
  if (!href) return '';
  var h = href.indexOf('#'); if (h >= 0) href = href.slice(h + 1);
  href = href.split('?')[0];
  if (href.length > 1 && href.charAt(href.length - 1) === '/') href = href.slice(0, -1);
  return href;
}
function dnEscHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

// "Progresso di studio": segna i capitoli come letti (persistito via NotesStore),
// mostra ✓ nella sidebar e una barra "X/N" in cima alla navigazione, con un
// bottone "Segna come letto" a fine capitolo. Robusto: salva i path, non citazioni.
function studyProgressPlugin(hook, vm) {
  function getRead() { var v = window.NotesStore.read('read', []); return Array.isArray(v) ? v : []; }
  function getFrac() { var v = window.NotesStore.read('frac', {}); return (v && typeof v === 'object' && !Array.isArray(v)) ? v : {}; }
  function isRead(p) { return getRead().indexOf(p) >= 0; }
  function toggle(p) {
    var arr = getRead(), i = arr.indexOf(p);
    if (i >= 0) arr.splice(i, 1); else arr.push(p);
    window.NotesStore.write('read', arr);
  }
  // Livello di un heading (h2→2 …) dal suo id nel contenuto.
  function levelOf(id) { var el = document.getElementById(id); return el && el.tagName.charAt(0) === 'H' ? parseInt(el.tagName.charAt(1), 10) : 99; }
  // Ident delle sottosezioni "figlie" di `ident` (capitolo → tutte; heading →
  // gli heading seguenti di livello più profondo, fino al prossimo pari/superiore).
  // Funziona solo sulla pagina aperta (le sottosezioni sono nel DOM solo lì).
  function descendantIdents(ident) {
    var q = ident.indexOf('?id='), path = q < 0 ? ident : ident.slice(0, q);
    var cur = (vm.route && vm.route.path) || '';
    if (path !== cur) return [];
    var hs = [].slice.call(document.querySelectorAll('.markdown-section h2[id], .markdown-section h3[id], .markdown-section h4[id]'));
    var out = [];
    if (q < 0) { hs.forEach(function (h) { out.push(path + '?id=' + h.id); }); return out; }  // capitolo: tutte
    var startId = ident.slice(q + 4), startLevel = levelOf(startId), started = false;
    for (var i = 0; i < hs.length; i++) {
      if (hs[i].id === startId) { started = true; continue; }
      if (!started) continue;
      if (levelOf(hs[i].id) > startLevel) out.push(path + '?id=' + hs[i].id);
      else break;                       // fine del blocco discendente
    }
    return out;
  }
  // Roll-up (azione ESPLICITA): sincronizza il capitolo aperto con le sue
  // sottosezioni in entrambe le direzioni — lo marca se tutte lette, lo de-marca se
  // ne resta una non letta. Usato SOLO da applyCascade (l'utente ha appena cliccato
  // una casella), dove de-spuntare è il comportamento atteso. Ritorna true se cambia.
  function rollup(read) {
    var cur = (vm.route && vm.route.path) || '';
    if (!cur || DN_SKIP[cur]) return false;
    var subs = descendantIdents(cur);
    if (!subs.length) return false;                 // capitolo senza sottosezioni: nessun roll-up
    var allDone = subs.every(function (id) { return read.indexOf(id) >= 0; });
    var ci = read.indexOf(cur);
    if (allDone && ci < 0) { read.push(cur); return true; }
    if (!allDone && ci >= 0) { read.splice(ci, 1); return true; }
    return false;
  }
  // Roll-up PASSIVO (alla sola navigazione): non de-spunta MAI un capitolo — così
  // rivisitarlo non ne perde il completamento. Se il capitolo è marcato "letto" ma
  // le sottosezioni no (es. spuntato dalla sidebar da un'altra pagina, dove non erano
  // nel DOM), le completa (roll-DOWN). Se invece tutte le sottosezioni sono lette,
  // marca il capitolo (roll-UP). Ritorna true se cambia qualcosa.
  function rollupPassive(read) {
    var cur = (vm.route && vm.route.path) || '';
    if (!cur || DN_SKIP[cur]) return false;
    var subs = descendantIdents(cur);
    if (!subs.length) return false;
    var changed = false;
    if (read.indexOf(cur) >= 0) {                   // capitolo marcato → completa i figli
      subs.forEach(function (id) { if (read.indexOf(id) < 0) { read.push(id); changed = true; } });
    } else if (subs.every(function (id) { return read.indexOf(id) >= 0; })) {
      read.push(cur); changed = true;               // tutti i figli letti → marca il capitolo
    }
    return changed;
  }
  // Spunta/despunta `ident` e cascata sui suoi discendenti (stesso stato).
  function applyCascade(ident) {
    var read = getRead(), on = read.indexOf(ident) < 0;
    [ident].concat(descendantIdents(ident)).forEach(function (id) {
      var i = read.indexOf(id);
      if (on && i < 0) read.push(id);
      else if (!on && i >= 0) read.splice(i, 1);
    });
    rollup(read);
    window.NotesStore.write('read', read);
  }
  // Inserisce/aggiorna la casella accanto a ogni voce presente nella sidebar
  // (capitoli + sottosezioni del capitolo aperto) e conta la barra su TUTTE le
  // voci visibili, così la % si muove a ogni spunta (anche sulle sottosezioni).
  // N include le sottosezioni del capitolo aperto, quindi si ricalcola navigando.
  function decorate() {
    var read = getRead();
    var links = [].slice.call(document.querySelectorAll('.sidebar-nav a'));
    links.forEach(function (a) {
      var ident = (a.getAttribute('href') || '').replace(/^#/, '');   // /docs/x  o  /docs/x?id=sez
      var base = ident.split('?')[0];
      if (!base || DN_SKIP[base]) return;
      var chk = a.querySelector('.dn-check');
      if (!chk) {
        chk = document.createElement('span');
        chk.className = 'dn-check';
        chk.setAttribute('role', 'checkbox');
        chk.setAttribute('tabindex', '0');
        chk.setAttribute('title', 'Segna come letto');
        (function (id) {
          function flip(e) { e.preventDefault(); e.stopPropagation(); applyCascade(id); decorate(); }
          chk.addEventListener('click', flip);
          chk.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') flip(e); });
        })(ident);
        a.insertBefore(chk, a.firstChild);
      }
      var r = read.indexOf(ident) >= 0;
      chk.classList.toggle('checked', r);
      chk.setAttribute('aria-checked', r ? 'true' : 'false');
    });
    var p = computeProgress();
    updateMeter(p.sum, p.total);
    // stessa progressione persistita per la % sulle card dell'hub (scrittura raw: niente evento)
    if (p.total) { try { localStorage.setItem(window.NotesStore.keyFor('progress'), JSON.stringify({ d: Math.round(p.sum * 100) / 100, t: p.total })); } catch (e) {} }
  }
  // Progressione FRAZIONARIA: denominatore = n. capitoli (fisso, stabile); ogni
  // capitolo contribuisce con la frazione delle sue sezioni lette. La frazione del
  // capitolo aperto si ricava dal DOM e si memorizza (dev-notes-<vault>-frac), così
  // non "balla" navigando: i capitoli non aperti mantengono l'ultima frazione nota.
  function computeProgress() {
    var read = getRead(), frac = getFrac();
    var cur = (vm.route && vm.route.path) || '';
    if (cur && !DN_SKIP[cur]) {
      var subs = descendantIdents(cur), f;
      if (subs.length) { var d = 0; subs.forEach(function (id) { if (read.indexOf(id) >= 0) d++; }); f = d / subs.length; }
      else { f = read.indexOf(cur) >= 0 ? 1 : 0; }                 // capitolo senza sottosezioni
      if (frac[cur] !== f) { frac[cur] = f; try { localStorage.setItem(window.NotesStore.keyFor('frac'), JSON.stringify(frac)); } catch (e) {} }
    }
    var seen = {}, total = 0, sum = 0;
    [].forEach.call(document.querySelectorAll('.sidebar-nav a'), function (a) {
      var ident = (a.getAttribute('href') || '').replace(/^#/, '');
      if (ident.indexOf('?id=') >= 0) return;                      // solo capitoli come denominatore
      var base = ident.split('?')[0];
      if (!base || DN_SKIP[base] || seen[ident]) return;
      seen[ident] = 1; total++;
      sum += (typeof frac[ident] === 'number') ? frac[ident] : (read.indexOf(ident) >= 0 ? 1 : 0);
    });
    return { sum: sum, total: total };
  }
  function updateMeter(sum, total) {
    var nav = document.querySelector('.sidebar-nav') || document.querySelector('.sidebar');
    if (!nav) return;
    var m = document.getElementById('dn-progress');
    if (!m) {
      m = document.createElement('div');
      m.id = 'dn-progress';
      m.innerHTML = '<div class="dn-progress-label"><span class="dn-progress-text">letto</span><span class="dn-progress-pct"></span></div><div class="dn-progress-bar"><span></span></div>';
      nav.insertBefore(m, nav.firstChild);
    }
    var pct = total ? Math.round(sum / total * 100) : 0;
    var pc = m.querySelector('.dn-progress-pct'); var ps = pct + '%'; if (pc.textContent !== ps) pc.textContent = ps;
    m.querySelector('.dn-progress-bar span').style.width = pct + '%';
    m.style.display = total ? '' : 'none';
  }
  hook.doneEach(function () {
    var read = getRead();
    if (rollupPassive(read)) window.NotesStore.write('read', read);   // completa (mai de-spunta); decorate via evento
    else decorate();
  });
  document.addEventListener('notesstore:change', function (e) {
    if (e.detail && (e.detail.name === 'read' || e.detail.name === '*')) decorate();
  });
}

// "Preferiti": stella su ogni SOTTO-SEZIONE (h2/h3/h4) del capitolo — segnalibrare
// il capitolo intero è poco utile — più un dock fisso con l'elenco (click per
// navigare alla sezione, ✕ per rimuovere). Persistito via NotesStore: {path, id, title}.
function bookmarksPlugin(hook, vm) {
  function get() { var v = window.NotesStore.read('favorites', []); return Array.isArray(v) ? v.filter(function (x) { return x && typeof x.path === 'string'; }) : []; }
  function eq(x, p, id) { return x.path === p && (x.id || '') === (id || ''); }
  function idx(p, id) { var a = get(), r = -1; a.forEach(function (x, i) { if (eq(x, p, id)) r = i; }); return r; }
  function toggle(p, id, title) { var a = get(), i = idx(p, id); if (i >= 0) a.splice(i, 1); else a.push({ path: p, id: id || '', title: title }); window.NotesStore.write('favorites', a); }
  function remove(p, id) { var a = get(), i = idx(p, id); if (i >= 0) { a.splice(i, 1); window.NotesStore.write('favorites', a); } }
  function href(f) { return '#' + f.path + (f.id ? '?id=' + f.id : ''); }

  function ensureDock() {
    if (document.getElementById('dn-fav')) return;
    var w = document.createElement('div');
    w.id = 'dn-fav';
    w.innerHTML = '<button id="dn-fav-btn" type="button" title="Preferiti" aria-label="Preferiti" aria-expanded="false">' + DN_ICON.starOut + '</button><div class="dn-fav-list" role="menu"></div>';
    document.body.appendChild(w);
    var btn = w.querySelector('#dn-fav-btn'), list = w.querySelector('.dn-fav-list');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !list.classList.contains('open');
      dnCloseAllPops(list);                     // chiudi gli altri popover
      list.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      if (willOpen) renderList();
    });
    document.addEventListener('click', function (e) { if (!w.contains(e.target)) list.classList.remove('open'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') list.classList.remove('open'); });
  }
  function renderList() {
    var list = document.querySelector('#dn-fav .dn-fav-list'); if (!list) return;
    var favs = get(), html = '<div class="dn-title">Preferiti</div>';
    if (!favs.length) html += '<div class="dn-empty">Nessun preferito. Usa la ☆ che compare accanto ai titoli delle sezioni.</div>';
    else favs.forEach(function (f) {
      html += '<div class="dn-fav-row"><a href="' + dnEscHtml(href(f)) + '">' + dnEscHtml(f.title || f.path) + '</a>' +
              '<button class="dn-fav-del" type="button" data-path="' + dnEscHtml(f.path) + '" data-id="' + dnEscHtml(f.id || '') + '" title="Rimuovi" aria-label="Rimuovi">' + DN_ICON.x + '</button></div>';
    });
    list.innerHTML = html;
    [].forEach.call(list.querySelectorAll('.dn-fav-del'), function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        remove(b.getAttribute('data-path'), b.getAttribute('data-id')); renderList(); refreshBtn(); syncStars();
      });
    });
  }
  function refreshBtn() { var b = document.getElementById('dn-fav-btn'); if (b) b.classList.toggle('has-fav', get().length > 0); }
  // una stella per ogni sotto-sezione (h2/h3/h4 con id); il capitolo intero (h1) no.
  function addStars(path) {
    var hs = document.querySelectorAll('.markdown-section h2[id], .markdown-section h3[id], .markdown-section h4[id]');
    [].forEach.call(hs, function (h) {
      if (h.querySelector('.dn-star')) return;
      var id = h.id || '', title = (h.textContent || '').trim();
      var s = document.createElement('button');
      s.type = 'button'; s.className = 'dn-star';
      s.title = 'Aggiungi ai preferiti'; s.setAttribute('aria-label', 'Aggiungi ai preferiti');
      s.setAttribute('data-id', id);
      s.innerHTML = idx(path, id) >= 0 ? DN_ICON.starFull : DN_ICON.starOut;
      s.classList.toggle('is-fav', idx(path, id) >= 0);
      s.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        toggle(path, id, title);
        var f = idx(path, id) >= 0;
        s.classList.toggle('is-fav', f); s.innerHTML = f ? DN_ICON.starFull : DN_ICON.starOut;
        renderList(); refreshBtn();
      });
      h.appendChild(s);
    });
  }
  function syncStars() {
    var path = (vm.route && vm.route.path) || '';
    [].forEach.call(document.querySelectorAll('.markdown-section .dn-star'), function (s) {
      var f = idx(path, s.getAttribute('data-id') || '') >= 0;
      s.classList.toggle('is-fav', f); s.innerHTML = f ? DN_ICON.starFull : DN_ICON.starOut;
    });
  }
  hook.mounted(function () { ensureDock(); refreshBtn(); });
  hook.doneEach(function () {
    ensureDock(); refreshBtn();
    var path = (vm.route && vm.route.path) || '';
    if (path && !DN_SKIP[path]) addStars(path);
  });
  document.addEventListener('notesstore:change', function (e) {
    if (e.detail && (e.detail.name === 'favorites' || e.detail.name === '*')) {
      refreshBtn(); syncStars();
      if (document.querySelector('#dn-fav .dn-fav-list.open')) renderList();
    }
  });
}

