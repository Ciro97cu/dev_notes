/*
 * civica/encrypt.mjs — cifratore locale del vault privato (docsify cifrato).
 *
 * Legge TUTTO l'albero di contenuti IN CHIARO da  civica/_plain/**.md
 * (le pagine docsify: README.md, _sidebar.md, _coverpage.md, le note…) e lo
 * impacchetta in UN SOLO file cifrato:
 *   civica/content.enc      mappa { "percorso.md": "markdown…" } cifrata (AES-256-GCM)
 *   civica/crypto.json      salt + iterazioni + verificatore — pubblici, NON è la chiave
 *
 * Un unico blob cifrato ha un vantaggio di riservatezza: su GitHub non trapela
 * nemmeno QUANTE note ci sono né i loro nomi (a differenza di tanti file .enc).
 *
 * La PASSPHRASE non viene mai salvata: si digita a ogni esecuzione (oppure, per
 * automazione, via variabile d'ambiente CIVICA_PASSPHRASE). Il testo in chiaro
 * resta in _plain/ (gitignored): nel repo e su GitHub finisce solo content.enc,
 * illeggibile senza la passphrase.
 *
 * Uso:   node civica/encrypt.mjs      (poi: git add civica && git commit)
 *
 * Crittografia: AES-256-GCM, chiave derivata dalla passphrase con PBKDF2-SHA-256
 * (300k iterazioni) su un salt casuale. Stessi parametri del lettore nel browser
 * (assets/gate.js), così il blob è interoperabile.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep, basename } from 'node:path';
import { webcrypto as wc } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const VAULT = basename(HERE);          // nome del vault (cartella): civica, inglese…
const OK = VAULT + '-ok';              // verificatore per-vault (retro-compatibile con civica)
const PLAIN = join(HERE, '_plain');
const CRYPTO = join(HERE, 'crypto.json');
const CONTENT = join(HERE, 'content.enc');

const enc = new TextEncoder();
const dec = new TextDecoder();
const b64 = (buf) => Buffer.from(buf).toString('base64');
const unb64 = (s) => new Uint8Array(Buffer.from(s, 'base64'));

async function loadOrInitCrypto() {
  if (existsSync(CRYPTO)) return JSON.parse(await readFile(CRYPTO, 'utf8'));
  const salt = wc.getRandomValues(new Uint8Array(16));
  return { v: 1, salt: b64(salt), iterations: 300000 };
}

async function deriveKey(passphrase, meta) {
  const baseKey = await wc.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return wc.subtle.deriveKey(
    { name: 'PBKDF2', salt: unb64(meta.salt), iterations: meta.iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptText(key, text) {
  const iv = wc.getRandomValues(new Uint8Array(12));
  const ct = await wc.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
  return JSON.stringify({ v: 1, iv: b64(iv), ct: b64(new Uint8Array(ct)) });
}

async function decryptText(key, blobStr) {
  const { iv, ct } = JSON.parse(blobStr);
  const pt = await wc.subtle.decrypt({ name: 'AES-GCM', iv: unb64(iv) }, key, unb64(ct));
  return dec.decode(pt);
}

// Raccoglie ricorsivamente tutti i .md sotto _plain/, con chiave = percorso
// relativo in stile URL ("docs/iva.md"), che è ciò che docsify richiede.
async function collectMarkdown(dir) {
  const out = {};
  async function walk(d) {
    for (const ent of await readdir(d, { withFileTypes: true })) {
      const p = join(d, ent.name);
      if (ent.isDirectory()) { await walk(p); continue; }
      if (!ent.name.endsWith('.md')) continue;
      const key = relative(PLAIN, p).split(sep).join('/');
      out[key] = await readFile(p, 'utf8');
    }
  }
  await walk(dir);
  return out;
}

function askPassphrase() {
  if (process.env.CIVICA_PASSPHRASE) return Promise.resolve(process.env.CIVICA_PASSPHRASE);
  const input = process.stdin;
  if (!input.isTTY) {
    console.error('Nessun terminale interattivo per digitare la passphrase.');
    console.error('Eseguire lo script in un terminale vero, oppure passarla così:');
    console.error('  CIVICA_PASSPHRASE="la-tua-passphrase" node civica/encrypt.mjs');
    process.exit(1);
  }
  // Lettura muta carattere per carattere (raw mode): niente dipendenza dagli
  // interni di readline, che in alcuni terminali non raccoglievano l'input.
  return new Promise((resolve) => {
    process.stdout.write('Passphrase (digitala, non compare a schermo): ');
    input.setRawMode(true);
    input.resume();
    input.setEncoding('utf8');
    let buf = '';
    const done = (value) => {
      input.setRawMode(false);
      input.pause();
      input.removeListener('data', onData);
      process.stdout.write('\n');
      resolve(value);
    };
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n' || ch === '') { done(buf); return; } // Invio / Ctrl-D
        if (ch === '') { input.setRawMode(false); process.stdout.write('\n'); process.exit(1); } // Ctrl-C
        if (ch === '' || ch === '\b') { buf = buf.slice(0, -1); continue; } // backspace
        if (ch >= ' ') buf += ch; // ignora le altre sequenze di controllo (frecce ecc.)
      }
    };
    input.on('data', onData);
  });
}

async function main() {
  if (!existsSync(PLAIN)) {
    console.error('Manca civica/_plain/ con le pagine in chiaro (*.md).');
    process.exit(1);
  }
  const meta = await loadOrInitCrypto();
  const passphrase = (await askPassphrase()).trim();
  if (!passphrase) { console.error('Passphrase vuota: interrompo.'); process.exit(1); }

  const key = await deriveKey(passphrase, meta);

  // Verificatore: impedisce di ri-cifrare tutto con una passphrase diversa per errore.
  if (meta.check) {
    let ok = false;
    try { ok = (await decryptText(key, meta.check)) === OK; } catch { ok = false; }
    if (!ok) {
      console.error('Passphrase diversa da quella usata finora: interrompo per non rendere le note irrecuperabili.');
      process.exit(1);
    }
  } else {
    meta.check = await encryptText(key, OK);
  }
  await writeFile(CRYPTO, JSON.stringify(meta, null, 2) + '\n');

  const map = await collectMarkdown(PLAIN);
  const paths = Object.keys(map).sort();
  if (!paths.length) { console.error('Nessun .md in _plain/: interrompo.'); process.exit(1); }
  await writeFile(CONTENT, await encryptText(key, JSON.stringify(map)));
  console.log(`Cifrate ${paths.length} pagine in content.enc:`);
  for (const p of paths) console.log('  · ' + p);
  console.log('Ora:  git add ' + VAULT + ' && git commit -m "' + VAULT + ': aggiorna note (cifrate)"  (il chiaro resta in _plain/, escluso da git).');
}

main().catch((e) => { console.error(e); process.exit(1); });
