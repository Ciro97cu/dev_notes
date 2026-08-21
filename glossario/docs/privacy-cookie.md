# Privacy, cookie e consenso

Sono quelle pagine e quei popup che compaiono su quasi ogni sito: il **banner dei cookie** ("Accetta / Rifiuta / Preferenze"), la **Privacy Policy** e la **Cookie Policy**. Non è una moda né una scelta di design: è **conformità legale alla privacy** (in inglese *privacy & cookie compliance*). In Unione Europea la materia è retta da due norme: il **GDPR** (*General Data Protection Regulation*, il regolamento generale sulla protezione dei dati) e la **direttiva ePrivacy**, nota come *cookie law*. In sintesi: prima di raccogliere dati personali o di installare cookie non indispensabili, il sito deve **informare** l'utente e, dove serve, **chiedere il consenso**.

Il popup di consenso lo gestisce di solito un **CMP** (*Consent Management Platform*, es. Cookiebot, Iubenda, OneTrust): un componente che mostra il banner, registra la scelta e blocca o sblocca gli script di conseguenza.

## Cosa sono i cookie (in breve)

Un **cookie** è un piccolo file che il sito salva nel browser per ricordarsi qualcosa tra una visita e l'altra: la sessione di login, la lingua scelta, il contenuto del carrello. Di per sé è innocuo; il tema privacy nasce quando i cookie servono a **profilare** l'utente o a tracciarlo tra siti diversi. Per questo si distinguono per **finalità**, ed è la finalità (non il cookie in sé) a decidere se serve il consenso.

| Categoria | A cosa servono | Serve il consenso? |
| --- | --- | --- |
| **Tecnici / necessari** | Far funzionare il sito: login, sessione, carrello, sicurezza | **No** — sono indispensabili |
| **Preferenze / funzionali** | Ricordare scelte non essenziali (lingua, tema) | Dipende (spesso sì) |
| **Statistici / analytics** | Misurare le visite (es. Google Analytics) | **Sì** (salvo eccezioni per analytics anonimizzati) |
| **Marketing / profilazione** | Pubblicità mirata, tracciamento tra siti | **Sì**, sempre |

Regola pratica da ricordare: **i cookie tecnici non chiedono permesso; tutto ciò che profila o traccia, sì.**

## Il cookie banner

È la finestrella che appare alla prima visita. La legge (e le linee guida del Garante) impone alcune cose precise, che si riconoscono a colpo d'occhio in un banner fatto bene:

- il consenso va chiesto **prima** di installare i cookie non necessari (non "continuando a navigare accetti");
- **rifiutare dev'essere facile quanto accettare**: se c'è "Accetta tutto", ci dev'essere anche "Rifiuta tutto", con lo stesso risalto;
- niente caselle **pre-spuntate** e niente *dark pattern* (il tasto "Rifiuta" nascosto o grigio è una violazione);
- dev'essere possibile **cambiare idea** dopo (revocare il consenso).

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 600 180" role="img" aria-label="Esempio di cookie banner" style="width:100%;max-width:560px;height:auto">
  <rect x="8" y="8" width="584" height="164" rx="14" fill="#ffffff" stroke="#d5dae2"/>
  <circle cx="46" cy="50" r="18" fill="#e7b45a"/>
  <circle cx="40" cy="45" r="2.4" fill="#8a5a20"/><circle cx="52" cy="49" r="2.4" fill="#8a5a20"/><circle cx="44" cy="57" r="2.4" fill="#8a5a20"/><circle cx="53" cy="58" r="2" fill="#8a5a20"/>
  <text x="80" y="44" font-family="system-ui,Arial,sans-serif" font-size="17" font-weight="700" fill="#1f2937">Questo sito usa i cookie</text>
  <text x="80" y="68" font-family="system-ui,Arial,sans-serif" font-size="13" fill="#5b6675">Cookie tecnici sempre attivi. Cookie di analisi e marketing</text>
  <text x="80" y="86" font-family="system-ui,Arial,sans-serif" font-size="13" fill="#5b6675">solo con il tuo consenso.</text>
  <g font-family="system-ui,Arial,sans-serif" font-size="13" font-weight="600">
    <rect x="80" y="112" width="124" height="40" rx="8" fill="#ffffff" stroke="#c2c8d2"/>
    <text x="142" y="137" text-anchor="middle" fill="#374151">Rifiuta tutto</text>
    <rect x="216" y="112" width="124" height="40" rx="8" fill="#ffffff" stroke="#c2c8d2"/>
    <text x="278" y="137" text-anchor="middle" fill="#374151">Preferenze</text>
    <rect x="352" y="112" width="160" height="40" rx="8" fill="#2563eb"/>
    <text x="432" y="137" text-anchor="middle" fill="#ffffff">Accetta tutto</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.4rem">Un banner corretto: le tre scelte sono equivalenti, "Rifiuta tutto" è visibile quanto "Accetta tutto".</figcaption>
