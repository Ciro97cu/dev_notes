# git/ — regole specifiche

Appunti Git, da zero ad avanzato. Regole comuni: vedi [../CLAUDE.md](../CLAUDE.md). Qui solo le specifiche del vault.

Struttura: file topic numerati **flat nella root** (`01-*.md` … `16-*.md`) + file di supporto (`glossario.md`, `playbook.md`, `errori.md`) + `_sidebar.md`, `README.md`.

## Le 10 regole di qualità
Ogni file di appunti deve rispettarle: sono il filtro usato in validazione e correzione.

1. **Comandi verificati** — nessun comando o flag inventato; sintassi reale di Git.
2. **Safe vs Destructive** — ogni comando che riscrive la storia o perde dati è marcato con ⚠️.
3. **Effetto esplicito** — ogni operazione di "annullamento" dice cosa succede a *working directory*, *staging area* e *history*.
4. **Versione** — si segnala se un comando dipende dalla versione di Git (es. `switch`/`restore` da 2.23).
5. **Esempi runnable** — copia-incolla funzionanti, con contesto chiaro (stato del repo prima e dopo).
6. **Terminologia unica** — stessi termini ovunque; la fonte è [glossario.md](glossario.md).
7. **Una fonte di verità** — un concetto è spiegato in un solo punto; gli altri file rimandano con un link.
8. **Fonte sui claim non ovvi** — affermazioni non banali hanno un link alla documentazione ufficiale di Git.
9. **Linguaggio semplice** — parole comuni; niente vocaboli ricercati se non indispensabili.
10. **Registro impersonale** — teoria in forma impersonale ("si usa `git commit`…"); i passi delle ricette all'infinito/imperativo ("Eseguire `git revert`…").

## Tono e chiarezza
Vale la **voce "professore"** del [root](../CLAUDE.md): la **spiegazione** (regola 9) va in prosa narrativa e distesa, non telegrafica. Eccezione del vault: i **comandi** restano in tabella (comando/effetto) e i **passi delle ricette** all'infinito/imperativo (regola 10) — la prosa narrativa è la teoria *attorno* ai comandi, non i comandi stessi.

## Scheletro di un file topic

```markdown
# <Titolo>

## Concetto
Cosa è e perché, in **prosa narrativa e distesa** (non 2-4 righe telegrafiche).

## Comandi
| Comando | Cosa fa |
|---------|---------|
| ...     | ...     |

## Esempi
Blocchi bash commentati.

## Casi comuni
Situazioni reali; le versioni "secche" stanno anche nel playbook.

## Errori frequenti
Errore quotato esatto + come si risolve.

## Collegamenti
Link ad altri file di appunti.
```

Le sezioni vuote per un dato topic si possono omettere: non vanno riempite a forza.

## File di supporto
- **`glossario.md`** — termini Git (EN) spiegati in IT semplice; è la fonte terminologica (regola 6).
- **`playbook.md`** — ricette pronte: "voglio fare X" → comandi esatti.
- **`errori.md`** — triage per messaggio: ogni voce quota il **messaggio esatto** come lo stampa Git (regola 1), poi causa, fix e link al topic. La spiegazione completa resta nel topic (regola 7). Differenza col playbook: il playbook parte da "voglio fare X", `errori.md` da "ho ricevuto il messaggio Y".

## Commit
Stile [Conventional Commits](https://www.conventionalcommits.org/) (`docs:`, `fix:`, …).

## Checklist manutenzione (quando aggiungi/rinomini una nota)
- [ ] `_sidebar.md` — voce nell'ordine giusto.
- [ ] `README.md` — riga nell'"Indice topic".
- [ ] `glossario.md` — nuovi termini EN introdotti (regola 6).
- [ ] `errori.md` — se il topic tratta errori con messaggio esatto.
- [ ] Link incrociati dai/ai topic correlati (regola 7).
