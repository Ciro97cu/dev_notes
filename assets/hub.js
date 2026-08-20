// Script dell'hub: toggle tema, banner "Riprendi", % di lettura sulle card, puntini di sfondo.

(function () {
  var KEY = 'dev-notes-theme';
  var btn = document.getElementById('theme-toggle');
  var isDark = function () { return document.documentElement.classList.contains('dark'); };
  var SUN = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
  var MOON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
  var paint = function () { btn.innerHTML = isDark() ? SUN : MOON; btn.title = isDark() ? 'Passa al tema chiaro' : 'Passa al tema scuro'; };
  paint();
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animT;
  btn.addEventListener('click', function () {
    var d = !isDark();
    if (!reduce) {                                   // icona che ruota entrando + transizione morbida dei colori
      document.documentElement.classList.add('theme-anim');
      clearTimeout(animT); animT = setTimeout(function () { document.documentElement.classList.remove('theme-anim'); }, 380);
      btn.classList.remove('spin'); void btn.offsetWidth; btn.classList.add('spin');
    }
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
    html: { n: 'HTML', a: '#e34f26' }, css: { n: 'CSS', a: '#1572b6' },
    javascript: { n: 'JavaScript', a: '#e6c200' }, typescript: { n: 'TypeScript', a: '#3178c6' },
    angular: { n: 'Angular', a: '#dd0031' }, git: { n: 'Git', a: '#f05133' },
    code: { n: 'Code', a: '#059669' }, glossario: { n: 'Glossario', a: '#6366f1' }
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


// Backup dati: esporta/importa file + QR scan + importa da link.
// L'hub è standalone (non carica shared/*.js), quindi la logica QR è auto-contenuta.
(function () {
  var btn = document.getElementById('hub-data-btn');
  if (!btn) return;

  // Path delle librerie QR: ricavato dal src di hub.js (es. .../assets/hub.js → .../assets/lib/)
  var _src = document.currentScript && document.currentScript.src || '';
  var LIB = _src.replace(/hub\.js(\?.*)?$/, 'lib/');

  // ── Icone ────────────────────────────────────────────────────────────────
  var ICON_DB   = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>';
  var ICON_DL   = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>';
  var ICON_UP   = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 9l5-5 5 5"/><path d="M12 4v12"/></svg>';
  var ICON_CAM  = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2-3z"/><circle cx="12" cy="13" r="3"/></svg>';
  var ICON_QR   = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>';

  btn.innerHTML = ICON_DB;

  // ── CSS modal (usa le variabili dell'hub, non quelle dei vault) ───────────
  var mst = document.createElement('style');
  mst.textContent = [
    '#dn-qr-modal{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center}',
    '.dn-qr-box{background:var(--card);border:1px solid var(--card-border);border-radius:14px;padding:1.4rem 1rem;max-width:340px;width:90%;max-height:90vh;overflow:auto;position:relative;box-shadow:var(--card-shadow);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-sizing:border-box}',
    '.dn-qr-box h3{margin:0 0 .5rem;font-size:1rem;font-weight:700;color:var(--fg)}',
    '.dn-qr-box p{margin:0 0 .9rem;font-size:.82rem;color:var(--fg);opacity:.7;line-height:1.45}',
    '.dn-qr-close{position:absolute;top:.7rem;right:.9rem;background:none;border:none;cursor:pointer;font-size:1.4rem;color:var(--fg);opacity:.55;line-height:1;padding:.1rem .3rem}',
    '.dn-qr-close:hover{opacity:1}',
    '.dn-qr-btn{width:100%;padding:.55rem;border-radius:8px;background:var(--grad-a);color:#fff;border:none;cursor:pointer;font-size:.88rem;font-weight:600}',
    '.dn-qr-btn:hover{opacity:.88}',
    '#dn-qr-video{width:100%;border-radius:8px;max-height:280px;object-fit:cover;background:#000;display:block}',
    '#dn-qr-scan-hint{font-size:.8rem;color:var(--fg);opacity:.7;text-align:center;margin:.6rem 0 0}',
    '#dn-qr-canvas{display:flex;justify-content:center;align-items:center;box-sizing:border-box;width:100%;margin-bottom:.9rem;background:#fff;border-radius:8px;padding:.75rem;min-height:210px}',
    // Mostra SOLO il canvas: davidshimjs dopo il primo render passerebbe a un <img>
    // (toDataURL) nascondendo il canvas, ma makeCode() aggiorna il canvas → l'img
    // resterebbe ferma sul frame 0 e l'animazione sembrerebbe congelata. Forzando il
    // canvas visibile e l'img nascosta, ogni frame di makeCode() si vede davvero.
    // min-width:0 sblocca il restringimento del flex item (default min-width:auto lo
    // terrebbe a 260px → overflow su box stretti); max-width:100% lo contiene senza upscalare.
    '#dn-qr-canvas canvas{display:block!important;max-width:100%!important;height:auto!important;min-width:0}',
    '#dn-qr-canvas img{display:none!important}',
    // barra di avanzamento (blocchi catturati) per lo scan animato
    '.dn-prog{height:8px;border-radius:5px;background:rgba(127,127,127,.25);overflow:hidden;margin:.7rem 0 .35rem}',
    '.dn-prog>span{display:block;height:100%;width:0;background:var(--grad-a);transition:width .2s ease}',
    '.dn-prog-lbl{font-size:.76rem;color:var(--fg);opacity:.7;text-align:center}'
  ].join('');
  document.head.appendChild(mst);

  // ── Popover ───────────────────────────────────────────────────────────────
  var pop = document.createElement('div');
  pop.id = 'hub-data-pop';
  pop.innerHTML =
    '<div class="dn-title">Dati — tutti i vault</div>' +
    '<button type="button" data-act="export">'      + ICON_DL   + 'Esporta tutto su file…</button>' +
    '<button type="button" data-act="import">'      + ICON_UP   + 'Importa da file…</button>' +
    '<hr style="border:none;border-top:1px solid var(--card-border);margin:.3rem">' +
    '<button type="button" data-act="qr-show">'     + ICON_QR   + 'Condividi via QR animato…</button>' +
    '<button type="button" data-act="qr-scan">'     + ICON_CAM  + 'Scannerizza QR animato…</button>' +
    '<div class="dn-note"><strong>Tutti i vault insieme</strong> (progressi, preferiti, evidenziazioni). Il <strong>QR animato</strong> allinea cellulare ⇄ PC senza cavi né account.</div>';
  document.body.appendChild(pop);

  var fileIn = document.createElement('input');
  fileIn.type = 'file'; fileIn.accept = 'application/json,.json';
  fileIn.style.cssText = 'position:absolute;opacity:0;pointer-events:none';
  document.body.appendChild(fileIn);

  function close() { pop.classList.remove('open'); }
  btn.addEventListener('click', function (e) { e.stopPropagation(); pop.classList.toggle('open'); });
  document.addEventListener('click', function (e) { if (!pop.contains(e.target) && e.target !== btn) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  // ── Raccolta / applicazione dati (condivisa da file e QR animato) ─────────
  var PREFIX = 'dev-notes-';
  var UNSAFE = { __proto__: 1, constructor: 1, prototype: 1 };
  // Chiavi "nostre": i dati dev-notes-* e le posizioni "Riprendi" (<vault>-last-page,
  // salvate senza prefisso da 04-plugins.js) — così l'export/import/QR le include.
  function isOurKey(k) { return !!k && (k.indexOf(PREFIX) === 0 || /-last-page$/.test(k)); }

  function collectData() {
    var data = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (isOurKey(key)) {
          try { data[key] = JSON.parse(localStorage.getItem(key)); }
          catch (_) { data[key] = localStorage.getItem(key); }
        }
      }
    } catch (e) {}
    return data;
  }
  // Scrive i dati (allowlist dev-notes-* + *-last-page, guardia proto-pollution). replace → svuota prima.
  function applyData(data, replace) {
    if (!data || typeof data !== 'object') throw new Error('formato non valido');
    if (replace) {
      var toRm = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (isOurKey(k)) toRm.push(k);
      }
      toRm.forEach(function (k) { try { localStorage.removeItem(k); } catch (_) {} });
    }
    Object.keys(data).forEach(function (key) {
      if (UNSAFE[key] || !isOurKey(key)) return;
      try { localStorage.setItem(key, JSON.stringify(data[key])); } catch (_) {}
    });
  }

  // ── Export su file ──────────────────────────────────────────────────────
  function exportAll() {
    var json = JSON.stringify({ app: 'dev-notes', version: 1, exportedAt: new Date().toISOString(), data: collectData() }, null, 2);
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    a.download = 'dev-notes-dati.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(a.href);
    close();
  }

  // ── Import da file ────────────────────────────────────────────────────────
  fileIn.addEventListener('change', function () {
    var f = fileIn.files && fileIn.files[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { alert('File troppo grande (max 8 MB).'); return; }
    var merge = confirm('Importa "' + f.name + '".\n\nOK = unisci ai dati attuali\nAnnulla = sostituisci tutto');
    var r = new FileReader();
    r.onload = function (ev) {
      try {
        var obj = JSON.parse(ev.target.result);
        if (!obj || typeof obj !== 'object' || !obj.data || typeof obj.data !== 'object')
          throw new Error('formato non valido');
        applyData(obj.data, !merge);
        location.reload();
      } catch (e) { alert('Import non riuscito: ' + e.message); }
    };
    r.readAsText(f);
  });

  // ── Lazy libs (caricate solo all'uso; jsqr da 257 KB solo per lo scan) ────
  function loadLib(src, cb) {
    var s = document.createElement('script'); s.src = src;
    s.onload = cb; s.onerror = function () { console.warn('[hub-qr] impossibile caricare', src); };
    document.head.appendChild(s);
  }
  function chain(steps, cb) {                    // carica in sequenza solo ciò che manca
    (function step(i) {
      if (i >= steps.length) { cb(); return; }
      if (steps[i].have()) { step(i + 1); return; }
      loadLib(steps[i].src, function () { step(i + 1); });
    })(0);
  }
  function ensureShare(cb) {
    chain([
      { have: function () { return window.LZString; },   src: LIB + 'lz-string.min.js' },
      { have: function () { return window.QRCode; },     src: LIB + 'qrcode.min.js' },
      { have: function () { return window.DnFountain; }, src: LIB + 'dn-fountain.js' }
    ], cb);
  }
  function ensureScan(cb) {
    chain([
      { have: function () { return window.LZString; },   src: LIB + 'lz-string.min.js' },
      { have: function () { return window.jsQR; },       src: LIB + 'jsqr.min.js' },
      { have: function () { return window.DnFountain; }, src: LIB + 'dn-fountain.js' }
    ], cb);
  }

  // Payload QR = stesso wrapper del file, compresso in byte (LZString → Uint8Array).
  function snapshotBytes() {
    return LZString.compressToUint8Array(JSON.stringify({ app: 'dev-notes', version: 1, data: collectData() }));
  }
  function bytesToData(bytes) {
    var obj = JSON.parse(LZString.decompressFromUint8Array(bytes));
    if (!obj || obj.app !== 'dev-notes' || !obj.data || typeof obj.data !== 'object')
      throw new Error('contenuto non riconosciuto');
    return obj.data;
  }

  // Parametri del QR animato: blocchi piccoli = QR meno denso e più facile da inquadrare;
  // FPS basso = ogni frame resta stabile più a lungo (la camera fa in tempo a leggerlo).
  var CHUNK = 200, FPS = 5, QR_PX = 260;

  // ── Modal comune ──────────────────────────────────────────────────────────
  function makeModal(label) {
    var m = document.createElement('div');
    m.id = 'dn-qr-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.setAttribute('aria-label', label);
    // blocca lo scroll della pagina sotto: su questo hub lo scroller è <html>
    // (documentElement), quindi il solo body:overflow non basta.
    var prevBody = document.body.style.overflow, prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    function onKey(e) { if (e.key === 'Escape') m._close(); }
    function closeM() {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      m.remove();
    }
    m.addEventListener('click', function (e) { if (e.target === m) closeM(); });
    document.addEventListener('keydown', onKey);
    m._close = closeM;
    return m;
  }

  // ── Condividi via QR animato (tutti i vault, stream infinito di frame) ────
  function shareOpen() {
    if (document.getElementById('dn-qr-modal')) return;
    ensureShare(function () {
      var enc = DnFountain.createEncoder(snapshotBytes(), CHUNK);
      var modal = makeModal('Condividi via QR animato');
      modal.innerHTML =
        '<div class="dn-qr-box">' +
          '<button class="dn-qr-close" type="button" aria-label="Chiudi">×</button>' +
          '<h3>Condividi via QR animato</h3>' +
          '<div id="dn-qr-canvas"></div>' +
          '<p id="dn-qr-scan-hint">Inquadra con «Scannerizza QR animato» sull\'altro dispositivo. Tieni aperto finché non completa (' + enc.K + ' blocchi) · <span id="dn-qr-frame">frame 1</span></p>' +
        '</div>';
      document.body.appendChild(modal);
      modal.querySelector('.dn-qr-close').addEventListener('click', modal._close);

      var box = modal.querySelector('#dn-qr-canvas');
      var fc  = modal.querySelector('#dn-qr-frame');
      var qr = new QRCode(box, { text: enc.next(), width: QR_PX, height: QR_PX, colorDark: '#000000', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.L });
      var n = 1;
      var timer = setInterval(function () {
        try { qr.makeCode(enc.next()); n++; if (fc) fc.textContent = 'frame ' + n; } catch (e) {}
      }, Math.round(1000 / FPS));

      var origClose = modal._close;
      modal._close = function () { clearInterval(timer); origClose(); };
      modal.querySelector('.dn-qr-close').onclick = modal._close;
    });
  }

  // ── Scannerizza QR animato (raccoglie frame → fountain-decode → import) ───
  function scanOpen() {
    if (document.getElementById('dn-qr-modal')) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Fotocamera non disponibile (richiede HTTPS o localhost).'); return;
    }
    ensureScan(function () {
      var dec = DnFountain.createDecoder();
      var modal = makeModal('Scannerizza QR animato');
      modal.innerHTML =
        '<div class="dn-qr-box">' +
          '<button class="dn-qr-close" type="button" aria-label="Chiudi">×</button>' +
          '<h3>Scannerizza QR animato</h3>' +
          '<video id="dn-qr-video" playsinline muted></video>' +
          '<div class="dn-prog"><span id="dn-prog-bar"></span></div>' +
          '<p class="dn-prog-lbl" id="dn-prog-lbl">Avvio fotocamera…</p>' +
        '</div>';
      document.body.appendChild(modal);
      modal.querySelector('.dn-qr-close').addEventListener('click', modal._close);

      var video = modal.querySelector('#dn-qr-video');
      var bar   = modal.querySelector('#dn-prog-bar');
      var lbl   = modal.querySelector('#dn-prog-lbl');
      var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
      var stream = null, rafId = null, finished = false;

      function stopAll() {
        if (rafId) cancelAnimationFrame(rafId);
        if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      }
      var origClose = modal._close;
      modal._close = function () { stopAll(); origClose(); };
      modal.querySelector('.dn-qr-close').onclick = modal._close;

      function finish() {
        finished = true; stopAll();
        var data;
        try { data = bytesToData(dec.result()); }
        catch (e) { lbl.textContent = 'Errore di lettura: ' + e.message; return; }
        modal.remove();
        var merge = confirm('Ricevuti i dati (' + Object.keys(data).length + ' voci).\n\nOK = unisci ai dati attuali\nAnnulla = sostituisci tutto');
        applyData(data, !merge);
        location.reload();
      }

      navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
        .then(function (s) {
          stream = s; video.srcObject = s; video.play();
          lbl.textContent = 'Inquadra il QR animato…';
          function tick() {
            if (finished) return;
            if (video.readyState >= video.HAVE_ENOUGH_DATA) {
              canvas.width = video.videoWidth; canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0);
              var id = ctx.getImageData(0, 0, canvas.width, canvas.height);
              var code = jsQR(id.data, id.width, id.height, { inversionAttempts: 'dontInvert' });
              if (code && code.data) {
                var st = dec.addFrame(code.data);
                if (st.K) {
                  var pct = Math.round(st.have / st.K * 100);
                  bar.style.width = pct + '%';
                  lbl.textContent = 'Ricezione… ' + st.have + '/' + st.K + ' blocchi (' + pct + '%)';
                }
                if (st.done) { finish(); return; }
              }
            }
            rafId = requestAnimationFrame(tick);
          }
          rafId = requestAnimationFrame(tick);
        })
        .catch(function (err) { lbl.textContent = 'Fotocamera non disponibile: ' + err.message; });
    });
  }

  // ── Click handler popover ─────────────────────────────────────────────────
  pop.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    if      (act === 'export')  { exportAll(); }
    else if (act === 'import')  { fileIn.value = ''; fileIn.click(); close(); }
    else if (act === 'qr-show') { close(); shareOpen(); }
    else if (act === 'qr-scan') { close(); scanOpen(); }
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
