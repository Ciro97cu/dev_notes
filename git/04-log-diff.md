# Log e Diff

## git log
Il comando `git log` mostra la cronologia dei commit, elencandoli dal più recente al più vecchio. Per ciascuno riporta l'hash che lo identifica, l'autore, la data e il messaggio, così da poter ripercorrere l'evoluzione del progetto un commit dopo l'altro.

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
Senza opzioni `git log` elenca tutti i commit, senza un limite prefissato.

## git diff
Il comando `git diff` mostra le differenze tra due versioni dei file: a seconda di come lo si invoca può confrontare il working directory, la staging area, un commit o un intero branch. L'output evidenzia riga per riga cosa è stato aggiunto, modificato o cancellato.

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
Le opzioni `--staged` e `--cached` sono equivalenti, e al posto degli hash dei commit si possono indicare anche nomi di branch o di tag.

## git blame
Il comando `git blame` mostra, per ogni singola riga di un file, l'ultimo commit che l'ha toccata, con il relativo hash, autore e data. È lo strumento con cui si risale a chi ha introdotto una determinata riga e a quando, di solito per capire il perché di una scelta o per rintracciare l'origine di un bug.

| Comando | Cosa fa |
|---------|---------|
| `git blame <file>` | Riga per riga: commit, autore, data |
| `git blame -L 10,20 <file>` | Solo le righe 10–20 |

```bash
git blame app.js
git blame -L 30,45 app.js   # solo una porzione
```
È un comando di sola lettura: non modifica nulla nel repo.

## Collegamenti
- [Commit](03-commit.md)
- [Branch](06-branch.md)
- Ricetta pronta: [Playbook](playbook.md)
