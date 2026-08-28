---
capitolo: 1
titolo: "Getting Started with Angular"
pagine: "6-19"
tags: [tipo/capitolo, tooling, signals, angular-22]
---
# 01 · Getting Started with Angular
> cap.1 · pp.6-19 — *Modern Angular* v3.0.0

Setup dell'ambiente, generazione del progetto con la **Angular CLI** e prima lettura del codice generato. Un'app Angular è un **albero di componenti** con un root component in cima; questo capitolo arriva fino al punto in cui quel componente gira nel browser. Il progetto di esempio del libro è **flights42** (`angular-architects/flights42` su GitHub).

## Tooling
> pp.6-8

### Development Environment

In teoria basta un editor di testo, ma un IDE specializzato offre syntax highlighting, code completion e debugging integrato. Gli autori consigliano **VS Code** (gratuito, leggero, multipiattaforma) o **WebStorm/IntelliJ** (prodotti commerciali JetBrains, con refactoring avanzato e test runner integrati); entrambi supportano TypeScript e Angular di serie. Su VS Code conviene installare l'extension pack *Angular Essentials* di John Papa (View → Extensions), che include l'**Angular Language Service** (code completion nei template HTML) ed **ESLint** (controlli di qualità del codice); su IntelliJ vanno invece verificati i plugin **Angular** e **TypeScript**, che devono essere attivi.

### Node.js

Tutto il tooling di sviluppo, build e test poggia su **Node.js**. Si consiglia di attenersi alle versioni **LTS** (Long-Term Support, con supporto a lungo termine, le più stabili); quando servono versioni diverse tra progetti, le si gestisce con un version manager (un programma che tiene installate più versioni di Node e permette di passare dall'una all'altra) come **NVM**.

### Angular CLI

Tool ufficiale del team Angular per generare, buildare e testare, aggiornato a ogni nuova versione di Angular. Si installa globalmente — `-g` la rende disponibile ovunque sulla macchina, mentre senza `-g` npm installerebbe solo nel progetto locale:

```bash
npm install -g @angular/cli
```

### Example Project Repository

Il progetto di esempio si clona da GitHub e si avvia con la CLI:

```bash
git clone https://github.com/angular-architects/flights42.git
cd flights42
npm install
ng serve -o   # -o apre il browser
```

> [!tip]
> Il repo di esempio ha **branch per capitolo** (vedi `readme.md`): utili per seguire il libro passo-passo.

## Getting Started with the Angular CLI
> pp.8-19

### Generating & Starting a Project
> pp.8-10

`ng new` scarica e configura automaticamente l'intera toolchain (la catena di strumenti che servono per lavorare al progetto): compilatore TypeScript, strumenti di test e i build tool che, in fase di compilazione, impacchettano i sorgenti in **bundle** (pochi file ottimizzati pronti per la produzione).

```bash
ng new flights42     # genera struttura + toolchain; rispondi Enter alle domande
cd flights42
ng serve -o          # dev server, default http://localhost:4200
ng serve -o --port 4242   # porta custom con --port
```

`ng serve` non solo serve l'app, ma **monitora i sorgenti** e li ricompila a ogni modifica, aggiornando poi la finestra del browser (live reload). Se la porta `4200` è occupata, la CLI ne propone un'altra. Per provare il meccanismo si apre `src/app/app.ts` e si cambia il valore del `title` in `World!`:

```ts
protected readonly title = signal('World!');
```

Al salvataggio il browser si aggiorna da solo; conviene poi riportare il valore a `flights42` per restare allineati con le spiegazioni del capitolo.

> [!warning]
> Va aperta nell'IDE la **cartella root del progetto** (quella che contiene `angular.json`), altrimenti l'autocompletamento fallisce e compaiono numerosi errori. La ricompilazione automatica funziona bene, ma occasionalmente la CLI "perde" una modifica o si desincronizza — capita con salvataggi rapidi in sequenza o con la rinomina di file. Il rimedio è risalvare i file interessati o, in ultima istanza, riavviare `ng serve`.

### Project Structure of CLI Projects
> pp.10-11

