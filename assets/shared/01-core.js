/*
 * Codice CONDIVISO da tutti i vault dell'hub — una sola fonte di verità.
 * Contiene l'anti-flash del tema e i plugin docsify riusabili (tema, mermaid,
 * callout collassabili, "Riprendi", puntini della cover). Quando qualcosa cambia
 * qui, cambia per tutti i vault.
 *
 * Ogni vault lo carica con <script src="../assets/shared.js"> PRIMA del proprio
 * assets/app.js (che definisce le parti specifiche: wikilink e window.$docsify).
 * La chiave di "Riprendi" è per-vault: il vault imposta window.__VAULT in app.js.
 */

// Anti-flash: imposta il tema il prima possibile, prima del render di docsify.
(function () {
  try {
    var saved = localStorage.getItem('dev-notes-theme');
    var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();

// ── Persistenza condivisa: NotesStore ────────────────────────────────────────
// Cache su localStorage (chiavi `dev-notes-<vault>-<nome>`, namespace via __VAULT)
// come store di lavoro, + Esporta/Importa di UN file JSON che l'utente possiede:
// sopravvive alla cancellazione dei dati del browser, portabile fra dispositivi.
// Nessun backend, nessun account, nessuna dipendenza. È la "fonte di verità" durevole.
window.NotesStore = (function () {
  var PREFIX = 'dev-notes-';
  function k(name) { return PREFIX + (window.__VAULT || 'hub') + '-' + name; }
  function read(name, fallback) {
    try { var r = localStorage.getItem(k(name)); return r == null ? fallback : JSON.parse(r); }
    catch (e) { return fallback; }
  }
  function write(name, val) {
    try { localStorage.setItem(k(name), JSON.stringify(val)); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('notesstore:change', { detail: { name: name } })); } catch (e) {}
  }
  // Fotografia di TUTTE le chiavi dev-notes-* (tutti i vault) per l'esportazione.
  function snapshot() {
    var out = {};
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(PREFIX) === 0) {
        try { out[key] = JSON.parse(localStorage.getItem(key)); }
        catch (e) { out[key] = localStorage.getItem(key); }
      }
    }
    return { app: 'dev-notes', version: 1, exportedAt: new Date().toISOString(), data: out };
  }
  function download() {
    var blob = new Blob([JSON.stringify(snapshot(), null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'dev-notes-dati.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function isArr(x) { return Object.prototype.toString.call(x) === '[object Array]'; }
  // Chiavi vietate: evitano il prototype pollution in fase di merge di dati importati.
  function unsafeKey(k) { return k === '__proto__' || k === 'constructor' || k === 'prototype'; }
  function mergeInto(key, incoming) {
    var cur; try { cur = JSON.parse(localStorage.getItem(key)); } catch (e) { cur = null; }
    var val = incoming;
    if (isArr(cur) && isArr(incoming)) {                 // array → unione senza duplicati
      var seen = {}, out = [];
      cur.concat(incoming).forEach(function (x) {
        var s = (x && typeof x === 'object') ? JSON.stringify(x) : String(x);
        if (!seen[s]) { seen[s] = 1; out.push(x); }
      });
      val = out;
    } else if (cur && incoming && typeof cur === 'object' && typeof incoming === 'object') {
      val = cur;
      Object.keys(incoming).forEach(function (kk) { if (!unsafeKey(kk)) val[kk] = incoming[kk]; });  // oggetto → shallow-merge
    }
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  // Importa SOLO chiavi `dev-notes-*` (niente scritture arbitrarie), validando i tipi.
  function importObj(obj, mode) {           // mode: 'merge' | 'replace'
    if (!obj || typeof obj !== 'object' || !obj.data || typeof obj.data !== 'object') throw new Error('file non valido');
    Object.keys(obj.data).forEach(function (key) {
      if (typeof key !== 'string' || key.indexOf(PREFIX) !== 0 || unsafeKey(key)) return;
      if (mode === 'merge') mergeInto(key, obj.data[key]);
      else { try { localStorage.setItem(key, JSON.stringify(obj.data[key])); } catch (e) {} }
    });
  }
  function importFile(file, mode, done) {
    if (!file) { done && done(new Error('nessun file')); return; }
    if (file.size > 8 * 1024 * 1024) { done && done(new Error('file troppo grande (max 8 MB)')); return; }
    var r = new FileReader();
    r.onload = function () {
      try { importObj(JSON.parse(r.result), mode); done && done(null); }
      catch (e) { done && done(e); }
    };
    r.onerror = function () { done && done(new Error('lettura fallita')); };
    r.readAsText(file);
  }
  return { read: read, write: write, snapshot: snapshot, download: download, importFile: importFile, keyFor: k };
})();

// Chiude i popover dei pulsanti fissi (dati/preferiti/evidenziatore) tranne `keep`,
// così aprendone uno gli altri non restano aperti in sovrapposizione.
function dnCloseAllPops(keep) {
  [['.dn-fav-list', '#dn-fav-btn'], ['.dn-hl-pop', '#dn-hl-btn']].forEach(function (pair) {
    var pop = document.querySelector(pair[0]);
    if (pop && pop !== keep && pop.classList.contains('open')) {
      pop.classList.remove('open');
      var b = document.querySelector(pair[1]); if (b) b.setAttribute('aria-expanded', 'false');
    }
  });
}
