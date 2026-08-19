---
modulo: 2
titolo: "Il head e i metadati"
tags: [tipo/modulo, fondamenti, metadati]
---
# 02 · Il `<head>` e i metadati
> modulo 2 — *HTML* · rif. MDN

Il `<head>` è la parte del documento che il browser legge **prima** di disegnare qualsiasi cosa e che non compare nel corpo della pagina: contiene i **metadati**, cioè informazioni *sulla* pagina — come è codificata, come si chiama, come deve comportarsi su mobile, come appare quando la si condivide. È una sezione piccola ma ad alto impatto: due righe qui decidono se il testo si legge, se la pagina è usabile al telefono e che faccia fa su Google e sui social.

## I metadati essenziali

Tre elementi non dovrebbero mai mancare, e vengono prima di tutto:

```html
<head>
  <meta charset="utf-8">
  <title>Ricette di pane — La Cucina di Anna</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
```

- **`<meta charset="utf-8">`** — dichiara la **codifica dei caratteri**. Va messo per primo (entro i primi 1024 byte del documento), perché il browser deve sapere come interpretare i byte prima di leggere il resto. `utf-8` è l'unica scelta sensata: copre ogni alfabeto ed emoji. Ometterla o sbagliarla porta ai classici caratteri storpiati — `Ã¨` al posto di `è`.
- **`<title>`** — il **titolo della pagina**. Non è decorativo: compare nella scheda del browser, nei preferiti, come prima riga nei risultati di ricerca, ed è la prima cosa che uno screen reader annuncia aprendo la pagina. Va scritto **descrittivo e unico per pagina**, con l'informazione più importante all'inizio.
- **`<meta name="viewport" …>`** — dice al browser mobile di usare la **larghezza reale del dispositivo** invece di fingere uno schermo da ~980px e rimpicciolire tutto. Senza, il responsive design non parte proprio (vedi <a href="../css/#/docs/11-responsive" target="_blank" rel="noopener">CSS · Responsive</a>).

## Come appare la pagina: ricerca e condivisione

Buona parte del `<head>` serve a controllare **come la pagina si presenta altrove** — nei risultati di ricerca e nelle anteprime social. Conviene vedere *dove* finisce ciascun metadato:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 720 200" role="img" aria-label="Dove finiscono i metadati del head: scheda, ricerca, anteprima social" style="width:100%;max-width:680px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="126" y="16" font-size="11" text-anchor="middle" font-weight="700">Scheda del browser</text><text x="362" y="16" font-size="11" text-anchor="middle" font-weight="700">Risultato di ricerca</text><text x="586" y="16" font-size="11" text-anchor="middle" font-weight="700">Anteprima social</text><rect x="40" y="34" width="172" height="32" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><rect x="50" y="42" width="15" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="1.2"/><text x="74" y="55" font-size="11" font-weight="600">Ricette di pane</text><text x="198" y="55" font-size="12" opacity=".5">&#215;</text><text x="126" y="188" font-size="10" text-anchor="middle" opacity=".75">da &lt;title&gt; + favicon</text><text x="256" y="44" font-size="12.5" text-decoration="underline">Ricette di pane — Anna</text><text x="256" y="61" font-size="9.5" opacity=".55">www.lacucinadianna.it</text><text x="256" y="80" font-size="9.5" opacity=".8">Ricette di pane fatto in casa,</text><text x="256" y="93" font-size="9.5" opacity=".8">passo per passo.</text><text x="362" y="188" font-size="10" text-anchor="middle" opacity=".75">da &lt;title&gt; + &lt;meta description&gt;</text><rect x="486" y="34" width="200" height="120" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><line x1="486" y1="100" x2="686" y2="100" stroke="currentColor" stroke-width="1.2"/><path d="M500 94 L528 66 L548 84 L576 62 L610 94" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="648" cy="58" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="496" y="118" font-size="11" font-weight="700">Ricette di pane</text><text x="496" y="133" font-size="9" opacity=".7">Pane fatto in casa, passo per passo.</text><text x="496" y="147" font-size="8" opacity=".5">LACUCINADIANNA.IT</text><text x="586" y="188" font-size="10" text-anchor="middle" opacity=".75">da og:image, og:title, og:description</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Gli stessi metadati del <code>&lt;head&gt;</code> riappaiono in tre posti diversi: il <code>&lt;title&gt;</code> nella scheda e come titolo del risultato di ricerca, la <code>&lt;meta description&gt;</code> come snippet, e le meta <strong>Open Graph</strong> nell'anteprima quando il link è condiviso.</figcaption>
</figure>

