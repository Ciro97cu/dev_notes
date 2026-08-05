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
  var ICON_LINK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

  btn.innerHTML = ICON_DB;

  // ── CSS modal (usa le variabili dell'hub, non quelle dei vault) ───────────
  var mst = document.createElement('style');
  mst.textContent = [
    '#dn-qr-modal{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center}',
    '.dn-qr-box{background:var(--card);border:1px solid var(--card-border);border-radius:14px;padding:1.4rem 1.6rem;max-width:320px;width:90%;position:relative;box-shadow:var(--card-shadow);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}',
    '.dn-qr-box h3{margin:0 0 .5rem;font-size:1rem;font-weight:700;color:var(--fg)}',
    '.dn-qr-box p{margin:0 0 .9rem;font-size:.82rem;color:var(--fg);opacity:.7;line-height:1.45}',
    '.dn-qr-close{position:absolute;top:.7rem;right:.9rem;background:none;border:none;cursor:pointer;font-size:1.4rem;color:var(--fg);opacity:.55;line-height:1;padding:.1rem .3rem}',
    '.dn-qr-close:hover{opacity:1}',
    '.dn-qr-btn{width:100%;padding:.55rem;border-radius:8px;background:var(--grad-a);color:#fff;border:none;cursor:pointer;font-size:.88rem;font-weight:600}',
    '.dn-qr-btn:hover{opacity:.88}',
    '#dn-qr-video{width:100%;border-radius:8px;max-height:280px;object-fit:cover;background:#000;display:block}',
    '#dn-qr-scan-hint{font-size:.8rem;color:var(--fg);opacity:.6;text-align:center;margin:.6rem 0 0}',
    '#dn-hub-link-input{width:100%;border-radius:8px;border:1px solid var(--card-border);background:var(--bg);color:var(--fg);font:inherit;font-size:.85rem;padding:.6rem;resize:none;margin-bottom:.8rem;box-sizing:border-box}'
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
    '<button type="button" data-act="qr-scan">'     + ICON_CAM  + 'Scannerizza QR…</button>' +
    '<button type="button" data-act="link-import">' + ICON_LINK + 'Importa da link…</button>' +
    '<div class="dn-note"><strong>File</strong>: backup completo di tutti i vault. <strong>QR / Link</strong>: importa da un vault su un altro dispositivo.</div>';
  document.body.appendChild(pop);

  var fileIn = document.createElement('input');
  fileIn.type = 'file'; fileIn.accept = 'application/json,.json';
  fileIn.style.cssText = 'position:absolute;opacity:0;pointer-events:none';
  document.body.appendChild(fileIn);

  function close() { pop.classList.remove('open'); }
  btn.addEventListener('click', function (e) { e.stopPropagation(); pop.classList.toggle('open'); });
  document.addEventListener('click', function (e) { if (!pop.contains(e.target) && e.target !== btn) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  // ── Export ────────────────────────────────────────────────────────────────
  function exportAll() {
    var PREFIX = 'dev-notes-', data = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf(PREFIX) === 0) {
          try { data[key] = JSON.parse(localStorage.getItem(key)); }
          catch (_) { data[key] = localStorage.getItem(key); }
        }
      }
    } catch (e) {}
    var json = JSON.stringify({ app: 'dev-notes', version: 1, exportedAt: new Date().toISOString(), data: data }, null, 2);
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    a.download = 'dev-notes-dati.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(a.href);
    close();
  }

  // ── Import file ───────────────────────────────────────────────────────────
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
        var PREFIX = 'dev-notes-';
        var UNSAFE = { __proto__: 1, constructor: 1, prototype: 1 };
        if (!merge) {
          var toRm = [];
          for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && k.indexOf(PREFIX) === 0) toRm.push(k);
          }
          toRm.forEach(function (k) { try { localStorage.removeItem(k); } catch (_) {} });
        }
        Object.keys(obj.data).forEach(function (key) {
          if (UNSAFE[key] || key.indexOf(PREFIX) !== 0) return;
          try { localStorage.setItem(key, JSON.stringify(obj.data[key])); } catch (_) {}
        });
        location.reload();
      } catch (e) { alert('Import non riuscito: ' + e.message); }
    };
    r.readAsText(f);
  });

  // ── Lazy libs (lz-string + jsqr, senza 01-core né NotesStore) ────────────
  var _libsReady = false;
  function loadLib(src, cb) {
    var s = document.createElement('script'); s.src = src;
    s.onload = cb; s.onerror = function () { console.warn('[hub-qr] cannot load', src); };
    document.head.appendChild(s);
  }
  function ensureLibs(cb) {
    if (_libsReady) { cb(); return; }
    var pending = 0;
    function done() { if (--pending === 0) { _libsReady = true; cb(); } }
    function need(cond, src) { if (!cond) { pending++; loadLib(src, done); } }
    need(window.LZString, LIB + 'lz-string.min.js');
    need(window.jsQR,     LIB + 'jsqr.min.js');
    if (!pending) { _libsReady = true; cb(); }
  }

  // ── Decode e import da sync URL (scrive direttamente in localStorage) ────
  function decode(str) {
    try { return JSON.parse(LZString.decompressFromEncodedURIComponent(str)); }
    catch (_) { return null; }
  }
  var SYNC_KEYS = { read: 1, frac: 1, progress: 1, favorites: 1 };
  function syncImport(obj) {
    if (!obj || typeof obj !== 'object' || typeof obj.d !== 'object' || Array.isArray(obj.d)) return false;
    if (!obj.vault) { alert('Dati non validi: vault mancante.'); return false; }
    var UNSAFE = { __proto__: 1, constructor: 1, prototype: 1 };
    var PREFIX = 'dev-notes-', count = 0;
    Object.keys(obj.d).forEach(function (k) {
      if (!SYNC_KEYS[k] || UNSAFE[k]) return;
      try { localStorage.setItem(PREFIX + obj.vault + '-' + k, JSON.stringify(obj.d[k])); count++; } catch (_) {}
    });
    return count > 0;
  }

  // ── Modal comune ──────────────────────────────────────────────────────────
  function makeModal(label) {
    var m = document.createElement('div');
    m.id = 'dn-qr-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.setAttribute('aria-label', label);
    function closeM() { m.remove(); }
    m.addEventListener('click', function (e) { if (e.target === m) closeM(); });
    m.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeM(); });
    m._close = closeM;
    return m;
  }

  // ── Scan QR ───────────────────────────────────────────────────────────────
  function scanOpen() {
    if (document.getElementById('dn-qr-modal')) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Fotocamera non disponibile (richiede HTTPS o localhost).'); return;
    }
    ensureLibs(function () {
      var modal = makeModal('Scannerizza QR');
      modal.innerHTML =
        '<div class="dn-qr-box">' +
          '<button class="dn-qr-close" type="button" aria-label="Chiudi">×</button>' +
          '<h3>Scannerizza QR</h3>' +
          '<video id="dn-qr-video" playsinline muted></video>' +
          '<p id="dn-qr-scan-hint">Avvio fotocamera…</p>' +
        '</div>';
      document.body.appendChild(modal);
      modal.querySelector('.dn-qr-close').addEventListener('click', modal._close);

      var video = modal.querySelector('#dn-qr-video');
      var hint  = modal.querySelector('#dn-qr-scan-hint');
      var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
      var stream = null, rafId = null;

      function stopAll() {
        if (rafId) cancelAnimationFrame(rafId);
        if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      }
      var origClose = modal._close;
      modal._close = function () { stopAll(); origClose(); };
      modal.querySelector('.dn-qr-close').onclick = modal._close;

      navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
        .then(function (s) {
          stream = s; video.srcObject = s; video.play();
          hint.textContent = 'Inquadra il QR generato nel vault…';
          function tick() {
            if (video.readyState < video.HAVE_ENOUGH_DATA) { rafId = requestAnimationFrame(tick); return; }
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            var id = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var code = jsQR(id.data, id.width, id.height, { inversionAttempts: 'dontInvert' });
            if (code && code.data) {
              var m = code.data.match(/[?&]sync=([^&#]+)/);
              if (m) {
                stopAll(); modal.remove();
                var obj = decode(m[1]);
                if (obj && confirm('Importare i dati del vault "' + (obj.vault || '?') + '"?')) {
                  if (syncImport(obj)) location.reload();
                }
                return;
              }
            }
            rafId = requestAnimationFrame(tick);
          }
          rafId = requestAnimationFrame(tick);
        })
        .catch(function (err) {
          hint.textContent = 'Fotocamera non disponibile: ' + err.message;
        });
    });
  }

  // ── Importa da link ───────────────────────────────────────────────────────
  function linkImportOpen() {
    if (document.getElementById('dn-qr-modal')) return;
    var modal = makeModal('Importa da link');
    modal.innerHTML =
      '<div class="dn-qr-box">' +
        '<button class="dn-qr-close" type="button" aria-label="Chiudi">×</button>' +
        '<h3>Importa da link</h3>' +
        '<p>Incolla il link di sincronizzazione generato in un vault.</p>' +
        '<textarea id="dn-hub-link-input" placeholder="https://…?sync=…" rows="3" spellcheck="false"></textarea>' +
        '<button class="dn-qr-btn" id="dn-hub-link-go">Importa</button>' +
      '</div>';
    document.body.appendChild(modal);
    modal.querySelector('.dn-qr-close').addEventListener('click', modal._close);

    var input = modal.querySelector('#dn-hub-link-input');
    input.focus();
    modal.querySelector('#dn-hub-link-go').addEventListener('click', function () {
      var url = input.value.trim();
      if (!url) return;
      var m = url.match(/[?&]sync=([^&#]+)/);
      if (!m) { alert('Link non valido: parametro ?sync= non trovato.'); return; }
      var raw = m[1];
      function proceed() {
        var obj = decode(raw);
        if (!obj) { alert('Dati non leggibili.'); return; }
        modal.remove();
        if (confirm('Importare i dati del vault "' + (obj.vault || '?') + '"?')) {
          if (syncImport(obj)) location.reload();
        }
      }
      if (window.LZString) { proceed(); return; }
      loadLib(LIB + 'lz-string.min.js', proceed);
    });
  }

  // ── Click handler popover ─────────────────────────────────────────────────
  pop.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    if      (act === 'export')      { exportAll(); }
    else if (act === 'import')      { fileIn.value = ''; fileIn.click(); close(); }
    else if (act === 'qr-scan')     { close(); scanOpen(); }
    else if (act === 'link-import') { close(); linkImportOpen(); }
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
