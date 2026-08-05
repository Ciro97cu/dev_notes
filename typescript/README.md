# Indice completo

Guida a **TypeScript 7.0** in sette parti progressive. I capitoli si possono leggere in sequenza, come percorso dai fondamenti al type system avanzato, oppure consultare singolarmente. Ogni pagina si chiude con una sezione **Domande** per l'auto-valutazione.

> Appunti personali di studio, verificati sulla documentazione ufficiale di [TypeScript](https://www.typescriptlang.org/docs/).

## Parte 1 — Le basi

- [1. Introduzione](docs/01-introduzione.md) — cos'è TypeScript, il rapporto con JavaScript e il ruolo del type checking.
- [2. Il compilatore](docs/02-compilatore.md) — `tsc`, il compilatore nativo di TypeScript 7 e la compilazione di file e progetti.
- [3. tsconfig.json](docs/03-tsconfig.md) — le opzioni del compilatore e i valori predefiniti moderni.
- [4. Configurare un progetto](docs/04-progetto.md) — impostare un progetto reale con tooling attuale.

## Parte 2 — I tipi

- [5. Tipizzazione statica e inferenza](docs/05-tipi-statici-inferenza.md) — annotazioni esplicite e tipi dedotti dal compilatore.
- [6. Tipi primitivi](docs/06-primitivi.md) — `string`, `number`, `boolean`, `bigint`, `symbol`, `null` e `undefined`.
- [7. Array e tuple](docs/07-array-tuple.md) — collezioni omogenee e tuple a lunghezza e tipi fissati.
- [8. Oggetti](docs/08-oggetti.md) — tipi degli oggetti, proprietà opzionali e `readonly`.
- [9. any, unknown, never](docs/09-any-unknown-never.md) — i tre tipi speciali e quando usarli.
- [10. Union e intersection types](docs/10-union-intersection.md) — combinare i tipi con `|` e `&`.
- [11. Type alias](docs/11-type-alias.md) — dare un nome a un tipo con `type`.
- [12. Literal types](docs/12-literal-types.md) — tipi che ammettono un solo valore.
- [13. enum](docs/13-enum.md) — insiemi di costanti nominate.

## Parte 3 — Funzioni e classi

- [14. Funzioni](docs/14-funzioni.md) — parametri, valori di ritorno, overload e tipi funzione.
- [15. Classi](docs/15-classi.md) — campi, modificatori di accesso e inizializzazione.
- [16. Programmazione a oggetti](docs/16-oop.md) — ereditarietà, classi astratte e polimorfismo.
- [17. Interfaces](docs/17-interfaces.md) — descrivere la forma di un oggetto e i contratti.

## Parte 4 — Restringere e asserire i tipi

- [18. Narrowing e type guards](docs/18-narrowing.md) — restringere un tipo tramite il control flow e i type predicate.
- [19. Type casting e const assertions](docs/19-casting.md) — le type assertion e `as const`.
- [20. L'operatore satisfies](docs/20-satisfies.md) — verificare un valore contro un tipo senza allargarlo.
- [21. Index signatures](docs/21-index-signatures.md) — tipizzare oggetti con chiavi dinamiche.
- [22. Optional chaining e nullish coalescing](docs/22-optional-chaining-nullish.md) — accedere in sicurezza a valori potenzialmente assenti.

## Parte 5 — Generics e utility types

- [23. Generics](docs/23-generics.md) — componenti riutilizzabili, vincoli, `const` type parameters e `NoInfer`.
- [24. Utility types](docs/24-utility-types.md) — `Partial`, `Pick`, `Record` e le altre trasformazioni della standard library.

## Parte 6 — Type-level: programmare con i tipi

- [25. keyof e typeof](docs/25-keyof-typeof.md) — gli operatori a livello di tipo per interrogare chiavi e valori.
- [26. Mapped types](docs/26-mapped-types.md) — costruire tipi iterando sulle chiavi di un altro tipo.
- [27. Conditional types e infer](docs/27-conditional-types.md) — tipi che dipendono da una condizione ed estrazione con `infer`.
- [28. Template literal types](docs/28-template-literal-types.md) — comporre e manipolare tipi stringa.

## Parte 7 — Avanzate ed ecosistema

- [29. Decorators](docs/29-decorators.md) — i decorator standard di ECMAScript (Stage 3).
- [30. Gestione delle risorse: using](docs/30-resource-management.md) — `using` e `await using` per il rilascio deterministico.
- [31. Moduli e namespaces](docs/31-moduli-namespaces.md) — import/export, import attributes e il ruolo legacy dei namespace.
- [32. Librerie di terze parti e tipi](docs/32-librerie-tipi.md) — pacchetti `@types` e dichiarazioni di modulo.

---

- [Risorse](docs/risorse.md) — documentazione ufficiale, playground e riferimenti per restare aggiornati.