</figure>

## Il consenso granulare (Preferenze)

Il pulsante "Preferenze" apre un pannello dove l'utente sceglie **categoria per categoria**. I cookie **necessari** sono sempre attivi e non disattivabili (senza di loro il sito non funziona); tutti gli altri partono **spenti** e si accendono solo se l'utente lo decide.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 600 316" role="img" aria-label="Pannello delle preferenze cookie con interruttori" style="width:100%;max-width:520px;height:auto">
  <rect x="8" y="8" width="584" height="300" rx="14" fill="#ffffff" stroke="#d5dae2"/>
  <text x="32" y="44" font-family="system-ui,Arial,sans-serif" font-size="18" font-weight="700" fill="#1f2937">Preferenze cookie</text>
  <line x1="32" y1="58" x2="568" y2="58" stroke="#eceff3"/>
  <g font-family="system-ui,Arial,sans-serif">
    <!-- Necessari: sempre attivi -->
    <text x="32" y="92" font-size="15" font-weight="700" fill="#1f2937">Necessari</text>
    <text x="32" y="110" font-size="12" fill="#5b6675">Indispensabili al funzionamento del sito</text>
    <text x="568" y="98" text-anchor="end" font-size="12" font-weight="700" fill="#2563eb">Sempre attivi</text>
    <line x1="32" y1="126" x2="568" y2="126" stroke="#f2f4f7"/>
    <!-- Statistici: off -->
    <text x="32" y="158" font-size="15" font-weight="700" fill="#1f2937">Statistici</text>
    <text x="32" y="176" font-size="12" fill="#5b6675">Misurano le visite in forma aggregata</text>
    <rect x="520" y="146" width="48" height="26" rx="13" fill="#cbd2dc"/><circle cx="533" cy="159" r="10" fill="#ffffff"/>
    <line x1="32" y1="192" x2="568" y2="192" stroke="#f2f4f7"/>
    <!-- Marketing: off -->
    <text x="32" y="224" font-size="15" font-weight="700" fill="#1f2937">Marketing</text>
    <text x="32" y="242" font-size="12" fill="#5b6675">Pubblicità e tracciamento tra siti</text>
    <rect x="520" y="212" width="48" height="26" rx="13" fill="#cbd2dc"/><circle cx="533" cy="225" r="10" fill="#ffffff"/>
  </g>
  <g font-family="system-ui,Arial,sans-serif" font-size="13" font-weight="600">
    <rect x="300" y="262" width="130" height="36" rx="8" fill="#ffffff" stroke="#c2c8d2"/>
    <text x="365" y="285" text-anchor="middle" fill="#374151">Salva preferenze</text>
    <rect x="440" y="262" width="128" height="36" rx="8" fill="#2563eb"/>
    <text x="504" y="285" text-anchor="middle" fill="#ffffff">Accetta tutti</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.4rem">I "Necessari" sono sempre attivi; le altre categorie partono spente e si attivano con l'interruttore.</figcaption>
</figure>

## La Privacy Policy (informativa privacy)

È la pagina che spiega, in modo trasparente, **come il sito tratta i dati personali**. Il GDPR impone che contenga alcune informazioni obbligatorie: non è un testo libero, ma una sorta di "scheda tecnica" del trattamento dei dati.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 600 372" role="img" aria-label="Anatomia di una pagina di privacy policy" style="width:100%;max-width:520px;height:auto">
  <rect x="70" y="8" width="460" height="356" rx="10" fill="#ffffff" stroke="#d5dae2"/>
  <text x="94" y="44" font-family="system-ui,Arial,sans-serif" font-size="17" font-weight="800" fill="#1f2937">Informativa sulla privacy</text>
  <line x1="94" y1="56" x2="506" y2="56" stroke="#eceff3"/>
  <g font-family="system-ui,Arial,sans-serif">
    <text x="94" y="88" font-size="13" font-weight="700" fill="#2563eb">1 · Titolare del trattamento</text>
    <rect x="94" y="96" width="412" height="8" rx="4" fill="#eef1f5"/>
    <text x="94" y="128" font-size="13" font-weight="700" fill="#2563eb">2 · Quali dati raccogliamo</text>
    <rect x="94" y="136" width="412" height="8" rx="4" fill="#eef1f5"/>
    <text x="94" y="168" font-size="13" font-weight="700" fill="#2563eb">3 · Finalità e base giuridica</text>
    <rect x="94" y="176" width="412" height="8" rx="4" fill="#eef1f5"/>
    <text x="94" y="208" font-size="13" font-weight="700" fill="#2563eb">4 · Per quanto li conserviamo</text>
    <rect x="94" y="216" width="360" height="8" rx="4" fill="#eef1f5"/>
    <text x="94" y="248" font-size="13" font-weight="700" fill="#2563eb">5 · Con chi li condividiamo (terze parti)</text>
    <rect x="94" y="256" width="412" height="8" rx="4" fill="#eef1f5"/>
    <text x="94" y="288" font-size="13" font-weight="700" fill="#2563eb">6 · I tuoi diritti</text>
    <rect x="94" y="296" width="380" height="8" rx="4" fill="#eef1f5"/>
    <text x="94" y="328" font-size="13" font-weight="700" fill="#2563eb">7 · Trasferimenti fuori dall'UE</text>
    <rect x="94" y="336" width="300" height="8" rx="4" fill="#eef1f5"/>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.4rem">Le sezioni obbligatorie di una privacy policy secondo il GDPR.</figcaption>
