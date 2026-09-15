/*
 * civica/encrypt.mjs — cifratore locale del vault privato.
 *
 * Legge le note IN CHIARO da  civica/_plain/*.md  e le cifra in
 *   civica/notes/<id>.enc   (una nota cifrata per file, id opaco)
 *   civica/index.enc        (elenco cifrato dei titoli)
 *   civica/crypto.json      (salt + iterazioni + verificatore — pubblici, NON è la chiave)
 *
 * La PASSPHRASE non viene mai salvata: si digita a ogni esecuzione
 * (oppure, per automazione, via variabile d'ambiente CIVICA_PASSPHRASE).
 * Il testo in chiaro resta in _plain/ (gitignored): nel repo e su GitHub
 * finiscono soltanto i .enc, illeggibili senza la passphrase.
 *
 * Uso:   node civica/encrypt.mjs      (poi: git add civica && git commit)
 *
 * Crittografia: AES-256-GCM, chiave derivata dalla passphrase con
 * PBKDF2-SHA-256 (300k iterazioni) su un salt casuale. Stessi parametri
 * del lettore nel browser (reader.js), così i .enc sono interoperabili.
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';
import { createInterface } from 'node:readline';
import { webcrypto as wc } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const PLAIN = join(HERE, '_plain');
const NOTES = join(HERE, 'notes');
const CRYPTO = join(HERE, 'crypto.json');
const INDEX = join(HERE, 'index.enc');

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

async function sha256hex(s) {
  const h = await wc.subtle.digest('SHA-256', enc.encode(s));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function askPassphrase() {
  if (process.env.CIVICA_PASSPHRASE) return Promise.resolve(process.env.CIVICA_PASSPHRASE);
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = () => {}; // input muto: la passphrase non compare a schermo
    process.stdout.write('Passphrase: ');
    rl.question('', (ans) => { rl.close(); process.stdout.write('\n'); resolve(ans); });
  });
}

async function main() {
  if (!existsSync(PLAIN)) {
    console.error('Manca civica/_plain/ con le note in chiaro (*.md).');
    process.exit(1);
  }
  const meta = await loadOrInitCrypto();
  const passphrase = (await askPassphrase()).trim();
  if (!passphrase) { console.error('Passphrase vuota: interrompo.'); process.exit(1); }

  const key = await deriveKey(passphrase, meta);

  // Verificatore: impedisce di ri-cifrare tutto con una passphrase diversa per errore.
  if (meta.check) {
    let ok = false;
    try { ok = (await decryptText(key, meta.check)) === 'civica-ok'; } catch { ok = false; }
    if (!ok) {
      console.error('Passphrase diversa da quella usata finora: interrompo per non rendere le note irrecuperabili.');
      process.exit(1);
    }
  } else {
    meta.check = await encryptText(key, 'civica-ok');
  }
  await writeFile(CRYPTO, JSON.stringify(meta, null, 2) + '\n');

  await mkdir(NOTES, { recursive: true });
  const files = (await readdir(PLAIN)).filter((f) => f.endsWith('.md')).sort();
  const index = [];
  for (const f of files) {
    const text = await readFile(join(PLAIN, f), 'utf8');
    const m = text.match(/^#\s+(.+)$/m);
    const title = m ? m[1].trim() : basename(f, '.md');
    const id = (await sha256hex(f)).slice(0, 16);
    await writeFile(join(NOTES, id + '.enc'), await encryptText(key, text));
    index.push({ id, title });
  }
  await writeFile(INDEX, await encryptText(key, JSON.stringify(index)));
  console.log(`Cifrate ${files.length} note.`);
  console.log('Ora:  git add civica && git commit -m "civica: aggiorna note (cifrate)"  (il chiaro resta in _plain/, escluso da git).');
}

main().catch((e) => { console.error(e); process.exit(1); });
