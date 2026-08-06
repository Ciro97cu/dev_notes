# Branch

## Concetto
Un branch (in italiano "ramo") è una linea di sviluppo parallela e indipendente all'interno dello stesso repository. Serve a lavorare su una nuova funzionalità o su una correzione tenendola isolata dal codice principale, che resta intatto finché il lavoro non è pronto. È anche il meccanismo che rende possibile la collaborazione: più persone possono procedere ognuna sul proprio ramo e poi riunire i rispettivi contributi con un'operazione di merge.

## master e main
Storicamente il branch principale di un repository si chiamava `master`, mentre lo standard adottato oggi è `main`. Il nome è cambiato ma il concetto è lo stesso: si tratta del ramo di riferimento, quello che custodisce la versione ufficiale e stabile del progetto.

## HEAD
`HEAD` è il puntatore che indica su quale branch (o, più raramente, su quale commit) si sta lavorando in questo momento. Lo si può immaginare come un segnalibro che dice a Git "il lavoro corrente è qui": ogni volta che si cambia branch, `HEAD` si sposta a seguire il nuovo ramo attivo.

## Comandi
| Comando | Cosa fa |
|---------|---------|
| `git branch` | Elenca i branch (`*` = quello attivo) |
| `git branch <nome>` | Crea un nuovo branch |
| `git branch -d <nome>` | Cancella un branch (solo se già unito) |
| `git branch -D <nome>` | Forza la cancellazione ⚠️ (`--delete --force`) |
| `git branch -m <nuovo>` | Rinomina il branch corrente |
| `git checkout <nome>` | Cambia branch (vecchio stile) |
| `git switch <nome>` | Cambia branch (moderno, Git ≥ 2.23) |
| `git switch -c <nome>` | Crea e passa subito al nuovo branch |
| `git switch -` | Torna al branch precedente |

## Esempi
```bash
git branch                       # elenco
git branch nuova-funzionalita    # crea
git switch nuova-funzionalita    # ci passa
git switch -c fix-bug            # crea + passa in un colpo solo
git switch -                     # torna al precedente

git branch -m nome-migliore      # rinomina il branch corrente
git branch -m vecchio nuovo      # rinomina indicando vecchio e nuovo nome
```

Cancellare:
```bash
git switch main          # spostarsi su un altro branch prima
git branch -d feature    # cancella se già unito
git branch -D feature    # ⚠️ forza, anche con modifiche non unite (si perde lavoro)
```

## checkout vs switch
Il comando `git checkout` è storicamente ambiguo perché fa due cose molto diverse: cambia branch **e** ripristina file. Proprio per questo, a partire da Git 2.23, le due funzioni sono state separate in comandi distinti: per cambiare branch si usa `git switch`, mentre per ripristinare file si usa `git restore` (si veda [Annullare](08-annullare.md)).

## Errori frequenti
- `error: Cannot delete branch 'X' checked out at ...` — significa che si sta cercando di cancellare proprio il branch su cui ci si trova. Occorre spostarsi prima su un altro branch con `git switch <altro>` e poi ripetere la cancellazione.

## Collegamenti
- [Merge](07-merge.md)
- [Annullare modifiche](08-annullare.md) — detached HEAD, restore
