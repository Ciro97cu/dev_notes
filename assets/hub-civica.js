/*
 * hub-civica.js — mostra/nasconde nell'hub la card del vault privato civica.
 *
 * L'hub è PUBBLICO: qui non c'è nessun segreto. L'iconcina lucchetto nel footer
 * apre un campo passphrase; la passphrase viene verificata DAVVERO contro
 * civica/crypto.json (deriva la chiave e decifra il verificatore), non con un
 * finto controllo. Se è giusta compare la card che punta a civica/ (che è a sua
 * volta cifrato); lo stesso lucchetto la rimuove. La passphrase non viene
 * memorizzata: nel vault va reinserita. Ricaricando l'hub, la card sparisce.
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

  var pop = null, cardEls = null, revealed = false;

  function closePop() { if (pop) { pop.remove(); pop = null; } lockBtn.setAttribute('aria-expanded', 'false'); }

  function openPop() {
    if (pop) { closePop(); return; }
    if (!(window.crypto && crypto.subtle)) { alert('Apri l’hub su https:// o http://localhost per l’area privata.'); return; }
    pop = document.createElement('div');
    pop.className = 'cvh-pop';
    pop.innerHTML =
      '<div class="cvh-row"><input id="cvh-pass" type="password" autocomplete="off" spellcheck="false" placeholder="passphrase"><button id="cvh-go" type="button">Apri</button></div>' +
      '<div class="cvh-err" id="cvh-err"></div>';
    document.body.appendChild(pop);
    lockBtn.setAttribute('aria-expanded', 'true');
    var input = pop.querySelector('#cvh-pass');
    var go = function () { submit(input.value); };
    pop.querySelector('#cvh-go').addEventListener('click', go);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); else if (e.key === 'Escape') closePop(); });
    input.focus();
  }

  function showErr(m) { var e = pop && pop.querySelector('#cvh-err'); if (e) e.textContent = m || ''; }

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
      revealCard();
      closePop();
    } catch (e) {
      showErr('Vault non ancora inizializzato.');
    }
  }

  function revealCard() {
    var grid = document.querySelector('main.grid');
    if (!grid || revealed) { revealed = true; lockBtn.classList.add('on'); return; }
    var h = document.createElement('h2');
    h.className = 'group-h';
    h.textContent = 'Privato';
    var a = document.createElement('a');
    a.className = 'card';
    a.href = 'civica/';
    a.setAttribute('style', '--accent:#1c7d70');
    a.innerHTML =
      '<span class="tile" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M12 3 3 8h18z"/><path d="M5 8v9"/><path d="M10 8v9"/><path d="M14 8v9"/><path d="M19 8v9"/></svg></span>' +
      '<span class="body"><span class="title">civica</span><span class="desc">Educazione civica: fisco, Stato e attualità. Privato e cifrato.</span></span>';
    grid.appendChild(h);
    grid.appendChild(a);
    cardEls = [h, a];
    revealed = true;
    lockBtn.classList.add('on');
    a.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function hideCard() {
    if (cardEls) { cardEls.forEach(function (el) { el.remove(); }); cardEls = null; }
    revealed = false;
    lockBtn.classList.remove('on');
    try { sessionStorage.removeItem(SKEY); } catch (e) {}   // ri-blocca anche il vault
  }

  lockBtn.addEventListener('click', function () {
    if (revealed) { hideCard(); return; }
    openPop();
  });

  // Se la sessione è già sbloccata (hub → vault → ritorno all'hub), mostra la card.
  try { if (sessionStorage.getItem(SKEY)) revealCard(); } catch (e) {}
})();
