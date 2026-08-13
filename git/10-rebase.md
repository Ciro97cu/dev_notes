# Rebase

Il rebase prende i commit di un branch e li riapplica uno dopo l'altro sopra un'altra base, di solito la punta di `main`. Nel farlo riscrive la storia del ramo per renderla **lineare**, come se quel lavoro fosse partito fin dall'inizio dalla nuova base anziché da quella vecchia.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 660 158" role="img" aria-label="04-rebase-prima-dopo" style="width:100%;max-width:660px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><text x="120" y="22" font-size="12" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">prima</text><line x1="40" y1="110" x2="110" y2="110" stroke="currentColor" stroke-width="1.6"/><line x1="110" y1="110" x2="180" y2="110" stroke="currentColor" stroke-width="1.6"/><line x1="110" y1="110" x2="180" y2="55" stroke="currentColor" stroke-width="1.6"/><line x1="180" y1="55" x2="250" y2="55" stroke="currentColor" stroke-width="1.6"/><circle cx="40" cy="110" r="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><circle cx="110" cy="110" r="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><circle cx="180" cy="110" r="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><circle cx="180" cy="55" r="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><circle cx="250" cy="55" r="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><rect x="159" y="121" width="41" height="22" rx="5" fill="var(--link,#f05133)" fill-opacity=".14" stroke="currentColor" stroke-width="1.2"/><text x="180" y="136" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">main</text><rect x="219" y="24" width="62" height="22" rx="5" fill="var(--link,#f05133)" fill-opacity=".14" stroke="currentColor" stroke-width="1.2"/><text x="250" y="39" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">feature</text><line x1="300" y1="20" x2="300" y2="150" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 3"/><text x="470" y="22" font-size="12" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">dopo</text><line x1="330" y1="90" x2="400" y2="90" stroke="currentColor" stroke-width="1.6"/><line x1="400" y1="90" x2="470" y2="90" stroke="currentColor" stroke-width="1.6"/><line x1="470" y1="90" x2="540" y2="90" stroke="currentColor" stroke-width="1.6"/><line x1="540" y1="90" x2="610" y2="90" stroke="currentColor" stroke-width="1.6"/><circle cx="330" cy="90" r="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><circle cx="400" cy="90" r="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><circle cx="470" cy="90" r="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><circle cx="540" cy="90" r="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><circle cx="610" cy="90" r="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><rect x="449" y="101" width="41" height="22" rx="5" fill="var(--link,#f05133)" fill-opacity=".14" stroke="currentColor" stroke-width="1.2"/><text x="470" y="116" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">main</text><rect x="579" y="57" width="62" height="22" rx="5" fill="var(--link,#f05133)" fill-opacity=".14" stroke="currentColor" stroke-width="1.2"/><text x="610" y="72" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">feature</text><text x="575" y="112" font-size="9" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">(hash nuovi)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem"><strong>Rebase</strong>: i commit di <code>feature</code> vengono ricollocati (con <strong>hash nuovi</strong>) sopra la punta di <code>main</code>, ottenendo una storia lineare.</figcaption>
</figure>

Lo si usa principalmente in due situazioni. La prima è aggiornare un feature branch con le ultime modifiche di `main` senza introdurre un merge commit, mantenendo così una cronologia pulita. La seconda è riordinare la propria storia — accorpando, riscrivendo o riordinando i commit — prima di aprire una pull request.

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
La differenza tra i due approcci sta in cosa fanno alla storia. Il **merge** unisce le storie dei due rami e, quando serve, crea un merge commit, preservando la cronologia originale così com'è avvenuta. Il **rebase** invece riscrive quella storia rendendola lineare e pulita, ma nel farlo **cambia gli hash** dei commit del feature branch, che di fatto diventano commit nuovi.

## Quando NON usarlo

> [!warning]
> - Su branch già pubblici e usati da altri, perché riscrivere la storia crea problemi a chi ha già basato il proprio lavoro su quei commit.
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