La CLI genera il root component `App` più i file di configurazione per build e test. I principali:

| File | Ruolo |
|---|---|
| `src/app/app.ts` | Codice TypeScript del root component (il suo comportamento) |
| `src/app/app.html` | Template del root component (il suo aspetto) |
| `src/main.ts` | Entry point: fa il **bootstrap** del root component |
| `src/index.html` | Start page; la build vi aggiunge i riferimenti ai bundle generati |
| `src/styles.css` | Stili globali |
| `package.json` | Librerie e versioni; `npm install` le scarica in `node_modules` |
| `angular.json` | Configurazione della CLI (riferimenti agli style, setup di test, ecc.) |
| `tsconfig.json` | Configurazione del compilatore TypeScript |

### Inspecting the Generated Source Code
> pp.11-15

Con la struttura sotto mano, si legge il codice generato: mostra fin da subito i **signal**, il **bootstrap** dell'applicazione e il collegamento alla **start page**.

#### App Component with Signals and Data Bindings
> pp.11-13

Il root component generato si chiama `App` e vive in `app.ts`. Definisce essenzialmente una proprietà `title`:

```ts
// src/app/app.ts
import { Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  protected readonly title = signal("flights42");

  // metodo aggiunto per aggiornare il signal title
  protected updateTitle(): void {
    this.title.set("Highly Sophisticated Flight App");
    console.log("Title updated", this.title());
  }
}
```

`title` è un [[signal]]: un contenitore per un valore che, ogni volta che cambia, **avvisa** le parti del sistema interessate — ed è proprio questa notifica che Angular sfrutta per aggiornare la UI e mostrare sempre lo stato più recente. Lo si **legge chiamandolo come una funzione** (`this.title()`) e lo si aggiorna con `.set()`. Il tipo è `WritableSignal<string>`, che Angular deduce dal valore di default, quindi non serve dichiararlo a mano.

Secondo la Angular style guide le proprietà usate **solo nel template** si dichiarano `protected`, per evitare modifiche accidentali dall'esterno della classe, e i signal si marcano `readonly`: non si **rimpiazzano**, si aggiornano.

`@Component` è un **decorator**, cioè un'annotazione che marca la classe come componente: i decorator aggiungono informazioni (i *metadati*) ai mattoni di Angular e si riconoscono dal `@` che li precede. Il `selector` è di norma il nome dell'elemento HTML personalizzato che rappresenta il componente, richiamabile con `<app-root></app-root>`; il decorator indica anche dove trovare il template (`templateUrl`) e il CSS locale (`styleUrl`, vuoto di default).

La keyword `export` rende la classe usabile in altri file, mentre gli `import` in cima portano dentro i costrutti di Angular (la funzione `signal`, il decorator `Component`, ecc.). L'array `imports` del decoratore elenca invece i costrutti che il **template** usa: qui `RouterOutlet`, il placeholder con cui il router mostra componenti diversi (→ [[04-router-navigation-lazy-loading]]).

Il template generato contiene il markup della start page vista sopra: gradevole, ma verboso. Per iniziare se ne sostituisce l'intero contenuto con questo breve frammento, che mostra due binding:

```html
<!-- src/app/app.html -->
<h1>Hello, {{ title() }}</h1>
<button (click)="updateTitle()">Update Title</button>
```

`{{ title() }}` è un'**interpolation**: si noti la chiamata al getter del signal (`title()`) per leggerne il valore corrente. `(click)="updateTitle()"` è invece un **event binding**, riconoscibile dalle parentesi tonde attorno al nome dell'evento.

Collegamenti: [[signal]] · approfondimenti su componenti e binding in [[02-signal-based-components]].

#### Bootstrapping the App Component
> pp.13-15

All'avvio Angular esegue `main.ts`, che fa il **bootstrap** del root component (lo avvia e lo "monta" nella pagina, mettendolo in moto): da lì in poi mostra l'intero albero di componenti.

