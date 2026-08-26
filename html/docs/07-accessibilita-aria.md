---
modulo: 7
titolo: "Accessibilità e ARIA"
tags: [tipo/modulo, accessibilita, aria]
---
# 07 · Accessibilità e ARIA
> modulo 7 — *HTML* · rif. MDN · WAI-ARIA

L'accessibilità (spesso abbreviata in **a11y**) è la pratica di rendere il web usabile da **tutti**, comprese le persone che navigano con uno screen reader, con la sola tastiera, con comandi vocali, con lo schermo ingrandito, o che hanno differenze visive, uditive, motorie o cognitive. Non è una nicchia: è un requisito di qualità (e in Europa anche di legge, con l'*European Accessibility Act* in vigore dal 2025) e quasi sempre ciò che la migliora torna utile a chiunque. La buona notizia, ripetuta in tutto questo vault, è che **l'HTML semantico dà gratis gran parte dell'accessibilità**: questo modulo spiega perché, e cosa fare quando il semantico non basta.

## L'albero di accessibilità

Accanto al DOM ([[01-documento-dom]]), il browser costruisce un secondo albero: l'**albero di accessibilità**. È una versione della pagina pensata per le tecnologie assistive, in cui ogni elemento è ridotto a ciò che serve per usarlo: il suo **ruolo** (cos'è — un pulsante, un link, una casella), il suo **nome** (l'etichetta con cui viene annunciato) e il suo **stato** (premuto, selezionato, espanso…). Uno screen reader non "vede" la pagina: legge quest'albero.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 720 236" role="img" aria-label="Da HTML all'albero di accessibilità: ruolo, nome, stato" style="width:100%;max-width:700px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="170" y="24" font-size="12" text-anchor="middle" font-weight="700">HTML</text><text x="560" y="24" font-size="12" text-anchor="middle" font-weight="700">Albero di accessibilità</text><rect x="40" y="44" width="260" height="48" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="52" y="73" font-size="11.5" font-family="ui-monospace,Menlo,Consolas,monospace">&lt;button&gt;Salva&lt;/button&gt;</text><rect x="40" y="104" width="260" height="48" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="52" y="133" font-size="11.5" font-family="ui-monospace,Menlo,Consolas,monospace">&lt;a href="/aiuto"&gt;Aiuto&lt;/a&gt;</text><rect x="40" y="164" width="260" height="56" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="52" y="185" font-size="11" font-family="ui-monospace,Menlo,Consolas,monospace">&lt;input type="checkbox" checked&gt;</text><text x="52" y="203" font-size="11" font-family="ui-monospace,Menlo,Consolas,monospace">&lt;label&gt;Notifiche&lt;/label&gt;</text><rect x="430" y="44" width="260" height="48" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="444" y="73" font-size="12">button · «Salva»</text><rect x="430" y="104" width="260" height="48" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="444" y="133" font-size="12">link · «Aiuto»</text><rect x="430" y="164" width="260" height="56" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="444" y="185" font-size="12">checkbox · «Notifiche»</text><text x="444" y="203" font-size="11" opacity=".75">stato: selezionato</text><path d="M300 68 L426 68" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M430 68 L422 63 L422 73 Z" fill="currentColor"/><path d="M300 128 L426 128" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M430 128 L422 123 L422 133 Z" fill="currentColor"/><path d="M300 192 L426 192" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M430 192 L422 187 L422 197 Z" fill="currentColor"/></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Ogni elemento HTML si riduce, nell'albero di accessibilità, a <strong>ruolo · nome · stato</strong>: è ciò che lo screen reader annuncia. Gli elementi semantici (<code>&lt;button&gt;</code>, <code>&lt;a&gt;</code>, <code>&lt;input&gt;</code> con la sua <code>&lt;label&gt;</code>) lo popolano correttamente da soli.</figcaption>
</figure>

Il punto cruciale è che gli elementi HTML semantici **popolano quest'albero da soli, e correttamente**. Un `<button>` ha già ruolo "button"; una `<label>` collegata dà il nome al campo; un `<input type="checkbox">` espone lo stato "selezionato". Scrivere HTML semantico *è* fare accessibilità. I problemi nascono quando si costruisce tutto con `<div>`: l'albero si riempie di nodi muti, senza ruolo né nome.

## La prima regola di ARIA

**ARIA** (*Accessible Rich Internet Applications*) è un insieme di attributi che permettono di **correggere o arricchire** l'albero di accessibilità quando l'HTML da solo non basta: aggiungere un ruolo, un nome, uno stato. Ma va usato con parsimonia, e la regola d'oro è netta:

> [!warning]
> **"No ARIA is better than bad ARIA"** — nessun ARIA è meglio di ARIA sbagliato. ARIA cambia *solo* ciò che viene annunciato, **non** il comportamento: un `<div role="button">` viene letto come pulsante, ma non è raggiungibile da tastiera e non risponde a Invio/Spazio finché non glielo si aggiunge a mano (con `tabindex` e gestori di eventi). Un `<button>` dà tutto questo gratis. **Prima l'elemento nativo giusto; ARIA solo quando non esiste.**

## Quando ARIA serve davvero

Ci sono casi legittimi in cui l'HTML non ha un elemento adatto e ARIA è la risposta:

- **Nominare un controllo senza testo visibile** — un pulsante con la sola icona ha bisogno di un nome: `aria-label="Cerca"`. Senza, viene annunciato solo come "pulsante".
- **Collegare un errore o una descrizione a un campo** — `aria-describedby="err-email"` fa leggere il messaggio d'errore insieme al campo; `aria-invalid="true"` ne segnala lo stato.
- **Annunciare aggiornamenti dinamici** — una *live region* con `aria-live="polite"` fa annunciare un contenuto che cambia senza ricaricare la pagina (un "salvato", un conteggio di risultati).
- **Widget complessi non esprimibili in HTML** — tab, combobox, tree: qui servono ruoli e stati ARIA (`role="tab"`, `aria-selected`, `aria-expanded`). Conviene seguire i modelli collaudati dell'**[ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)**, non inventarli.

I mattoni di ARIA sono tre famiglie: i **ruoli** (`role="tablist"`), gli **stati** (`aria-expanded`, `aria-checked`: dinamici) e le **proprietà** (`aria-label`, `aria-describedby`: più stabili).

## Il nome accessibile

Il **nome accessibile** è l'etichetta con cui un elemento viene annunciato, e il browser lo calcola con una priorità precisa: il contenuto testuale (il testo dentro un `<button>`), oppure `aria-labelledby` (che punta all'`id` di un altro elemento), `aria-label` (una stringa esplicita), l'`alt` di un'immagine, la `<label>` di un campo. Regola pratica: se un controllo ha già testo visibile, **quello** è il suo nome — non aggiungere un `aria-label` che lo sovrascriverebbe di nascosto.

