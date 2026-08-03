# Guida a TypeScript

Benvenuti nella guida completa a **TypeScript**, pensata per accompagnare chi parte dai fondamenti fino a padroneggiare le parti più avanzate del type system. I contenuti sono organizzati in sette parti progressive, ognuna suddivisa in pagine tematiche che si possono leggere in sequenza oppure consultare singolarmente. L'[indice completo](docs/00-indice.md) raccoglie tutti i capitoli con un collegamento diretto.

Tutti i contenuti sono validati su **TypeScript 7.0**, la versione stabile più recente. Dove la sintassi o le impostazioni predefinite sono cambiate nel tempo, la guida riporta sempre lo stato attuale del linguaggio.

## Come è organizzata

La barra laterale presenta l'intero indice diviso in parti:

- **Parte 1 — Le basi**: cos'è TypeScript, il compilatore nativo, `tsconfig.json` e la configurazione di un progetto.
- **Parte 2 — I tipi**: tipizzazione statica, tipi primitivi, array, tuple, oggetti, `any`/`unknown`/`never`, union, intersection, alias, literal types ed enum.
- **Parte 3 — Funzioni e classi**: funzioni tipizzate, classi, programmazione a oggetti e interfacce.
- **Parte 4 — Restringere e asserire i tipi**: narrowing, type guards, casting, const assertions, l'operatore `satisfies`, index signatures, optional chaining e nullish coalescing.
- **Parte 5 — Generics e utility types**: componenti riutilizzabili, `const` type parameters, `NoInfer` e trasformazioni di tipo.
- **Parte 6 — Type-level: programmare con i tipi**: `keyof` e `typeof`, mapped types, conditional types e `infer`, template literal types.
- **Parte 7 — Avanzate ed ecosistema**: decorators, gestione delle risorse con `using`, moduli, namespaces e integrazione con librerie di terze parti.

## Quiz di verifica

Ogni pagina si chiude con una sezione **Domande**: le risposte sono nascoste in blocchi a scomparsa. Conviene formulare mentalmente la propria risposta prima di espanderle, così da verificare davvero la comprensione dell'argomento.

<details>
<summary>Esempio di quiz — clic per rivelare la risposta</summary>

Questo è l'aspetto di una risposta nascosta. Le risposte vengono mostrate solo dopo il clic, per favorire l'auto-valutazione.
</details>

## Convenzioni

- I termini tecnici (type inference, narrowing, generics, ecc.) restano in lingua originale, perché sono lo standard de facto della comunità.
- Tutti gli esempi di codice sono in TypeScript e seguono la sintassi di TypeScript 7.0.

Buona lettura. Si può iniziare dalla prima sezione: [Introduzione](docs/01-introduzione.md), oppure consultare l'[indice completo](docs/00-indice.md).
