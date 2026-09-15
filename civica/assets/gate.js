/*
 * civica/assets/gate.js — cancello cifrato davanti a docsify.
 *
 * civica è un normale vault docsify (sidebar, ricerca, callout, strumenti di
 * studio), ma i suoi contenuti sul repo sono UN solo blob cifrato (content.enc).
 * Questo script:
 *   1. mostra il cancello e chiede la passphrase;
 *   2. deriva la chiave (PBKDF2-SHA-256) e decifra content.enc (AES-256-GCM)
 *      in una mappa { "percorso.md": markdown } tenuta SOLO in memoria;
 *   3. dirotta le richieste di docsify (XHR/fetch) verso quei contenuti decifrati
 *      tramite blob URL, così docsify e i suoi plugin funzionano senza modifiche;
 *   4. inietta il core docsify (prima i plugin, poi il core, poi Prism) e parte.
 *
 * Niente Service Worker: docsify è una SPA a hash, un solo contesto JS che
 * controlliamo per intero. La chiave non lascia mai questa pagina e non è
 * persistita; l'indice di ricerca (in chiaro in localStorage) viene ripulito
 * alla chiusura. Stessi parametri crittografici di encrypt.mjs.
 */
(function () {
  'use strict';
  var enc = new TextEncoder(), dec = new TextDecoder();
  var DIR = location.pathname.replace(/[^/]*$/, '');           // es. "/civica/"
  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  var realOpen = XMLHttpRequest.prototype.open;
  var MEM = null, blobCache = {};

  function unb64(str) { return Uint8Array.from(atob(str), function (c) { return c.charCodeAt(0); }); }

  async function deriveKey(pass, meta) {
    var baseKey = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: unb64(meta.salt), iterations: meta.iterations, hash: 'SHA-256' },
      baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    );
  }
  async function decryptText(k, blobStr) {
    var o = JSON.parse(blobStr);
    var pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(o.iv) }, k, unb64(o.ct));
    return dec.decode(pt);
  }

  // Percorso di una richiesta, relativo alla cartella del vault → chiave in MEM.
  function memKey(url) {
    try {
      var u = new URL(url, location.href);
      if (u.origin !== location.origin) return null;
      var p = u.pathname;
      if (p.indexOf(DIR) === 0) p = p.slice(DIR.length);
      return p.replace(/^\/+/, '');
    } catch (e) { return null; }
  }
  function hasMem(key) { return key && MEM && Object.prototype.hasOwnProperty.call(MEM, key); }
  function blobFor(key) {
    if (!blobCache[key]) blobCache[key] = URL.createObjectURL(new Blob([MEM[key]], { type: 'text/markdown' }));
    return blobCache[key];
  }

  // Dirotta le richieste dei contenuti verso i blob decifrati; il resto passa.
  function installShims() {
    XMLHttpRequest.prototype.open = function (method, url) {
      var key = (typeof url === 'string') ? memKey(url) : null;
      if (hasMem(key)) arguments[1] = blobFor(key);
      return realOpen.apply(this, arguments);
    };
    if (realFetch) {
      window.fetch = function (input, init) {
        var url = (typeof input === 'string') ? input : (input && input.url);
        var key = url ? memKey(url) : null;
        if (hasMem(key)) return Promise.resolve(new Response(MEM[key], { status: 200, headers: { 'Content-Type': 'text/markdown' } }));
        return realFetch(input, init);
      };
    }
  }

  // L'indice di ricerca di docsify finisce in chiaro in localStorage: lo togliamo
  // alla chiusura, così non resta traccia leggibile dei contenuti sul dispositivo.
  function wipeSearchOnUnload() {
    window.addEventListener('beforeunload', function () {
      try { localStorage.removeItem('docsify.search.index'); localStorage.removeItem('docsify.search.expires'); } catch (e) {}
    });
  }

  function boot() {
    document.getElementById('cv-gate').remove();
    var app = document.getElementById('app');
    app.style.display = '';
    // Prima i plugin (si registrano in $docsify.plugins), POI il core docsify,
    // POI le lingue Prism (che estendono il Prism incluso nel core).
    var scripts = [
      '../assets/vendor/docsify-search.min.js',
      '../assets/vendor/docsify-copy-code.min.js',
      '../assets/vendor/docsify-pagination.min.js',
      '../assets/vendor/docsify-flexible-alerts.min.js',
      '../assets/vendor/docsify.min.js',
      '../assets/vendor/prism-bash.min.js',
      '../assets/vendor/prism-json.min.js',
      '../assets/vendor/prism-markup.min.js'
    ];
    (function next(i) {
      if (i >= scripts.length) return;
      var s = document.createElement('script');
      s.src = scripts[i];
      s.onload = function () { next(i + 1); };
      s.onerror = function () { next(i + 1); };
      document.body.appendChild(s);
    })(0);
  }

  // ── Cancello ──
  var errEl, input;
  function showErr(msg) { if (errEl) errEl.textContent = msg || ''; }

  async function unlock() {
    var pass = input.value;
    if (!pass) { showErr('Inserisci la passphrase.'); return; }
    showErr('verifico…');
    try {
      var meta = await (await realFetch('crypto.json', { cache: 'no-store' })).json();
      var key = await deriveKey(pass, meta);
      var ok = false;
      try { ok = (await decryptText(key, meta.check)) === 'civica-ok'; } catch (e) { ok = false; }
      if (!ok) { showErr('Passphrase errata.'); return; }
      var blobStr = await (await realFetch('content.enc', { cache: 'no-store' })).text();
      MEM = JSON.parse(await decryptText(key, blobStr));
      installShims();
      wipeSearchOnUnload();
      boot();
    } catch (e) {
      if (e && (e.status === 404 || /content\.enc|crypto\.json/.test(String(e)))) showErr('Vault non ancora inizializzato (esegui encrypt.mjs).');
      else showErr('Errore nel caricamento.');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    input = document.getElementById('cv-pass');
    errEl = document.getElementById('cv-err');
    var btn = document.getElementById('cv-unlock');
    if (!realFetch) { showErr('Browser non supportato.'); return; }
    if (!(window.crypto && crypto.subtle)) { showErr('Apri il vault su http://localhost o https:// (la cifratura non funziona da file://).'); return; }
    btn.addEventListener('click', unlock);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') unlock(); });
    input.focus();
  });
})();
