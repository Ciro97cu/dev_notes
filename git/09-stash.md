# Stash

Lo stash è un deposito temporaneo dove Git mette da parte le modifiche non ancora committate, senza però perderle. Torna utile quando serve interrompere il lavoro in corso — per cambiare branch o dedicarsi ad altro — ma non lo si vuole ancora cristallizzare in un commit incompleto: si "parcheggiano" le modifiche, si ottiene un working directory pulito e le si recupera in un secondo momento.

## Comandi
| Comando | Cosa fa |
|---------|---------|
| `git stash` | Mette da parte le modifiche, pulisce il working directory |
| `git stash list` | Elenca gli stash salvati (con id `stash@{n}`) |
| `git stash pop` | Riapplica l'ultimo stash e lo **rimuove** dalla lista |
| `git stash apply [stash@{n}]` | Riapplica uno stash **senza** rimuoverlo |
| `git stash drop [stash@{n}]` | Cancella uno stash specifico ⚠️ |
| `git stash clear` | Cancella **tutti** gli stash ⚠️ |

## Esempi
```bash
git stash                  # salva e pulisci
git switch altro-branch    # lavora altrove
git switch -               # torna
git stash pop              # riprendi le modifiche

git stash list             # stash@{0}, stash@{1}, ...
git stash apply stash@{1}  # riapplica uno specifico, lo tiene
git stash drop stash@{1}   # ⚠️ elimina uno specifico
git stash clear            # ⚠️ elimina tutti gli stash
```

## Collegamenti
- [Branch](06-branch.md)
- Ricetta pronta: [Playbook](playbook.md)
