# Commit

Un commit è un'istantanea salvata dello stato dei file tracciati in un dato momento, accompagnata da un messaggio che descrive cosa è cambiato. È il mattone con cui si costruisce la cronologia del progetto: ogni commit resta registrato nella storia, così è sempre possibile tornare a una versione precedente o confrontare due momenti diversi del lavoro.

Il percorso che porta a un commit attraversa tre luoghi. Si comincia modificando i file nel *working directory*, cioè la cartella di lavoro così come appare sul disco; con `git add` le modifiche che si vogliono salvare vengono spostate nella **staging area**, una zona d'attesa in cui si compone il prossimo commit scegliendo cosa includere; infine `git commit` fotografa ciò che si trova in staging e lo fissa nella storia.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 520 150" role="img" aria-label="01-tre-aree" style="width:100%;max-width:560px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="14" y="58" width="108" height="46" rx="6" fill="none" fill-opacity="1" stroke="currentColor" stroke-width="1.6"/><rect x="206" y="58" width="108" height="46" rx="6" fill="none" fill-opacity="1" stroke="currentColor" stroke-width="1.6"/><rect x="398" y="58" width="108" height="46" rx="6" fill="none" fill-opacity="1" stroke="currentColor" stroke-width="1.6"/><text x="68" y="80" font-size="12" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Working</text><text x="68" y="96" font-size="11" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">directory</text><text x="260" y="80" font-size="12" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Staging</text><text x="260" y="96" font-size="11" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">area</text><text x="452" y="80" font-size="12" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Repository</text><text x="452" y="96" font-size="11" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">(history)</text><line x1="122" y1="74" x2="200" y2="74" stroke="currentColor" stroke-width="1.6"/><path d="M200 70 L206 74 L200 78 Z" fill="currentColor"/><text x="164" y="48" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">git add</text><line x1="206" y1="92" x2="128" y2="92" stroke="currentColor" stroke-width="1.6"/><path d="M128 88 L122 92 L128 96 Z" fill="currentColor"/><text x="164" y="128" font-size="10.5" text-anchor="middle" font-weight="400" opacity=".8" fill="currentColor">git restore --staged</text><line x1="314" y1="74" x2="392" y2="74" stroke="currentColor" stroke-width="1.6"/><path d="M392 70 L398 74 L392 78 Z" fill="currentColor"/><text x="356" y="48" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">git commit</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Le tre aree di Git: <code>git add</code> porta le modifiche in <strong>staging</strong>, <code>git commit</code> le fissa nella <strong>history</strong>; <code>git restore --staged</code> fa il percorso inverso (toglie da staging).</figcaption>
</figure>

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
