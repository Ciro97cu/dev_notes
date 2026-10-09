#!/usr/bin/env node
/*
 * scripts/sync-setup.mjs — prepara la sincronizzazione personale via GitHub Gist (assets/shared/08-sync.js).
 *
 * Chiede: token GitHub (fine-grained, permesso account «Gists: Read and write» e nient'altro),
 * ID del gist segreto e una passphrase. Verifica token e gist su GitHub, poi scrive /sync.json:
 *   { v, salt, iterations, check, secret }
 * dove `check` e `secret` (token + ID gist) sono cifrati con AES-256-GCM e una chiave derivata dalla
 * passphrase (PBKDF2-SHA-256, 300k iterazioni) — stessi parametri di civica/encrypt.mjs e di 08-sync.js.
 * sync.json è pubblico ma illeggibile senza la passphrase; la passphrase non viene salvata da nessuna parte.
 *
 * Uso:   node scripts/sync-setup.mjs            (poi: git add sync.json && git commit, push, deploy)
 * Opzioni: --no-check   non contatta GitHub (solo per prove)
 *          --out=FILE   scrive altrove invece che in /sync.json
 * Senza terminale interattivo: SYNC_TOKEN, SYNC_GIST, SYNC_PASSPHRASE come variabili d'ambiente.
 *
 * Quando il token scade (o lo si revoca): crearne uno nuovo e rieseguire lo script.
 * La passphrase deve essere DIVERSA da quelle dei vault privati (il lucchetto dell'hub prova prima i vault).
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { webcrypto as wc } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OK = 'dev-notes-sync-ok';
const FILE = 'dev-notes-sync.json';
const args = process.argv.slice(2);
const NO_CHECK = args.includes('--no-check');
const OUT = resolve((args.find((a) => a.startsWith('--out=')) || '').slice(6) || join(ROOT, 'sync.json'));

const enc = new TextEncoder();
const b64 = (u8) => Buffer.from(u8).toString('base64');
async function deriveKey(passphrase, salt, iterations) {
  const base = await wc.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return wc.subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
}
async function encrypt(key, text) {
  const iv = wc.getRandomValues(new Uint8Array(12));
  const ct = await wc.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
  return JSON.stringify({ v: 1, iv: b64(iv), ct: b64(new Uint8Array(ct)) });
}

// Lettura da tastiera: visibile per l'ID del gist, muta per token e passphrase.
function ask(label, { hidden = false, env } = {}) {
  if (env && process.env[env]) return Promise.resolve(process.env[env]);
  const input = process.stdin;
  if (!input.isTTY) {
    console.error(`Nessun terminale interattivo: passare ${env} come variabile d'ambiente.`);
    process.exit(1);
  }
  return new Promise((done) => {
    process.stdout.write(label);
    input.setRawMode(true); input.resume(); input.setEncoding('utf8');
    let buf = '';
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n' || ch === '\u0004') {          // Invio / Ctrl-D
          input.setRawMode(false); input.pause(); input.removeListener('data', onData);
          process.stdout.write('\n'); done(buf.trim()); return;
        }
        if (ch === '\u0003') { input.setRawMode(false); process.stdout.write('\n'); process.exit(1); }   // Ctrl-C
        if (ch === '\u007f' || ch === '\b') { if (buf) { buf = buf.slice(0, -1); if (!hidden) process.stdout.write('\b \b'); } continue; }
        if (ch >= ' ') { buf += ch; if (!hidden) process.stdout.write(ch); }
      }
    };
    input.on('data', onData);
  });
}

async function github(method, gist, token, body) {
  const r = await fetch('https://api.github.com/gists/' + gist, {
    method,
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, json: await r.json().catch(() => ({})) };
}

async function main() {
  console.log('Sincronizzazione personale via GitHub Gist — configurazione\n');
  const token = await ask('Token GitHub (non compare a schermo): ', { hidden: true, env: 'SYNC_TOKEN' });
  const gistIn = await ask('ID del gist (o il suo URL): ', { env: 'SYNC_GIST' });
  const gist = gistIn.replace(/\/+$/, '').split('/').pop();
  if (!token || !/^[0-9a-f]{20,}$/i.test(gist)) { console.error('Token o ID del gist mancante/non valido.'); process.exit(1); }

  if (!NO_CHECK) {
    process.stdout.write('Verifico token e gist su GitHub… ');
    const g = await github('GET', gist, token);
    if (g.status !== 200) {
      console.error(`\nGitHub ha risposto ${g.status}: controllare l'ID del gist e che il token abbia il permesso «Gists».`);
      process.exit(1);
    }
    if (!g.json.files || !g.json.files[FILE]) {      // crea il file vuoto: verifica anche il permesso di scrittura
      const w = await github('PATCH', gist, token, { files: { [FILE]: { content: '{"v":1,"empty":true}' } } });
      if (w.status !== 200) { console.error(`\nScrittura sul gist rifiutata (${w.status}): al token serve «Gists: Read and write».`); process.exit(1); }
    }
    console.log('ok');
  }

  const pass = await ask('Passphrase per attivare la sync (non compare a schermo): ', { hidden: true, env: 'SYNC_PASSPHRASE' });
  const again = process.env.SYNC_PASSPHRASE ? pass : await ask('Ripeti la passphrase: ', { hidden: true });
  if (!pass || pass !== again) { console.error('Le passphrase non coincidono (o sono vuote).'); process.exit(1); }
  if (pass.length < 12) console.warn('Attenzione: sync.json è pubblico, conviene una passphrase lunga (almeno 12-16 caratteri).');

  const salt = wc.getRandomValues(new Uint8Array(16)), iterations = 300000;
  const key = await deriveKey(pass, salt, iterations);
  const out = { v: 1, salt: b64(salt), iterations, check: await encrypt(key, OK), secret: await encrypt(key, JSON.stringify({ token, gist })) };
  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(`\nScritto ${OUT}.\nPoi: git add sync.json && git commit, push e deploy; infine inserire la passphrase nel lucchetto dell'hub su ogni dispositivo.`);
}
main().catch((e) => { console.error(e); process.exit(1); });
