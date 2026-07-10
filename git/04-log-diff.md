# Log e Diff

## git log
Mostra la cronologia dei commit, dal più recente al più vecchio: hash, autore,
data, messaggio.

| Comando | Cosa fa |
|---------|---------|
| `git log` | Cronologia completa |
| `git log --oneline` | Un commit per riga (compatto) |
| `git log --stat` | Mostra anche quali file e di quanto sono cambiati |
| `git log -p` | Mostra le differenze (diff) di ogni commit |
| `git log -n <num>` | Limita ai primi N commit (`--max-count`) |

```bash
git log --oneline
git log -n 3          # ultimi 3 commit
```
Default: tutti i commit, nessun limite fisso.

## git diff
Mostra le differenze tra versioni: working directory, staging, commit, branch.
Evidenzia le righe aggiunte, modificate o cancellate.

| Comando | Confronta |
|---------|-----------|
| `git diff` | working directory vs ultimo commit (modifiche NON in staging) |
| `git diff HEAD` | working directory vs ultimo commit (staged + non staged) |
| `git diff --staged` | staging vs ultimo commit (= `--cached`) |
| `git diff <branch1> <branch2>` | due branch |
| `git diff <hash1> <hash2>` | due commit |
| `git diff <a> <b> -- <file>` | solo un file |

```bash
git diff                          # cosa ho cambiato e non ancora aggiunto
git diff --staged                 # cosa entrerà nel prossimo commit
git diff main develop             # differenze tra due branch
git diff main develop -- app.js   # solo su un file
git diff a1b2c3d e4f5g6h          # tra due commit
```
`--staged` e `--cached` sono equivalenti. Al posto degli hash si possono usare
nomi di branch o tag.

## git blame
Mostra, per ogni riga di un file, l'ultimo commit che l'ha modificata: hash,
autore, data. Utile per capire chi ha introdotto una riga e quando.

| Comando | Cosa fa |
|---------|---------|
| `git blame <file>` | Riga per riga: commit, autore, data |
| `git blame -L 10,20 <file>` | Solo le righe 10–20 |

```bash
git blame app.js
git blame -L 30,45 app.js   # solo una porzione
```
Sola lettura: non modifica nulla.

## Collegamenti
- [Commit](03-commit.md)
- [Branch](06-branch.md)
- Ricetta pronta: [Playbook](playbook.md)
