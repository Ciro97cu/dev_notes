# typescript/ — regole specifiche

Guida a TypeScript, dai fondamenti al type system avanzato, in sette parti. Regole comuni: vedi [../CLAUDE.md](../CLAUDE.md). Qui solo le specifiche del vault.

Struttura: contenuti **flat** in `docs/` (`00-indice.md`, `01-*.md` … `32-*.md` + `risorse.md`), più `assets/`, `_sidebar.md`, `README.md`.

## Specifiche di contenuto
- Tutti gli esempi validati su **TypeScript 7.0** (versione stabile di riferimento). Dove sintassi o default sono cambiati nel tempo, riportare sempre lo stato attuale del linguaggio.
- Termini tecnici EN (type inference, narrowing, generics, …) **non tradotti**: standard de facto della comunità.

## Struttura di ogni capitolo
- **Spiegazione** con esempi in TypeScript (sintassi TS 7.0).
- Chiusura con sezione **Domande**: risposte nascoste in blocchi `<details>` per l'auto-valutazione.

## Checklist manutenzione (quando aggiungi/rinomini una nota)
- [ ] `_sidebar.md` — voce nella parte e nell'ordine giusto.
- [ ] `README.md` e `docs/00-indice.md` — se cambia l'indice delle sette parti.
- [ ] Sezione **Domande** (`<details>`) a fine capitolo.