- **`<meta name="description">`** — una frase che riassume la pagina. Non influenza il posizionamento, ma è lo **snippet** che il motore di ricerca può mostrare sotto il titolo: scritta bene, invoglia il click.
- **Open Graph** (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) — il **protocollo** che decide l'anteprima quando il link è condiviso su chat e social. L'`og:image` è quella che fa la differenza: senza, il link appare spoglio.

```html
<meta name="description" content="Ricette di pane fatto in casa, passo per passo.">
<meta property="og:title" content="Ricette di pane">
<meta property="og:description" content="Pane fatto in casa, passo per passo.">
<meta property="og:image" content="https://esempio.it/anteprima.jpg">
```

> [!tip]
> Le meta di Open Graph usano `property=` (non `name=`), perché seguono un protocollo esterno all'HTML. È un dettaglio che sfugge e fa fallire l'anteprima in silenzio.

## I collegamenti: `<link>`

L'elemento `<link>` connette la pagina a **risorse esterne**. I due usi più comuni:

```html
<link rel="stylesheet" href="stili.css">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
```

- **`rel="stylesheet"`** — collega un foglio di stile CSS.
- **`rel="icon"`** — la **favicon** (l'iconcina nella scheda). Un SVG scala a ogni risoluzione con un solo file.

Esistono anche `<link>` per le **prestazioni**, come `rel="preconnect"` (apre in anticipo la connessione a un dominio, per esempio un servizio di font) e `rel="preload"` (scarica prima una risorsa critica): utili ma da usare con criterio, non a pioggia.

> [!warning]
> Dove mettere il `<script>`? Uno `<script src="…">` senza attributi **blocca** il parsing della pagina finché non è scaricato ed eseguito. La scelta moderna è metterlo nel `<head>` con **`defer`**: il download avviene in parallelo e l'esecuzione è rimandata a fine parsing, nell'ordine dei file. `async` invece esegue appena pronto, senza garanzie d'ordine — adatto solo a script indipendenti (per esempio l'analytics).

## Ripasso lampo

<details>
<summary>Perché <code>&lt;meta charset="utf-8"&gt;</code> va messo per primo?</summary>

Perché il browser deve sapere come interpretare i byte del documento prima di leggerne il contenuto; la specifica chiede che sia entro i primi 1024 byte. `utf-8` copre ogni alfabeto ed emoji; ometterlo o sbagliarlo produce caratteri storpiati.

</details>

<details>
<summary>Cosa fa <code>&lt;meta name="viewport"&gt;</code> e cosa succede se manca?</summary>

Dice al browser mobile di usare la larghezza reale del dispositivo invece di simulare uno schermo largo (~980px) e rimpicciolire. Senza, il responsive design non funziona: la pagina appare come un "desktop rimpicciolito".

</details>

<details>
<summary>Che differenza c'è tra <code>&lt;meta name="description"&gt;</code> e le meta Open Graph?</summary>

`description` è lo snippet che un motore di ricerca può mostrare sotto il titolo. Le meta **Open Graph** (`og:*`, con `property=`) controllano l'anteprima quando il link è condiviso su social e chat — in particolare `og:image`.

</details>

<details>
<summary>Qual è la differenza tra <code>defer</code> e <code>async</code> su uno <code>&lt;script&gt;</code>?</summary>

`defer` scarica in parallelo ed esegue a fine parsing, **nell'ordine** dei file — la scelta di default. `async` esegue appena pronto, **senza garanzie d'ordine** — adatto solo a script indipendenti come l'analytics.

</details>

<details>
<summary>Perché conviene una favicon in SVG?</summary>

Un singolo file SVG scala a qualsiasi risoluzione senza sgranare, evitando di generare tante immagini di dimensioni diverse.

</details>

**In sintesi:**
- Il `<head>` contiene i **metadati**: non si vede, ma decide codifica, titolo, comportamento mobile e anteprime.
- Sempre presenti: **`charset="utf-8"`** (per primo), **`<title>`** descrittivo, **`<meta name="viewport">`**.
- **`description`** governa lo snippet di ricerca, **Open Graph** l'anteprima social (attenzione a `property=`).
- `<link>` collega CSS e favicon; **`<script defer>`** è il modo giusto di caricare JS senza bloccare il parsing.
