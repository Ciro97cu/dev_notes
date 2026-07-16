# glossario/ — regole specifiche

Vault **catch-all**: raccoglie termini di sviluppo trasversali che non appartengono a un vault tematico (git/javascript/typescript/angular). Regole comuni: vedi [../CLAUDE.md](../CLAUDE.md). Qui solo le specifiche.

Struttura: contenuti in `docs/` raggruppati per **area tematica** (`web-browser.md`, `formati-e-fondamenti.md`, `tooling-javascript.md`, `react.md`, `concetti-programmazione.md`), più `_sidebar.md`, `_coverpage.md`, `README.md` (indice).

## Specifiche di contenuto
- Ogni voce è un titolo `### <Termine>` con definizione concisa; i termini/API restano in inglese (backtick per i costrutti di codice).
- Voci ordinate per pertinenza dentro ogni area (non per forza alfabetico).
- **Rimando, non duplicazione**: se un termine è approfondito in un altro vault, la voce dà la definizione breve e linka lì (es. Immutabilità → [[equality-immutability]] del vault Angular). Vale la regola *una fonte di verità* del root.
- **Verifica prima di scrivere**: la fonte (glossario personale) può contenere imprecisioni o nozioni datate → correggere e aggiornare (es. stato di supporto browser di una feature).

## Criterio di ammissione (cosa entra qui)
Un termine va nel glossario generico **solo se** non ha un capitolo-casa in un vault tematico. Se invece esiste il capitolo giusto (es. un concetto di TypeScript), va integrato lì, non qui.

## Checklist manutenzione (quando aggiungi/rinomini una voce)
- [ ] `_sidebar.md` — l'area tematica esiste / è nell'ordine giusto.
- [ ] `README.md` — la voce è elencata nell'indice dell'area.
- [ ] Rimando a un vault tematico se il termine è già (o va) approfondito altrove.
