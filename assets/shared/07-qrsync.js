
// ── QR / URL Sync — condivisione progresso e segnalibri tra dispositivi ───────
// Dati inclusi: read, frac, progress, favorites (del vault corrente).
// Highlights esclusi (troppo grandi per un singolo QR).
// Librerie lazily caricate da assets/lib/ solo quando serve.
(function () {
  'use strict';

  // Calcola il base-path di assets/ dal src di questo script, così funziona
  // indipendentemente da quale vault lo carica (../assets/shared/07-qrsync.js).
  var _src = (document.currentScript && document.currentScript.src) || '';
  var LIB_BASE = _src.replace(/shared\/07-qrsync\.js(\?.*)?$/, 'lib/');

  var SYNC_KEYS = ['read', 'frac', 'progress', 'favorites'];

  // ── Encode / decode ────────────────────────────────────────────────────────
  function encode(obj) {
    return LZString.compressToEncodedURIComponent(JSON.stringify(obj));
  }
  function decode(str) {
    try { return JSON.parse(LZString.decompressFromEncodedURIComponent(str)); }
    catch (_) { return null; }
  }

  // ── Snapshot del vault corrente ────────────────────────────────────────────
  function snapshot() {
    var d = {};
    SYNC_KEYS.forEach(function (k) {
      var v = NotesStore.read(k);
      if (v !== null) d[k] = v;
    });
    return { vault: window.__VAULT || '', d: d };
  }

  // ── Import con guard ───────────────────────────────────────────────────────
  function syncImport(obj) {
    if (!obj || typeof obj !== 'object' || typeof obj.d !== 'object' || Array.isArray(obj.d)) return false;
    // warn se i dati vengono da un vault diverso
    if (obj.vault && obj.vault !== (window.__VAULT || '')) {
      if (!confirm('I dati nel link provengono dal vault "' + obj.vault +
          '" ma sei nel vault "' + (window.__VAULT || '?') + '".\nImportare comunque?')) {
        return false;
      }
    }
    var count = 0;
    SYNC_KEYS.forEach(function (k) {
      if (!Object.prototype.hasOwnProperty.call(obj.d, k)) return;
      // proto-pollution guard
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') return;
      NotesStore.write(k, obj.d[k]);
      count++;
    });
    return count > 0;
  }

  // ── Genera URL di sync ─────────────────────────────────────────────────────
  function syncUrl() {
    var encoded = encode(snapshot());
    // ?sync= va nel query string reale (prima del #), non nel fragment hash di docsify
    return location.origin + location.pathname + '?sync=' + encoded + location.hash;
  }

  // ── Controlla ?sync= all'apertura del vault ────────────────────────────────
  function checkUrl() {
    var m = location.search.match(/[?&]sync=([^&]+)/);
    if (!m) return;
    var raw = m[1];
    // pulisce subito la URL senza rifare la navigazione
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (_) {}
    function proceed() {
      var obj = decode(raw);
      if (!obj) return;
      showSyncBanner(obj);
    }
    if (window.LZString) { proceed(); return; }
    loadLib(LIB_BASE + 'lz-string.min.js', proceed);
  }

  function showSyncBanner(obj) {
    if (document.getElementById('dn-sync-banner')) return;
    var div = document.createElement('div');
    div.id = 'dn-sync-banner';
    div.innerHTML =
      '<span class="dn-sync-msg">Trovati dati di sincronizzazione nel link.</span>' +
      '<button id="dn-sync-ok" type="button">Importa</button>' +
      '<button id="dn-sync-no" type="button">Ignora</button>';
    document.body.appendChild(div);
    document.getElementById('dn-sync-ok').addEventListener('click', function () {
      var ok = syncImport(obj);
      div.remove();
      if (ok) location.reload();
    });
    document.getElementById('dn-sync-no').addEventListener('click', function () { div.remove(); });
  }

  // ── Caricamento lazy librerie ──────────────────────────────────────────────
  function loadLib(src, cb) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = cb;
    s.onerror = function () { console.warn('[dn-qr] impossibile caricare', src); };
    document.head.appendChild(s);
  }

  var _libsReady = false;
  function ensureLibs(cb) {
    if (_libsReady) { cb(); return; }
    var pending = 0;
    function done() { if (--pending === 0) { _libsReady = true; cb(); } }
    function need(cond, src) { if (!cond) { pending++; loadLib(src, done); } }
    need(window.LZString, LIB_BASE + 'lz-string.min.js');
    need(window.QRCode,   LIB_BASE + 'qrcode.min.js');
    need(window.jsQR,     LIB_BASE + 'jsqr.min.js');
    if (!pending) { _libsReady = true; cb(); }
  }

  // ── CSS ────────────────────────────────────────────────────────────────────
  var CSS = [
    '#dn-qr-modal{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center}',
    '.dn-qr-box{background:var(--bg-soft);border:1px solid var(--border);border-radius:14px;padding:1.4rem 1.6rem;max-width:320px;width:90%;position:relative;box-shadow:0 8px 36px rgba(0,0,0,.28)}',
    '.dn-qr-box h3{margin:0 0 .5rem;font-size:1rem;font-weight:700}',
    '.dn-qr-box p{margin:0 0 .9rem;font-size:.82rem;opacity:.7;line-height:1.45}',
    '.dn-qr-close{position:absolute;top:.7rem;right:.9rem;background:none;border:none;cursor:pointer;font-size:1.4rem;color:var(--text);opacity:.55;line-height:1;padding:.1rem .3rem}',
    '.dn-qr-close:hover{opacity:1}',
    // QR canvas: fondo bianco fisso (max contrasto per qualsiasi scanner)
    '#dn-qr-canvas{display:flex;justify-content:center;margin-bottom:1rem;background:#fff;border-radius:8px;padding:.75rem}',
    '#dn-qr-canvas canvas,#dn-qr-canvas img{display:block!important}',
    '.dn-qr-btn{width:100%;padding:.55rem;border-radius:8px;background:var(--link);color:#fff;border:none;cursor:pointer;font-size:.88rem;font-weight:600}',
    '.dn-qr-btn:hover{opacity:.88}',
    // video camera
    '#dn-qr-video{width:100%;border-radius:8px;max-height:280px;object-fit:cover;background:#000;display:block}',
    '#dn-qr-scan-hint{font-size:.8rem;opacity:.6;text-align:center;margin:.6rem 0 0}',
    // banner di import
    '#dn-sync-banner{position:fixed;top:0;left:0;right:0;z-index:9998;background:var(--link);color:#fff;padding:.65rem 1rem;display:flex;align-items:center;gap:.8rem;font-size:.88rem;font-weight:600;box-shadow:0 2px 12px rgba(0,0,0,.2)}',
    '#dn-sync-banner .dn-sync-msg{flex:1}',
    '#dn-sync-banner button{padding:.28rem .75rem;border-radius:6px;border:2px solid rgba(255,255,255,.65);background:transparent;color:#fff;cursor:pointer;font-weight:700;font-size:.83rem}',
    '#dn-sync-banner button:hover{background:rgba(255,255,255,.18)}'
  ].join('');
  var st = document.createElement('style');
  st.id = 'dn-qr-styles';
  st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  // ── Modal: mostra QR ───────────────────────────────────────────────────────
  function qrOpen() {
    if (document.getElementById('dn-qr-modal')) return;
    ensureLibs(function () {
      var url = syncUrl();
      var modal = document.createElement('div');
      modal.id = 'dn-qr-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Condividi via QR / Link');
      modal.innerHTML =
        '<div class="dn-qr-box">' +
          '<button class="dn-qr-close" type="button" aria-label="Chiudi">×</button>' +
          '<h3>Condividi via QR / Link</h3>' +
          '<p>Inquadra col telefono o copia il link. Sincronizza: progresso e segnalibri di questo vault.</p>' +
          '<div id="dn-qr-canvas"></div>' +
          '<button class="dn-qr-btn" id="dn-qr-copy">Copia link</button>' +
        '</div>';
      document.body.appendChild(modal);

      new QRCode(document.getElementById('dn-qr-canvas'), {
        text: url,
        width: 210,
        height: 210,
        colorDark: '#111111',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });

      var copyBtn = modal.querySelector('#dn-qr-copy');
      copyBtn.addEventListener('click', function () {
        var orig = 'Copia link';
        (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
          .catch(function () {
            // fallback senza clipboard API
            var tmp = document.createElement('textarea');
            tmp.value = url;
            tmp.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(tmp);
            tmp.focus();
            tmp.select();
            document.execCommand('copy');
            tmp.remove();
          })
          .finally(function () {
            copyBtn.textContent = 'Copiato!';
            setTimeout(function () { copyBtn.textContent = orig; }, 1800);
          });
      });

      function close() { modal.remove(); }
      modal.querySelector('.dn-qr-close').addEventListener('click', close);
      modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
      modal.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
      modal.querySelector('.dn-qr-close').focus();
    });
  }

  // ── Modal: scan fotocamera ─────────────────────────────────────────────────
  function scanOpen() {
    if (document.getElementById('dn-qr-modal')) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('La fotocamera non è accessibile (richiede HTTPS o localhost).');
      return;
    }
    ensureLibs(function () {
      var modal = document.createElement('div');
      modal.id = 'dn-qr-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Scannerizza QR');
      modal.innerHTML =
        '<div class="dn-qr-box">' +
          '<button class="dn-qr-close" type="button" aria-label="Chiudi">×</button>' +
          '<h3>Scannerizza QR</h3>' +
          '<video id="dn-qr-video" playsinline muted></video>' +
          '<p id="dn-qr-scan-hint">Avvio fotocamera…</p>' +
        '</div>';
      document.body.appendChild(modal);

      var video  = modal.querySelector('#dn-qr-video');
      var hint   = modal.querySelector('#dn-qr-scan-hint');
      var canvas = document.createElement('canvas');
      var ctx    = canvas.getContext('2d');
      var stream = null;
      var rafId  = null;

      function stopAll() {
        if (rafId) cancelAnimationFrame(rafId);
        if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      }
      function closeModal() { stopAll(); modal.remove(); }

      modal.querySelector('.dn-qr-close').addEventListener('click', closeModal);
      modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
      modal.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

      navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
        .then(function (s) {
          stream = s;
          video.srcObject = s;
          video.play();
          hint.textContent = 'Inquadra il QR generato sull\'altro dispositivo…';

          function tick() {
            if (video.readyState < video.HAVE_ENOUGH_DATA) { rafId = requestAnimationFrame(tick); return; }
            canvas.width  = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'dontInvert' });
            if (code && code.data) {
              var m = code.data.match(/[?&]sync=([^&#]+)/);
              if (m) {
                stopAll();
                modal.remove();
                var obj = decode(m[1]);
                if (obj && confirm('Importare i dati dal QR?')) {
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
          hint.style.cssText = 'color:var(--link);font-size:.85rem;margin-top:.8rem';
        });
    });
  }

  // ── Esposizione pubblica ───────────────────────────────────────────────────
  window.dnQrOpen   = qrOpen;
  window.dnScanOpen = scanOpen;

  // ── Init: controlla ?sync= all'apertura ───────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkUrl);
  } else {
    checkUrl();
  }
})();
