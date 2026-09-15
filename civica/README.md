# Vault privato (cifrato)

Vault personale **cifrato lato client**: le note in chiaro non finiscono mai nel repository. Nel commit e su GitHub ci sono solo file **illeggibili senza la passphrase**; il testo in chiaro vive in `_plain/` (escluso da git) e viene decifrato **solo nel browser**, dopo aver inserito la passphrase, dal lettore in [`index.html`](index.html).

## Come funziona

- `_plain/*.md` — le note in **chiaro** (gitignored: restano solo sul tuo computer).
- `encrypt.mjs` — cifra `_plain/` in `notes/*.enc` + `index.enc` (AES-256-GCM, chiave da passphrase via PBKDF2). Da eseguire in locale.
- `notes/*.enc`, `index.enc`, `crypto.json` — i **cifrati** (più salt/iterazioni pubblici): questi sì si committano.
- `index.html` + `reader.js` — il lettore: cancello passphrase, poi decifra e mostra le note in locale.

## Aggiungere / aggiornare una nota

1. Scrivi o modifica un file in `_plain/` (per esempio `_plain/iva.md`).
2. Cifra:
   ```bash
   node civica/encrypt.mjs      # chiede la passphrase (non viene salvata)
   ```
3. Committa i cifrati:
   ```bash
   git add civica && git commit -m "civica: aggiorna note (cifrate)"
   ```
   (`_plain/` è escluso da git: nel repo finiscono solo i `.enc`.)

## Leggere

Apri `civica/` nel browser (in locale o dal sito), inserisci la passphrase: il lettore decifra l'elenco e le note **in memoria**, senza mandare nulla in rete.

## Avvertenze

- **La sicurezza è tutta nella passphrase.** Scegline una forte e non committarla mai.
- **Se la perdi, le note sono irrecuperabili**: è il prezzo della cifratura vera (nessun reset).
- Resta visibile su GitHub il *fatto* che il vault esista e **quante** note ci sono (i nomi dei file `.enc` sono opachi, i titoli sono cifrati): il **contenuto** no.
- Il testo in chiaro non deve mai entrare in un commit: ci pensa il `.gitignore` (`_plain/`).
