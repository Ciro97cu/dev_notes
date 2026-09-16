/*
 * hub-civica.js — porta d'ingresso al vault privato civica dall'hub.
 *
 * L'hub è PUBBLICO: qui non c'è nessun segreto. L'iconcina lucchetto nel footer
 * apre un campo passphrase; la passphrase viene verificata DAVVERO contro
 * civica/crypto.json (deriva la chiave e decifra il verificatore). Se è giusta,
 * si salva la chiave derivata (NON la passphrase) in sessionStorage e si va
 * DIRITTI nel vault (civica/), che si apre già sbloccato. Nessuna card resta
 * nell'hub: tornando indietro non si vede nulla. Se la sessione è già sbloccata,
 * il lucchetto entra senza richiedere di nuovo la passphrase.
 */
(function () {
  'use strict';
  var lockBtn = document.getElementById('hub-civica-lock');
  if (!lockBtn) return;

  var enc = new TextEncoder(), dec = new TextDecoder();
  var SKEY = 'civica-key';   // chiave derivata (per la sessione) condivisa col vault
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

  function enterVault() { location.assign('civica/'); }
  function hasSession() { try { return !!sessionStorage.getItem(SKEY); } catch (e) { return false; } }

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

  async function submit(pass) {
    if (!pass) { showErr('Inserisci la passphrase.'); return; }
    showErr('verifico…');
    try {
      var meta = await (await fetch('civica/crypto.json', { cache: 'no-store' })).json();
      var key = await deriveKey(pass, meta);
      var ok = false;
      try { ok = (await decryptText(key, meta.check)) === 'civica-ok'; } catch (e) { ok = false; }
      if (!ok) { showErr('Passphrase errata.'); return; }
      // Salva la chiave (non la passphrase) in sessione: il vault si aprirà già sbloccato.
      try { sessionStorage.setItem(SKEY, b64(await crypto.subtle.exportKey('raw', key))); } catch (e) {}
      enterVault();
    } catch (e) {
      showErr('Vault non ancora inizializzato.');
    }
  }

  lockBtn.addEventListener('click', function () {
    if (hasSession()) { enterVault(); return; }   // già sbloccato in questa sessione: entra diretto
    openPop();
  });
})();
