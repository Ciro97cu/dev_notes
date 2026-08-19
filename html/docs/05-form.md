---
modulo: 5
titolo: "Form"
tags: [tipo/modulo, form, accessibilita]
---
# 05 · Form
> modulo 5 — *HTML* · rif. MDN

I form sono il modo in cui l'utente **inserisce dati** e li invia: campi, caselle, menu a tendina e un pulsante di invio. È l'area di HTML dove si sbaglia di più in usabilità e accessibilità, perché è fatta di tante piccole decisioni — quale tipo di campo, come etichettarlo, come validarlo — ognuna con conseguenze concrete su chi compila. La buona notizia è che HTML, se lo si asseconda, offre gratis moltissimo: tastiere giuste, validazione, supporto ai password manager. L'accessibilità dei form si intreccia con quella generale, ripresa in [[07-accessibilita-aria]].

## L'ossatura: `<form>` e i controlli

Un form è racchiuso da `<form>`, che ha due attributi chiave: `action` (dove mandare i dati) e `method`. Il `method` è una decisione:

- **`get`** — i dati finiscono **nell'URL** (`?q=pane`). Adatto a ricerche e filtri: ripetibile, condivisibile, senza effetti collaterali.
- **`post`** — i dati viaggiano **nel corpo** della richiesta. Adatto a operazioni che **cambiano stato** (registrarsi, pubblicare), e per dati non banali.

Dentro il form stanno i **controlli**: `<input>` (il più versatile), `<textarea>`, `<select>` e `<button>`.

## Il tipo di `<input>` giusto

L'attributo `type` di `<input>` non è un dettaglio estetico: decide la **tastiera** che appare su mobile, la **validazione** automatica e a volte un'interfaccia dedicata (un calendario, un selettore di colore). Sceglierlo bene è metà del lavoro:

```html
<input type="email">   <!-- tastiera con @, controllo del formato -->
<input type="tel">     <!-- tastierino numerico -->
<input type="number">  <!-- solo numeri, con min/max/step -->
<input type="date">    <!-- selettore di data nativo -->
```

Oltre a questi: `text`, `password`, `search`, `url`, `checkbox` (scelte multiple indipendenti), `radio` (scelta singola in un gruppo), `file`, `range`, `color`, `hidden`. La regola: **il tipo più specifico che descrive il dato**, mai `type="text"` per pigrizia quando ne esiste uno calzante.

## `<label>`: mai un campo senza

È la decisione più importante di tutto il modulo: **ogni controllo deve avere una `<label>`**. L'etichetta si collega al campo in due modi — con `for` che punta all'`id`, oppure avvolgendo il controllo:

```html
<label for="email">Email</label>
<input id="email" name="email" type="email" autocomplete="email" required>
```

Perché è irrinunciabile: uno screen reader annuncia il **nome** del campo grazie alla label; e cliccando sull'etichetta si attiva il controllo (un bersaglio più grande, comodissimo per le checkbox). Il `placeholder` **non** è un'etichetta: è un testo di esempio che sparisce appena si scrive, non viene letto in modo affidabile e lascia il campo anonimo.

> [!warning]
> Usare il solo `placeholder` al posto della `<label>` è l'errore più diffuso nei form: senza label, il campo è muto per le tecnologie assistive e privo del "nome" anche per chi vede, una volta iniziato a digitare.

## Raggruppare: `<fieldset>` e `<legend>`

Quando più controlli formano un gruppo — tipicamente un insieme di `radio` — si racchiudono in un `<fieldset>` con un `<legend>` che lo intitola. Lo screen reader annuncia la `legend` insieme a ogni opzione, così "Spedizione: standard / espressa" si capisce; senza, si sentirebbero opzioni sciolte senza sapere a quale domanda rispondono.

## Menu, aree di testo e pulsanti

- **`<select>`** con `<option>` (e `<optgroup>` per raggrupparle) — un menu a tendina.
- **`<textarea>`** — testo su più righe.
- **`<button>`** — un pulsante vero. Attenzione al `type`: il default è **`submit`**, quindi un `<button>` dentro un form **invia** il form anche se non lo si voleva. Per un pulsante che fa altro (con JavaScript) serve `type="button"`.

> [!tip]
> Preferire sempre `<button>` a un `<div>` reso cliccabile: il `<button>` è raggiungibile da tastiera, si attiva con Invio e Spazio, ed è annunciato come pulsante — tutto gratis. Ricrearlo con un `<div>` significa reimplementare a mano ciò che il browser dà già.

## Validazione nativa (gratis)