## Tastiera e focus

Tutto ciò che è interattivo deve funzionare **senza mouse**. Alcuni principi:

- **Operabilità da tastiera** — ogni azione possibile col mouse deve esserlo con la tastiera. Gli elementi nativi (`<button>`, `<a>`, i campi) sono già raggiungibili con Tab e attivabili con Invio/Spazio; ricrearli con `<div>` significa reimplementare tutto a mano.
- **Focus visibile** — chi naviga con Tab deve *vedere* dov'è. Non rimuovere l'anello di focus; semmai stilizzalo con `:focus-visible` (vedi <a href="../css/#/docs/03-pseudo-classi-elementi" target="_blank" rel="noopener">CSS · Pseudo-classi</a>).
- **Ordine logico** — l'ordine di tabulazione segue l'ordine del DOM: un altro motivo per un markup ordinato. `tabindex="0"` rende focalizzabile un elemento che non lo è; `tabindex="-1"` lo rende focalizzabile solo via codice; i **valori positivi vanno evitati**, perché scombinano l'ordine.
- **Skip link** — un link "Salta al contenuto" a inizio pagina permette a chi usa la tastiera di scavalcare il menu ripetuto su ogni pagina.

## Colore, contrasto e movimento

Alcune barriere non riguardano la struttura ma la percezione, e si governano soprattutto in CSS: il **contrasto** testo/sfondo (le WCAG chiedono almeno 4.5:1 per il testo normale), il non affidarsi al **solo colore** per un'informazione (un errore segnalato solo in rosso è invisibile a chi non distingue il rosso: aggiungi un'icona o del testo) e il rispetto di **`prefers-reduced-motion`** per chi è disturbato dalle animazioni.

## Lo standard: le WCAG

Le regole di riferimento sono le **WCAG** (*Web Content Accessibility Guidelines*), organizzate attorno a quattro principi ricordati con l'acronimo **POUR**: il contenuto dev'essere *Perceivable* (percepibile), *Operable* (utilizzabile), *Understandable* (comprensibile) e *Robust* (robusto). Prevedono tre livelli di conformità (A, AA, AAA) e l'obiettivo pratico della gran parte dei siti è il livello **AA**.

## Come si verifica: gli strumenti

L'accessibilità **non** si valuta a occhio, e nemmeno con un solo strumento: quelli automatici, da soli, intercettano una parte dei problemi (indicativamente un terzo). Serve una combinazione:

