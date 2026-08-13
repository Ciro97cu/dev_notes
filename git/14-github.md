# GitHub

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

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 580 170" role="img" aria-label="06-locale-remoto" style="width:100%;max-width:620px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="40" y="60" width="150" height="70" rx="6" fill="none" fill-opacity="1" stroke="currentColor" stroke-width="1.6"/><rect x="360" y="60" width="170" height="70" rx="6" fill="none" fill-opacity="1" stroke="currentColor" stroke-width="1.6"/><text x="115" y="90" font-size="13" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Locale</text><text x="115" y="110" font-size="10" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">(il tuo PC)</text><text x="445" y="90" font-size="13" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Remoto</text><text x="445" y="110" font-size="10" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">GitHub / origin</text><line x1="360" y1="78" x2="196" y2="78" stroke="currentColor" stroke-width="1.6"/><path d="M196 74 L190 78 L196 82 Z" fill="currentColor"/><text x="275" y="68" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">clone / fetch / pull</text><line x1="190" y1="112" x2="354" y2="112" stroke="currentColor" stroke-width="1.6"/><path d="M354 108 L360 112 L354 116 Z" fill="currentColor"/><text x="275" y="132" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">push</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem"><code>clone</code> copia il remoto in locale; <code>fetch</code>/<code>pull</code> scaricano gli aggiornamenti; <code>push</code> invia i tuoi commit al remoto.</figcaption>
</figure>

## Remote tracking branch
Un remote tracking branch (es. `origin/main`) è un branch locale speciale che tiene
traccia dello stato di un branch sul remoto. Serve a sapere se il proprio branch è
avanti o indietro rispetto al server. `git branch -r` li elenca.

## clone vs init
La scelta tra i due comandi dipende dal punto di partenza: per un progetto nuovo, creato da zero, si usa `git init`, mentre per un progetto che esiste già su un remoto si usa `git clone` per portarsene una copia in locale.

## Autenticazione: HTTPS o SSH
Per clonare un repository privato o per inviare i propri commit con `push`, GitHub deve sapere chi sei: serve **autenticarsi**. Le strade sono due. Con **HTTPS** il remoto ha un URL del tipo `https://github.com/utente/repo.git` e l'accesso avviene tramite un *personal access token* (un gettone segreto che sostituisce la password dell'account). Con **SSH** il remoto ha la forma `git@github.com:utente/repo.git` e l'accesso si fonda su una **coppia di chiavi**: una chiave **privata**, che resta sul computer e non va mai condivisa né committata, e una chiave **pubblica**, che si carica una volta sola su GitHub. Al momento del collegamento GitHub verifica che le due combacino, senza che la privata lasci mai la macchina.

La chiave si **crea** con `ssh-keygen`, non con `cat`: quest'ultimo si limita a *mostrare* il contenuto della pubblica (il file `.pub`) quando serve copiarla. Il nome del file segue l'algoritmo: `id_ed25519.pub` per una chiave ed25519 (quello consigliato oggi), `id_rsa.pub` per una vecchia chiave RSA.

| Comando | Cosa fa |
|---------|---------|
| `ssh-keygen -t ed25519 -C "tua@email"` | **Crea** la coppia di chiavi: `~/.ssh/id_ed25519` (privata) e `id_ed25519.pub` (pubblica) |
| `cat ~/.ssh/id_ed25519.pub` | **Mostra** la chiave pubblica, da copiare e incollare su GitHub |
| `ssh -T git@github.com` | Verifica che GitHub riconosca la chiave (risponde col tuo username) |
| `git remote set-url origin git@github.com:utente/repo.git` | Converte un remoto esistente da HTTPS a SSH |

La configurazione si fa una volta sola: **generare** la coppia con `ssh-keygen`, **copiare** la pubblica con `cat ~/.ssh/id_ed25519.pub`, **incollarla** su GitHub in *Settings → SSH and GPG keys → New SSH key*, infine **verificare** con `ssh -T git@github.com`. I dettagli sono nella [guida ufficiale di GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh).

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