```ts
// src/main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { App } from "./app/app";

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

`bootstrapApplication(rootComponent, config)` prende il root component e una configurazione dell'applicazione. La config registra i **servizi disponibili a livello globale** e sta in `app.config.ts`:

```ts
// src/app/app.config.ts
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes)],
};
```

I servizi globali si registrano in `providers` tramite [[providers|provider functions]]: qui `provideBrowserGlobalErrorListeners()` (intercetta gli errori non gestiti della pagina; l'error handler di default li stampa nella console del browser) e `provideRouter(routes)` (configura il router). Nel resto del libro questa config si arricchisce di altri servizi.

#### Connecting the Root Component to the Start Page

```html
<!-- src/index.html -->
[...]
<body>
  <app-root></app-root>
</body>
[...]
```

`index.html` contiene `<app-root></app-root>` come **punto di innesto**: in fase di build la CLI compila e bundla i sorgenti e aggiunge qui i riferimenti ai bundle, uno dei quali contiene il codice di `main.ts` che avvia l'applicazione.

### Installing Additional Packages

Ci sono due modi per aggiungere una libreria. `npm i <pkg>` (alias di `npm install <pkg>`) si limita a **installarla** — es. `npm install @ngrx/signals`, usata più avanti per la gestione dello stato. `ng add <pkg>` invece la installa **e la configura**: `ng add @angular/material` (la component library del team Angular) imposta theming e tipografia di Material — il libro ne usa parti selezionate per dialog e toast; alle domande del setup si risponde Enter per accettare i default.

### Adding Components and Styles

Per non perdere tempo su styling e menu, il libro fa copiare nel progetto i file del repo `angular-architects/flights42-assets`: uno `styles.css` globale e i componenti `navbar`/`sidebar` con i rispettivi template, più un `app.html` modificato che li referenzia.

### Configuring the Angular CLI
> pp.15-19

Gli **schematics** (le "ricette" che la CLI usa quando genera file con `ng generate`: dicono cosa creare e con quali opzioni di default) si configurano in `angular.json` (nodo `projects/<project-name>/schematics`) per ridurre il rumore in fase di studio e usare **OnPush**:

```jsonc
"schematics": {
  "@schematics/angular:component": {
    "style": "none",
    "skipTests": true,
    "changeDetection": "OnPush"
  },
  "@schematics/angular:directive": {
    "skipTests": true
  },
  "@schematics/angular:pipe": {
    "skipTests": true
  },
  "@schematics/angular:service": {
    "skipTests": true
  }
}
```

`skipTests: true` evita di generare i file di test per componenti, direttive, pipe e service — non perché lo scaffolding sia sbagliato (lo *scaffolding* è la generazione automatica dei file di partenza da parte della CLI), ma perché in [[07-testing-with-vitest]] questi file si scrivono a mano per mostrarne i concetti.

> [!info|label:Angular 22+ · OnPush di default]
> **OnPush** è la strategia di [[glossario#change-detection|change detection]] raccomandata (la change detection è il meccanismo con cui Angular controlla cos'è cambiato e ridisegna la UI di conseguenza): Angular aggiorna un componente **solo quando i suoi dati cambiano** (es. quando un signal fornisce un nuovo valore) invece di ricontrollare tutta l'app. I signal la rendono naturale. **Da Angular 22 è il default.**

> [!tip]
> Anche se OnPush è ormai il default, il libro continua a scrivere `changeDetection: ChangeDetectionStrategy.OnPush` esplicitamente in **ogni** `@Component`, per due motivi: rende la scelta **visibile a colpo d'occhio** (codice auto-documentante) e resta **retrocompatibile** con versioni < 22, dove gli snippet copiati si comportano allo stesso modo.

### Initializing the Linter

`ng lint` esegue **ESLint**. Un *linter* è uno strumento che analizza il codice e segnala errori comuni e violazioni degli standard di scrittura. La CLI lo **configura alla prima esecuzione** (Enter per i default → set di regole Angular + TypeScript); le regole si personalizzano in `eslint.config.js`. In VS Code gli errori compaiono man mano che si scrive, se è installata l'estensione ESLint (inclusa nell'Angular Essentials pack).

### Building the Application

`ng build` produce la **build di produzione**: compila TS → JS, bundla (raggruppa tutto in pochi file) e ottimizza i bundle per la performance con due tecniche, la **minify** (comprime il codice togliendo spazi e accorciando i nomi) e il [[glossario#tree-shaking|tree-shaking]] (rimuove il codice inutilizzato). L'output finisce in `dist/<app>/browser`, es. `dist/flights42/browser`: per il deploy basta copiarlo su un web server.

Collegamenti: [[providers]] · gestione dello stato con NgRx in [[09-ngrx-signal-store]] · testing in [[07-testing-with-vitest]].

## Ripasso lampo

<details>
<summary>Che differenza c'è tra <code>npm i <pkg></code> e <code>ng add <pkg></code>?</summary>

`npm i <pkg>` (alias di `npm install`) si limita a **installare** la libreria. `ng add <pkg>` la installa **e esegue passi di setup aggiuntivi** — es. `ng add @angular/material` configura theming e tipografia di Material nel progetto.

</details>

<details>
<summary>Come si legge e come si aggiorna il valore di un <code>signal</code>? Perché si dichiara <code>readonly</code>?</summary>

Lo si **legge chiamandolo come funzione**: `this.title()`. Lo si **aggiorna** con `.set()` (es. `this.title.set('...')`). Si dichiara `readonly` perché i signal **non si rimpiazzano, si aggiornano**: il riferimento all'oggetto signal resta lo stesso, cambia il valore che contiene.

</details>

<details>
<summary>Cosa fa <code>bootstrapApplication</code> e dove si registrano i servizi globali?</summary>

In `main.ts`, `bootstrapApplication(App, appConfig)` fa il **bootstrap** del root component, da cui Angular mostra l'intero albero di componenti. I servizi globali si registrano nell'array `providers` di `appConfig` (in `app.config.ts`) tramite **provider functions** come `provideRouter()` e `provideBrowserGlobalErrorListeners()`.

</details>

<details>
<summary>A cosa serve <code>OnPush</code> e perché i signal lo rendono conveniente?</summary>

`OnPush` aggiorna un componente **solo quando i suoi dati cambiano**, invece di ricontrollare l'intera app a ogni ciclo → change detection più efficiente. I signal notificano esplicitamente i cambi di valore, quindi calzano perfettamente con OnPush. Da **Angular 22** è la strategia di default.

</details>

<details>
<summary>Quali file si guardano per capire root component, bootstrap e start page?</summary>

Root component: `src/app/app.ts` (logica) e `src/app/app.html` (template). Bootstrap: `src/main.ts` (chiama `bootstrapApplication`) e `src/app/app.config.ts` (i servizi globali). Start page: `src/index.html`, che contiene `<app-root></app-root>` come punto di innesto.

</details>

<details>
<summary>Perché il libro scrive <code>changeDetection: ChangeDetectionStrategy.OnPush</code> esplicitamente se da Angular 22 è già il default?</summary>

Per due ragioni: rende la scelta **visibile a colpo d'occhio** in ogni componente (codice auto-documentante) e resta **retrocompatibile** con versioni di Angular precedenti alla 22, dove il default non era OnPush — così chi copia gli snippet in un progetto più vecchio ottiene lo stesso comportamento.

</details>

**In sintesi:**
- La CLI genera una struttura professionale con un solo `ng new` (compiler, test, build, ottimizzazioni); `ng serve -o` avvia il dev server con live reload.
- L'app è un **albero di componenti** con root `App`, bootstrappato da `main.ts` tramite `bootstrapApplication(App, appConfig)`; i servizi globali stanno nei `providers` di `appConfig`.
- I **signal** sono onnipresenti fin dal componente generato: si leggono chiamandoli (`title()`), si aggiornano con `.set()`, si dichiarano `readonly`.
- Per lo studio si configurano gli schematics in `angular.json` (`skipTests`, `style: none`, `OnPush`), si abilita il linter con `ng lint` e si produce il bundle con `ng build`. **OnPush è il default da Angular 22.**
