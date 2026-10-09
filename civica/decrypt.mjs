#!/usr/bin/env node
/*
 * decrypt.mjs — operazione inversa di encrypt.mjs per un vault privato (docsify cifrato).
 *
 * Ricostruisce <vault>/_plain/**.md decifrando <vault>/content.enc con la passphrase del vault.
 * Serve quando il testo in chiaro non è su questo computer (nuova macchina, cartella persa):
 * dopo, si modifica _plain/ e si ri-cifra con encrypt.mjs come sempre.
 *
 * Uso:   node civica/decrypt.mjs        (stesso file in inglese/: il vault è la cartella dello script)
 * Se _plain/ esiste già e non è vuota si ferma, per non sovrascrivere modifiche più recenti:
 * aggiungere --force per sovrascrivere comunque.
 * La passphrase non viene salvata; senza terminale interattivo: <VAULT>_PASSPHRASE (es. CIVICA_PASSPHRASE).
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename, normalize, isAbsolute, sep } from 'node:path';
import { webcrypto as wc } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const VAULT = basename(HERE);
const OK = VAULT + '-ok';
const PLAIN = join(HERE, '_plain');
const CONTENT = join(HERE, 'content.enc');
const CRYPTO = join(HERE, 'crypto.json');
const FORCE = process.argv.includes('--force');

const enc = new TextEncoder(), dec = new TextDecoder();
const unb64 = (s) => new Uint8Array(Buffer.from(s, 'base64'));
async function deriveKey(passphrase, meta) {
  const base = await wc.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return wc.subtle.deriveKey({ name: 'PBKDF2', salt: unb64(meta.salt), iterations: meta.iterations, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
}
async function decryptText(key, blobStr) {
  const { iv, ct } = JSON.parse(blobStr);
  return dec.decode(await wc.subtle.decrypt({ name: 'AES-GCM', iv: unb64(iv) }, key, unb64(ct)));
}

function askPassphrase() {
  const env = process.env[VAULT.toUpperCase() + '_PASSPHRASE'];
  if (env) return Promise.resolve(env);
  const input = process.stdin;
  if (!input.isTTY) {
    console.error(`Nessun terminale interattivo: eseguire in un terminale vero, oppure ${VAULT.toUpperCase()}_PASSPHRASE="…" node ${VAULT}/decrypt.mjs`);
    process.exit(1);
  }
  return new Promise((resolve) => {
    process.stdout.write(`Passphrase del vault ${VAULT} (non compare a schermo): `);
    input.setRawMode(true); input.resume(); input.setEncoding('utf8');
    let buf = '';
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n' || ch === '\u0004') {
          input.setRawMode(false); input.pause(); input.removeListener('data', onData);
          process.stdout.write('\n'); resolve(buf); return;
        }
        if (ch === '\u0003') { input.setRawMode(false); process.stdout.write('\n'); process.exit(1); }
        if (ch === '\u007f' || ch === '\b') { buf = buf.slice(0, -1); continue; }
        if (ch >= ' ') buf += ch;
      }
    };
    input.on('data', onData);
  });
}

async function main() {
  if (!existsSync(CONTENT) || !existsSync(CRYPTO)) { console.error(`Mancano ${VAULT}/content.enc o ${VAULT}/crypto.json: niente da decifrare.`); process.exit(1); }
  if (existsSync(PLAIN) && (await readdir(PLAIN)).length && !FORCE) {
    console.error(`${VAULT}/_plain/ esiste già e non è vuota: interrompo per non sovrascrivere modifiche più recenti (usa --force per sovrascrivere).`);
    process.exit(1);
  }
  const meta = JSON.parse(await readFile(CRYPTO, 'utf8'));
  const passphrase = (await askPassphrase()).trim();
  const key = await deriveKey(passphrase, meta);
  let ok = false;
  try { ok = (await decryptText(key, meta.check)) === OK; } catch { ok = false; }
  if (!ok) { console.error('Passphrase errata.'); process.exit(1); }

  const map = JSON.parse(await decryptText(key, await readFile(CONTENT, 'utf8')));
  const paths = Object.keys(map).sort();
  for (const p of paths) {
    const rel = normalize(p);
    if (isAbsolute(rel) || rel.split(sep).includes('..')) { console.error('Percorso non valido nel contenuto cifrato: ' + p); process.exit(1); }
    const dest = join(PLAIN, rel);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, map[p]);
  }
  console.log(`Ricostruite ${paths.length} pagine in ${VAULT}/_plain/ (esclusa da git):`);
  for (const p of paths) console.log('  · ' + p);
  console.log(`Dopo le modifiche: node ${VAULT}/encrypt.mjs per ri-cifrare.`);
}
main().catch((e) => { console.error(e); process.exit(1); });
