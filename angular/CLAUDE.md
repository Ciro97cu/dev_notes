# angular/ — regole specifiche

**Vault Obsidian**. Appunti di studio sul libro *Modern Angular* (**3ª edizione**, v3.0.0 — aggiornata ad **Angular 22**). Regole comuni: vedi [../CLAUDE.md](../CLAUDE.md). Qui solo le specifiche del vault.

Fonte: `modern-angular_v3_0_0.pdf` (in locale, `.gitignore`d). I numeri di pagina dei riferimenti sono i **numeri stampati sul libro** (il page-label che il viewer mostra aprendo il PDF), **non** l'indice sequenziale del reader. Il PDF ha 12 pagine di front matter, quindi: **stampato = reader − 12**. L'outline in [`_meta/book-outline.txt`](_meta/book-outline.txt) è invece in numeri **reader** (1–467): per leggere col Read tool / `r.pages[N-1]` una pagina stampata `P`, usare `reader = P + 12`.

> [!info] Versioning del vault
> Gli appunti seguono la **v3.0.0** (Angular 22). Le feature introdotte con Angular 21.1/21.2/22 sono marcate con un callout `> [!info] Angular 22+` e il tag `angular-22` nel frontmatter → filtrabili in search/graph. Dove un vecchio snippet mostra ancora `@Injectable({ providedIn: 'root' })`, leggilo come [[service|@Service()]].

