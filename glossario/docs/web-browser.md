# Web, browser e rete

Termini legati a come i siti vengono indirizzati, serviti e resi dal browser.

## Dominio

Un dominio è l'identificatore leggibile che rappresenta un sito su Internet. È composto da **nome** ed **estensione** (TLD, *top-level domain*): in `google.com`, `google` è il nome e `.com` l'estensione. Serve a evitare di dover ricordare l'indirizzo IP numerico del server.

Il collegamento tra dominio e server avviene tramite il **DNS** (*Domain Name System*), che traduce il nome in un indirizzo IP. Quando si digita un indirizzo, il browser interroga il DNS, ottiene l'IP del server web e gli invia la richiesta; il server risponde con i file che compongono il sito. La registrazione di un dominio passa per un *registrar* (es. Verisign, GoDaddy).

## Sottodominio

Un sottodominio è una suddivisione di un dominio principale, usata per separare aree del sito. In `blog.esempio.com`, `blog` è il sottodominio. Usi tipici: sezioni distinte (`shop.`, `support.`) o varianti per lingua (`it.esempio.com`). Come i domini, i sottodomini si gestiscono via DNS, dal pannello del provider di hosting o del registrar.

## Cache

La cache è una memoria temporanea in cui si conservano dati usati di frequente, per accedervi più in fretta e ridurre il lavoro ripetuto. Nello sviluppo assume forme diverse a seconda del livello:

- **Cache del browser** — file statici (CSS, JS, immagini) memorizzati per velocizzare le visite successive.
- **Cache del database** — risultati di query frequenti tenuti pronti per migliorare le prestazioni.
- **Cache del codice** — bytecode/compilato tenuto da runtime come Node.js o .NET per ridurre il tempo di avvio.
- **Cache HTTP** — risposte HTTP conservate per alleggerire il server e rispondere più rapidamente.

> [!warning]
> La cache è la causa più comune di "ho aggiornato ma vedo la versione vecchia". In fase di debug conviene disattivarla (DevTools → *Network* → *Disable cache*) o fare un hard reload.

## Blink

Blink è il **motore di rendering** che trasforma HTML, CSS e JavaScript in ciò che appare a schermo. È usato dai browser basati su Chromium: Google Chrome, Microsoft Edge (versioni recenti), Opera, Brave, Vivaldi. Safari usa invece WebKit (da cui Blink deriva come fork) e Firefox usa Gecko.

> [!tip]
> A grandi linee la **pipeline di rendering**: il markup diventa **DOM**, il CSS diventa **CSSOM**, i due si combinano nel *render tree*; seguono **layout** (posizione e dimensioni di ogni elemento), **paint** (riempimento dei pixel) e **composite** (composizione dei layer). Il motore JavaScript (in Chromium è **V8**) è un componente separato dal motore di rendering, ma collabora con esso.

## Debugger (Chrome DevTools)

Il debugger integrato in Chrome (scheda *Sources* dei DevTools) permette di fermare l'esecuzione del codice e ispezionarlo passo passo, invece di disseminare `console.log`.

Flusso tipico:
1. Aprire i DevTools (`Ctrl+Shift+I`, o `Cmd+Option+I` su Mac) e andare in *Sources*.
2. Aprire il file da analizzare e cliccare sul numero di riga per impostare un **breakpoint** (punto di interruzione).
3. Eseguire il codice: l'esecuzione si ferma al breakpoint.
4. Ispezionare le variabili nel pannello *Scope*; osservare la *Call Stack*.
5. Avanzare con i controlli: *step over* (`F10`), *step into* (`F11`), *step out* (`Shift+F11`), *resume* (`F8`).

> [!tip]
> La keyword `debugger;` nel codice mette un breakpoint via software: l'esecuzione si ferma su quella riga quando i DevTools sono aperti.

## Event bubbling

L'event bubbling (*propagazione*) descrive come un evento del DOM, dopo essere partito dall'elemento più interno (il *target*), **risale** verso gli antenati fino alla radice del documento. Un click su un pulsante viene quindi gestito prima dal pulsante, poi dal genitore, e così via.

```js
// <div id="parent"><button id="child">Click</button></div>
parent.addEventListener('click', () => console.log('genitore'));
child.addEventListener('click', () => console.log('figlio'));
// Click sul pulsante → console: "figlio", poi "genitore"
```

Per impedire la risalita si usa `stopPropagation()`:

```js
child.addEventListener('click', (e) => {
  e.stopPropagation();
  console.log('figlio'); // il genitore non riceve più l'evento
});
```

> [!tip]
> Prima del bubbling esiste una fase di **capturing** (dalla radice verso il target). Si attiva passando `{ capture: true }` come terzo argomento di `addEventListener`. Il modello completo è quindi *capture → target → bubbling*.
