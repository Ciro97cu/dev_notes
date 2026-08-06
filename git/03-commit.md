# Commit

## Concetto
Un commit è un'istantanea salvata dello stato dei file tracciati in un dato momento, accompagnata da un messaggio che descrive cosa è cambiato. È il mattone con cui si costruisce la cronologia del progetto: ogni commit resta registrato nella storia, così è sempre possibile tornare a una versione precedente o confrontare due momenti diversi del lavoro.

Il percorso che porta a un commit attraversa tre luoghi. Si comincia modificando i file nel *working directory*, cioè la cartella di lavoro così come appare sul disco; con `git add` le modifiche che si vogliono salvare vengono spostate nella **staging area**, una zona d'attesa in cui si compone il prossimo commit scegliendo cosa includere; infine `git commit` fotografa ciò che si trova in staging e lo fissa nella storia.

## Comandi
| Comando | Cosa fa |
|---------|---------|
| `git add <file>` | Aggiunge uno o più file alla staging area |
| `git add .` | Aggiunge tutti i file modificati (cartella corrente + sottocartelle) |
| `git commit -m "messaggio"` | Crea un commit con i file in staging |
| `git restore --staged <file>` | Toglie un file dalla staging area, lascia le modifiche nel working directory |
| `git commit --amend` | Modifica l'ultimo commit (messaggio o file) ⚠️ |

## Esempi
```bash
git add index.html          # un file
git add .                   # tutto
git commit -m "Aggiunge pagina di login"

git restore --staged index.html   # togli un file dalla staging
git restore --staged .            # togli tutto dalla staging
```

## --amend
L'opzione `--amend` modifica l'ultimo commit invece di aggiungerne uno nuovo, e torna utile quando ci si accorge subito di un messaggio sbagliato o di un file dimenticato.
```bash
git commit --amend -m "Nuovo messaggio"   # cambia solo il messaggio
git add file-dimenticato.txt
git commit --amend                        # aggiunge il file al commit precedente
```
⚠️ `--amend` riscrive la storia: è sicuro solo su commit **non ancora pushati**, mentre su commit già condivisi crea conflitti agli altri. Effetto: la `history` cambia (nuovo hash), mentre working directory e staging restano invariati.

## Commit atomico
Un commit atomico contiene **una sola modifica logica**, completa e indipendente dalle altre. Se durante il lavoro si corregge un bug e si aggiunge una feature, la scelta atomica è tenerli in due commit separati anziché fonderli in uno. Il vantaggio è concreto: la storia resta leggibile, individuare la causa di un problema (il debug) diventa più semplice, si può annullare un singolo cambiamento con un revert mirato e la revisione del codice scorre più facilmente.

## Messaggi di commit
La convenzione più diffusa, adottata da Git e dai progetti open source, è scrivere il messaggio in **present tense / imperative mood**: il messaggio descrive cosa fa il commit, come se fosse un comando impartito al codice.
> [!tip] Usare l'imperativo presente
> `Aggiunge la funzione di login`, `Corregge bug nella validazione`

> [!warning] Evitare il passato
> `Aggiunta la funzione di login`

### Messaggio su più linee
Invocato senza `-m`, `git commit` apre l'editor di testo configurato, dove si può scrivere un messaggio articolato su più righe:
```bash
git commit
```
In vim si preme `i` per entrare in modalità inserimento, si scrive il messaggio, poi `Esc` per uscirne e infine `:wq` seguito da Invio per salvare e chiudere.

## Collegamenti
- [Annullare modifiche](08-annullare.md) — `restore`, `reset`, `revert`
- [Log e Diff](04-log-diff.md)
- [.gitignore](05-gitignore.md)
