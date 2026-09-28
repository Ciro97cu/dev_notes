# Bundler

Strumenti che raccolgono i moduli di un progetto e le sue dipendenze e ne producono pochi file ottimizzati, pronti da servire al browser.

## Cos'è un bundler

Un **bundler** è lo strumento che prende il codice sorgente di un progetto — decine o migliaia di file, più le librerie installate in `node_modules` — e ne ricava **pochi file ottimizzati** da mandare al browser. Parte da uno o più **entry point**, segue tutti gli `import` per ricostruire il **grafo dei moduli** (quale file dipende da quale), risolve dove vive fisicamente ogni dipendenza e riscrive il tutto in output che un browser sa caricare.

È nato da una mancanza concreta: fino al 2015 il browser **non aveva un sistema di moduli**, quindi non c'era modo di dichiarare che un file dipende da un altro se non ordinando a mano i `<script>` nella pagina. In più le librerie pubblicate su npm erano scritte in [CommonJS](docs/moduli-e-bundling.md?id=commonjs), un formato che il browser non capisce. Il bundler risolveva entrambe le cose in un colpo: metteva le dipendenze nell'ordine giusto e le traduceva in qualcosa di eseguibile.

Oggi i moduli nativi ci sono, ma il bundler resta, perché nel frattempo ha smesso di essere un semplice «incollatore di file». Le sue responsabilità tipiche sono:

- **risoluzione** — stabilire a quale file corrisponde ogni `import`, incluse le regole con cui npm cerca dentro `node_modules`;
- **trasformazione** — tradurre ciò che il browser non esegue (TypeScript, JSX, Sass), da sé o delegando a un [transpiler](docs/transpiler.md);
- **ottimizzazione** — [tree-shaking](docs/moduli-e-bundling.md?id=tree-shaking), minificazione e [code-splitting](docs/moduli-e-bundling.md?id=lazy-loading);
- **asset** — trattare immagini, font e CSS come moduli, aggiungendo al nome un hash del contenuto perché la cache del browser sappia quando il file è cambiato;
- **dev server** — servire il progetto in sviluppo aggiornando la pagina a ogni modifica.

Da qui la differenza con un **transpiler**, che è la confusione più frequente. Il transpiler traduce **un file per volta** e non sa nulla di come i file si colleghino fra loro; il bundler ragiona sul **grafo dell'intero progetto** e decide cosa finisce in quale file. Sono compiti complementari, tanto che un bundler chiama spesso un transpiler al proprio interno, e diversi strumenti recenti fanno entrambe le cose.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 600 240" role="img" aria-label="Un bundler parte dai moduli sorgente e dalle dipendenze in node_modules, ne ricostruisce il grafo applicando tree-shaking e minificazione, e produce pochi file ottimizzati con hash nel nome" style="width:100%;max-width:560px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="300" y="22" font-size="12.5" text-anchor="middle" font-weight="700">Cosa fa un bundler: da molti moduli sorgente a pochi file ottimizzati</text><text x="72" y="44" font-size="9.5" text-anchor="middle" font-weight="600" opacity=".75">sorgenti e dipendenze</text><text x="514" y="44" font-size="9.5" text-anchor="middle" font-weight="600" opacity=".75">output per il browser</text><rect x="24" y="60" width="96" height="26" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="72" y="77" font-size="10" text-anchor="middle">app.ts</text><rect x="24" y="94" width="96" height="26" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="72" y="111" font-size="10" text-anchor="middle">home.ts</text><rect x="24" y="128" width="96" height="26" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="72" y="145" font-size="10" text-anchor="middle">utils.ts</text><rect x="24" y="170" width="96" height="28" rx="5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><text x="72" y="188" font-size="9" text-anchor="middle" opacity=".8">node_modules</text><rect x="222" y="92" width="150" height="80" rx="8" fill="var(--link,#78716c)" fill-opacity=".16" stroke="currentColor" stroke-width="1.6"/><text x="297" y="124" font-size="12" text-anchor="middle" font-weight="700">bundler</text><text x="297" y="142" font-size="9.5" text-anchor="middle" opacity=".8">grafo dei moduli</text><text x="297" y="157" font-size="9.5" text-anchor="middle" opacity=".8">tree-shaking · minify</text><path d="M120 73 L216 112" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M219 112 L210.3 112.3 L212.9 105.8 Z" fill="currentColor"/><path d="M120 107 L216 124" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M219 124 L210.5 126.1 L211.7 119.2 Z" fill="currentColor"/><path d="M120 141 L216 136" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M219 136 L211.2 139.9 L210.8 132.9 Z" fill="currentColor"/><path d="M120 184 L216 152" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M219 152 L212.5 157.8 L210.3 151.1 Z" fill="currentColor"/><rect x="452" y="60" width="124" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="514" y="79" font-size="10" text-anchor="middle" font-weight="700">main-a1b2.js</text><rect x="452" y="104" width="124" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3"/><text x="514" y="123" font-size="10" text-anchor="middle">chunk-c3d4.js</text><rect x="452" y="148" width="124" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="514" y="167" font-size="9.5" text-anchor="middle">styles-e5f6.css</text><path d="M376 112 L445 75" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M448 75 L442.5 81.8 L439.3 75.6 Z" fill="currentColor"/><path d="M376 132 L445 119" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M448 119 L440.7 123.9 L439.5 117 Z" fill="currentColor"/><path d="M376 152 L445 163" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M448 163 L439.6 165.3 L440.6 158.3 Z" fill="currentColor"/></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il bundler legge i moduli scritti a mano e le dipendenze esterne (tratteggiate), ne ricostruisce il grafo e ne emette pochi file col contenuto già ottimizzato. L&apos;hash nel nome (<code>main-a1b2.js</code>) serve alla cache del browser; il riquadro tratteggiato in uscita è un <a href="#/docs/moduli-e-bundling?id=lazy-loading">chunk</a> caricato solo al bisogno.</figcaption>
</figure>

