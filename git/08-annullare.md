# Annullare modifiche

Tre comandi, tre scopi diversi. La scelta dipende da: modifiche salvate o no,
commit pushato o no.

## Detached HEAD
Si entra in "detached HEAD" spostandosi su un commit specifico invece che su un
branch: `HEAD` punta a un commit, non a un branch.

```bash
git checkout a1b2c3d     # HEAD staccato sul commit a1b2c3d
```
⚠️ I nuovi commit fatti qui non sono legati a nessun branch → si perdono cambiando
branch. Per tornare a lavorare normalmente:
```bash
git switch main          # ri-aggancia HEAD a un branch
```
Per salvare il lavoro fatto in detached HEAD, creare un branch prima di uscire:
```bash
git switch -c nuovo-branch
```

## git restore
Annulla le modifiche ai file nel working directory, riportandoli a una versione
precedente.

| Comando | Effetto |
|---------|---------|
| `git restore <file>` | Scarta le modifiche non salvate sul file (torna a HEAD) ⚠️ |
| `git restore .` | Scarta tutte le modifiche non salvate ⚠️ |
| `git restore --staged <file>` | Toglie il file dalla staging area (modifiche restano) |
| `git restore --source=<hash> <file>` | Riporta il file alla versione di un commit |

```bash
git restore app.js                      # scarta le modifiche su app.js
git restore --staged app.js             # toglie da staging (modifiche restano)
git restore --source=a1b2c3d app.js     # versione di app.js da quel commit
```
⚠️ Le modifiche scartate **non** sono recuperabili, se non erano già in un commit.

## git reset
Sposta `HEAD` e, a seconda dell'opzione, tocca anche staging e working directory.
Usato per annullare commit o togliere file dalla staging.

| Comando | history | staging | working dir |
|---------|---------|---------|-------------|
| `git reset --soft HEAD~1` | indietro di 1 | invariata (modifiche pronte) | invariato |
| `git reset --mixed HEAD~1` (default) | indietro di 1 | svuotata | invariato |
| `git reset --hard HEAD~1` ⚠️ | indietro di 1 | svuotata | **modifiche cancellate** |
| `git reset <file>` | — | toglie il file dalla staging | invariato |

```bash
git reset --soft HEAD~1     # annulla il commit, tieni tutto pronto in staging
git reset HEAD~1            # (mixed) annulla il commit, modifiche nel working dir
git reset --hard HEAD~1     # ⚠️ annulla il commit E cancella le modifiche
git reset app.js           # toglie app.js dalla staging
```
⚠️ `--hard` elimina le modifiche non salvate, in modo definitivo. `reset` su commit
già pushati riscrive la storia condivisa → non farlo (usa `revert`).

## git revert
Annulla uno o più commit **creando un nuovo commit** che inverte le modifiche. Non
cancella la cronologia.

```bash
git revert HEAD            # annulla l'ultimo commit
git revert a1b2c3d         # annulla un commit specifico
```
> [!tip] Sicuro sui repository condivisi
> `git revert` non riscrive la storia: è l'opzione sicura per i commit già pushati.

## reset vs revert (quale usare?)
- Commit **non** pushato, solo locale → `reset`.
- Commit **già pushato** / condiviso → `revert`.

## Collegamenti
- [Commit](03-commit.md)
- [Interni di Git](12-interni-git.md) — `reflog` per recuperare dopo un `reset --hard`
- Ricette pronte: [Playbook](playbook.md)
