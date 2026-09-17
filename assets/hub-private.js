/*
 * hub-private.js — porta d'ingresso ai vault privati (civica, inglese, …) dall'hub.
 *
 * L'hub è PUBBLICO: qui non c'è nessun segreto. L'iconcina lucchetto nel footer
 * apre un campo passphrase; la passphrase viene provata DAVVERO contro ogni vault
 * nascosto (deriva la chiave e decifra il verificatore <vault>-ok). La password
 * SCEGLIE il vault: quella di civica apre civica, quella di inglese apre inglese
 * (per questo devono essere diverse). Al match si salva la chiave derivata (NON la
 * passphrase) in sessionStorage e si va DIRITTI nel vault, già sbloccato.
 *
 * L'hub è "terreno bloccato": a ogni caricamento le chiavi di sessione vengono
 * cancellate, così tornando all'hub i vault si ri-bloccano.
 */
(function () {
  'use strict';
  var VAULTS = ['civica', 'inglese'];   // cartelle dei vault nascosti

  function relock() { try { for (var i = 0; i < VAULTS.length; i++) sessionStorage.removeItem(VAULTS[i] + '-key'); } catch (e) {} }
  relock();
  window.addEventListener('pageshow', relock);   // anche al ritorno da bfcache

  var lockBtn = document.getElementById('hub-private-lock');
  if (!lockBtn) return;

  var enc = new TextEncoder(), dec = new TextDecoder();
  function unb64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  function b64(buf) { var a = new Uint8Array(buf), s = ''; for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
  async function deriveKey(pass, meta) {
    var bk = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: unb64(meta.salt), iterations: meta.iterations, hash: 'SHA-256' },
      bk, { name: 'AES-GCM', length: 256 }, true, ['decrypt']   // estraibile: la salviamo in sessione per l'auto-sblocco del vault
    );
  }
  async function decryptText(k, blobStr) {
    var o = JSON.parse(blobStr);
    var pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(o.iv) }, k, unb64(o.ct));
    return dec.decode(pt);
  }

  var pop = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } lockBtn.setAttribute('aria-expanded', 'false'); }
  function showErr(m) { var e = pop && pop.querySelector('#cvh-err'); if (e) e.textContent = m || ''; }

  function openPop() {
    if (pop) { closePop(); return; }
    if (!(window.crypto && crypto.subtle)) { alert('Apri l’hub su https:// o http://localhost per l’area privata.'); return; }
    pop = document.createElement('div');
    pop.className = 'cvh-pop';
    pop.innerHTML =
      '<div class="cvh-row"><input id="cvh-pass" type="password" autocomplete="off" spellcheck="false" placeholder="passphrase"><button id="cvh-go" type="button">Entra</button></div>' +
      '<div class="cvh-err" id="cvh-err"></div>';
    document.body.appendChild(pop);
    lockBtn.setAttribute('aria-expanded', 'true');
    var input = pop.querySelector('#cvh-pass');
    var go = function () { submit(input.value); };
    pop.querySelector('#cvh-go').addEventListener('click', go);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); else if (e.key === 'Escape') closePop(); });
    input.focus();
  }

  // Prova la password contro un vault: se apre, ritorna la chiave esportata (b64).
  async function tryVault(vault, pass) {
    var r = await fetch(vault + '/crypto.json', { cache: 'no-store' });
    if (!r.ok) return null;                       // vault non ancora inizializzato
    var meta = await r.json();
    var key = await deriveKey(pass, meta);
    var ok = false;
    try { ok = (await decryptText(key, meta.check)) === (vault + '-ok'); } catch (e) { ok = false; }
    if (!ok) return null;
    return b64(await crypto.subtle.exportKey('raw', key));
  }

  async function submit(pass) {
    if (!pass) { showErr('Inserisci la passphrase.'); return; }
    showErr('verifico…');
    for (var i = 0; i < VAULTS.length; i++) {
      var vault = VAULTS[i], keyB64 = null;
      try { keyB64 = await tryVault(vault, pass); } catch (e) { keyB64 = null; }
      if (keyB64) {
        try { sessionStorage.setItem(vault + '-key', keyB64); } catch (e) {}
        location.assign(vault + '/');            // la password ha scelto il vault
        return;
      }
    }
    showErr('Passphrase errata.');
  }

  lockBtn.addEventListener('click', openPop);
})();
