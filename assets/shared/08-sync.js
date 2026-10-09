/*
 * 08-sync.js — sincronizzazione personale dei dati di studio fra dispositivi, via GitHub Gist.
 *
 * Spenta per chiunque visiti il sito: nessuna richiesta esterna, i dati restano in locale.
 * Si accende su un dispositivo inserendo la passphrase di sync nel lucchetto dell'hub
 * (hub-private.js chiama dnSync.tryActivate): la passphrase decifra /sync.json — pubblico ma
 * cifrato, creato con scripts/sync-setup.mjs — che contiene il token GitHub (permesso «Gists»
 * soltanto) e l'ID del gist. Sul dispositivo resta la chiave derivata, non la passphrase.
 *
 * Con la sync attiva: all'apertura di una pagina si scaricano i dati dal gist; ogni modifica
 * locale si invia pochi secondi dopo. Nel gist finisce solo testo cifrato (AES-256-GCM).
 * Revisione remota = updated_at del gist: se è cambiata e qui non c'è niente di nuovo, vince il
 * remoto; se sono cambiati entrambi, si uniscono (array per unione, oggetti chiave per chiave).
 *
 * Chiavi sincronizzate: dev-notes-* e <vault>-last-page, tranne il tema (scelta del dispositivo).
 */
(function () {
  'use strict';
  var KEYSTORE = 'dn-sync';                     // chiave AES derivata (b64): sync attiva qui
  var META = 'dn-sync-meta';                    // { fp, remoteAt }: ultimo stato allineato
  var FILE = 'dev-notes-sync.json';             // nome del file dentro il gist
  var OK = 'dev-notes-sync-ok';                 // verificatore della passphrase in sync.json
  var THEME = 'dev-notes-theme';
  var API = 'https://api.github.com/gists/';
  var _src = (document.currentScript && document.currentScript.src) || '';
  var ROOT = _src.replace(/assets\/shared\/08-sync\.js(\?.*)?$/, '');   // radice dell'hub

  // ── Dati locali ───────────────────────────────────────────────────────────
  function inScope(k) { return !!k && k !== THEME && (k.indexOf('dev-notes-') === 0 || /-last-page$/.test(k)); }
  function collect() {
    var keys = [], data = {};
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (inScope(k)) keys.push(k); } } catch (e) {}
    keys.sort().forEach(function (k) { var raw = localStorage.getItem(k); try { data[k] = JSON.parse(raw); } catch (e) { data[k] = raw; } });
    return data;
  }
  function fingerprint(data) {
    var s = JSON.stringify(Object.keys(data).sort().map(function (k) { return [k, data[k]]; }));
    var h = 2166136261;                                   // FNV-1a 32 bit
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16) + ':' + s.length;
  }
  // replace: le chiavi sincronizzate assenti in `data` vengono rimosse (le cancellazioni viaggiano).
  function apply(data, replace) {
    if (replace) {
      var rm = [];
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (inScope(k) && !(k in data)) rm.push(k); }
      rm.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
    }
    Object.keys(data).forEach(function (k) {
      if (!inScope(k) || k === '__proto__' || k === 'constructor' || k === 'prototype') return;
      try { localStorage.setItem(k, JSON.stringify(data[k])); } catch (e) {}
    });
  }
  function isArr(x) { return Object.prototype.toString.call(x) === '[object Array]'; }
  function union(a, b) {
    var seen = {}, out = [];
    a.concat(b).forEach(function (x) { var s = (x && typeof x === 'object') ? JSON.stringify(x) : String(x); if (!seen[s]) { seen[s] = 1; out.push(x); } });
    return out;
  }
  // Conflitto (modifiche su entrambi i lati): niente si perde, a costo di qualche cancellazione che "ritorna".
  function merge(local, remote) {
    var out = {};
    Object.keys(remote).forEach(function (k) { out[k] = remote[k]; });
    Object.keys(local).forEach(function (k) {
      var l = local[k], r = out[k];
      if (!(k in out)) out[k] = l;
      else if (isArr(l) && isArr(r)) out[k] = union(r, l);
      else if (l && r && typeof l === 'object' && typeof r === 'object') {
        var o = {};
        Object.keys(r).forEach(function (s) { o[s] = r[s]; });
        Object.keys(l).forEach(function (s) { o[s] = (isArr(l[s]) && isArr(r[s])) ? union(r[s], l[s]) : l[s]; });
        out[k] = o;
      } else out[k] = l;
    });
    return out;
  }
  function readMeta() { try { return JSON.parse(localStorage.getItem(META)) || {}; } catch (e) { return {}; } }
  function writeMeta(m) { try { localStorage.setItem(META, JSON.stringify(m)); } catch (e) {} }

  // ── Crittografia (stessi parametri di hub-private.js / encrypt.mjs) ──────
  var enc = new TextEncoder(), dec = new TextDecoder();
  function unb64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  function b64(buf) { var a = new Uint8Array(buf), s = ''; for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
  async function derive(pass, meta) {
    var bk = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: unb64(meta.salt), iterations: meta.iterations, hash: 'SHA-256' },
      bk, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  }
  async function decrypt(key, blob) {
    var o = JSON.parse(blob);
    return dec.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(o.iv) }, key, unb64(o.ct)));
  }
  async function encrypt(key, text) {
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(text));
    return JSON.stringify({ v: 1, iv: b64(iv), ct: b64(ct) });
  }
  async function loadConfig() {
    var r = await fetch(ROOT + 'sync.json', { cache: 'no-store' });
    if (!r.ok) throw new Error('sync.json non trovato (eseguire scripts/sync-setup.mjs)');
    return r.json();
  }

  // ── Credenziali e API del gist ───────────────────────────────────────────
  var creds = null;                                     // { key, token, gist } in memoria
  async function getCreds() {
    if (creds) return creds;
    var raw = localStorage.getItem(KEYSTORE);
    if (!raw) throw new Error('sync non attiva');
    var key = await crypto.subtle.importKey('raw', unb64(raw), 'AES-GCM', false, ['encrypt', 'decrypt']);
    var s = JSON.parse(await decrypt(key, (await loadConfig()).secret));
    creds = { key: key, token: s.token, gist: s.gist };
    return creds;
  }
  async function api(method, body, keepalive) {
    var c = await getCreds();
    var r = await fetch(API + c.gist, {
      method: method, cache: 'no-store', keepalive: !!keepalive,
      headers: { Authorization: 'Bearer ' + c.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (r.status === 401 || r.status === 403) throw new Error('token GitHub non valido o scaduto: rigeneralo ed esegui di nuovo scripts/sync-setup.mjs');
    if (!r.ok) throw new Error('GitHub ha risposto ' + r.status);
    return r.json();
  }
  async function pull() {
    var g = await api('GET'), f = g.files && g.files[FILE], c = await getCreds();
    if (!f || !f.content || f.content.indexOf('"ct"') < 0) return { at: g.updated_at, data: null };
    if (f.truncated) throw new Error('il file nel gist supera 1 MB');
    return { at: g.updated_at, data: JSON.parse(await decrypt(c.key, f.content)).data };
  }
  async function push(data, keepalive) {
    var c = await getCreds(), files = {};
    files[FILE] = { content: await encrypt(c.key, JSON.stringify({ v: 1, savedAt: new Date().toISOString(), data: data })) };
    return (await api('PATCH', { files: files }, keepalive)).updated_at;
  }

  // ── Ciclo di sincronizzazione ────────────────────────────────────────────
  var running = null;
  // Ritorna true se i dati locali sono stati aggiornati dal remoto (serve ricaricare la pagina).
  function sync() {
    if (running) return running;
    running = (async function () {
      var data = collect(), fp = fingerprint(data), meta = readMeta(), changed = false;
      var remote = await pull();
      // Più recente solo se il timestamp è davvero successivo: una lettura "vecchia" dell'API
      // (replica non ancora aggiornata) non deve mai sovrascrivere dati più nuovi.
      var newer = !!remote.data && (!meta.remoteAt || remote.at > meta.remoteAt);
      if (newer) {                                                   // un altro dispositivo ha scritto
        var next = (fp === meta.fp) ? remote.data : merge(data, remote.data);
        changed = fingerprint(next) !== fp;
        apply(next, true);
        var at = (next === remote.data) ? remote.at : await push(next);
        writeMeta({ fp: fingerprint(collect()), remoteAt: at });
      } else if (fp !== meta.fp || !remote.data) {                  // novità solo qui
        writeMeta({ fp: fp, remoteAt: await push(data) });
      }
      return changed;
    })();
    running.then(function () { running = null; }, function () { running = null; });
    return running;
  }

  // ── Avvisi ────────────────────────────────────────────────────────────────
  var toastEl = null, errShown = false;
  function toast(msg, action) {
    if (toastEl) toastEl.remove();
    toastEl = document.createElement('div');
    toastEl.setAttribute('role', 'status');
    toastEl.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483001;max-width:min(420px,calc(100vw - 32px));' +
      'padding:.6rem .9rem;border-radius:12px;font:13.5px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;gap:.7rem;align-items:center;' +
      'background:var(--panel,var(--bg,#fff));color:var(--fg,var(--text,#1f2328));border:1px solid rgba(127,127,127,.3);box-shadow:0 10px 30px rgba(0,0,0,.18)';
    var t = document.createElement('span'); t.textContent = msg; toastEl.appendChild(t);
    if (action) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = action.label;
      b.style.cssText = 'font:inherit;font-weight:600;cursor:pointer;border-radius:8px;padding:.3rem .65rem;background:transparent;' +
        'color:var(--link,var(--grad-a,#7c3aed));border:1px solid var(--link,var(--grad-a,#7c3aed))';
      b.addEventListener('click', action.run); toastEl.appendChild(b);
    }
    document.body.appendChild(toastEl);
    if (!action) setTimeout(function () { if (toastEl) { toastEl.remove(); toastEl = null; } }, 4500);
  }
  function fail(e) {
    if (!navigator.onLine) return;                         // offline: si riprova alla prossima modifica
    if (errShown) return;
    errShown = true;
    toast('Sync non riuscita: ' + (e && e.message || e));
  }

  // ── Avvio sulla pagina ───────────────────────────────────────────────────
  function enabled() { try { return !!localStorage.getItem(KEYSTORE); } catch (e) { return false; } }
  function reloadOnce() {
    var last = +sessionStorage.getItem('dn-sync-reload') || 0;
    if (Date.now() - last < 15000) return;                 // niente ricariche a catena
    sessionStorage.setItem('dn-sync-reload', String(Date.now()));
    location.reload();
  }
  function start() {
    if (!enabled() || !(window.crypto && crypto.subtle)) return;
    if (sessionStorage.getItem('dn-sync-welcome')) { sessionStorage.removeItem('dn-sync-welcome'); toast('Sincronizzazione attiva su questo dispositivo'); }
    sync().then(function (changed) { if (changed) reloadOnce(); }, fail);
    // Modifiche locali: controllo leggero ogni 5 s (impronta dei dati), invio solo se cambiate.
    setInterval(function () {
      if (document.visibilityState !== 'visible' || running) return;
      if (fingerprint(collect()) !== readMeta().fp) sync().then(function (ch) { if (ch) toast('Dati aggiornati da un altro dispositivo', { label: 'Ricarica', run: function () { location.reload(); } }); }, fail);
    }, 5000);
    // Tornando sulla scheda: recupera ciò che un altro dispositivo ha scritto nel frattempo.
    var hiddenAt = 0;
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
        var data = collect(), fp = fingerprint(data);
        if (fp !== readMeta().fp && creds) push(data, JSON.stringify(data).length < 50000).then(function (at) { writeMeta({ fp: fp, remoteAt: at }); }, function () {});
      } else if (Date.now() - hiddenAt > 30000) {
        sync().then(function (ch) { if (ch) toast('Dati aggiornati da un altro dispositivo', { label: 'Ricarica', run: function () { location.reload(); } }); }, fail);
      }
    });
  }

  // ── API per hub-private.js e per il menu Dati dell'hub ───────────────────
  window.dnSync = {
    enabled: enabled,
    // Prova la passphrase contro sync.json; se apre, attiva la sync su questo dispositivo.
    tryActivate: async function (pass) {
      var meta;
      try { meta = await loadConfig(); } catch (e) { return false; }
      var key = await derive(pass, meta), ok = false;
      try { ok = (await decrypt(key, meta.check)) === OK; } catch (e) { ok = false; }
      if (!ok) return false;
      localStorage.setItem(KEYSTORE, b64(await crypto.subtle.exportKey('raw', key)));
      localStorage.removeItem(META);                       // primo allineamento: unione locale + remoto
      creds = null;
      return true;
    },
    syncNow: function () {
      errShown = false;
      return sync().then(function (ch) { if (ch) reloadOnce(); else toast('Sincronizzazione completata'); }, fail);
    },
    disable: function () {
      try { localStorage.removeItem(KEYSTORE); localStorage.removeItem(META); } catch (e) {}
      creds = null;
      toast('Sincronizzazione disattivata su questo dispositivo');
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