Aggiungendo dei **vincoli** agli input, il browser li controlla da solo al momento dell'invio, senza una riga di JavaScript: `required` (obbligatorio), `type="email"`/`"url"` (formato), `min`/`max` e `step` (per numeri e date), `minlength`/`maxlength`, `pattern` (un'espressione regolare). Se qualcosa non va, il browser **blocca l'invio**, mostra un messaggio e porta il focus sul campo:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 720 230" role="img" aria-label="Flusso della validazione nativa di un form" style="width:100%;max-width:680px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="16" y="90" width="120" height="52" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="76" y="120" font-size="12" text-anchor="middle">Invio del form</text><rect x="170" y="86" width="176" height="60" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="258" y="110" font-size="11.5" text-anchor="middle">Il browser controlla</text><text x="258" y="126" font-size="11.5" text-anchor="middle">i vincoli del campo</text><path d="M430 78 L492 116 L430 154 L368 116 Z" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="430" y="120" font-size="11.5" text-anchor="middle">Validi?</text><rect x="560" y="64" width="150" height="44" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="635" y="90" font-size="12" text-anchor="middle">Il form parte</text><rect x="560" y="150" width="150" height="56" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="635" y="172" font-size="11" text-anchor="middle">Invio bloccato:</text><text x="635" y="188" font-size="11" text-anchor="middle">messaggio + focus</text><path d="M136 116 L166 116" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M170 116 L162 111 L162 121 Z" fill="currentColor"/><path d="M346 116 L364 116" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M368 116 L360 111 L360 121 Z" fill="currentColor"/><path d="M492 116 L492 86 L556 86" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M560 86 L552 81 L552 91 Z" fill="currentColor"/><text x="502" y="100" font-size="10.5">sì</text><path d="M430 154 L430 178 L556 178" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M560 178 L552 173 L552 183 Z" fill="currentColor"/><text x="440" y="172" font-size="10.5">no</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Con i vincoli sugli input (<code>required</code>, <code>type</code>, <code>pattern</code>…) il browser valida da solo prima dell'invio: se tutto è a posto il form parte, altrimenti l'invio è bloccato con messaggio e focus sul primo campo non valido.</figcaption>
</figure>

Lo stato dei campi è anche stilabile in CSS con `:valid`, `:invalid` e `:user-invalid` (vedi <a href="../css/#/docs/03-pseudo-classi-elementi" target="_blank" rel="noopener">CSS · Pseudo-classi</a>). Quando serve un controllo **su misura** — un messaggio personalizzato, una regola che HTML non esprime — si usa la **Constraint Validation API** in JavaScript: `checkValidity()`, `setCustomValidity()` e l'oggetto `validity` del campo.

## `name` e `autocomplete`

Due attributi che fanno la differenza pur passando inosservati:

- **`name`** — è la **chiave** con cui il valore viene inviato al server (`email=anna@…`). Senza `name`, il campo non viene proprio spedito.
- **`autocomplete`** — dà al browser e ai password manager un'etichetta standard del dato (`autocomplete="email"`, `"current-password"`, `"street-address"`), così possono compilare i campi. È un guadagno enorme di velocità e accessibilità: da attivare, non da disabilitare per abitudine.

## Ripasso lampo

<details>
<summary>Quando <code>method="get"</code> e quando <code>method="post"</code>?</summary>

`get` mette i dati nell'URL: adatto a ricerche e filtri, ripetibili e condivisibili. `post` li mette nel corpo della richiesta: adatto a operazioni che **cambiano stato** (registrazione, pubblicazione) e a dati non banali.

</details>

<details>
<summary>Perché il tipo di <code>&lt;input&gt;</code> conta, oltre alla validazione?</summary>

Perché `type` decide anche la **tastiera** su mobile (il `@` con `type="email"`, il tastierino con `type="number"`) e a volte un'interfaccia dedicata (calendario per `date`). Si sceglie sempre il tipo più specifico che descrive il dato.

</details>

<details>
<summary>Perché il <code>placeholder</code> non sostituisce la <code>&lt;label&gt;</code>?</summary>

Perché il placeholder sparisce appena si digita, non è letto in modo affidabile dagli screen reader e lascia il campo senza "nome". La `<label>` (collegata con `for`/`id` o avvolgendo il campo) dà il nome del campo e, cliccata, ne attiva il controllo.

</details>

<details>
<summary>Che vincoli offre la validazione nativa e cosa fa il browser se falliscono?</summary>

`required`, `type` (email/url), `min`/`max`/`step`, `minlength`/`maxlength`, `pattern`. Se un vincolo non è rispettato, il browser **blocca l'invio**, mostra un messaggio e porta il focus sul primo campo non valido — senza JavaScript. Per messaggi su misura c'è la Constraint Validation API.

</details>

<details>
<summary>Qual è il <code>type</code> di default di <code>&lt;button&gt;</code> dentro un form?</summary>

`submit`: un `<button>` senza `type` **invia** il form. Per un pulsante che fa altro (via JavaScript) serve `type="button"`.

</details>

**In sintesi:**
- `<form>` con `method` `get` (ricerche/filtri) o `post` (cambia stato); il **tipo di `<input>`** giusto dà tastiera e validazione corrette.
- **Ogni campo con la sua `<label>`** (il `placeholder` non è un'etichetta); gruppi in `<fieldset>`/`<legend>`; `<button>` di default fa `submit`.
- La **validazione nativa** (`required`, `pattern`, `type`…) blocca l'invio e segnala gli errori gratis; per messaggi su misura c'è la Constraint Validation API.
- `name` è la chiave inviata al server; `autocomplete` fa compilare i campi a browser e password manager.
