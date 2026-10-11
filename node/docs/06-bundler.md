# 06 · Bundler: costruire le web app

Fare la **build** di una web app significa trasformare i sorgenti del progetto (moduli JavaScript o TypeScript, fogli di stile, immagini e le librerie installate in `node_modules`) nei file che il browser scarica ed esegue; lo strumento che se ne occupa è il **bundler**. Che cosa sia un bundler in generale, come ricostruisca il grafo dei moduli e quali strumenti esistano è raccontato nel <a href="../glossario/#/docs/bundler" target="_blank" rel="noopener">glossario alla voce Bundler</a>, insieme a meccanismi come il tree-shaking e il code-splitting. Questo capitolo guarda lo stesso strumento dal lato di Node e del progetto: che cosa succede quando si lancia `vite` oppure `vite build`, perché sviluppo e produzione seguono due strade diverse, come si scrive la configurazione e come entrano in gioco variabili d'ambiente, asset e plugin. Lo strumento di riferimento è **Vite**, oggi la scelta più diffusa per una web app nuova: la versione corrente è la [8.3](https://vite.dev/releases), e dalla [8.0 del 12 marzo 2026](https://vite.dev/blog/announcing-vite8) il motore che fa il lavoro pesante è **Rolldown**.

## Un bundler è un programma Node

Vite si installa come dipendenza di sviluppo del progetto e si usa attraverso gli script di `package.json`. Un progetto creato con [`npm create vite@latest`](https://vite.dev/guide/) contiene già i tre script che servono:

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^8.3.4"
  }
}
```

Quando si lancia `npm run dev`, npm cerca il comando `vite` anche nella cartella `node_modules/.bin`, che [aggiunge al `PATH` degli script](https://docs.npmjs.com/cli/v11/commands/npm-run). Lì c'è un collegamento al file che il pacchetto `vite` dichiara nel proprio campo `"bin"`, cioè `bin/vite.js`, e la prima riga di quel file è `#!/usr/bin/env node`: la *shebang*, l'indicazione con cui un sistema Unix sceglie il programma che deve eseguire uno script. Il dev server, insomma, è un normale processo Node con il suo event loop: resta acceso finché ha un server in ascolto, come spiegato nel [[01-dentro-node#l39event-loop-giro-per-giro|capitolo 01]], e si ferma con `Ctrl+C`.

