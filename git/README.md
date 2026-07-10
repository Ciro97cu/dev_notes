# Appunti Git

Appunti di studio su Git, da zero ad avanzato. Pensati come percorso ordinato
ma usabili anche come reference rapida durante il lavoro.

## Come sono organizzati

- File numerati per topic (`01-*.md`, `02-*.md`, ...) da leggere in ordine.
- Ogni file segue lo stesso scheletro (vedi [REGOLE.md](REGOLE.md)).
- Termini tecnici e comandi restano in inglese; il testo è in italiano semplice.

## Indice topic

| # | File | Argomento |
|---|------|-----------|
| 01 | [Introduzione](01-introduzione.md) | Cos'è Git, Git vs GitHub, config nome/email |
| 02 | [Repository](02-repository.md) | `init`, `status`, cos'è un repo |
| 03 | [Commit](03-commit.md) | `add`, `commit`, `--amend`, commit atomico, messaggi |
| 04 | [Log e Diff](04-log-diff.md) | `log`, `diff`, `blame` |
| 05 | [.gitignore](05-gitignore.md) | regole e pattern per ignorare file |
| 06 | [Branch](06-branch.md) | HEAD, `branch`, `checkout`, `switch`, rinomina |
| 07 | [Merge](07-merge.md) | merge commit, fast-forward, conflitti |
| 08 | [Annullare](08-annullare.md) | detached HEAD, `restore`, `reset`, `revert` |
| 09 | [Stash](09-stash.md) | salvare modifiche temporanee |
| 10 | [Rebase](10-rebase.md) | rebase, interattivo, force-with-lease |
| 11 | [Tag](11-tag.md) | tag lightweight/annotated, SemVer |
| 12 | [Interni di Git](12-interni-git.md) | cartella `.git`, objects, SHA-1, reflog |
| 13 | [Alias](13-alias.md) | abbreviare i comandi |
| 14 | [GitHub](14-github.md) | clone, remote, push, fetch, pull, PR, fork |
| 15 | [Terminale](15-terminale.md) | comandi shell base |
| 16 | [SemVer](16-semver.md) | versionamento semantico `MAJOR.MINOR.PATCH` |

## File di supporto

- [REGOLE.md](REGOLE.md) — le regole di qualità che ogni appunto deve rispettare.
- [glossario.md](glossario.md) — termini Git (EN) spiegati in italiano semplice.
- [playbook.md](playbook.md) — ricette pronte: problema reale → comandi esatti.
- [errori.md](errori.md) — messaggi di errore di Git → causa e fix.

## Convenzioni

- Commit in stile [Conventional Commits](https://www.conventionalcommits.org/)
  (`docs:`, `fix:`, ...).
- Comandi pericolosi marcati con ⚠️.

## Anteprima locale

Il sito è generato con [Docsify](https://docsify.js.org/) (nessuna build).
Per vederlo in locale serve un server statico (non basta aprire il file):

```bash
npx serve .          # poi aprire l'indirizzo mostrato
# oppure
python3 -m http.server
```
