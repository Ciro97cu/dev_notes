# Errori comuni

Triage per i messaggi di errore di Git. Si cerca il **messaggio** (anche parziale),
si legge causa e fix. La teoria sta nei file topic linkati.

I messaggi sono quotati come li stampa Git.

## Push / remoto

### `failed to push some refs` / `! [rejected] ... (fetch first)`
Il remoto ha commit non presenti in locale (qualcuno ha pushato prima).
```bash
git pull --rebase    # porta i commit remoti sotto i propri
git push
```
→ [GitHub](14-github.md), [Rebase](10-rebase.md)

### `Updates were rejected because the tip of your current branch is behind`
Stesso caso: branch locale indietro rispetto al remoto. Stessa soluzione di sopra.
Forzare con `git push --force` solo se necessario ⚠️ → meglio `--force-with-lease`.
→ [Rebase](10-rebase.md)

### `fatal: remote origin already exists`
Si sta facendo `remote add` su un remoto che esiste già. Cambiare l'URL invece:
```bash
git remote set-url origin <nuovo-url>
```
→ [GitHub](14-github.md)

### `fatal: refusing to merge unrelated histories`
Due storie senza antenati comuni (es. repo locale + repo remoto creato a parte).
```bash
git pull origin main --allow-unrelated-histories
```
→ [GitHub](14-github.md)

### `Permission denied (publickey)`
Chiave SSH non configurata o non riconosciuta dal server. Usare l'URL https oppure
configurare una chiave SSH sull'account GitHub.
→ [GitHub](14-github.md)

## Checkout / merge / pull

### `Your local changes to the following files would be overwritten by ...`
Ci sono modifiche non committate che verrebbero sovrascritte. Metterle da parte o
committarle prima:
```bash
git stash        # poi: git switch / git pull ...
git stash pop
```
→ [Stash](09-stash.md)

### `CONFLICT (content): Merge conflict in <file>`
Stesse righe cambiate sui due lati. Risolvere a mano i marcatori
`<<<<<<<` / `=======` / `>>>>>>>`, poi:
```bash
git add <file>
git commit          # (merge) oppure: git rebase --continue
```
Per mollare tutto: `git merge --abort` o `git rebase --abort`.
→ [Merge](07-merge.md)

## Commit / config

### `Author identity unknown` / `Please tell me who you are`
Nome ed email non configurati.
```bash
git config --global user.name "Mario Rossi"
git config --global user.email "mario.rossi@example.com"
```
→ [Introduzione](01-introduzione.md)

### `nothing to commit, working tree clean`
Niente da committare: nessuna modifica, oppure manca `git add`.
```bash
git status     # controlla lo stato; git add <file> se serve
```
→ [Commit](03-commit.md)

## Repository

### `fatal: not a git repository (or any of the parent directories)`
Non si è dentro un repo Git.
```bash
cd <cartella-del-repo>   # oppure, per crearne uno: git init
```
→ [Repository](02-repository.md)

## Detached HEAD

### `You are in 'detached HEAD' state`
HEAD punta a un commit, non a un branch. Per salvare il lavoro fatto:
```bash
git switch -c nuovo-branch    # crea un branch sul punto attuale
```
→ [Annullare](08-annullare.md)
