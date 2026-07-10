# Branch

## Concetto
Un branch (ramo) è una linea di sviluppo parallela. Permette di lavorare su nuove
funzionalità o fix senza toccare il codice principale. Più persone lavorano in
parallelo e poi uniscono (merge) il lavoro.

## master e main
Storicamente il branch principale si chiamava `master`. Lo standard attuale è
`main`. Stesso concetto: il ramo principale, la versione ufficiale e stabile.

## HEAD
`HEAD` è un puntatore che indica su quale branch (o commit) si sta lavorando ora.
Un segnalibro: "Git lavora qui". Cambiando branch, `HEAD` si sposta.

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
`git checkout` fa due cose (cambia branch **e** ripristina file) → ambiguo. Da Git
2.23 le funzioni sono separate:
- cambiare branch → `git switch`
- ripristinare file → `git restore` (vedi [Annullare](08-annullare.md))

## Errori frequenti
- `error: Cannot delete branch 'X' checked out at ...` → si è sul branch da
  cancellare. Spostarsi prima con `git switch <altro>`.

## Collegamenti
- [Merge](07-merge.md)
- [Annullare modifiche](08-annullare.md) — detached HEAD, restore
