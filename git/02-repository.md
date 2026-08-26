# Repository

Un repository (spesso abbreviato in "repo") è la cartella di un progetto messa sotto il controllo di Git: contiene i file su cui si lavora e, insieme a essi, la cronologia completa di ogni modifica che li ha portati allo stato attuale. Tutto ciò che serve a ricostruire questa storia vive in una sottocartella nascosta chiamata `.git`, dove Git registra i commit, i branch e i tag; è proprio quella cartella a trasformare una comune directory in un repository, ed è per questo che cancellarla significa perdere la storia pur conservando i file. Un repository può essere locale, cioè risiedere sul proprio computer, oppure remoto quando è ospitato su un server come GitHub o GitLab, e le due forme convivono normalmente: si lavora sulla copia locale e la si sincronizza con quella remota.

All'interno di un repository ogni file attraversa alcuni **stati** ben definiti (quelli che `git status` riporta) e sono i comandi a farlo passare dall'uno all'altro. È la mappa da tenere a mente fin da subito; i dettagli di `git add` e `git commit` arrivano nel [capitolo sui commit](03-commit.md).

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 702 150" role="img" aria-label="00-ciclo-vita-file" style="width:100%;max-width:640px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="16" y="44" width="112" height="44" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="72.0" y="64" font-size="11.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Untracked</text><text x="72.0" y="79" font-size="9" text-anchor="middle" font-weight="400" opacity=".65" fill="currentColor">non tracciato</text><rect x="202" y="44" width="112" height="44" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="258.0" y="64" font-size="11.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Staged</text><text x="258.0" y="79" font-size="9" text-anchor="middle" font-weight="400" opacity=".65" fill="currentColor">in staging</text><rect x="388" y="44" width="112" height="44" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="444.0" y="64" font-size="11.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Committed</text><text x="444.0" y="79" font-size="9" text-anchor="middle" font-weight="400" opacity=".65" fill="currentColor">committato</text><rect x="574" y="44" width="112" height="44" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="630.0" y="64" font-size="11.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Modified</text><text x="630.0" y="79" font-size="9" text-anchor="middle" font-weight="400" opacity=".65" fill="currentColor">modificato</text><path d="M128 66.0 L194 66.0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M202 66.0 L194 61.0 L194 71.0 Z" fill="currentColor"/><text x="165.0" y="55.0" font-size="9.5" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor">git add</text><path d="M314 66.0 L380 66.0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M388 66.0 L380 61.0 L380 71.0 Z" fill="currentColor"/><text x="351.0" y="55.0" font-size="9.5" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor">git commit</text><path d="M500 66.0 L566 66.0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M574 66.0 L566 61.0 L566 71.0 Z" fill="currentColor"/><text x="537.0" y="55.0" font-size="9.5" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor">si modifica</text><path d="M630 88 L630 128 L258 128 L258 90" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M258 88 L253 96 L263 96 Z" fill="currentColor"/><text x="444" y="124" font-size="9.5" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor">git add</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Gli stati che <code>git status</code> riporta e come i comandi li fanno passare: <code>git add</code> porta in <strong>staging</strong>, <code>git commit</code> fissa nella storia, una modifica successiva riporta a <strong>modificato</strong>. (Da <em>committato</em> si torna a <em>non tracciato</em> con <code>git rm</code>.)</figcaption>
</figure>

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
