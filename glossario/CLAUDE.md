# glossario/ — regole specifiche

Vault **catch-all**: raccoglie termini di sviluppo trasversali che non appartengono a un vault tematico (git/javascript/typescript/angular). Regole comuni: vedi [../CLAUDE.md](../CLAUDE.md). Qui solo le specifiche.

Struttura: contenuti in `docs/` raggruppati per **area tematica** (`web-browser.md`, `formati-e-fondamenti.md`, `tooling-javascript.md`, `react.md`, `concetti-programmazione.md`), più `_sidebar.md`, `_coverpage.md`, `README.md` (indice).

## Specifiche di contenuto
- Ogni voce è un titolo `### <Termine>` spiegato nella **voce "professore"** del [root](../CLAUDE.md): prosa **discorsiva**, non una definizione telegrafica da dizionario. Eccezione del vault: resta **contenuta** — è un glossario, non un capitolo — quindi spiegazione breve ma fluida, e quando il termine è già approfondito in un altro vault si dà il minimo e si rimanda lì. I termini/API restano in inglese (backtick per i costrutti di codice).
- Voci ordinate per pertinenza dentro ogni area (non per forza alfabetico).
- **Rimando, non duplicazione**: se un termine è approfondito in un altro vault, la voce dà la definizione breve e linka lì (es. Immutabilità → [[equality-immutability]] del vault Angular). Vale la regola *una fonte di verità* del root.
- **Verifica prima di scrivere**: la fonte (glossario personale) può contenere imprecisioni o nozioni datate → correggere e aggiornare (es. stato di supporto browser di una feature).

## Criterio di ammissione (cosa entra qui)
Un termine va nel glossario generico **solo se** non ha un capitolo-casa in un vault tematico. Se invece esiste il capitolo giusto (es. un concetto di TypeScript), va integrato lì, non qui.

## Diagrammi — visual-first
Il glossario è **visual-first**: dove una voce ha una dimensione visiva — struttura, flusso, gerarchia, relazione spaziale (grafo dei moduli, bundle e chunk, scale di un'API, stack delle chiamate, curve di crescita) — si aggiunge un **SVG inline**, non è opzionale (vedi il principio nel [root](../CLAUDE.md#diagrammi)). Valgono le regole SVG del root: `currentColor`, nessun colore custom (dark-mode safe), escaping di `&`/`<`/`>`, e **verifica obbligatoria in WebKit** (`python3 scripts/svg-preview.py`) prima di committare — resa *e* correttezza, una figura per volta. Stile della casa: `<figure>` + `<svg>` con testo/tratti `fill="currentColor"`, riquadri `fill="var(--bg,#ffffff)"`, accento `fill="var(--link,#78716c)"` con `fill-opacity`, e `<figcaption>` in prosa sotto per ciò che non sta nel disegno.

## Checklist manutenzione (quando aggiungi/rinomini una voce)
- [ ] `_sidebar.md` — l'area tematica esiste / è nell'ordine giusto.
- [ ] `README.md` — la voce è elencata nell'indice dell'area.
- [ ] Rimando a un vault tematico se il termine è già (o va) approfondito altrove.
- [ ] **SVG inline** dove la voce ha una dimensione visiva, verificato in WebKit (resa + correttezza).