- **[axe DevTools](https://www.deque.com/axe/devtools/)** — l'estensione del browser (basata su `axe-core`) che analizza la pagina e segnala le violazioni con la spiegazione. Lo standard de facto.
- **Lighthouse** — integrato nei DevTools di Chrome, dà un punteggio di accessibilità e una checklist.
- **[WAVE](https://wave.webaim.org/)** — evidenzia i problemi *sopra* la pagina, comodo per capirli visivamente.
- **[Pa11y](https://pa11y.org/)** — da riga di comando, per mettere i controlli nella CI ed evitare regressioni.
- **`eslint-plugin-jsx-a11y`** — nei progetti React/JSX, segnala gli errori già mentre si scrive (un'immagine senza `alt`, un `<div onClick>` senza ruolo…).
- Il **pannello Accessibility** dei DevTools — mostra l'albero di accessibilità e il nome/ruolo calcolati per ogni elemento: prezioso per capire *cosa* riceve davvero lo screen reader.

Ma la prova che conta di più è **manuale**: navigare la pagina con la **sola tastiera** (Tab, Invio, Esc) e ascoltarla con uno **screen reader** vero — **VoiceOver** (integrato in macOS e iOS), **NVDA** (Windows, gratuito), **TalkBack** (Android). Dieci minuti con uno screen reader insegnano più di qualsiasi report automatico.

> [!tip]
> Il modo più veloce per scovare i problemi grossi: prova a usare la tua pagina **senza toccare il mouse**. Se non riesci a raggiungere un controllo, ad attivarlo o a capire dov'è il focus, quello è un bug di accessibilità — e, quasi sempre, anche di usabilità per tutti.

## Ripasso lampo

<details>
<summary>Cos'è l'albero di accessibilità?</summary>

Un secondo albero che il browser costruisce accanto al DOM, pensato per le tecnologie assistive: riduce ogni elemento a **ruolo · nome · stato**. È ciò che uno screen reader legge. Gli elementi semantici lo popolano correttamente da soli.

</details>

<details>
<summary>Cosa significa "no ARIA is better than bad ARIA"?</summary>

Che ARIA cambia solo ciò che viene **annunciato**, non il comportamento: un `<div role="button">` sembra un pulsante ma non è operabile da tastiera finché non lo si programma. Meglio l'elemento nativo giusto (`<button>`), che dà ruolo, focus e tastiera gratis; ARIA solo quando un elemento adatto non esiste.

</details>

<details>
<summary>Fai due casi in cui ARIA serve davvero.</summary>

Nominare un pulsante con la sola icona (`aria-label="Cerca"`); annunciare un aggiornamento dinamico con una live region (`aria-live="polite"`); collegare un errore a un campo (`aria-describedby`); costruire widget non nativi (tab, combobox) con ruoli e stati ARIA.

</details>

<details>
<summary>Perché contano il focus visibile e l'ordine del DOM?</summary>

Perché chi naviga da tastiera deve **vedere** dov'è (non rimuovere l'anello di focus, semmai `:focus-visible`) e l'ordine di tabulazione **segue il DOM**: un markup ordinato dà un ordine di navigazione sensato. I `tabindex` positivi vanno evitati perché lo scombinano.

</details>

<details>
<summary>Perché non basta uno strumento automatico, e quali strumenti si usano?</summary>

Perché gli strumenti automatici (axe, Lighthouse, WAVE, Pa11y, `eslint-plugin-jsx-a11y`) intercettano solo una parte dei problemi. La verifica decisiva è **manuale**: navigare con la sola tastiera e ascoltare con uno screen reader reale (VoiceOver, NVDA, TalkBack).

</details>

<details>
<summary>Cosa sono le WCAG e il livello AA?</summary>

Le **WCAG** sono le linee guida di riferimento per l'accessibilità, fondate sui principi **POUR** (Perceivable, Operable, Understandable, Robust), con livelli A/AA/AAA. Il livello **AA** è l'obiettivo pratico della maggior parte dei siti.

</details>

**In sintesi:**
- Il browser costruisce un **albero di accessibilità** (ruolo · nome · stato); l'HTML semantico lo popola giusto da solo — è il modo più solido di fare a11y.
- **ARIA** corregge/arricchisce quell'albero, ma "no ARIA is better than bad ARIA": prima l'elemento nativo, ARIA solo dove non esiste.
- **Tastiera e focus**: tutto operabile senza mouse, focus visibile, ordine dal DOM, skip link; il colore non è mai l'unico canale.
- Si verifica con **strumenti** (axe, Lighthouse, WAVE, Pa11y, eslint-plugin-jsx-a11y) **più prova manuale** (tastiera + screen reader); lo standard sono le **WCAG**, obiettivo **AA**.
