/*
 * civica/reader.js — lettore cifrato (solo browser, nessuna dipendenza).
 *
 * Cancello passphrase → deriva la chiave (PBKDF2-SHA-256) → scarica e decifra
 * l'elenco e le note (AES-256-GCM), tutto in locale. Senza la passphrase i file
 * scaricati restano illeggibili. Stessi parametri di encrypt.mjs.
 */
(function () {
  'use strict';
  var app = document.getElementById('app');
  var enc = new TextEncoder(), dec = new TextDecoder();
  var key = null, notes = [];

  function b64(buf) { var a = new Uint8Array(buf), s = ''; for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
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
  async function fetchText(url) { var r = await fetch(url, { cache: 'no-store' }); if (!r.ok) throw { status: r.status }; return r.text(); }
  async function fetchJson(url) { var r = await fetch(url, { cache: 'no-store' }); if (!r.ok) throw { status: r.status }; return r.json(); }

  // ── markdown minimale (headings, liste, tabelle, quote, code, inline, HTML grezzo) ──
  function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function inline(s) {
    return s
      .replace(/`([^`]+)`/g, function (_, c) { return '<code>' + c + '</code>'; })
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\s][^*]*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
  function mdToHtml(md) {
    var lines = md.replace(/\r\n/g, '\n').split('\n'), out = '', i = 0, N = lines.length;
    while (i < N) {
      var line = lines[i];
      if (/^```/.test(line)) {
        var code = ''; i++;
        while (i < N && !/^```/.test(lines[i])) { code += lines[i] + '\n'; i++; }
        i++; out += '<pre><code>' + escapeHtml(code.replace(/\n$/, '')) + '</code></pre>'; continue;
      }
      if (/^\s*</.test(line)) { out += line + '\n'; i++; continue; }
      if (/^\s*$/.test(line)) { i++; continue; }
      var h = line.match(/^(#{1,3})\s+(.+)$/);
      if (h) { var lvl = h[1].length; out += '<h' + lvl + '>' + inline(escapeHtml(h[2].trim())) + '</h' + lvl + '>'; i++; continue; }
      if (/^(-{3,}|\*{3,})\s*$/.test(line)) { out += '<hr>'; i++; continue; }
      if (/^>\s?/.test(line)) {
        var buf = [];
        while (i < N && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
        out += '<blockquote>' + mdToHtml(buf.join('\n')) + '</blockquote>'; continue;
      }
      if (/\|/.test(line) && i + 1 < N && /-/.test(lines[i + 1]) && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
        var parseRow = function (r) { return r.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(function (c) { return c.trim(); }); };
        var header = parseRow(line); i += 2; var rows = [];
        while (i < N && /\|/.test(lines[i]) && !/^\s*$/.test(lines[i])) { rows.push(parseRow(lines[i])); i++; }
        var t = '<table><thead><tr>' + header.map(function (c) { return '<th>' + inline(escapeHtml(c)) + '</th>'; }).join('') + '</tr></thead><tbody>';
        for (var r0 = 0; r0 < rows.length; r0++) t += '<tr>' + rows[r0].map(function (c) { return '<td>' + inline(escapeHtml(c)) + '</td>'; }).join('') + '</tr>';
        out += t + '</tbody></table>'; continue;
      }
      if (/^\s*[-*]\s+/.test(line)) {
        var uit = [];
        while (i < N && /^\s*[-*]\s+/.test(lines[i])) { uit.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++; }
        out += '<ul>' + uit.map(function (it) { return '<li>' + inline(escapeHtml(it)) + '</li>'; }).join('') + '</ul>'; continue;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        var oit = [];
        while (i < N && /^\s*\d+\.\s+/.test(lines[i])) { oit.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
        out += '<ol>' + oit.map(function (it) { return '<li>' + inline(escapeHtml(it)) + '</li>'; }).join('') + '</ol>'; continue;
      }
      var para = [line]; i++;
      while (i < N && !/^\s*$/.test(lines[i]) && !/^(#{1,3}\s|>\s?|```|\s*[-*]\s+|\s*\d+\.\s+|-{3,}|\s*<)/.test(lines[i])) { para.push(lines[i]); i++; }
      out += '<p>' + inline(escapeHtml(para.join(' '))) + '</p>';
    }
    return out;
  }

  // ── UI ──
  function renderLock(msg) {
    app.innerHTML = '<div class="cv-lock"><h1>Vault privato</h1>' +
      '<p>Inserisci la passphrase per sbloccare.</p>' +
      '<div class="cv-row"><input class="cv-input" id="cv-pass" type="password" autocomplete="off" placeholder="passphrase"><button class="cv-btn" id="cv-unlock">Sblocca</button></div>' +
      '<div class="cv-err" id="cv-err">' + (msg || '') + '</div></div>';
    var input = document.getElementById('cv-pass');
    var go = function () { tryUnlock(input.value); };
    document.getElementById('cv-unlock').addEventListener('click', go);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    input.focus();
  }

  async function tryUnlock(pass) {
    var errEl = document.getElementById('cv-err'); if (errEl) errEl.textContent = 'verifico…';
    try {
      var meta = await fetchJson('crypto.json');
      var k = await deriveKey(pass, meta);
      var ok = false;
      try { ok = (await decryptText(k, meta.check)) === 'civica-ok'; } catch (e) { ok = false; }
      if (!ok) { if (errEl) errEl.textContent = 'Passphrase errata.'; return; }
      key = k;
      notes = JSON.parse(await decryptText(key, await fetchText('index.enc')));
      renderList();
    } catch (e) {
      if (e && e.status === 404) { if (errEl) errEl.textContent = 'Vault non ancora inizializzato (esegui encrypt.mjs).'; }
      else { if (errEl) errEl.textContent = 'Errore nel caricamento.'; }
    }
  }

  function renderList() {
    var lis = notes.length
      ? notes.map(function (n) { return '<li><a href="#" data-id="' + n.id + '">' + escapeHtml(n.title) + '</a></li>'; }).join('')
      : '<li class="cv-empty" style="padding:.75rem .2rem">Nessuna nota ancora.</li>';
    app.innerHTML = '<div class="cv-head"><span class="cv-title">Vault privato</span><span class="cv-sub">' + notes.length + ' note</span></div><ul class="cv-list">' + lis + '</ul>';
    app.querySelectorAll('.cv-list a').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); openNote(a.getAttribute('data-id')); });
    });
  }

  async function openNote(id) {
    try {
      var md = await decryptText(key, await fetchText('notes/' + id + '.enc'));
      app.innerHTML = '<button class="cv-back" id="cv-back">← Elenco</button><article class="cv-note"></article>';
      app.querySelector('.cv-note').innerHTML = mdToHtml(md);
      document.getElementById('cv-back').addEventListener('click', renderList);
      window.scrollTo(0, 0);
    } catch (e) { renderList(); }
  }

  renderLock();
})();