</figure>

Le voci che non possono mancare:

| Sezione | Cosa dichiara |
| --- | --- |
| **Titolare del trattamento** | Chi decide come e perché trattare i dati (l'azienda), con i contatti |
| **Dati raccolti** | Quali dati personali (nome, email, IP, comportamento di navigazione…) |
| **Finalità e base giuridica** | *Perché* si trattano e *su quale fondamento legale* (consenso, contratto, obbligo di legge, legittimo interesse) |
| **Conservazione** | Per quanto tempo i dati restano salvati |
| **Destinatari / terze parti** | Con chi si condividono (fornitori, analytics, ad network) |
| **Diritti dell'interessato** | Accesso, rettifica, cancellazione ("diritto all'oblio"), portabilità, opposizione |
| **Trasferimenti extra-UE** | Se i dati vanno fuori dall'Unione (es. server USA) e con quali garanzie |

## La Cookie Policy

È la "sorella" tecnica della privacy policy, dedicata **solo ai cookie**: l'elenco dei cookie usati con, per ciascuno, il **nome**, il **fornitore**, la **finalità** e la **durata**. Spesso è una tabella. È collegata al banner (il pulsante "Preferenze" e il link "Cookie Policy" puntano qui) e alla privacy policy.

## E i "Termini di servizio"?

Da non confondere: i **Termini di servizio** (*Terms of Service* / *Termini e condizioni*) sono il **contratto d'uso** del sito — regole, responsabilità, cosa è permesso e cosa no. Riguardano l'uso del servizio, non i dati personali. Privacy Policy e Cookie Policy parlano di **dati**; i Termini parlano di **regole d'uso**.

## Lato sviluppatore: come si implementa

Qui il tema tocca chi scrive il codice, perché il consenso ha effetti tecnici concreti:

- gli script che installano cookie non necessari (Google Analytics, pixel di Meta, tag pubblicitari) **non vanno caricati subito**: si caricano **solo dopo** che l'utente ha acconsentito a quella categoria. Prima del consenso restano bloccati.
- la scelta dell'utente va **memorizzata** (di solito in un cookie tecnico o in `localStorage`) così il banner non riappare a ogni pagina, e va offerto un modo per **revocarla**.
- strumenti come **Google Consent Mode** fanno sì che i tag Google si adattino automaticamente allo stato del consenso; nel mondo pubblicitario lo standard di scambio del consenso è l'**IAB TCF** (*Transparency & Consent Framework*), che codifica le scelte in una stringa di consenso.
- collegamento con la sicurezza: i cookie hanno attributi che li rendono più sicuri — `Secure` (solo su HTTPS), `HttpOnly` (non leggibili da JavaScript, contro l'XSS) e `SameSite` (contro il CSRF), quest'ultimo già incontrato nella nota su [CORS](docs/web-browser.md).

> [!tip]
> Il filo da ricordare: **informare + consenso preventivo per ciò che non è necessario**. Il banner è la richiesta di consenso, la Privacy/Cookie Policy sono l'informativa; il consenso si può sempre **rifiutare** (facile come accettarlo) e **revocare**.

Fonti: [Testo del GDPR](https://gdpr-info.eu/) · [Garante Privacy — linee guida cookie](https://www.garanteprivacy.it/cookie) · [MDN — HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies).

Collegamenti: [Web, browser e rete](docs/web-browser.md) (cookie `SameSite`, CORS) · [HTTP: codici di stato](docs/http-status.md).
