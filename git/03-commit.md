# Commit

## Concetto
Un commit è un salvataggio dello stato attuale dei file tracciati, con un messaggio
che descrive cosa è cambiato. Forma la cronologia del progetto e permette di
tornare indietro.

Flusso: si modifica un file (working directory) → si aggiunge alla **staging area**
con `git add` → si salva con `git commit`.

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
Modifica l'ultimo commit invece di crearne uno nuovo.
```bash
git commit --amend -m "Nuovo messaggio"   # cambia solo il messaggio
git add file-dimenticato.txt
git commit --amend                        # aggiunge il file al commit precedente
```
⚠️ `--amend` riscrive la storia. Sicuro solo su commit **non ancora pushati**; su
commit già condivisi crea conflitti agli altri. Effetto: `history` cambia (nuovo
hash), working directory e staging invariati.

## Commit atomico
Un commit atomico contiene **una sola modifica logica**, completa e indipendente.
Correggere un bug e aggiungere una feature → due commit separati, non uno.
Vantaggi: storia chiara, debug più facile, revert mirato, review più semplice.

## Messaggi di commit
**Present tense / imperative mood** (convenzione diffusa, usata da Git e dai
progetti open source): il messaggio descrive cosa fa il commit, come un comando.
> [!tip] Usa l'imperativo presente
> `Aggiunge la funzione di login`, `Corregge bug nella validazione`

> [!warning] Evita il passato
> `Aggiunta la funzione di login`

### Messaggio su più linee
`git commit` senza `-m` apre l'editor:
```bash
git commit
```
In vim: `i` (modalità inserimento) → scrivi → `Esc` → `:wq` + Invio (salva e chiude).

## Collegamenti
- [Annullare modifiche](08-annullare.md) — `restore`, `reset`, `revert`
- [Log e Diff](04-log-diff.md)
- [.gitignore](05-gitignore.md)
