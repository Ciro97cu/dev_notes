# Repository

## Concetto
Un repository (spesso abbreviato in "repo") è la cartella di un progetto messa sotto il controllo di Git: contiene i file su cui si lavora e, insieme a essi, la cronologia completa di ogni modifica che li ha portati allo stato attuale. Tutto ciò che serve a ricostruire questa storia vive in una sottocartella nascosta chiamata `.git`, dove Git registra i commit, i branch e i tag; è proprio quella cartella a trasformare una comune directory in un repository, ed è per questo che cancellarla significa perdere la storia pur conservando i file. Un repository può essere locale, cioè risiedere sul proprio computer, oppure remoto quando è ospitato su un server come GitHub o GitLab, e le due forme convivono normalmente: si lavora sulla copia locale e la si sincronizza con quella remota.

## Comandi
| Comando | Cosa fa |
|---------|---------|
| `git init` | Inizializza un nuovo repo nella cartella corrente (crea `.git`) |
| `git status` | Mostra lo stato: file modificati, aggiunti, cancellati, pronti per il commit |

## Esempi
```bash
git init       # crea il repo nella cartella corrente
git status     # cosa è cambiato dall'ultimo commit
```

## Collegamenti
- [Commit](03-commit.md)
- [Interni di Git](12-interni-git.md) — cosa c'è dentro `.git`
