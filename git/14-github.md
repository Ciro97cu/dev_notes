# GitHub

## Concetto
GitHub è una piattaforma online che ospita repository Git remoti e vi costruisce sopra una serie di funzioni di collaborazione, come la gestione delle issue, le pull request e la revisione del codice. Conviene tenere ben distinti i due nomi: Git è lo strumento di versionamento vero e proprio, mentre GitHub è soltanto uno dei posti in cui conservare un repository remoto.

## Repo pubblico vs privato
Un repository su GitHub può essere pubblico o privato. Un repository **pubblico** è visibile a chiunque: tutti possono vederne il codice, scaricarlo e proporre modifiche. Un repository **privato**, al contrario, è accessibile solo al proprietario e ai collaboratori esplicitamente autorizzati.

## README
Il README è un file di testo, di solito chiamato `README.md`, collocato nella cartella principale del progetto. Serve a descriverlo — lo scopo, come si installa e si usa, qualche esempio, le indicazioni per contribuire e la licenza — ed è la prima cosa che chi arriva sul repo si trova davanti, perché GitHub lo mostra in automatico appena si apre il repository.

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
La scelta tra i due comandi dipende dal punto di partenza: per un progetto nuovo, creato da zero, si usa `git init`, mentre per un progetto che esiste già su un remoto si usa `git clone` per portarsene una copia in locale.

## GitHub Gists
I Gist di GitHub sono frammenti di codice o note che si possono condividere al volo. Ogni gist è a tutti gli effetti un piccolo repository Git, quindi è clonabile e versionato come qualsiasi altro, e può essere pubblico, visibile a tutti, oppure segreto, raggiungibile solo da chi ne ha il link.

## Pull Request (PR)
Una pull request è la richiesta formale di unire un branch — tipicamente un feature branch — dentro un altro, di solito `main` o `develop`. Il suo valore è aprire uno spazio per la review del codice prima che l'integrazione avvenga davvero, e questo aiuta a mantenere la qualità e la stabilità del progetto.

## Forking
Il fork crea una copia indipendente di un repository remoto sul proprio account, sulla quale si può lavorare liberamente senza toccare in alcun modo l'originale. È il meccanismo con cui si contribuisce ai progetti altrui: si lavora sul proprio fork e poi si propongono le modifiche al progetto di partenza tramite una pull request.

## Collegamenti
- [Repository](02-repository.md)
- [Branch](06-branch.md) e [Merge](07-merge.md)
- [Tag](11-tag.md) — `git push origin --tags`
- Ricetta pronta: [Playbook](playbook.md)
