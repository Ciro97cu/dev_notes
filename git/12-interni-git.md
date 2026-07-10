# Interni di Git

## La cartella .git
È il cuore del repo, creata da `git init` o `git clone`. Contiene tutti i dati e i
metadati per la cronologia, i branch, ecc. Cancellandola si perde tutta la storia,
ma i file del progetto (lo stato attuale) restano.

| Elemento | Scopo |
|----------|-------|
| `objects/` | Tutti gli oggetti del repo (versioni dei file, commit, tree). Compressi, identificati da hash |
| `refs/` | Puntatori ai commit: branch in `refs/heads/`, tag in `refs/tags/` |
| `HEAD` | File che punta al branch corrente (es. `ref: refs/heads/main`) |
| `hooks/` | Script attivabili in momenti del ciclo Git (pre-commit, post-push, ...) |
| `index` | File binario = la staging area |
| `config` | Configurazione locale del repo |

## config
Il file `.git/config` ha le impostazioni valide **solo per questo repo**. Hanno la
precedenza sulla config globale (`~/.gitconfig`) e di sistema. Utile per usare
nome/email diversi per progetto.

Sezioni principali:
- `[core]` → impostazioni di base del repo.
- `[remote "origin"]` → URL del remoto e regole di fetch.
- `[branch "main"]` → upstream del branch locale (`remote = origin`, `merge = refs/heads/main`).

Si modifica a mano o, meglio, con `git config`.

## objects/ — il database interno
Git non salva i file come li vediamo, ma come "oggetti" compressi. Quattro tipi:
- **Blob** → il contenuto di un file (solo dati, niente nome né permessi).
- **Tree** → una directory: elenco di puntatori a blob (file) e ad altri tree
  (sottocartelle), con nomi e permessi.
- **Commit** → punta a un tree (stato completo del progetto) + metadati: commit
  genitore, autore, committer, data, messaggio. La sequenza di commit = la storia.
- **Tag** → nome leggibile che punta a un commit (oggetto annotated tag).

### Hashing
Git calcola un hash **SHA-1** (40 caratteri esadecimali, es. `a1e8fb59...`) sul
contenuto di ogni oggetto → è il suo id univoco.
- **Integrità** → cambia un bit → cambia l'hash. La storia non si altera senza che
  si noti.
- **Efficienza** → file con contenuto identico = un solo blob, spazio risparmiato.

> Nota: SHA-1 è il default; Git supporta anche SHA-256 come opzione.

Gli oggetti stanno in sottocartelle nominate con i **primi 2 caratteri** dell'hash;
il resto è il nome del file. Es: `a1e8fb...` → `.git/objects/a1/e8fb...`. Evita
troppi file in una sola directory.

## Reflog
`git reflog` registra tutte le posizioni passate di `HEAD` (e delle punte dei
branch) nel repo **locale**. A differenza di `git log` (storia pubblica e lineare),
è un diario privato delle proprie azioni, **non** condiviso con `git push`. Serve a
recuperare lavoro che sembra perso dopo operazioni distruttive (`reset`, branch
cancellato).

```bash
git reflog                 # elenco delle mosse di HEAD
git reflog show            # alias di: git log -g --abbrev-commit --pretty=oneline
```
Ogni riga: hash, puntatore (`HEAD@{1}`), azione (commit/reset/checkout/merge),
messaggio.

### Qualificatori
- **Per indice** → `HEAD@{0}` = ora, `HEAD@{1}` = mossa precedente. Anche `main@{2}`.
- **Per tempo** → `HEAD@{"5 minutes ago"}`, `main@{"2 hours ago"}`,
  `HEAD@{yesterday}`, `HEAD@{2025-10-25 09:00:00}`.

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
- Non permanente: le voci scadono (in genere ~90 giorni, ~30 per i commit non più
  raggiungibili). Ottimo per errori recenti, inaffidabile per lavoro perso da tempo.
- Strettamente **locale**: non condiviso con i collaboratori.

## Collegamenti
- [Annullare](08-annullare.md)
- [Introduzione](01-introduzione.md) — `git config` globale
