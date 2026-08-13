# Branch

Un branch (in italiano "ramo") è una linea di sviluppo parallela e indipendente all'interno dello stesso repository. Serve a lavorare su una nuova funzionalità o su una correzione tenendola isolata dal codice principale, che resta intatto finché il lavoro non è pronto. È anche il meccanismo che rende possibile la collaborazione: più persone possono procedere ognuna sul proprio ramo e poi riunire i rispettivi contributi con un'operazione di merge.

## master e main
Storicamente il branch principale di un repository si chiamava `master`, mentre lo standard adottato oggi è `main`. Il nome è cambiato ma il concetto è lo stesso: si tratta del ramo di riferimento, quello che custodisce la versione ufficiale e stabile del progetto.

## HEAD
`HEAD` è il puntatore che indica su quale branch (o, più raramente, su quale commit) si sta lavorando in questo momento. Lo si può immaginare come un segnalibro che dice a Git "il lavoro corrente è qui": ogni volta che si cambia branch, `HEAD` si sposta a seguire il nuovo ramo attivo.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 460 170" role="img" aria-label="02-branch-head" style="width:100%;max-width:480px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><line x1="70" y1="120" x2="160" y2="120" stroke="currentColor" stroke-width="1.6"/><line x1="160" y1="120" x2="240" y2="120" stroke="currentColor" stroke-width="1.6"/><line x1="160" y1="120" x2="240" y2="60" stroke="currentColor" stroke-width="1.6"/><line x1="240" y1="60" x2="330" y2="60" stroke="currentColor" stroke-width="1.6"/><circle cx="70" cy="120" r="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><circle cx="160" cy="120" r="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><circle cx="240" cy="120" r="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><circle cx="240" cy="60" r="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><circle cx="330" cy="60" r="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><rect x="219" y="131" width="41" height="22" rx="5" fill="var(--link,#f05133)" fill-opacity=".14" stroke="currentColor" stroke-width="1.2"/><text x="240" y="146" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">main</text><rect x="295" y="29" width="62" height="22" rx="5" fill="var(--link,#f05133)" fill-opacity=".14" stroke="currentColor" stroke-width="1.2"/><text x="326" y="44" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">feature</text><rect x="389" y="29" width="41" height="22" rx="5" fill="var(--link,#f05133)" fill-opacity=".14" stroke="currentColor" stroke-width="1.2"/><text x="410" y="44" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">HEAD</text><line x1="388" y1="40" x2="368" y2="40" stroke="currentColor" stroke-width="1.5"/><path d="M368 36 L362 40 L368 44 Z" fill="currentColor"/></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Ogni commit punta al precedente; un <strong>branch</strong> è un'etichetta sull'ultimo commit e <code>HEAD</code> indica il ramo attivo — qui <code>feature</code>.</figcaption>
</figure>

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
