# Annullare modifiche

Annullare in Git non è un'operazione sola: esistono tre comandi principali (`restore`, `reset` e `revert`), ciascuno con uno scopo diverso. Quale sia quello giusto dipende soprattutto da due domande: se le modifiche sono già state salvate in un commit oppure no, e se quel commit è già stato condiviso (pushato) oppure è ancora solo locale.

## Detached HEAD
Ci si ritrova in stato di "detached HEAD" (HEAD staccato) spostandosi direttamente su un commit specifico anziché su un branch: in quella condizione `HEAD` punta a un singolo commit invece che a un ramo.

```bash
git checkout a1b2c3d     # HEAD staccato sul commit a1b2c3d
```
⚠️ I nuovi commit creati in questo stato non sono legati ad alcun branch, quindi rischiano di andare persi non appena si cambia ramo. Per tornare a lavorare normalmente ci si riaggancia a un branch:
```bash
git switch main          # ri-aggancia HEAD a un branch
```
Per salvare il lavoro fatto in detached HEAD, creare un branch prima di uscire:
```bash
git switch -c nuovo-branch
```

## git restore
Il comando `git restore` annulla le modifiche ai file nel working directory, riportandoli a una versione precedente — di norma quella dell'ultimo commit. Serve a buttare via il lavoro in corso su uno o più file quando si è deciso di non tenerlo.

| Comando | Effetto |
|---------|---------|
| `git restore <file>` | Scarta le modifiche non salvate sul file (torna a HEAD) ⚠️ |
| `git restore .` | Scarta tutte le modifiche non salvate ⚠️ |
| `git restore --staged <file>` | Toglie il file dalla staging area (modifiche restano) |
| `git restore --source=<hash> <file>` | Riporta il file alla versione di un commit |

```bash
git restore app.js                      # scarta le modifiche su app.js
git restore --staged app.js             # toglie da staging (modifiche restano)
git restore --source=a1b2c3d app.js     # versione di app.js da quel commit
```
⚠️ Le modifiche scartate in questo modo **non** sono recuperabili, a meno che non fossero già state salvate in un commit.

## git reset
Il comando `git reset` sposta `HEAD` indietro nella storia e, a seconda dell'opzione scelta, agisce anche sulla staging area e sul working directory. Lo si usa per annullare uno o più commit oppure, in forma più mite, per togliere file dalla staging.

| Comando | history | staging | working dir |
|---------|---------|---------|-------------|
| `git reset --soft HEAD~1` | indietro di 1 | invariata (modifiche pronte) | invariato |
| `git reset --mixed HEAD~1` (default) | indietro di 1 | svuotata | invariato |
| `git reset --hard HEAD~1` ⚠️ | indietro di 1 | svuotata | **modifiche cancellate** |
| `git reset <file>` | — | toglie il file dalla staging | invariato |

