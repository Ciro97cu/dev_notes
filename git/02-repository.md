# Repository

## Concetto
Un repository ("repo") è una cartella che contiene i file di un progetto più la
cronologia completa delle modifiche. Dentro c'è una cartella nascosta `.git` che
memorizza commit, branch e tag. Può essere locale (sul proprio computer) o remoto
(su un server come GitHub o GitLab).

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
