/*
 * 07-backup.js — backup giornaliero dei dati di studio su file (hub + tutti i vault).
 *
 * I dati (progressi, preferiti, evidenziazioni, "Riprendi") vivono solo in localStorage,
 * che il browser può svuotare. Al primo caricamento del giorno, SE i dati sono cambiati
 * dall'ultimo backup, compare un avviso: [Salva backup] / [Non oggi].
 *
 * - Chrome/Edge (File System Access API): si sceglie UNA volta una cartella; ogni backup
 *   è un file NUOVO con data e ora nel nome (dev-notes-backup-AAAA-MM-GG-HHMM.json), così
 *   un salvataggio fatto dopo una perdita di dati non sovrascrive mai un backup buono.
 *   L'handle della cartella è conservato in IndexedDB.
 * - Altri browser: scarica lo stesso file nei Download.
 * - navigator.storage.persist(): chiede al browser di non sfrattare i dati da solo.
 *
 * Il formato è quello di "Esporta tutto su file…" dell'hub: si ripristina con "Importa da file…".
 * Standalone (non dipende da NotesStore), così lo caricano sia l'hub sia i vault.
 */
(function () {
  'use strict';
  var PREFIX = 'dev-notes-';
  var META = 'dn-backup-meta';                  // stato del backup: NON entra nel backup
  var THEME = 'dev-notes-theme';                // cambiare tema non è "lavoro" da salvare
  var DB = 'dn-backup', STORE = 'handles', HKEY = 'dir';
  var FS = typeof window.showDirectoryPicker === 'function';

  // Stesse chiavi dell'export dell'hub: dev-notes-* e le posizioni "Riprendi" (<vault>-last-page).
  function isOurKey(k) { return !!k && (k.indexOf(PREFIX) === 0 || /-last-page$/.test(k)); }
  function collect() {
    var keys = [], data = {};
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (isOurKey(k)) keys.push(k); } } catch (e) {}
    keys.sort().forEach(function (k) {
      var raw = localStorage.getItem(k);
      try { data[k] = JSON.parse(raw); } catch (e) { data[k] = raw; }
    });
    return data;
  }
  // Impronta dei dati "di lavoro" (tema escluso): serve solo a capire se qualcosa è cambiato.
  function fingerprint(data) {
    var s = JSON.stringify(Object.keys(data).filter(function (k) { return k !== THEME; }).map(function (k) { return [k, data[k]]; }));
    var h = 2166136261;                                   // FNV-1a 32 bit
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16) + ':' + s.length;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function stamp() { var d = new Date(); return today() + '-' + pad(d.getHours()) + pad(d.getMinutes()); }
  function readMeta() { try { return JSON.parse(localStorage.getItem(META)) || {}; } catch (e) { return {}; } }
  function writeMeta(m) { try { localStorage.setItem(META, JSON.stringify(m)); } catch (e) {} }
  function json(data) { return JSON.stringify({ app: 'dev-notes', version: 1, exportedAt: new Date().toISOString(), data: data }, null, 2); }

  // ── IndexedDB: conserva l'handle della cartella scelta ─────────────────────
  function idb(mode, fn) {
    return new Promise(function (res, rej) {
      var open = indexedDB.open(DB, 1);
      open.onupgradeneeded = function () { open.result.createObjectStore(STORE); };
      open.onerror = function () { rej(open.error); };
      open.onsuccess = function () {
        var tx = open.result.transaction(STORE, mode), req = fn(tx.objectStore(STORE));
        tx.oncomplete = function () { open.result.close(); res(req && req.result); };
        tx.onerror = function () { open.result.close(); rej(tx.error); };
      };
    });
  }
  function getDir() { return idb('readonly', function (s) { return s.get(HKEY); }).catch(function () { return null; }); }
  function putDir(h) { return idb('readwrite', function (s) { return s.put(h, HKEY); }).catch(function () {}); }

  var dir = null;                                         // precaricato: il click deve arrivare
                                                          // a requestPermission senza attese
  async function writeToDir(data, pick) {
    if (dir && !pick) {
      var p = await dir.queryPermission({ mode: 'readwrite' });
      if (p !== 'granted') p = await dir.requestPermission({ mode: 'readwrite' });
      if (p !== 'granted') pick = true;
    }
    if (!dir || pick) {
      dir = await window.showDirectoryPicker({ id: 'dev-notes-backup', mode: 'readwrite' });
      await putDir(dir);
    }
    var name = 'dev-notes-backup-' + stamp() + '.json';
    var fh = await dir.getFileHandle(name, { create: true });
    var w = await fh.createWritable();
    await w.write(json(data));
    await w.close();
    return dir.name + '/' + name;
  }
  function download(data) {
    var name = 'dev-notes-backup-' + stamp() + '.json';
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json(data)], { type: 'application/json' }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    return 'Download/' + name;
  }
  // Salva subito; pick=true forza la scelta di una nuova cartella. Ritorna il percorso salvato.
  async function saveNow(pick) {
    var data = collect();
    var where = FS ? await writeToDir(data, pick) : download(data);
    writeMeta({ lastPrompt: today(), fp: fingerprint(data), at: new Date().toISOString(), where: where });
    return where;
  }

  // ── Avviso ────────────────────────────────────────────────────────────────
  var CSS =
    '.dn-bk{position:fixed;left:16px;bottom:16px;z-index:2147483000;width:min(360px,calc(100vw - 32px));box-sizing:border-box;' +
      'padding:.85rem .95rem;border-radius:14px;font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;' +
      'background:var(--panel,var(--bg,#fff));color:var(--fg,var(--text,#1f2328));' +
      'border:1px solid color-mix(in srgb,var(--link,var(--grad-a,#7c3aed)) 35%,rgba(127,127,127,.25));' +
      'box-shadow:0 12px 34px rgba(0,0,0,.18);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);animation:dn-bk-in .2s ease}' +
    '@keyframes dn-bk-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
    '@media (prefers-reduced-motion:reduce){.dn-bk{animation:none}}' +
    '.dn-bk-t{margin:0 0 .2rem;font-weight:700}' +
    '.dn-bk-s{margin:0 0 .75rem;font-size:.86rem;color:var(--fg-soft,var(--text-soft,#59636e));overflow-wrap:anywhere}' +
    '.dn-bk-row{display:flex;flex-wrap:wrap;gap:.45rem;align-items:center}' +
    '.dn-bk-b{font:inherit;font-size:.86rem;font-weight:600;cursor:pointer;border-radius:9px;padding:.42rem .8rem;' +
      'border:1px solid rgba(127,127,127,.35);background:transparent;color:inherit}' +
    '.dn-bk-b.is-primary{color:var(--link,var(--grad-a,#7c3aed));border-color:var(--link,var(--grad-a,#7c3aed));' +
      'background:color-mix(in srgb,var(--link,var(--grad-a,#7c3aed)) 12%,transparent)}' +
    '.dn-bk-b:hover,.dn-bk-b:focus-visible{border-color:var(--link,var(--grad-a,#7c3aed));outline:none}' +
    '.dn-bk-l{margin-left:auto;font:inherit;font-size:.78rem;background:none;border:0;padding:0;cursor:pointer;' +
      'color:var(--fg-soft,var(--text-soft,#59636e));text-decoration:underline}';

  var box = null;
  function hide() { if (box) { box.remove(); box = null; } }
  function render(title, sub, buttons) {
    if (!document.getElementById('dn-bk-css')) {
      var st = document.createElement('style'); st.id = 'dn-bk-css'; st.textContent = CSS; document.head.appendChild(st);
    }
    hide();
    box = document.createElement('div');
    box.className = 'dn-bk'; box.setAttribute('role', 'status');
    var t = document.createElement('p'); t.className = 'dn-bk-t'; t.textContent = title; box.appendChild(t);
    var s = document.createElement('p'); s.className = 'dn-bk-s'; s.textContent = sub; box.appendChild(s);
    if (buttons.length) {
      var row = document.createElement('div'); row.className = 'dn-bk-row';
      buttons.forEach(function (b) {
        var el = document.createElement('button'); el.type = 'button';
        el.className = b.link ? 'dn-bk-l' : 'dn-bk-b' + (b.primary ? ' is-primary' : '');
        el.textContent = b.label; el.addEventListener('click', b.run); row.appendChild(el);
      });
      box.appendChild(row);
    }
    document.body.appendChild(box);
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }); } catch (e) { return ''; }
  }
  async function doSave(pick) {
    try {
      var where = await saveNow(pick);
      render('Backup salvato', where, []);
      setTimeout(hide, 4000);
    } catch (e) {
      if (e && e.name === 'AbortError') return;          // scelta della cartella annullata: l'avviso resta
      render('Backup non riuscito', String(e && e.message || e), [
        { label: 'Riprova', primary: true, run: function () { doSave(true); } },
        { label: 'Chiudi', run: hide }
      ]);
    }
  }
  function prompt(meta) {
    var last = meta.at ? 'Ultimo backup: ' + fmtDate(meta.at) + '.' : 'Non è ancora stato fatto nessun backup.';
    var buttons = [];
    if (FS && dir) {
      buttons.push({ label: 'Salva in «' + dir.name + '»', primary: true, run: function () { doSave(false); } });
    } else if (FS) {
      buttons.push({ label: 'Scegli cartella e salva…', primary: true, run: function () { doSave(true); } });
    } else {
      buttons.push({ label: 'Scarica backup', primary: true, run: function () { doSave(false); } });
    }
    buttons.push({ label: 'Non oggi', run: function () { var m = readMeta(); m.lastPrompt = today(); writeMeta(m); hide(); } });
    if (FS && dir) buttons.push({ label: 'cambia cartella', link: true, run: function () { doSave(true); } });
    render('Backup di oggi', 'I dati di studio sono cambiati dall’ultimo backup. ' + last, buttons);
  }

  async function init() {
    try { if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) navigator.storage.persist(); } catch (e) {}
    if (FS) dir = await getDir();
    var data = collect(), meta = readMeta();
    var work = Object.keys(data).filter(function (k) { return k !== THEME; });
    if (!work.length) return;                             // niente da salvare
    if (meta.lastPrompt === today()) return;              // già proposto oggi
    if (meta.fp === fingerprint(data)) return;            // nulla di nuovo dall'ultimo backup
    prompt(meta);
  }

  window.dnBackup = { saveNow: function () { return doSave(false); }, chooseFolder: function () { return doSave(true); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
