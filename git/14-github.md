# GitHub

## Concetto
GitHub è una piattaforma online che ospita repository Git remoti, con funzioni di
collaborazione (issue, pull request, review, ecc.). Git è lo strumento; GitHub è
uno dei posti dove tenere il repo remoto.

## Repo pubblico vs privato
- **Pubblico** → visibile a chiunque: tutti vedono, scaricano, propongono modifiche.
- **Privato** → visibile solo a proprietari e collaboratori autorizzati.

## README
File di testo (di solito `README.md`) nella cartella principale. Descrive il
progetto: scopo, installazione, uso, esempi, come contribuire, licenza. GitHub lo
mostra in automatico aprendo il repo.

## Comandi
| Comando | Cosa fa |
|---------|---------|
| `git clone <url>` | Copia in locale un repo remoto (file + storia + branch) |
| `git remote -v` | Elenca i remoti configurati |
| `git remote add <nome> <url>` | Collega un remoto (es. `origin`) |
| `git remote set-url <nome> <url>` | Cambia l'URL di un remoto |
| `git remote remove <nome>` | Rimuove un remoto |
| `git push <remoto> <branch>` | Invia i commit al remoto |
| `git push -u <remoto> <branch>` | Push + imposta l'upstream (`--set-upstream`) |
| `git fetch` | Scarica gli aggiornamenti dal remoto, NON tocca il branch locale |
| `git pull` | `fetch` + `merge` automatico nel branch locale |
| `git branch -r` | Elenca i branch remoti (remote tracking) |

## Esempi
```bash
git clone https://github.com/utente/nome-repo.git

git remote add origin https://github.com/utente/nome-repo.git
git remote -v

git push -u origin main      # prima volta: imposta l'upstream
git push                     # volte successive

git fetch                    # guarda cosa è cambiato sul server
git pull                     # scarica E unisce
```
Se il branch remoto non esiste ancora, `git push` lo crea.

## Remote tracking branch
Un remote tracking branch (es. `origin/main`) è un branch locale speciale che tiene
traccia dello stato di un branch sul remoto. Serve a sapere se il proprio branch è
avanti o indietro rispetto al server. `git branch -r` li elenca.

## clone vs init
- Progetto nuovo, da zero → `git init`.
- Progetto già esistente su un remoto → `git clone`.

## GitHub Gists
Frammenti di codice o note condivisibili. Ogni gist è un repo Git (clonabile,
versionato). Possono essere pubblici (tutti) o segreti (solo con il link).

## Pull Request (PR)
Richiesta formale di unire un branch (di solito un feature branch) in un altro (di
solito `main` / `develop`). Abilita la review del codice prima dell'integrazione →
mantiene qualità e stabilità.

## Forking
Il fork crea una copia indipendente di un repo remoto sul proprio account. Ci si
lavora liberamente senza toccare l'originale. Usato per contribuire a progetti di
altri (poi si propone una PR).

## Collegamenti
- [Repository](02-repository.md)
- [Branch](06-branch.md) e [Merge](07-merge.md)
- [Tag](11-tag.md) — `git push origin --tags`
- Ricetta pronta: [Playbook](playbook.md)