## webpack

[webpack](https://webpack.js.org/) è il veterano della categoria e per anni ne è stato lo standard di fatto. Il suo modello ruota attorno a due estensioni: i **loader**, che insegnano al bundler come leggere un tipo di file, e i **plugin**, che si agganciano alle fasi della compilazione. Ne deriva la sua caratteristica principale, la **configurabilità**: non c'è praticamente scenario che non si riesca a piegare, al prezzo di una configurazione verbosa. È anche lo strumento in cui è nato il [Module Federation](docs/moduli-e-bundling.md?id=module-federation).

Il suo limite è di essere scritto in JavaScript, quindi lento rispetto ai concorrenti compilati. Va però sfatata l'idea che sia abbandonato: è **attivamente mantenuto** (a luglio 2026 è uscita la 5.109, una delle minor più ricche degli ultimi tempi) e muove ancora numeri enormi. È vero invece che non è più la scelta predefinita per un progetto nuovo, con download in calo di circa il 22% su base annua.

## Rollup

[Rollup](https://rollupjs.org/) nasce **ESM-first** e con una vocazione diversa: produrre bundle puliti e leggibili, ed è il terreno su cui è stato inventato il [tree-shaking](docs/moduli-e-bundling.md?id=tree-shaking). Per questo è storicamente il bundler di riferimento per **pubblicare librerie**, dove conta che l'output sia ordinato e ri-ottimizzabile da chi lo consuma, più che spedire un'applicazione intera.

Per anni è stato anche il motore delle build di produzione di Vite. Quel ruolo, da Vite 8, è passato al suo successore in Rust.

## Rolldown

[Rolldown](https://rolldown.rs/) è la riscrittura di Rollup in **Rust**, pensata per conservarne l'API e i plugin ma con le prestazioni di uno strumento compilato. Ha raggiunto la **1.0 stabile il 7 maggio 2026**, con API bloccata e garanzie di compatibilità.

Non è uno strumento che di solito si installa a mano: lo si incontra perché **è il bundler che sta dentro Vite 8**, quindi è già in uso in ogni progetto Vite recente.

## Vite

[Vite](https://vite.dev/) è anzitutto un modo diverso di intendere lo sviluppo. In fase di *dev* non impacchetta quasi nulla: sfrutta i **moduli nativi** del browser e serve i file su richiesta, così l'avvio è immediato anche su progetti grandi e resta tale al crescere del codice. Per la produzione, invece, un bundle serve ancora, e lì fa il lavoro pieno.

Il cambiamento importante è recente. Fino alla versione 7 Vite usava **due** strumenti — esbuild per pre-elaborare le dipendenze in sviluppo e Rollup per la build di produzione. Con **Vite 8, stabile dal 12 marzo 2026**, entrambi sono stati sostituiti da **Rolldown**, un unico bundler in Rust che copre sviluppo e produzione, con build dichiarate fino a 10-30 volte più rapide e compatibilità piena con i plugin esistenti. È l'evoluzione architetturale più profonda dai tempi di Vite 2.

## esbuild

[esbuild](https://esbuild.github.io/) è scritto in **Go** e ha un solo obiettivo dichiarato: la velocità, con margini di uno o due ordini di grandezza sui bundler in JavaScript. Fa sia trasformazione (TypeScript, JSX) sia bundling, ma offre meno estensibilità e meno opzioni dei concorrenti storici — è un compromesso voluto.

Per questo lo si trova spesso **dentro** altri strumenti invece che usato da solo: chi costruisce una toolchain lo adotta come motore e ci mette sopra la propria interfaccia. È il caso della Angular CLI, come si vede più sotto.

## Rspack

[Rspack](https://rspack.rs/) è un bundler in **Rust** con una scelta di progetto molto precisa: mantenere un'**API compatibile con webpack**, così che plugin e loader dell'ecosistema esistente continuino a funzionare. L'idea è poter sostituire webpack in un progetto già avviato guadagnando velocità senza riscrivere la configurazione. Ha un meccanismo di compilazione **incrementale** che rende l'aggiornamento a caldo rapido anche su basi di codice grandi, e offre **supporto di prima classe al [Module Federation](docs/moduli-e-bundling.md?id=module-federation)**. La 1.7 è l'ultima minor della serie 1.x prima del passaggio alla 2.0.

## Parcel e Turbopack

Due strumenti che si incontrano in contesti più delimitati. [Parcel](https://parceljs.org/) punta sulla configurazione **zero**: riconosce da sé i tipi di file e imposta una pipeline ragionevole senza che si scriva nulla, il che lo rende comodo per prototipi e progetti piccoli. [Turbopack](https://nextjs.org/docs/app/api-reference/turbopack) è il bundler in Rust sviluppato da Vercel per **Next.js**: dalla versione 16 è **stabile e predefinito sia per `next dev` sia per `next build`**, e webpack vi è rimasto solo come scelta esplicita — a tal punto che una configurazione webpack personalizzata fa fallire la build, per non lasciarla passare inosservata. Di fatto non lo si adotta: lo si usa perché si usa Next.js.

## Quale scegliere

| Strumento | Scritto in | Forte in | Quando conviene |
|---|---|---|---|
| webpack | JavaScript | configurabilità, ecosistema | progetti esistenti e configurazioni fuori standard |
| Rollup | JavaScript | output pulito | pubblicare una **libreria** |
| Rolldown | Rust | successore di Rollup | arriva già dentro Vite 8 |
| Vite | usa Rolldown | dev server immediato | applicazioni nuove |
| esbuild | Go | velocità pura | come motore dentro altre toolchain |
| Rspack | Rust | compatibilità webpack | accelerare un progetto webpack già avviato |
| Turbopack | Rust | integrazione con Next.js | si usa perché si usa Next.js |
| Parcel | JavaScript e Rust | zero configurazione | prototipi e progetti piccoli |

Nella pratica la scelta è raramente libera, perché il bundler arriva insieme al framework: chi lavora con Angular riceve esbuild e Vite dalla CLI, chi usa Next.js riceve Turbopack. La decisione consapevole si presenta in due casi: quando si **pubblica una libreria** (dove Rollup resta il riferimento) e quando si ha un **progetto webpack lento** da velocizzare senza riscriverlo, che è esattamente lo spazio di Rspack.

## Il bundler nel mondo Angular

Angular non espone un bundler, lo incapsula in un **builder** della CLI, e negli ultimi anni lo ha cambiato. Il builder predefinito è `application` (nel pacchetto `@angular/build`, storicamente `@angular-devkit/build-angular`), e sotto usa **due strumenti con ruoli distinti**: **esbuild** per il build di produzione e **Vite** solo come **dev server** per `ng serve`. È una distinzione che vale la pena tenere a mente, perché si sente spesso dire che «Angular è passato a Vite»: in realtà chi impacchetta l'applicazione è esbuild, mentre Vite serve i file mentre si sviluppa.

Il vecchio builder `browser`, basato su **webpack**, è **deprecato** dalla v17 e sopravvive solo per non rompere i progetti non ancora migrati — con migrazione automatica proposta dalla v18. Le **librerie** seguono un percorso a parte: si impacchettano con **ng-packagr** secondo l'Angular Package Format, che per generare i bundle FESM si appoggiava a Rollup e nelle versioni recenti è passato a esbuild.

Sul [Module Federation](docs/moduli-e-bundling.md?id=module-federation) la strada di Angular è divergente: invece di dipendere da webpack, l'ecosistema ha adottato la **Native Federation**, che riproduce la stessa idea sugli standard del web per restare compatibile con la toolchain esbuild — il tema è trattato in <a href="../angular/#/capitoli/18-micro-frontends" target="_blank" rel="noopener">ch18 · Micro Frontends</a>.

> [!tip]
> Riferimenti: <a href="https://angular.dev/tools/cli/build-system-migration" target="_blank" rel="noopener">Angular · Build system migration</a>, <a href="https://angular.dev/tools/libraries/angular-package-format" target="_blank" rel="noopener">Angular Package Format</a>, <a href="https://vite.dev/blog/announcing-vite8" target="_blank" rel="noopener">Vite 8</a>, <a href="https://webpack.js.org/blog/2026-02-04-roadmap-2026/" target="_blank" rel="noopener">webpack · Roadmap 2026</a>, <a href="https://rspack.rs/" target="_blank" rel="noopener">Rspack</a>.
