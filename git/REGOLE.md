# Regole degli appunti

Ogni file di appunti deve rispettare queste regole per essere affidabile.
Sono il filtro usato in fase di validazione e correzione.

## Le 10 regole

1. **Comandi verificati** — nessun comando o flag inventato; sintassi reale di Git.
2. **Safe vs Destructive** — ogni comando che riscrive la storia o perde dati è marcato con ⚠️.
3. **Effetto esplicito** — ogni operazione di "annullamento" dice cosa succede a *working directory*, *staging area* e *history*.
4. **Versione** — si segnala se un comando dipende dalla versione di Git (es. `switch`/`restore` da 2.23).
5. **Esempi runnable** — gli esempi sono copia-incolla funzionanti, con contesto chiaro (stato del repo prima e dopo).
6. **Terminologia unica** — stessi termini ovunque; la fonte è il [glossario](glossario.md).
7. **Una fonte di verità** — un concetto è spiegato in un solo punto; gli altri file rimandano con un link.
8. **Fonte sui claim non ovvi** — affermazioni non banali hanno un link alla documentazione ufficiale di Git.
9. **Linguaggio semplice** — parole comuni; niente vocaboli ricercati se non indispensabili.
10. **Registro impersonale** — teoria in forma impersonale ("si usa `git commit`..."); i passi delle ricette all'infinito/imperativo ("Eseguire `git revert`..."). Mai "io"; "tu" evitato.

## Scheletro di un file topic

```markdown
# <Titolo>

## Concetto
Cosa è e perché, 2–4 righe.

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

## File errori.md

Indice di triage per messaggi di errore: ogni voce quota il **messaggio esatto**
come lo stampa Git (regola 1), poi causa, fix e link al topic. La spiegazione
completa resta nel topic (regola 7); `errori.md` è solo l'accesso rapido a partire
dal messaggio. Differenza con il [playbook](playbook.md): il playbook parte da
"voglio fare X", `errori.md` parte da "ho ricevuto il messaggio Y".
