# Micro frontend con single-spa

Paradigma per orchestrare più micro frontend nella stessa pagina, caricandoli a runtime come moduli separati. Riferimento storico o per progetti che lo adottano.

## Micro frontend con single-spa

[single-spa](https://single-spa.js.org/) è un framework per orchestrare più micro frontend nella stessa pagina, caricandoli e scaricandoli **a runtime** come moduli separati. Si appoggia a due meccanismi.

### Import Map

Un'**import map** dice al browser dove trovare ogni modulo importato per nome, spostando la **risoluzione dei moduli a runtime**.

```html
<script type="importmap">
{ "imports": { "react": "https://esm.sh/react@18" } }
</script>
```

In un progetto "normale" (es. con Webpack/Vite) la risoluzione avviene a **build time**: il bundler sa dove trovare `react` in `node_modules` e lo include nel bundle. In un'architettura micro frontend, invece, ogni app può avere dipendenze e versioni diverse ed essere servita da un server distinto: l'import map permette al browser di sapere, **a runtime**, da dove caricare ciascun modulo — così ogni micro frontend usa la sua versione di una libreria senza interferenze.

> [!warning]
> Le import map **non** sono più una proposta sperimentale: sono uno standard supportato dai browser moderni (Chrome/Edge 89+, Firefox 108+, Safari 16.4+). Vanno però dichiarate **prima** di qualsiasi `<script type="module">`.

> [!tip]
> Il vault Angular usa le import map in un contesto diverso (**Native Federation**), descritto in <a href="../angular/#/capitoli/18-micro-frontends" target="_blank" rel="noopener">ch18 · Micro Frontends</a>.

### SystemJS

[SystemJS](https://github.com/systemjs/systemjs) è un **module loader universale**: carica a runtime moduli in formati diversi (ES modules, CommonJS, AMD, global) in tutti i browser, tramite l'API `System.import()`. È spesso abbinato a single-spa per caricare i micro frontend come moduli separati on-demand.

```js
System.import('nomeApplicazione').then((app) => {
  // il modulo è stato caricato ed eseguito a runtime
});
```

Serve perché `System.import()` non è una funzione standard del linguaggio: SystemJS ne fornisce l'implementazione in modo cross-browser. Con le import map ormai native, in molti scenari il suo ruolo è ridotto, ma resta usato dove serve caricare formati misti o supportare browser datati.