Vite è distribuito **solo come ES module**, ed è per questo che richiede [Node 20.19+ o 22.12+](https://vite.dev/guide/): sono le versioni in cui `require()` di un ES module funziona senza opzioni, e il [motivo dichiarato](https://vite.dev/blog/announcing-vite7) è proprio permettere ai moduli CommonJS di caricare l'API di Vite anche se il pacchetto è solo ESM (il meccanismo è nel [[02-moduli-e-pacchetti#far-convivere-i-due-mondi|capitolo 02]]). Node 24 LTS soddisfa il requisito.

Non tutto, però, è JavaScript. Rolldown e **Oxc**, il compilatore che traduce e minifica il codice, sono scritti in **Rust** e arrivano come binari già compilati per ogni sistema operativo, ciascuno in un pacchetto npm separato (`@rolldown/binding-darwin-arm64`, `@rolldown/binding-linux-x64-gnu` e così via). Questi pacchetti sono elencati fra le [dipendenze opzionali](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#optionaldependencies) e dichiarano con i campi `os` e `cpu` per quale sistema sono fatti: il package manager installa quello che corrisponde alla macchina e salta gli altri, perché per una dipendenza opzionale un'installazione mancata non è un errore. Il file che resta è un `.node`, un [addon nativo](https://nodejs.org/api/addons.html), cioè una libreria compilata che Node carica come se fosse un modulo. È una divisione dei compiti tipica degli strumenti recenti: Node orchestra (legge la configurazione, apre il server, esegue i plugin scritti in JavaScript) e il codice nativo fa i calcoli pesanti.

| Comando | Effetto |
|---|---|
| `npm run dev` (cioè `vite`) | avvia il dev server, per impostazione predefinita su `http://localhost:5173` |
| `npm run build` (cioè `vite build`) | esegue la build di produzione e scrive il risultato in `dist/` |
| `npm run preview` (cioè `vite preview`) | serve `dist/` in locale su `http://localhost:4173` per controllare la build; non è un server di produzione |
| `vite --force` | rifà il pre-bundling delle dipendenze ignorando la cache |
| `vite build --mode staging` | build in una modalità diversa da `production`, con il suo file `.env.staging` |
| `vite build --watch` | ricostruisce a ogni modifica dei sorgenti |

Le opzioni della [CLI di Vite](https://vite.dev/guide/cli) si possono passare anche attraverso gli script, separandole da quelle di npm con un doppio trattino: `npm run build -- --mode staging`.

## Due comandi, due strade

Lo stesso programma nasconde due modi di lavorare molto diversi. In **sviluppo** l'obiettivo è vedere subito il risultato di ogni modifica, quindi conta la velocità con cui il server parte e si aggiorna; in **produzione** l'obiettivo è spedire all'utente il minor numero possibile di byte e di richieste, e si può spendere tutto il tempo che serve per ottenerlo. Vite risponde con due *pipeline*, cioè due catene di passaggi distinte.

Con `vite` il codice dell'applicazione **non viene impacchettato**: il dev server lo consegna al browser modulo per modulo, sfruttando gli ES modules nativi, e traduce ogni file solo quando il browser lo chiede. L'unico impacchettamento riguarda le dipendenze di `node_modules`, preparate una volta all'avvio. Con `vite build`, invece, Rolldown legge l'intero progetto in una volta, ne ricostruisce il grafo completo e produce i file ottimizzati in `dist/`. La documentazione spiega il [perché della differenza](https://vite.dev/guide/why): i moduli non impacchettati funzionano bene in locale, ma in produzione le catene di `import` annidati costerebbero troppi viaggi di rete.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 680 300" role="img" aria-label="Due comandi, due strade. A sinistra vite in sviluppo: il browser chiede i moduli uno per uno al dev server Node, che traduce ogni file su richiesta; sotto, le sole dipendenze pre-impacchettate da Rolldown in node_modules/.vite. A destra vite build: tutto il progetto, cioè index.html, src e node_modules, passa a Rolldown, che ricostruisce il grafo completo, applica tree-shaking e minificazione e scrive in dist pochi file con hash nel nome" style="width:100%;max-width:680px;height:auto;color:inherit"><defs><marker id="n06-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="175" y="26" font-size="12.5" text-anchor="middle" font-weight="700">vite · sviluppo</text><text x="505" y="26" font-size="12.5" text-anchor="middle" font-weight="700">vite build · produzione</text><rect x="20" y="38" width="310" height="250" rx="12" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".45"/><rect x="350" y="38" width="310" height="250" rx="12" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".45"/><rect x="55" y="58" width="240" height="44" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="175" y="77" font-size="12" text-anchor="middle" font-weight="700">browser</text><text x="175" y="93" font-size="10" text-anchor="middle" opacity=".75">chiede i moduli uno per uno</text><line x1="135" y1="104" x2="135" y2="144" stroke="currentColor" stroke-width="1.4" marker-end="url(#n06-a)"/><text x="127" y="128" font-size="10" text-anchor="end" font-family="ui-monospace,Menlo,monospace">import</text><line x1="215" y1="146" x2="215" y2="106" stroke="currentColor" stroke-width="1.4" marker-end="url(#n06-a)"/><text x="223" y="128" font-size="10">un file JS</text><rect x="55" y="148" width="240" height="50" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="175" y="169" font-size="12" text-anchor="middle" font-weight="700">dev server (Node)</text><text x="175" y="186" font-size="10" text-anchor="middle" opacity=".8">traduce ogni file su richiesta</text><line x1="175" y1="230" x2="175" y2="202" stroke="currentColor" stroke-width="1.4" marker-end="url(#n06-a)"/><rect x="55" y="232" width="240" height="44" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3"/><text x="175" y="250" font-size="11" text-anchor="middle" font-weight="700">dipendenze pre-impacchettate</text><text x="175" y="266" font-size="10" text-anchor="middle" opacity=".75">Rolldown · node_modules/.vite</text><rect x="385" y="58" width="240" height="44" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="505" y="77" font-size="12" text-anchor="middle" font-weight="700">tutto il progetto</text><text x="505" y="93" font-size="10" text-anchor="middle" opacity=".75" font-family="ui-monospace,Menlo,monospace">index.html · src/ · node_modules</text><line x1="505" y1="104" x2="505" y2="144" stroke="currentColor" stroke-width="1.4" marker-end="url(#n06-a)"/><rect x="385" y="148" width="240" height="50" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="505" y="169" font-size="12" text-anchor="middle" font-weight="700">Rolldown</text><text x="505" y="186" font-size="10" text-anchor="middle" opacity=".8">grafo completo · tree-shaking · minify</text><line x1="505" y1="200" x2="505" y2="228" stroke="currentColor" stroke-width="1.4" marker-end="url(#n06-a)"/><rect x="385" y="232" width="240" height="44" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="505" y="251" font-size="12" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">dist/</text><text x="505" y="267" font-size="10" text-anchor="middle" opacity=".75">pochi file con hash nel nome</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">A sinistra il dev server: nessun bundle del codice dell'applicazione, ogni <code>import</code> diventa una richiesta e ogni file viene tradotto solo quando serve; si impacchettano in anticipo soltanto le dipendenze (tratteggiate). A destra la build: tutto il lavoro avviene prima, una volta sola, e il risultato è una cartella di file statici pronti da pubblicare.</figcaption>
</figure>

Fino a Vite 7 le due strade erano percorse da due strumenti diversi, esbuild in sviluppo e Rollup in produzione, con piccole differenze di comportamento fra l'una e l'altra. Da Vite 8 entrambe passano da Rolldown, e Oxc si occupa di tradurre e minificare il codice, così sviluppo e produzione [si comportano in modo più coerente](https://vite.dev/guide/why); il passaggio è raccontato nel <a href="../glossario/#/docs/bundler?id=vite" target="_blank" rel="noopener">glossario alla voce Vite</a>. Esiste anche una modalità che impacchetta il codice pure in sviluppo, pensata per i progetti molto grandi dove migliaia di richieste separate diventano un collo di bottiglia: si attiva con `vite --experimentalBundle`, e la CLI stessa la definisce [altamente sperimentale](https://vite.dev/guide/cli).

Chi lavora con Angular incontra una variante di questo schema: la CLI usa Vite soltanto come dev server ed esbuild per la build, come spiegato nel <a href="../glossario/#/docs/bundler?id=il-bundler-nel-mondo-angular" target="_blank" rel="noopener">glossario alla voce sul bundler nel mondo Angular</a>.

## Il dev server

### ES modules nativi, tradotti su richiesta

Nel dev server il punto d'ingresso è `index.html`, che Vite tratta come [parte del grafo dei moduli](https://vite.dev/guide/#index-html-and-project-root). Il browser riceve la pagina, trova `<script type="module" src="/src/main.ts">` e chiede quel file; ogni `import` dentro `main.ts` diventa a sua volta una nuova richiesta HTTP, e così via lungo tutto il grafo. Il server, costruito in Node come una catena di *middleware* (funzioni che gestiscono una richiesta una dopo l'altra, ciascuna con un compito) che i plugin possono [estendere](https://vite.dev/guide/api-plugin#configureserver), risponde a ogni richiesta traducendo **solo quel file**: TypeScript e JSX diventano JavaScript, un CSS importato diventa un modulo che inietta un tag `<style>`. Il lavoro cresce quindi con le pagine effettivamente aperte e non con la dimensione del progetto, ed è il motivo per cui l'avvio resta [quasi istantaneo](https://vite.dev/guide/why) anche su basi di codice grandi. Ai file non modificati il server risponde con un rapido [304 *Not Modified*](https://vite.dev/guide/performance), e il browser riusa la copia che ha già.

Questa trasformazione è una pura **traduzione**, un file per volta: Vite [non controlla i tipi](https://vite.dev/guide/features#transpile-only) di TypeScript, perché il controllo dei tipi richiede di conoscere l'intero grafo e rallenterebbe ogni risposta. Il controllo resta all'editor e a un comando separato come `tsc --noEmit`, da affiancare alla build; il rapporto fra traduzione e controllo dei tipi è approfondito nel [[04-varianti-di-javascript|capitolo 04]].

### Il pre-bundling delle dipendenze

Il browser sa caricare `import './utils.js'`, che è un percorso relativo, ma non `import { debounce } from 'lodash-es'`: il nome nudo di un pacchetto (*bare import*) non è un URL, e la richiesta [fallisce](https://vite.dev/guide/features#npm-dependency-resolving-and-pre-bundling). Per questo, al primo avvio, Vite esplora i sorgenti, raccoglie tutti gli import di pacchetti e li impacchetta in anticipo con Rolldown: è il **pre-bundling delle dipendenze**. Poi riscrive ogni import in un URL vero, del tipo `/node_modules/.vite/deps/lodash-es.js?v=f3sf2ebd`.

L'operazione ha [due scopi](https://vite.dev/guide/dep-pre-bundling). Il primo è la compatibilità: in sviluppo tutto viene servito come ES module, quindi i pacchetti ancora pubblicati in CommonJS o UMD vanno convertiti, e Vite ne ricava anche gli export con nome, così `import React, { useState } from 'react'` funziona come ci si aspetta. Il secondo è la velocità: alcuni pacchetti ESM sono fatti di centinaia di file che si importano a vicenda (`lodash-es` ne conta più di 600), e senza pre-bundling un solo `import` scatenerebbe centinaia di richieste; impacchettato, il pacchetto ne richiede una.

Il risultato finisce in una **cache** su disco, la cartella `node_modules/.vite`, e il lavoro si ripete solo quando cambia qualcosa che lo riguarda: il contenuto del lockfile, la cartella delle patch, i campi rilevanti di `vite.config.js` o il valore di `NODE_ENV`. Per forzarlo si avvia il server con `vite --force`, oppure si cancella la cartella. Anche il browser fa la sua parte: le dipendenze già pronte gli arrivano con l'intestazione `Cache-Control: max-age=31536000,immutable`, quindi non vengono più richieste al server, e il parametro `?v=` dell'URL cambia quando si installa una versione diversa. Il pre-bundling, infine, [vale solo in sviluppo](https://vite.dev/guide/dep-pre-bundling#the-why): nella build di produzione le dipendenze entrano nel grafo come tutto il resto.

> [!tip]
> Se Vite non scopre da solo una dipendenza (perché l'import viene generato da un plugin, o perché è un pacchetto collegato di un monorepo, tema del [[09-monorepo|capitolo 09]]), la si aggiunge a mano con [`optimizeDeps.include`](https://vite.dev/config/dep-optimization-options#optimizedeps-include); al contrario, `optimizeDeps.exclude` lascia fuori un pacchetto piccolo e già ESM, che il browser può caricare direttamente.

### Hot Module Replacement

L'**Hot Module Replacement** (HMR, «sostituzione a caldo dei moduli») è il meccanismo che, quando si salva un file, aggiorna nel browser **solo il modulo cambiato**, senza ricaricare la pagina e quindi senza perdere lo stato dell'applicazione: il testo scritto in un form, la scheda aperta, un contatore a metà. Un aggiornamento attraversa quattro tappe, due nel processo Node e due nel browser.

Tutto comincia nel dev server, che **osserva** i file del progetto con la libreria [chokidar](https://vite.dev/config/server-options#server-watch) e si accorge, per esempio, che `format.js` è stato modificato (tappa 1 nella figura). Il server tiene un **grafo dei moduli**, aggiornato man mano che il browser chiede i file, e in quel grafo risale dagli importatori del modulo cambiato finché non incontra un **confine HMR** (*HMR boundary*): un modulo che ha [dichiarato di saper accettare](https://vite.dev/guide/api-hmr#hot-accept-cb) l'aggiornamento (tappa 2). A quel punto avvisa il browser attraverso una connessione **WebSocket**, un canale sempre aperto in cui anche il server può prendere l'iniziativa di mandare messaggi, configurabile con [`server.ws`](https://vite.dev/config/server-options#server-ws) (tappa 3). Nel browser lo riceve il piccolo client di Vite, lo script `/@vite/client` che il dev server aggiunge alla pagina, che importa la nuova versione del modulo-confine e la consegna alla funzione con cui il modulo aveva accettato l'aggiornamento (tappa 4).

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 700 275" role="img" aria-label="Il percorso di un aggiornamento HMR. In alto il grafo dei moduli: main.js importa App.jsx, che importa Counter.jsx, che importa format.js. Uno: il watcher del dev server Node vede che format.js è cambiato. Due: il server risale agli importatori fino a Counter.jsx, il confine HMR che chiama hot.accept. Tre: manda un messaggio al browser via WebSocket. Quattro: il browser riesegue Counter.jsx; main.js e App.jsx, sopra il confine, non vengono rieseguiti" style="width:100%;max-width:700px;height:auto;color:inherit"><defs><marker id="n06-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="30" y="52" font-size="10.5" font-weight="700" opacity=".7">grafo dei moduli</text><text x="520" y="26" font-size="10.5" text-anchor="middle">2 · risale fino al confine</text><path d="M600 64 C 585 32, 455 32, 442 62" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3" marker-end="url(#n06-b)"/><g opacity=".6"><rect x="30" y="66" width="130" height="48" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="95" y="95" font-size="11.5" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">main.js</text><rect x="200" y="66" width="130" height="48" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="265" y="95" font-size="11.5" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">App.jsx</text></g><rect x="370" y="66" width="130" height="48" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="435" y="87" font-size="11.5" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">Counter.jsx</text><text x="435" y="104" font-size="10" text-anchor="middle" opacity=".8" font-family="ui-monospace,Menlo,monospace">hot.accept()</text><rect x="540" y="66" width="130" height="48" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8" stroke-dasharray="5 3"/><text x="605" y="87" font-size="11.5" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">format.js</text><text x="605" y="104" font-size="10" text-anchor="middle" opacity=".8">modificato</text><line x1="162" y1="90" x2="196" y2="90" stroke="currentColor" stroke-width="1.4" marker-end="url(#n06-b)"/><line x1="332" y1="90" x2="366" y2="90" stroke="currentColor" stroke-width="1.4" marker-end="url(#n06-b)"/><line x1="502" y1="90" x2="536" y2="90" stroke="currentColor" stroke-width="1.4" marker-end="url(#n06-b)"/><text x="180" y="136" font-size="10" text-anchor="middle" opacity=".7">sopra il confine: non rieseguiti</text><rect x="30" y="200" width="250" height="52" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="155" y="221" font-size="12" text-anchor="middle" font-weight="700">browser</text><text x="155" y="239" font-size="10.5" text-anchor="middle" opacity=".8">4 · riesegue Counter.jsx</text><rect x="420" y="200" width="250" height="52" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".1" stroke="currentColor" stroke-width="1.6"/><text x="545" y="221" font-size="12" text-anchor="middle" font-weight="700">dev server (Node)</text><text x="545" y="239" font-size="10.5" text-anchor="middle" opacity=".8">1 · il watcher vede format.js</text><line x1="418" y1="226" x2="284" y2="226" stroke="currentColor" stroke-width="1.5" marker-end="url(#n06-b)"/><text x="351" y="216" font-size="10.5" text-anchor="middle">3 · WebSocket</text><line x1="605" y1="116" x2="578" y2="196" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#n06-b)"/><line x1="222" y1="198" x2="418" y2="118" stroke="currentColor" stroke-width="1.3" marker-end="url(#n06-b)"/></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Le frecce del grafo vanno da chi importa a chi è importato. Dopo la modifica di <code>format.js</code> il server risale verso gli importatori e si ferma al primo modulo che accetta l'aggiornamento, <code>Counter.jsx</code>: il browser ne scarica la nuova versione e riesegue solo quella (la freccia diagonale), mentre i moduli più in alto restano come sono, con il loro stato.</figcaption>
</figure>

Vite [non avvisa gli importatori](https://vite.dev/guide/api-hmr#hot-accept-cb) che stanno sopra il confine: è una semplificazione voluta, sufficiente nella pratica, che risparmia il costo di generare moduli intermedi. Se invece la risalita arriva fino al punto d'ingresso senza incontrare nessun confine, l'aggiornamento non si può applicare a caldo e la pagina viene ricaricata per intero. È lo stesso schema in tutti i bundler, che la documentazione di webpack [descrive passo per passo](https://webpack.js.org/concepts/hot-module-replacement/); in Vite il client segnala quel momento con l'evento [`vite:beforeFullReload`](https://vite.dev/guide/api-hmr#hot-on-event-cb).

Un modulo diventa un confine chiamando `import.meta.hot.accept()`. L'oggetto `import.meta.hot` esiste solo sotto il dev server, e la documentazione chiede di racchiuderne l'uso in un `if`, così la build di produzione lo [elimina del tutto](https://vite.dev/guide/api-hmr#required-conditional-guard):

```js
// src/orologio.js: un modulo che accetta i propri aggiornamenti
export function mostra(el) {
  el.textContent = new Date().toLocaleTimeString();
}

if (import.meta.hot) {
  import.meta.hot.accept((nuovo) => {
    // nuovo è la versione aggiornata del modulo (undefined se c'è un errore di sintassi)
    nuovo?.mostra(document.querySelector('#orologio'));
  });
}
```

La chiamata va scritta proprio nella forma `import.meta.hot.accept(`, perché Vite la riconosce leggendo il sorgente senza eseguirlo; se il modulo ha effetti collaterali da ripulire prima che giri la nuova versione (un timer, un listener), li si chiude in `import.meta.hot.dispose()`. Nella pratica quotidiana, però, queste righe non si scrivono quasi mai a mano: l'API è [pensata soprattutto per chi scrive framework e strumenti](https://vite.dev/guide/api-hmr), e i plugin ufficiali la inseriscono da sé in ogni componente, come fa [React Fast Refresh](https://vite.dev/guide/features#hot-module-replacement) con `@vitejs/plugin-react`. Anche un file CSS importato si aggiorna [a caldo](https://vite.dev/guide/features#css), senza ricaricare la pagina.

## La build di produzione

`vite build` parte da `index.html` e consegna a Rolldown l'intero grafo: è qui che lavorano il <a href="../glossario/#/docs/moduli-e-bundling?id=tree-shaking" target="_blank" rel="noopener">tree-shaking</a>, che scarta il codice mai usato, e il <a href="../glossario/#/docs/moduli-e-bundling?id=come-funziona-il-code-splitting" target="_blank" rel="noopener">code-splitting</a>, che separa in file a parte, i *chunk*, ciò che viene caricato con un `import()` dinamico. Poi il codice viene **minificato** (spazi, commenti e nomi lunghi tolti, come spiegato nel <a href="../glossario/#/docs/react?id=minificazione-e-ottimizzazione" target="_blank" rel="noopener">glossario</a>): il JavaScript con il minificatore di Oxc, che è il valore predefinito di [`build.minify`](https://vite.dev/config/build-options#build-minify), e il CSS con [Lightning CSS](https://vite.dev/config/build-options#build-cssminify).

La build traduce il codice per i browser della fascia [Baseline *Widely Available*](https://vite.dev/guide/build#browser-compatibility), cioè le funzionalità disponibili da tempo in tutti i browser principali; per Vite 8 significa Chrome ed Edge 111, Firefox 114, Safari 16.4. La traduzione riguarda solo la **sintassi**: Vite non aggiunge *polyfill* (il codice che emula le API mancanti), e per i browser più vecchi esiste il plugin ufficiale `@vitejs/plugin-legacy`. Sopra il lavoro di Rolldown, Vite aggiunge alcune [ottimizzazioni proprie](https://vite.dev/guide/features#build-optimizations): inserisce nell'HTML i tag `<link rel="modulepreload">` per far scaricare in anticipo il codice di partenza e le sue dipendenze dirette, estrae in un file separato il CSS usato dai chunk caricati al bisogno, e riscrive gli `import()` dinamici perché scarichino in parallelo anche i chunk condivisi di cui avranno bisogno. Se un chunk supera i 500 kB, la build lo segnala con un avviso ([`build.chunkSizeWarningLimit`](https://vite.dev/config/build-options#build-chunksizewarninglimit)): non è un errore, ma un buon indizio che qualcosa andrebbe caricato al bisogno.

### Nomi con hash e cache a lungo termine

I file prodotti dalla build hanno nel nome un **hash**, una breve sequenza di caratteri calcolata a partire dal contenuto: il nome predefinito dei chunk in Rolldown è [`[name]-[hash].js`](https://rolldown.rs/reference/OutputOptions.chunkFileNames), e l'hash dipende solo dal contenuto finale del file. Ne viene fuori qualcosa come `index-BRBmoGS9.js`. Se il contenuto non cambia, il nome resta identico da una build all'altra; se cambia anche di un solo carattere, cambia il nome.

È la base della **cache a lungo termine**. Un file il cui nome cambia a ogni modifica non ha bisogno di essere ricontrollato: il server può mandarlo con `Cache-Control: max-age=31536000, immutable`, che dice al browser di tenerlo per un anno senza più chiedere, e quando il codice cambia arriva semplicemente un file con un altro nome. MDN chiama questa tecnica [*cache busting*](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control). L'unico file che non può avere un nome variabile è `index.html`, perché è l'indirizzo da cui tutto parte: va servito con `Cache-Control: no-cache`, che non vieta di conservarlo ma obbliga a ricontrollarlo con il server a ogni uso. La documentazione di Vite lo [raccomanda esplicitamente](https://vite.dev/guide/build#load-error-handling): un `index.html` vecchio rimasto in cache continuerebbe a puntare a chunk che il nuovo deploy potrebbe aver cancellato, e per gestire proprio quell'errore Vite emette l'evento `vite:preloadError`.

### Source map

Il codice minificato è illeggibile, e un errore in produzione indicherebbe la riga 1, colonna 48.213, di un file come `index-BRBmoGS9.js`. Le **source map** sono file che collegano ogni punto del codice generato alla riga corrispondente del sorgente originale, così il debugger e gli strumenti di analisi degli errori possono mostrare il codice scritto a mano (il meccanismo è descritto nel <a href="../typescript/#/docs/03-tsconfig?id=sourcemap" target="_blank" rel="noopener">vault TypeScript, all'opzione <code>sourceMap</code></a>). In sviluppo il dev server le fornisce da sé per i moduli che traduce, e per impostazione predefinita [nasconde dal debugger](https://vite.dev/config/server-options#server-sourcemapignorelist) i file di `node_modules`. Nella build, invece, l'opzione [`build.sourcemap`](https://vite.dev/config/build-options#build-sourcemap) è spenta, e i valori possibili sono pochi:

| Valore | Effetto |
|---|---|
| `false` (predefinito) | nessuna source map |
| `true` | un file `.map` separato accanto a ogni file JavaScript, con un commento che lo indica |
| `'inline'` | la source map scritta dentro il file stesso, codificata in Base64 (*data URI*) |
| `'hidden'` | come `true`, ma senza il commento: i browser non la trovano, gli strumenti di analisi degli errori sì |

La scelta `'hidden'` è il compromesso tipico in produzione: le mappe si caricano sul servizio che raccoglie gli errori, ma chi apre gli strumenti del browser non riceve il sorgente originale.

### Anatomia di una build

Dopo `vite build`, la cartella `dist/` ha una forma ricorrente: alla radice l'HTML e i file copiati da `public/`, sotto [`assets/`](https://vite.dev/config/build-options#build-assetsdir) tutto ciò che è passato dal bundler, con l'hash nel nome.

```
dist/
├── index.html               riscritto: punta ai file con hash
├── favicon.svg              copiato da public/ così com'è
├── robots.txt               copiato da public/
└── assets/
    ├── index-BRBmoGS9.js    il codice di partenza (entry chunk)
    ├── index-D8kLq2xF.css   il CSS estratto
    ├── Chart-C4mN7pQe.js    un chunk caricato con import() dinamico
    └── logo-Bx92kfTa.png    un'immagine importata da JavaScript
```

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 680 300" role="img" aria-label="La cartella dist dopo la build. Alla radice index.html, da servire con no-cache perché viene ricontrollato a ogni visita, e i file favicon.svg e robots.txt copiati da public con il nome invariato. Nella sottocartella assets i file con hash nel nome: index-BRBmoGS9.js e index-D8kLq2xF.css, a cui punta index.html, il chunk Chart-C4mN7pQe.js caricato con import dinamico dal codice di partenza, e logo-Bx92kfTa.png; tutta la cartella assets si può tenere in cache per un anno come immutable" style="width:100%;max-width:680px;height:auto;color:inherit"><defs><marker id="n06-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="20" y="20" width="640" height="270" rx="12" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="40" y="46" font-size="12.5" font-weight="700" font-family="ui-monospace,Menlo,monospace">dist/</text><rect x="40" y="70" width="210" height="54" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".14" stroke="currentColor" stroke-width="1.6"/><text x="145" y="93" font-size="12" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">index.html</text><text x="145" y="111" font-size="9.5" text-anchor="middle" opacity=".8">no-cache · ricontrollato a ogni visita</text><rect x="40" y="168" width="210" height="32" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3" stroke-dasharray="5 3"/><text x="145" y="188" font-size="11" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">favicon.svg</text><rect x="40" y="210" width="210" height="32" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3" stroke-dasharray="5 3"/><text x="145" y="230" font-size="11" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">robots.txt</text><text x="145" y="264" font-size="9.5" text-anchor="middle" opacity=".75">da public/, nome invariato</text><rect x="290" y="50" width="350" height="222" rx="10" fill="var(--link,#5fa04e)" fill-opacity=".07" stroke="currentColor" stroke-width="1.4"/><text x="310" y="74" font-size="12" font-weight="700" font-family="ui-monospace,Menlo,monospace">assets/</text><rect x="310" y="88" width="200" height="32" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="410" y="108" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">index-BRBmoGS9.js</text><rect x="310" y="132" width="200" height="32" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="410" y="152" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">index-D8kLq2xF.css</text><rect x="310" y="176" width="200" height="32" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3"/><text x="410" y="196" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">Chart-C4mN7pQe.js</text><rect x="310" y="220" width="200" height="32" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="410" y="240" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">logo-Bx92kfTa.png</text><line x1="252" y1="90" x2="306" y2="103" stroke="currentColor" stroke-width="1.4" marker-end="url(#n06-c)"/><line x1="252" y1="106" x2="306" y2="145" stroke="currentColor" stroke-width="1.4" marker-end="url(#n06-c)"/><path d="M512 104 C 565 112, 565 184, 514 192" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3" marker-end="url(#n06-c)"/><text x="572" y="152" font-size="10" font-family="ui-monospace,Menlo,monospace">import()</text><text x="578" y="236" font-size="10.5" text-anchor="middle" font-weight="700">immutable</text><text x="578" y="251" font-size="9.5" text-anchor="middle" opacity=".8">in cache un anno</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem"><code>index.html</code> è l'unico file dal nome fisso che punta al resto: va ricontrollato a ogni visita. I file in <code>assets/</code> cambiano nome quando cambia il contenuto, quindi possono restare in cache a tempo indeterminato; il chunk tratteggiato viene scaricato solo quando il codice esegue l'<code>import()</code>. I file di <code>public/</code> arrivano senza hash, esattamente come erano.</figcaption>
</figure>

Prima di pubblicare, `vite preview` serve la cartella `dist/` in locale per un ultimo controllo: è un server statico pensato [solo per l'anteprima](https://vite.dev/guide/static-deploy), non per la produzione. Quando l'HTML non lo genera Vite ma un framework lato server (Rails, Laravel, un backend Node), l'opzione [`build.manifest`](https://vite.dev/config/build-options#build-manifest) scrive in `dist/.vite/manifest.json` la tabella che associa ogni sorgente al suo file con hash, così il server sa quali tag inserire nella pagina.

## Il file di configurazione

Vite funziona senza configurazione, ma quasi ogni progetto ha un file **`vite.config.js`** (o `.ts`) nella radice, che esporta un oggetto di opzioni. Per scriverlo con `import` ed `export`, dice la [documentazione](https://vite.dev/config/), il file deve essere riconosciuto da Node come ES module, secondo le regole del [[02-moduli-e-pacchetti#come-node-sceglie-fra-i-due|capitolo 02]] (estensione `.mjs`, oppure `.js` con `"type": "module"`). La stessa pagina spiega come viene caricato: per impostazione predefinita Vite lo impacchetta con Rolldown in un file temporaneo dentro `node_modules/.vite-temp` e poi lo importa, il che permette di scriverlo in TypeScript anche quando Node non saprebbe eseguirlo direttamente. Con `vite --configLoader native` il file viene invece eseguito così com'è dal runtime, e per un `vite.config.ts` serve allora una versione di Node che esegua TypeScript da sé (22.18 o successiva, come spiegato nel [[04-varianti-di-javascript|capitolo 04]]); la documentazione annuncia che questa modalità diventerà quella predefinita in una prossima versione maggiore.

Il punto importante è che la configurazione **gira in Node**, non nel browser: può importare `node:path`, leggere `process.env`, usare `import.meta.dirname` come qualunque script del [[02-moduli-e-pacchetti#dove-si-trova-il-modulo-importmeta|capitolo 02]].

```js
// vite.config.js
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  base: command === 'build' ? '/mia-app/' : '/',
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  define: {
    // npm imposta npm_package_version quando si lancia «npm run …»
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? 'dev'),
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  build: {
    sourcemap: mode === 'staging',
  },
}));
```

La funzione `defineConfig()` non cambia nulla a runtime: serve all'editor per suggerire le opzioni e controllarne i tipi. Al suo interno si può passare un oggetto oppure, come qui, una funzione che riceve il **comando** (`'serve'` per il dev server, `'build'` per la build) e la **modalità**, e restituisce una configurazione diversa a seconda dei casi: è la [configurazione condizionale](https://vite.dev/config/#conditional-config). Nell'esempio il percorso `base` cambia solo per la build, e le source map si accendono solo in modalità `staging`.

| Chiave | A che cosa serve |
|---|---|
| [`plugins`](https://vite.dev/config/shared-options#plugins) | l'elenco dei plugin, nell'ordine in cui vanno applicati; i valori falsi vengono ignorati, così un plugin si attiva con una condizione |
| [`base`](https://vite.dev/config/shared-options#base) | il percorso pubblico da cui l'app sarà servita (predefinito `/`); serve quando si pubblica in una sottocartella, per esempio `'/<repo>/'` su [GitHub Pages](https://vite.dev/guide/static-deploy#github-pages) |
| [`resolve.alias`](https://vite.dev/config/shared-options#resolve-alias) | sostituzioni nei percorsi degli `import`: con l'alias sopra, `'@/utils/date'` diventa `src/utils/date` |
| [`define`](https://vite.dev/config/shared-options#define) | costanti globali sostituite nel codice durante la build |
| [`server`](https://vite.dev/config/server-options) | opzioni del dev server: porta, apertura del browser, *proxy* verso un backend |
| [`build`](https://vite.dev/config/build-options) | opzioni della build: cartella di uscita (`outDir`, predefinita `dist`), browser di destinazione, minificazione, source map |

Alcune chiavi meritano due parole in più. Gli alias di `resolve.alias` vanno scritti con **percorsi assoluti**, perché un percorso relativo verrebbe usato così com'è, e di qui l'uso di `resolve(import.meta.dirname, 'src')`. In un progetto TypeScript lo stesso alias va dichiarato anche in `paths` di `tsconfig.json`, altrimenti l'editor non lo capisce; per non scriverlo due volte, da Vite 8 l'opzione [`resolve.tsconfigPaths: true`](https://vite.dev/config/shared-options#resolve-tsconfigpaths) fa leggere a Vite direttamente i `paths` di `tsconfig.json`.

La chiave `define` è una **sostituzione testuale**: ovunque nel codice compaia l'identificatore `__APP_VERSION__`, la build lo rimpiazza con il valore. Per questo un valore di tipo stringa va passato attraverso `JSON.stringify()`, che lo racchiude fra virgolette: senza, nel codice finirebbe `1.4.0` nudo invece di `"1.4.0"`. In TypeScript la costante va anche dichiarata, per esempio con `declare const __APP_VERSION__: string` nel file `src/vite-env.d.ts`. La chiave `server.proxy`, infine, fa sì che una richiesta del browser a `http://localhost:3000/api/utenti` venga girata dal dev server a `http://localhost:8080/api/utenti`: dal punto di vista del browser la richiesta resta sulla stessa origine, e i problemi di <a href="../glossario/#/docs/web-browser?id=cross-origin-cors" target="_blank" rel="noopener">CORS</a> in sviluppo spariscono.

Per le opzioni di Rolldown che Vite non espone direttamente c'è [`build.rolldownOptions`](https://vite.dev/config/build-options#build-rolldownoptions). Nei tutorial meno recenti si incontra `build.rollupOptions`: da Vite 8 è un alias deprecato della nuova chiave, e la [guida alla migrazione](https://vite.dev/guide/migration) elenca le altre opzioni rinominate nel passaggio da esbuild e Rollup a Oxc e Rolldown.

> [!info|label:Legacy]
> Prima di Vite, la configurazione tipica di una web app era un `webpack.config.js`. Il modello di [webpack](https://webpack.js.org/concepts/) ruota attorno all'**entry** (il file da cui parte il grafo), all'**output** e soprattutto ai **loader**, trasformazioni da dichiarare a mano per ogni tipo di file che non sia JavaScript, applicate [da destra verso sinistra](https://webpack.js.org/concepts/loaders/); il dev server era un pacchetto a parte, `webpack-dev-server`, che impacchettava tutto anche in sviluppo.
>
> ```js
> // webpack.config.js
> export default {
>   mode: 'production',
>   entry: './src/index.js',
>   output: { filename: '[name].[contenthash].js' },
>   module: {
>     rules: [
>       { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
>       { test: /\.png$/i, type: 'asset/resource' },
>     ],
>   },
> };
> ```
>
> Webpack non è abbandonato (è [attivamente mantenuto](https://webpack.js.org/blog/2026-02-04-roadmap-2026/), e dalla versione 5 gli *asset modules* come `type: 'asset/resource'` sostituiscono i vecchi `file-loader` e `url-loader`), e lo si incontra ancora in moltissimi progetti esistenti; per un progetto nuovo, però, la strada è Vite, che riconosce da sé CSS, immagini e TypeScript senza loader da configurare. Il ruolo di webpack oggi è descritto nel <a href="../glossario/#/docs/bundler?id=webpack" target="_blank" rel="noopener">glossario alla voce webpack</a>.

## Variabili d'ambiente e modalità

In un programma Node le **variabili d'ambiente** (coppie nome-valore che il sistema operativo passa a ogni processo) si leggono da `process.env`, come accennato nel [[01-dentro-node#stesso-linguaggio-ambiente-diverso|capitolo 01]]. Nel browser `process` non esiste. Vite colma la distanza con l'oggetto **`import.meta.env`**: in sviluppo è definito come variabile globale, mentre nella build ogni sua occorrenza viene [sostituita staticamente](https://vite.dev/guide/env-and-mode) con il valore, come fa `define`. Una conseguenza pratica è che va scritto per esteso, `import.meta.env.VITE_API_URL`: una forma calcolata come `import.meta.env['VITE_' + nome]` non viene riconosciuta.

Alcune costanti ci sono [sempre](https://vite.dev/guide/env-and-mode#built-in-constants):

| Costante | Valore |
|---|---|
| `import.meta.env.MODE` | la modalità in cui gira l'app (`'development'`, `'production'` o una personalizzata) |
| `import.meta.env.BASE_URL` | il percorso pubblico impostato con `base` |
| `import.meta.env.PROD` | `true` in produzione |
| `import.meta.env.DEV` | `true` in sviluppo, sempre l'opposto di `PROD` |
| `import.meta.env.SSR` | `true` se il codice gira sul server (rendering lato server) |

La **modalità** è un'etichetta che dice per quale ambiente si sta lavorando: il dev server parte in `development`, la build in `production`, e l'opzione `--mode` permette di sceglierne un'altra, per esempio `vite build --mode staging`. Da essa dipende quali file `.env` vengono letti. Vite li cerca nella radice del progetto (o nella cartella indicata da [`envDir`](https://vite.dev/config/shared-options#envdir)):

| File | Quando viene caricato |
|---|---|
| `.env` | sempre |
| `.env.local` | sempre, ma da tenere fuori da git |
| `.env.[mode]` | solo nella modalità indicata, per esempio `.env.production` |
| `.env.[mode].local` | solo in quella modalità, fuori da git |

Le [regole di precedenza](https://vite.dev/guide/env-and-mode#env-files) sono due: un file specifico di una modalità vince su quello generico, e una variabile già presente nell'ambiente quando si lancia Vite (come in `VITE_API_URL=https://… vite build`) vince su tutti i file. I file vengono letti all'avvio, quindi dopo una modifica il server va riavviato.

Nel codice dell'applicazione arrivano **solo** le variabili il cui nome comincia con **`VITE_`** (il prefisso si cambia con [`envPrefix`](https://vite.dev/config/shared-options#envprefix)), e arrivano sempre come **stringhe**, anche quando il valore sembra un numero o un booleano.

```bash
# .env
VITE_API_URL=https://api.esempio.it
DB_PASSWORD=segreta
```

```js
console.log(import.meta.env.VITE_API_URL);   // "https://api.esempio.it"
console.log(import.meta.env.DB_PASSWORD);    // undefined: senza prefisso non arriva al browser

if (import.meta.env.DEV) {
  console.log('solo in sviluppo');           // nella build di produzione questo blocco sparisce
}
```

> [!warning]
> Il prefisso `VITE_` **non** protegge nulla: è il contrario, è il permesso di finire nel bundle. Il valore viene scritto nel JavaScript che chiunque può scaricare e leggere, quindi chiavi di API private, password e token non vanno mai in una variabile `VITE_`, come avverte la [documentazione](https://vite.dev/guide/env-and-mode#env-variables); un segreto resta su un server. I file `*.local` vanno comunque aggiunti a `.gitignore`.

In un progetto TypeScript, i nomi delle variabili personalizzate si dichiarano estendendo l'interfaccia `ImportMetaEnv` in `src/vite-env.d.ts`, così l'editor li suggerisce e ne conosce il tipo ([dettagli](https://vite.dev/guide/env-and-mode#intellisense-for-typescript)). Il file di configurazione, invece, vede solo le variabili già presenti in `process.env`: i file `.env` vengono letti **dopo** la configurazione, perché quali file leggere dipende da opzioni che stanno nella configurazione stessa. Se un valore di `.env` deve influenzare la configurazione, lo si carica a mano con la funzione [`loadEnv()`](https://vite.dev/config/#using-environment-variables-in-config) esportata da Vite.

Un'ultima distinzione evita confusioni: la modalità e `NODE_ENV` sono [due cose diverse](https://vite.dev/guide/env-and-mode#node-env-and-modes). `vite build --mode staging` lascia `NODE_ENV` a `"production"` (quindi `import.meta.env.PROD` vale `true`) e cambia solo la modalità, cioè i file `.env` letti e il valore di `import.meta.env.MODE`.

## Gli asset statici

Gli **asset** sono i file che non sono codice: immagini, font, icone, video. In Vite un asset si può **importare** come un modulo, e l'import [restituisce il suo URL](https://vite.dev/guide/assets#importing-asset-as-url) pubblico: in sviluppo qualcosa come `/src/img.png`, nella build un nome con hash come `/assets/img-2d8efhgA.png`.

```js
import logoUrl from './logo.png';        // una stringa: l'URL dell'immagine
import './stile.css';                     // inietta il CSS nella pagina
import classi from './card.module.css';   // CSS Modules: un oggetto con i nomi delle classi
import dati from './dati.json';           // il contenuto del JSON, già convertito in oggetto

document.querySelector('#logo').src = logoUrl;
```

Importare un asset invece di scriverne il percorso a mano ha tre vantaggi: l'immagine entra nel grafo, quindi un percorso sbagliato diventa un errore di build invece di un'immagine rotta in produzione; riceve l'hash e quindi la cache a lungo termine; e i file più piccoli di [`build.assetsInlineLimit`](https://vite.dev/config/build-options#build-assetsinlinelimit), 4 KiB per impostazione predefinita, vengono incorporati direttamente nel codice come *data URL* in <a href="../glossario/#/docs/formati-e-fondamenti?id=base64-btoa-atob" target="_blank" rel="noopener">Base64</a>, risparmiando una richiesta. Lo stesso trattamento vale per i riferimenti `url()` dentro il CSS. Un file `.css` importato viene iniettato nella pagina con un tag `<style>`, mentre un file che finisce in `.module.css` è trattato come [CSS Modules](https://vite.dev/guide/features#css-modules): i nomi delle classi vengono resi unici e l'import restituisce l'oggetto che li associa ai nomi originali.

Un **suffisso** nell'import cambia il modo in cui il file viene trattato:

| Import | Risultato |
|---|---|
| `import url from './file.js?url'` | l'URL del file, anche per tipi che Vite non riconosce come asset |
| `import testo from './shader.glsl?raw'` | il contenuto del file come stringa |
| `import icona from './icona.svg?inline'` | il file sempre incorporato come data URL, qualunque sia la dimensione |
| `import CalcoloWorker from './calcolo.js?worker'` | un costruttore: `new CalcoloWorker()` avvia il modulo come Web Worker |

Esiste anche una strada che passa solo per lo standard: `new URL('./img.png', import.meta.url)` costruisce l'URL di un file accanto al modulo, e Vite la [riconosce](https://vite.dev/guide/assets#new-url-url-import-meta-url) durante la build purché il percorso sia scritto per intero, non calcolato.

Alcuni file, però, non devono passare dal bundler. È il caso di `robots.txt`, che nessun codice importa, o di una favicon che deve mantenere esattamente il suo nome. Per questi c'è la cartella **`public/`** nella radice del progetto: il suo contenuto viene [servito alla radice](https://vite.dev/guide/assets#the-public-directory) `/` in sviluppo e copiato tale e quale nella radice di `dist/` durante la build, senza hash e senza trasformazioni. Si fa riferimento a quei file con un percorso assoluto: `public/icona.png` si scrive `/icona.png`. La regola pratica è importare tutto ciò che il codice usa e riservare `public/` ai file che devono conservare nome e posizione.

## I plugin

Un **plugin** è il modo in cui si insegna a Vite qualcosa che non sa fare da solo: supportare un framework, un nuovo tipo di file, una trasformazione del codice. Concretamente è un **oggetto** con un nome e alcuni **hook**: funzioni con nomi prestabiliti che il bundler chiama in momenti precisi del suo lavoro, passando ogni volta i dati del momento (il percorso di un modulo, il suo codice, l'HTML della pagina) e lasciando al plugin la possibilità di intervenire. Per convenzione un plugin si distribuisce come una funzione che accetta delle opzioni e restituisce l'oggetto, ed è per questo che nella configurazione si scrive `react()` e non `react`.

I plugin di Vite [estendono l'interfaccia dei plugin di Rolldown](https://vite.dev/guide/api-plugin), che a sua volta è [quasi del tutto compatibile](https://rolldown.rs/apis/plugin-api) con quella di [Rollup](https://rollupjs.org/plugin-development/): molti plugin scritti per Rollup funzionano quindi anche in Vite, e lo stesso plugin vale sia in sviluppo sia nella build. La differenza fra le due strade si vede in quali hook vengono chiamati:

| Hook | Quando viene chiamato | Compito |
|---|---|---|
| `config`, `configResolved` | all'avvio (solo Vite) | modificare o leggere la configurazione |
| `options`, `buildStart` | all'avvio del server o della build | preparare lo stato del plugin |
| `resolveId` | per ogni `import` | decidere a quale file (o modulo virtuale) corrisponde |
| `load` | per ogni modulo | fornirne il contenuto |
| `transform` | per ogni modulo | trasformarne il codice |
| `transformIndexHtml` | sull'HTML (solo Vite) | modificare la pagina |
| `configureServer` | solo nel dev server (solo Vite) | aggiungere *middleware* al server |
| `handleHotUpdate` | quando un file cambia (solo Vite) | personalizzare l'HMR |
| `renderChunk`, `generateBundle` | solo nella build | intervenire sui file prodotti |

In sviluppo il dev server chiama `resolveId`, `load` e `transform` [a ogni richiesta](https://vite.dev/guide/api-plugin#rolldown-hooks) di un modulo, mentre gli hook che lavorano sui file prodotti non vengono mai chiamati, perché un bundle non esiste. Nella build gli stessi hook girano su tutto il grafo, seguiti da quelli di generazione dell'output.

Un esempio piccolo mostra i due hook più istruttivi. Un **modulo virtuale** è un modulo che non esiste su disco: lo inventa un plugin, rispondendo a `resolveId` e `load`, ed è un modo comodo per passare al codice informazioni note solo al momento della build.

```js
// vite.config.js
import { defineConfig } from 'vite';

function buildInfo() {
  const id = 'virtual:build-info';
  const idRisolto = '\0' + id;   // il prefisso \0 segnala agli altri plugin un modulo virtuale

  return {
    name: 'build-info',           // obbligatorio: compare negli avvisi e negli errori
    resolveId(source) {
      if (source === id) return idRisolto;
    },
    load(moduleId) {
      if (moduleId === idRisolto) {
        return `export const builtAt = ${JSON.stringify(new Date().toISOString())};`;
      }
    },
  };
}

export default defineConfig({
  plugins: [buildInfo()],
});
```

Nel codice dell'applicazione basta `import { builtAt } from 'virtual:build-info'`. Quando il bundler incontra quell'import chiede a tutti i plugin, attraverso `resolveId`, a che cosa corrisponda; `buildInfo` risponde con l'identificatore prefissato da `\0`, la [convenzione di Rollup](https://rollupjs.org/plugin-development/#conventions) che dice agli altri plugin di non provare a trattarlo come un file. Poi il bundler chiede il contenuto con `load`, e il plugin restituisce una riga di JavaScript generata al momento. Un hook che restituisce `undefined` passa semplicemente la mano al plugin successivo.

Due proprietà regolano il comportamento di un plugin nel suo insieme: [`enforce`](https://vite.dev/guide/api-plugin#plugin-ordering) (`'pre'` o `'post'`) lo sposta prima o dopo i plugin interni di Vite, e [`apply`](https://vite.dev/guide/api-plugin#conditional-application) (`'serve'` o `'build'`) lo limita al dev server o alla build. Rolldown aggiunge infine i [filtri degli hook](https://vite.dev/guide/api-plugin#hook-filters): un hook può dichiarare con una proprietà `filter` (per esempio un'espressione regolare sul percorso) quali moduli gli interessano, così il motore in Rust evita di chiamare il codice JavaScript del plugin per tutti gli altri. È un dettaglio che conta proprio per la divisione dei compiti vista all'inizio: ogni passaggio da Rust a JavaScript ha un costo, e i plugin più diffusi usano già i filtri.

> [!info|label:Nel repo]
> Questo progetto è un caso istruttivo per contrasto: **non ha bundler**. Gli appunti sono file Markdown che docsify rende direttamente nel browser, e le poche librerie sono copiate in `assets/vendor/`; il README del progetto, alla sezione *Architettura*, spiega perché un bundler qui sposterebbe soltanto file già pronti. Un bundler ripaga quando c'è codice da tradurre, un grafo da ottimizzare e una cache da gestire con gli hash, cioè in quasi ogni applicazione, ma non in un quaderno di appunti.

> [!tip]
> Vite è un programma Node con due modi di lavorare: in sviluppo serve gli ES modules uno per uno, traducendoli su richiesta, impacchetta in anticipo solo le dipendenze e aggiorna i moduli con l'HMR; in produzione Rolldown costruisce il grafo intero e scrive in `dist/` file minificati con l'hash nel nome, da servire con cache lunga, lasciando `index.html` sempre ricontrollato. La configurazione gira in Node, nel browser arrivano solo le variabili `VITE_`, e nessun segreto deve stare fra queste.

## Ripasso lampo

<details>
<summary>Perché <code>vite</code> parte quasi subito anche su un progetto grande, mentre <code>vite build</code> impiega di più?</summary>

Perché in sviluppo il codice dell'applicazione non viene impacchettato: il dev server lo serve come ES modules nativi e traduce ogni file solo quando il browser lo chiede, quindi il lavoro dipende dalle pagine aperte e non dalla dimensione del progetto. La build invece elabora tutto il grafo in una volta, con tree-shaking, code-splitting e minificazione.

</details>

<details>
<summary>A che cosa serve il pre-bundling delle dipendenze, e che cosa c'è in <code>node_modules/.vite</code>?</summary>

Serve a convertire in ES modules i pacchetti CommonJS o UMD e a ridurre a un solo file i pacchetti fatti di centinaia di moduli, che altrimenti produrrebbero centinaia di richieste. `node_modules/.vite` è la cache su disco di quel lavoro, rifatta quando cambiano lockfile, patch, configurazione o `NODE_ENV`, oppure a mano con `vite --force`. Vale solo in sviluppo.

</details>

<details>
<summary>Quando un aggiornamento si applica a caldo e quando invece la pagina si ricarica per intero?</summary>

Il dev server risale dal modulo modificato verso i suoi importatori, nel grafo dei moduli, finché trova un confine HMR, cioè un modulo che chiama `import.meta.hot.accept()` (di solito inserito da un plugin del framework); il server avvisa il browser via WebSocket, e il browser riesegue solo quel modulo. Se la risalita arriva al punto d'ingresso senza trovare un confine, la pagina si ricarica per intero.

</details>

<details>
<summary>Perché i file di <code>dist/assets/</code> hanno un hash nel nome, e come vanno serviti rispetto a <code>index.html</code>?</summary>

L'hash è calcolato dal contenuto: se il file cambia, cambia il nome. Quei file si possono quindi servire con `Cache-Control: max-age=31536000, immutable` e tenere in cache per un anno, perché una nuova versione arriverà con un nome nuovo. `index.html`, che ha un nome fisso e punta a tutti gli altri, va servito con `no-cache`, così il browser lo ricontrolla a ogni visita e non resta legato a chunk vecchi.

</details>

<details>
<summary>Perché <code>DB_PASSWORD</code> scritta in <code>.env</code> non arriva al codice del browser, e perché neanche una variabile <code>VITE_</code> è un posto sicuro per un segreto?</summary>

Perché Vite espone in `import.meta.env` solo le variabili con il prefisso `VITE_`. Quelle, però, vengono scritte nel JavaScript della build, che chiunque può scaricare e leggere: il prefisso è il permesso di finire nel bundle, non una protezione. I segreti restano su un server.

</details>
