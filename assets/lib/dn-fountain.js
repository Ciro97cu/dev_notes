// dn-fountain.js — trasferimento dati via QR animato (fountain codes / Luby Transform).
//
// Perché: un file (progressi + preferiti + evidenziazioni di tutti i vault) supera di
// gran lunga la capacità di un singolo QR. Lo si spezza in K blocchi e si genera uno
// stream INFINITO di frame, ognuno XOR di un sottoinsieme casuale di blocchi (LT code).
// Il ricevente cattura frame in ORDINE QUALSIASI finché non ne ha ~K·(1+ε): un frame
// perso non costringe a ricominciare il ciclo, si aspetta semplicemente il successivo.
//
// Ogni frame è testo ASCII (header + payload base64) così passa integro attraverso
// QRCode(text) e jsQR().data senza problemi di codifica binaria.
// Formato frame:  DNF1|<seed>|<K>|<chunkSize>|<totalLen>|<base64(payload)>
//
// Riferimenti alla tecnica: fountain codes / Luby Transform; standard BC-UR dei wallet
// hardware, progetto txqr. Distribuzione dei gradi: Robust Soliton.
//
// Funziona sia nel browser (window.DnFountain) sia in Node (module.exports) → testabile.
(function (root) {
  'use strict';

  // Limiti anti-DoS: un QR malevolo/corrotto (header con numeri enormi) non deve poter
  // far allocare array/buffer giganti. Valori larghi rispetto all'uso reale (K~500,
  // chunk 300, total ~180 KB): un payload legittimo non li avvicina nemmeno.
  var MAX_K = 20000, MAX_CHUNK = 8192, MAX_TOTAL = 4 * 1024 * 1024;

  // ── base64 (Uint8Array ⇄ ASCII) ─────────────────────────────────────────
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var B64INV = (function () { var m = {}; for (var i = 0; i < B64.length; i++) m[B64.charAt(i)] = i; return m; })();

  function b64encode(bytes) {
    var out = '', i;
    for (i = 0; i + 2 < bytes.length; i += 3) {
      var n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
      out += B64.charAt((n >> 18) & 63) + B64.charAt((n >> 12) & 63) + B64.charAt((n >> 6) & 63) + B64.charAt(n & 63);
    }
    var rem = bytes.length - i;
    if (rem === 1) {
      var a = bytes[i] << 16;
      out += B64.charAt((a >> 18) & 63) + B64.charAt((a >> 12) & 63) + '==';
    } else if (rem === 2) {
      var b = (bytes[i] << 16) | (bytes[i + 1] << 8);
      out += B64.charAt((b >> 18) & 63) + B64.charAt((b >> 12) & 63) + B64.charAt((b >> 6) & 63) + '=';
    }
    return out;
  }

  function b64decode(str) {
    var clean = str.replace(/[^A-Za-z0-9+/]/g, '');   // via il padding '=' e ogni rumore
    var full = Math.floor(clean.length / 4);
    var tail = clean.length - full * 4;                // 0, 2 o 3 (mai 1)
    var len = full * 3 + (tail === 2 ? 1 : tail === 3 ? 2 : 0);
    var out = new Uint8Array(len), o = 0, i;
    for (i = 0; i + 3 < clean.length; i += 4) {
      var n = (B64INV[clean.charAt(i)] << 18) | (B64INV[clean.charAt(i + 1)] << 12) |
              (B64INV[clean.charAt(i + 2)] << 6) | B64INV[clean.charAt(i + 3)];
      out[o++] = (n >> 16) & 255;
      out[o++] = (n >> 8) & 255;
      out[o++] = n & 255;
    }
    if (tail === 2) {
      var a = (B64INV[clean.charAt(i)] << 18) | (B64INV[clean.charAt(i + 1)] << 12);
      out[o++] = (a >> 16) & 255;
    } else if (tail === 3) {
      var b = (B64INV[clean.charAt(i)] << 18) | (B64INV[clean.charAt(i + 1)] << 12) | (B64INV[clean.charAt(i + 2)] << 6);
      out[o++] = (b >> 16) & 255;
      out[o++] = (b >> 8) & 255;
    }
    return out;
  }

  // ── PRNG deterministico (mulberry32): stesso seed ⇒ stessa sequenza sui due lati ──
  function prng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ── Distribuzione Robust Soliton: CDF sui gradi 1..K, campionata con un uniforme ──
  function buildSoliton(K) {
    var c = 0.03, delta = 0.5;
    var R = c * Math.log(K / delta) * Math.sqrt(K);
    var rho = new Array(K + 1), tau = new Array(K + 1), d;
    rho[1] = 1 / K;
    for (d = 2; d <= K; d++) rho[d] = 1 / (d * (d - 1));
    var pivot = Math.round(K / R);
    for (d = 1; d <= K; d++) {
      if (d < pivot) tau[d] = R / (d * K);
      else if (d === pivot) tau[d] = R * Math.log(R / delta) / K;
      else tau[d] = 0;
    }
    var Z = 0;
    for (d = 1; d <= K; d++) Z += rho[d] + tau[d];
    var cdf = new Array(K + 1), acc = 0;
    for (d = 1; d <= K; d++) { acc += (rho[d] + tau[d]) / Z; cdf[d] = acc; }
    return function (u) {
      for (var i = 1; i <= K; i++) if (u <= cdf[i]) return i;
      return K;
    };
  }

  // Sceglie `degree` indici distinti in [0,K) (Fisher-Yates parziale, deterministico).
  function pickIndices(rng, K, degree) {
    degree = Math.min(degree, K);
    var arr = new Array(K), i;
    for (i = 0; i < K; i++) arr[i] = i;
    for (i = 0; i < degree; i++) {
      var j = i + Math.floor(rng() * (K - i));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr.slice(0, degree);
  }

  function xorInto(dst, src) { for (var i = 0; i < dst.length; i++) dst[i] ^= src[i]; }

  // Da seed → (grado, indici): identico su encoder e decoder.
  function frameSpec(seed, K, soliton) {
    var rng = prng(seed);
    var degree = soliton(rng());
    return pickIndices(rng, K, degree);
  }

  // ── Encoder ──────────────────────────────────────────────────────────────
  function createEncoder(bytes, chunkSize) {
    chunkSize = chunkSize || 500;
    var total = bytes.length;
    var K = Math.max(1, Math.ceil(total / chunkSize));
    var chunks = new Array(K), i, j;
    for (i = 0; i < K; i++) {
      var c = new Uint8Array(chunkSize);
      for (j = 0; j < chunkSize; j++) { var p = i * chunkSize + j; c[j] = p < total ? bytes[p] : 0; }
      chunks[i] = c;
    }
    var soliton = buildSoliton(K);
    var seq = 0;
    function next() {
      var seed = seq++;
      var idx = frameSpec(seed, K, soliton);
      var out = new Uint8Array(chunkSize);
      for (var k = 0; k < idx.length; k++) xorInto(out, chunks[idx[k]]);
      return 'DNF1|' + seed + '|' + K + '|' + chunkSize + '|' + total + '|' + b64encode(out);
    }
    return { next: next, K: K, total: total, chunkSize: chunkSize };
  }

  // ── Decoder (peeling / belief propagation) ────────────────────────────────
  function createDecoder() {
    var K = null, chunkSize = null, total = null, soliton = null;
    var solved = null, solvedCount = 0, eqs = [];

    function peel() {
      var progress = true;
      while (progress) {
        progress = false;
        for (var e = eqs.length - 1; e >= 0; e--) {
          var eq = eqs[e], del = [];
          eq.set.forEach(function (i) { if (solved[i]) { xorInto(eq.data, solved[i]); del.push(i); } });
          for (var d = 0; d < del.length; d++) eq.set.delete(del[d]);
          if (eq.set.size === 0) { eqs.splice(e, 1); }
          else if (eq.set.size === 1) {
            var idx; eq.set.forEach(function (i) { idx = i; });
            eqs.splice(e, 1);
            if (!solved[idx]) { solved[idx] = eq.data; solvedCount++; progress = true; }
          }
        }
      }
    }

    // Ritorna { ok, done, have, K }. Frame malformati o incoerenti → ignorati (ok:false).
    function addFrame(text) {
      if (typeof text !== 'string' || text.indexOf('DNF1|') !== 0)
        return { ok: false, done: solvedCount === K && K !== null, have: solvedCount, K: K };
      var parts = text.split('|');
      if (parts.length < 6) return { ok: false, done: false, have: solvedCount, K: K };
      var seed = parseInt(parts[1], 10), fK = parseInt(parts[2], 10),
          fCs = parseInt(parts[3], 10), fTot = parseInt(parts[4], 10);
      var payload = parts.slice(5).join('|');   // il base64 non contiene '|', ma per sicurezza
      if (!(fK > 0) || !(fCs > 0) || !(fTot >= 0)) return { ok: false, done: false, have: solvedCount, K: K };
      if (fK > MAX_K || fCs > MAX_CHUNK || fTot > MAX_TOTAL || fTot > fK * fCs)
        return { ok: false, done: false, have: solvedCount, K: K };   // fuori dai limiti o incoerente: ignora
      if (K === null) { K = fK; chunkSize = fCs; total = fTot; solved = new Array(K); soliton = buildSoliton(K); }
      else if (fK !== K || fCs !== chunkSize || fTot !== total) {
        return { ok: false, done: solvedCount === K, have: solvedCount, K: K };   // stream diverso: ignora
      }
      if (solvedCount === K) return { ok: false, done: true, have: solvedCount, K: K };
      var data = b64decode(payload);
      if (data.length !== chunkSize) return { ok: false, done: false, have: solvedCount, K: K };
      var idx = frameSpec(seed, K, soliton);
      eqs.push({ set: new Set(idx), data: data });
      peel();
      return { ok: true, done: solvedCount === K, have: solvedCount, K: K };
    }

    function result() {
      if (K === null || solvedCount !== K) return null;
      var out = new Uint8Array(total);
      for (var i = 0; i < K; i++) {
        var c = solved[i];
        for (var j = 0; j < chunkSize; j++) { var p = i * chunkSize + j; if (p < total) out[p] = c[j]; }
      }
      return out;
    }

    return {
      addFrame: addFrame,
      result: result,
      progress: function () { return { have: solvedCount, K: K }; }
    };
  }

  var api = { createEncoder: createEncoder, createDecoder: createDecoder, b64encode: b64encode, b64decode: b64decode };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.DnFountain = api;
})(typeof window !== 'undefined' ? window : this);