## Tono e chiarezza (registro professore)
Gli appunti spiegano come farebbe **un professore appassionato e chiaro** a uno studente alle prime armi: prosa **fluida e distesa**, non telegrafica. Fonte di verità del contenuto: sempre il PDF (v3.0.0). Esempio di riferimento del tono: [`concetti/signal.md`](concetti/signal.md).
- **Registro impersonale** rigoroso: *"si legge"*, *"si usa"*, *"conviene"*. **Mai** la seconda persona (*"leggi"*, *"usi"*, *"puoi"*, *"vuoi"*) né l'imperativo nella teoria (l'imperativo resta ammesso solo nei passi operativi di una ricetta).
- **Ogni sezione/nota apre con una frase-definizione in parole semplici** (cos'è e a cosa serve) prima dei dettagli. Evitare gli incipit telegrafici senza verbo (es. *"Primitiva di stato reattivo scrivibile."*).
- **Ogni tecnicismo si introduce spiegandolo** la prima volta, con parole comuni; niente gergo non necessario. La **profondità tecnica e i termini corretti restano**: accessibile è *come* si spiega, non *quanto* si taglia.
- **Niente `→` come connettivo di prosa**, né frasi spezzate in elenco quando serve un periodo: le relazioni si esprimono con congiunzioni (*"così"*, *"quindi"*, *"perché"*, *"invece"*).

## Struttura
```
README.md            home = indice completo: mappa dei 19 capitoli + concetti + cert
capitoli/            1 nota-hub per capitolo (filename inglesi numerati a 2 cifre)
concetti/            note atomiche sui concetti cardine ricorrenti
cert/                prep certificazione: Angular *classico* non coperto dal libro (vedi sotto)
assets/              immagini
_meta/               book-outline.txt + glossario.md (meta, non sono appunti)
```
Modello **ibrido**: la nota-capitolo è l'hub e contiene il grosso; le note atomiche (`concetti/`) esistono solo per i concetti davvero centrali e ricorrenti, e si linkano da più capitoli.

## Naming file capitoli
`NN-kebab-title-inglese.md` con NN = numero capitolo a 2 cifre. Mappa:
- 01-getting-started
- 02-signal-based-components
- 03-reactive-design-with-signals
- 04-router-navigation-lazy-loading
- 05-state-management-services-signals
- 06-signal-forms
- 07-testing-with-vitest
- 08-sustainable-architectures
- 09-ngrx-signal-store
- 10-signal-queries-component-communication
- 11-directives-templates-containers
- 12-initialization-route-changes
- 13-hashbrown-agentic-ui
- 14-monorepos-libraries
- 15-internationalization
- 16-authentication-authorization
- 17-defer-ssr-hydration
- 18-micro-frontends
- 19-forensic-architecture-analysis

## Concetti atomici disponibili (in `concetti/`) — linkare con `[[nome]]`
signal · computed · effect · linked-signal · debounced · resource · untracked · reactive-context · equality-immutability · signal-input · signal-output · model-signal · two-way-binding · content-projection · signal-queries · inject · injection-context · providers · lightweight-store · delegated-signal · service

## Template nota-capitolo
```markdown
---
capitolo: N
titolo: "<Titolo inglese>"
pagine: "<start>-<end>"
tags: [tipo/capitolo, <tematici>]
---
# NN · <Titolo inglese>
> cap.N · pp.<start>-<end> — *Modern Angular* v3.0.0

<Intro/contesto breve: cosa copre il capitolo e perché conta.>

## <Sezione>
> pp.<x>-<y>

<Prosa breve in italiano.>

```ts
// snippet commentato, re-indentato
```

> [!warning]
> <punto insidioso>

> [!tip]
> <cosa ricordare>

Collegamenti: [[concetto]], [[NN-altro-capitolo]]

## Ripasso lampo

**1.** <domanda>
> [!success]- Risposta
> <risposta concisa>

**2.** <domanda>
> [!success]- Risposta
> <risposta concisa>

(3-6 domande di autovalutazione, ognuna con la risposta in callout pieghevole)

**In sintesi:** <2-4 bullet con i punti chiave.>
```

## Fedeltà alla struttura del PDF (heading & prosa)
Gli appunti **ricalcano l'outline del PDF**, capitolo per capitolo (il **cap.16** è il riferimento):
- **Heading = titoli di sezione del PDF, in inglese**: `##` per le sezioni principali, `###` per le sottosezioni concettuali. Non appiattire più sottosezioni sotto un unico `##`.
- **`**bold**` è solo enfasi** di un termine nella prosa, **mai** un surrogato di titolo: se nel PDF quel blocco ha un titolo, va promosso a `###`.
- **Prosa, non elenchi puntati**: i bullet (o una tabella) si usano **solo** per enumerazioni vere (verbi HTTP, valori ammessi, stati). Mai per spiegare un singolo concetto o una catena di ragionamento, che nel PDF è prosa.
- **Granularità concettuale**: un heading per ogni sottosezione del PDF che porta un concetto; i passi di pura procedura/scaffolding di progetto si fondono nella prosa (o si omettono se superflui), senza titolo dedicato.

## Template nota atomica (`concetti/`)
```markdown
---
titolo: "<nome API/concetto>"
tags: [tipo/concetto, <tematico>]
aliases: [<sinonimi/varianti>]
---
# <nome>

<Definizione concisa in 2-4 righe.>

```ts
// snippet minimo
```

> [!warning]
> <insidia tipica>

**Usato in:** [[NN-capitolo]], [[NN-capitolo]]
```

## Sezione `cert/` — prep certificazione (Angular classico)
Appunti per la **cert Angular** di certificates.dev (target Senior). Coprono **solo** l'Angular *classico/legacy* che l'esame richiede e che **non** è nel libro *Modern Angular* (NgModules, template-driven & reactive forms, RxJS, DI e routing class-based, change detection con Zone.js, NgRx Redux, testing Jasmine/Karma, perf, security).
- **Anti-duplicazione (regola dura)**: se un tema è già spiegato nei capitoli moderni, **non si riscrive** → si rimanda con `> [!info] vs Modern`. Fonte: [certificates.dev](https://certificates.dev/angular) + angular.dev / rxjs.dev / ngrx.io.
- **Naming**: `cert/<topic-kebab>.md` (inglese), più `cert/00-index.md` (MOC + checklist spuntabile + link ai capitoli per i temi). NON usano il template capitolo (niente `pp.`).
- **Template nota cert**: frontmatter `titolo`/`tags: [tipo/cert, <tematici>, legacy]`/`livello`; `> Cert Angular · ...`; concept 2-4 righe; sezioni con esempio classico re-indentato; `> [!warning]` insidie d'esame; `> [!info] vs Modern` (link al capitolo moderno); `> [!info] Stato attuale` (deprecazione/default odierno + link); chiusura con **Ripasso lampo** e **In sintesi:**.
- **Manutenzione**: aggiungendo una nota `cert/`, aggiornare `cert/00-index.md` e la sezione `Cert` di `_sidebar.md`.

## Callout
- `> [!warning]` (insidie) e `> [!tip]` (cose da ricordare) vanno **senza titolo custom** — niente "Gotcha"/"Take-away": Obsidian mostra l'etichetta di default.
- `> [!info]` mantiene il titolo quando è informativo (es. `[!info] Angular 22+`, `[!info] Versioning del vault`).
- `> [!success]- Risposta` (collassato, nota il `-`) per le risposte del **Ripasso lampo**.
- La sezione di chiusura del capitolo si chiama **In sintesi:** (non "Take-away").

## Tag controllati
- tipo: `tipo/capitolo`, `tipo/concetto`
- tematici: `signals`, `components`, `reactivity`, `routing`, `di`, `services`, `state-management`, `forms`, `testing`, `architecture`, `ngrx`, `directives`, `templates`, `lifecycle`, `ai`, `monorepo`, `i18n`, `security`, `ssr`, `micro-frontends`, `http`, `performance`, `tooling`
- versione: `angular-22` (note che trattano feature gated ad Angular 21.1/21.2/22)

## Diagrammi
Mermaid dove rende davvero: reactive flow / signal graph, gerarchia DI, child routes, flussi OAuth/OIDC, architecture matrix, unidirectional data flow.

## Note operative sull'estrazione PDF
- Testo via `pypdf` (`python3` con `from pypdf import PdfReader`). Pagina i-esima = `r.pages[i-1].extract_text()` (0-based).
- Il codice estratto **perde indentazione** → ricostruirla.
- Ogni pagina ha un watermark `ciro.cu97@gmail.com <data>` → **ignorarlo**.
- **Numerazione pagine**: `r.pages[N-1]` e l'outline usano il numero **reader** (1–467); i riferimenti nelle note usano il numero **stampato** (`stampato = reader − 12`, per le 12 pagine di front matter). Quindi per estrarre il testo della pagina stampata `P` si legge `r.pages[P + 12 - 1]`. Fonte dei numeri: l'outline in `_meta/book-outline.txt` (reader), da convertire `−12`.

## Checklist manutenzione (quando aggiungi/rinomini una nota)
- [ ] `_sidebar.md` — voce nell'ordine giusto.
- [ ] `README.md` (home = indice) — link al capitolo/concetto.
- [ ] Frontmatter completo (`capitolo`/`titolo`/`pagine`/`tags`), col tag `angular-22` se la nota tratta feature gated.
- [ ] `concetti/` — se introduci un concetto cardine ricorrente, valuta una nota atomica + backlink `[[nome]]`.
- [ ] Sezioni **Ripasso lampo** e **In sintesi:** a fine capitolo.
