# Interni di Git

## La cartella .git
La cartella `.git` è il cuore del repository: viene creata da `git init` o da `git clone` e contiene tutti i dati e i metadati che compongono la cronologia, i branch, i tag e la configurazione. È qui che vive davvero il repository, non nei file di progetto: cancellando questa cartella si perde l'intera storia, mentre i file del progetto — cioè lo stato attuale così com'è sul disco — restano al loro posto, semplicemente non più tracciati.

| Elemento | Scopo |
|----------|-------|
| `objects/` | Tutti gli oggetti del repo (versioni dei file, commit, tree). Compressi, identificati da hash |
| `refs/` | Puntatori ai commit: branch in `refs/heads/`, tag in `refs/tags/` |
| `HEAD` | File che punta al branch corrente (es. `ref: refs/heads/main`) |
| `hooks/` | Script attivabili in momenti del ciclo Git (pre-commit, post-push, ...) |
| `index` | File binario = la staging area |
| `config` | Configurazione locale del repo |

## config
Il file `.git/config` raccoglie le impostazioni valide **solo per questo repository**, che hanno la precedenza sulla configurazione globale (`~/.gitconfig`) e su quella di sistema. È il posto giusto, per esempio, quando si vogliono usare nome ed email diversi in un progetto specifico.

Le sezioni principali sono:
- `[core]` — le impostazioni di base del repo.
- `[remote "origin"]` — l'URL del remoto e le regole di fetch.
- `[branch "main"]` — l'upstream del branch locale (`remote = origin`, `merge = refs/heads/main`).

Il file si può modificare a mano, ma di solito conviene farlo con `git config`.

## objects/ — il database interno
Git non memorizza i file così come appaiono, ma li scompone in "oggetti" compressi, ciascuno identificato dal proprio hash. Gli oggetti sono di quattro tipi. Un **blob** custodisce il contenuto vero e proprio di un file, e nient'altro: solo i dati, senza il nome né i permessi. Un **tree** rappresenta una directory, cioè un elenco di puntatori ai blob (i file) e ad altri tree (le sottocartelle), stavolta corredati di nomi e permessi. Un **commit** punta a un singolo tree — che fissa lo stato completo del progetto in quel momento — e vi aggiunge i metadati: il commit genitore, l'autore, il committer, la data e il messaggio; è la catena di questi commit, ciascuno che rimanda al precedente, a formare la storia. Un **tag**, nella sua forma annotated, è infine un oggetto che dà un nome leggibile a un commit.

### Hashing
Su ogni oggetto Git calcola un hash **SHA-1**, una stringa di 40 caratteri esadecimali (per esempio `a1e8fb59...`) derivata dal contenuto dell'oggetto stesso: quell'hash ne diventa l'identificatore univoco. Da questa scelta discendono due proprietà importanti. La prima è l'**integrità**: poiché l'hash dipende dal contenuto, basta che cambi un solo bit perché cambi anche l'hash, così la storia non può essere alterata senza che la modifica salti all'occhio. La seconda è l'**efficienza**: due file con contenuto identico producono lo stesso hash e vengono quindi salvati come un unico blob, risparmiando spazio.

> Nota: SHA-1 è il default; Git supporta anche SHA-256 come opzione.

Gli oggetti sono conservati in sottocartelle il cui nome è dato dai **primi 2 caratteri** dell'hash, mentre il resto dell'hash fa da nome del file: l'oggetto `a1e8fb...`, per esempio, finisce in `.git/objects/a1/e8fb...`. Questa suddivisione evita di accumulare troppi file in un'unica directory.

## Reflog
Il comando `git reflog` registra tutte le posizioni che `HEAD` (e le punte dei branch) hanno assunto nel tempo, ma solo nel repository **locale**. A differenza di `git log`, che mostra la storia pubblica e lineare del progetto, il reflog è una sorta di diario privato delle proprie azioni, **non** condiviso con `git push`. Il suo scopo è recuperare lavoro che sembra perso dopo operazioni distruttive, come un `reset` o la cancellazione di un branch.

```bash
git reflog                 # elenco delle mosse di HEAD
git reflog show            # alias di: git log -g --abbrev-commit --pretty=oneline
```
Ogni riga riporta l'hash, il puntatore (`HEAD@{1}`), l'azione compiuta (commit, reset, checkout, merge) e un messaggio.

### Qualificatori
I riferimenti del reflog si possono qualificare in due modi. Il primo è per indice, dove `HEAD@{0}` indica la posizione attuale, `HEAD@{1}` la mossa precedente e così via; la stessa notazione vale anche per un branch, come `main@{2}`. Il secondo è per tempo, indicando un momento tra parentesi graffe, per esempio `HEAD@{"5 minutes ago"}`, `main@{"2 hours ago"}`, `HEAD@{yesterday}` o `HEAD@{2025-10-25 09:00:00}`.

### Recuperare
Annullare un `reset --hard`:
```bash
git reflog                 # trova il commit "perso", es. HEAD@{1} = f7b3f73
git reset --hard HEAD@{1}  # oppure: git reset --hard f7b3f73
```
Recuperare un branch cancellato:
```bash
git reflog                          # trova l'ultimo commit del branch, es. b2c1d3e
git branch nome-recuperato b2c1d3e  # ricrea il branch su quel commit
```

### Limiti
Il reflog ha però due limiti importanti. Non è permanente: le sue voci scadono col tempo (in genere dopo circa 90 giorni, e circa 30 per i commit non più raggiungibili), quindi è ottimo per rimediare a errori recenti ma inaffidabile per recuperare lavoro perso da tempo. Ed è strettamente **locale**: non viene condiviso con i collaboratori né inviato con `git push`.

## Collegamenti
- [Annullare](08-annullare.md)
- [Introduzione](01-introduzione.md) — `git config` globale