```bash
git reset --soft HEAD~1     # annulla il commit, tieni tutto pronto in staging
git reset HEAD~1            # (mixed) annulla il commit, modifiche nel working dir
git reset --hard HEAD~1     # ⚠️ annulla il commit E cancella le modifiche
git reset app.js           # toglie app.js dalla staging
```
⚠️ L'opzione `--hard` elimina in modo definitivo le modifiche non salvate. Inoltre un `reset` su commit già pushati riscrive la storia condivisa, quindi è da evitare: in quel caso si usa `revert`.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 560 168" role="img" aria-label="05-reset-tre-aree" style="width:100%;max-width:600px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><text x="6" y="68" font-size="10" text-anchor="start" font-weight="400" opacity=".8" fill="currentColor">history</text><text x="6" y="108" font-size="10" text-anchor="start" font-weight="400" opacity=".8" fill="currentColor">staging</text><text x="6" y="148" font-size="10" text-anchor="start" font-weight="400" opacity=".8" fill="currentColor">working dir</text><text x="115" y="40" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">git reset --soft</text><rect x="70" y="50" width="90" height="26" rx="5" fill="var(--link,#059669)" fill-opacity=".18" stroke="currentColor" stroke-width="1.6"/><text x="115" y="67" font-size="9.5" text-anchor="middle" font-weight="400" opacity=".9" fill="currentColor">azzera</text><rect x="70" y="90" width="90" height="26" rx="5" fill="none" fill-opacity="1" stroke="currentColor" stroke-width="1.6"/><text x="115" y="107" font-size="9.5" text-anchor="middle" font-weight="400" opacity=".5" fill="currentColor">invariato</text><rect x="70" y="130" width="90" height="26" rx="5" fill="none" fill-opacity="1" stroke="currentColor" stroke-width="1.6"/><text x="115" y="147" font-size="9.5" text-anchor="middle" font-weight="400" opacity=".5" fill="currentColor">invariato</text><text x="295" y="40" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">git reset --mixed  (default)</text><rect x="250" y="50" width="90" height="26" rx="5" fill="var(--link,#059669)" fill-opacity=".18" stroke="currentColor" stroke-width="1.6"/><text x="295" y="67" font-size="9.5" text-anchor="middle" font-weight="400" opacity=".9" fill="currentColor">azzera</text><rect x="250" y="90" width="90" height="26" rx="5" fill="var(--link,#059669)" fill-opacity=".18" stroke="currentColor" stroke-width="1.6"/><text x="295" y="107" font-size="9.5" text-anchor="middle" font-weight="400" opacity=".9" fill="currentColor">azzera</text><rect x="250" y="130" width="90" height="26" rx="5" fill="none" fill-opacity="1" stroke="currentColor" stroke-width="1.6"/><text x="295" y="147" font-size="9.5" text-anchor="middle" font-weight="400" opacity=".5" fill="currentColor">invariato</text><text x="495" y="40" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">git reset --hard  ⚠️</text><rect x="450" y="50" width="90" height="26" rx="5" fill="var(--link,#059669)" fill-opacity=".18" stroke="currentColor" stroke-width="1.6"/><text x="495" y="67" font-size="9.5" text-anchor="middle" font-weight="400" opacity=".9" fill="currentColor">azzera</text><rect x="450" y="90" width="90" height="26" rx="5" fill="var(--link,#059669)" fill-opacity=".18" stroke="currentColor" stroke-width="1.6"/><text x="495" y="107" font-size="9.5" text-anchor="middle" font-weight="400" opacity=".9" fill="currentColor">azzera</text><rect x="450" y="130" width="90" height="26" rx="5" fill="var(--link,#059669)" fill-opacity=".18" stroke="currentColor" stroke-width="1.6"/><text x="495" y="147" font-size="9.5" text-anchor="middle" font-weight="400" opacity=".9" fill="currentColor">azzera</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem"><code>git reset</code> e le tre aree: <code>--soft</code> sposta solo <code>HEAD</code> (history), <code>--mixed</code> (default) svuota anche la <strong>staging</strong>, <code>--hard</code> azzera pure il <strong>working directory</strong> (⚠️ modifiche perse).</figcaption>
</figure>

## git revert
Il comando `git revert` annulla uno o più commit **creando un nuovo commit** che ne inverte le modifiche, invece di rimuoverli dalla storia. La cronologia non viene toccata: al commit indesiderato se ne aggiunge un altro che lo neutralizza, ed è proprio questo a renderlo l'opzione sicura quando i commit sono già stati condivisi.

```bash
git revert HEAD            # annulla l'ultimo commit
git revert a1b2c3d         # annulla un commit specifico
```
> [!tip|label:Sicuro sui repository condivisi]
> `git revert` non riscrive la storia: è l'opzione sicura per i commit già pushati.

## reset vs revert (quale usare?)
La regola pratica per scegliere è semplice: se il commit è ancora solo locale e non è stato pushato, si può usare `reset`; se invece è già stato pushato o comunque condiviso con altri, si usa `revert`.

## Collegamenti
- [Commit](03-commit.md)
- [Interni di Git](12-interni-git.md) — `reflog` per recuperare dopo un `reset --hard`
- Ricette pronte: [Playbook](playbook.md)
