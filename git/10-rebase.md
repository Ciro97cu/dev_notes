# Rebase

## Concetto
Rebase prende i commit di un branch e li riapplica sopra un'altra base (di solito
`main`), riscrivendo la storia per renderla **lineare**.

Quando usarlo:
- Aggiornare un feature branch con le ultime modifiche di `main` senza merge commit.
- Pulire la storia (squash, reword, reorder) prima di una pull request.

## Comandi
| Comando | Cosa fa |
|---------|---------|
| `git rebase <base>` | Riapplica i commit del branch corrente sopra `<base>` |
| `git rebase --continue` | Prosegue il rebase dopo aver risolto un conflitto |
| `git rebase --abort` | Annulla il rebase, torna allo stato iniziale |
| `git rebase -i <commit>` | Rebase interattivo (squash/reword/reorder) |
| `git pull --rebase` | Pull che riappoggia i commit locali, evita il merge commit |

```bash
git switch feature
git rebase main            # riappoggia "feature" sopra "main"

# se ci sono conflitti: risolvere i file, poi
git add <file>
git rebase --continue      # oppure: git rebase --abort
```

## Rebase interattivo
`git rebase -i HEAD~3` apre l'editor con gli ultimi 3 commit, ognuno con `pick`.
Cambiando `pick` con un'altra parola si sceglie l'azione:

| Azione | Cosa fa |
|--------|---------|
| `pick` (p) | usa il commit così com'è (default) |
| `reword` (r) | usa il commit, ma permette di cambiarne il messaggio |
| `edit` (e) | si ferma per modifiche più complesse / dividere il commit |
| `squash` (s) | unisce al commit precedente, combina i messaggi |
| `fixup` (f) | come squash, ma scarta il messaggio del commit corrente |
| `exec` (x) | esegue un comando di shell (es. un test) |
| `drop` (d) | rimuove il commit |
| `label` (l) | assegna un'etichetta a un commit |
| `reset` (t) | riporta HEAD a un'etichetta |
| `merge` (m) | crea un commit di merge |

## merge vs rebase
- **Merge** → unisce le storie, crea (se serve) un merge commit, preserva la
  cronologia originale.
- **Rebase** → riscrive la storia in modo lineare e pulito, ma **cambia gli hash**
  dei commit del feature branch.

## Quando NON usarlo

> [!warning]
> - Su branch già pubblici e usati da altri → riscrivere la storia crea problemi a chi ha già basato il lavoro su quei commit.
> - Su `main` / `develop` o altri branch di riferimento condivisi.
> - Se il progetto richiede audit trail con merge commit espliciti.

## Push dopo rebase
Dopo un rebase su un branch già pushato serve forzare il push:
```bash
git push --force-with-lease
```
⚠️ `--force-with-lease` è più sicuro di `--force`: rifiuta il push se qualcun altro
ha pushato nel frattempo, riducendo il rischio di sovrascrivere lavoro altrui.

## Collegamenti
- [Merge](07-merge.md)
- [Annullare](08-annullare.md)
