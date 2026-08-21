# HTTP — codici di stato

Ogni volta che il browser (o un client qualsiasi) chiede qualcosa a un server via HTTP, il server risponde con un **codice di stato**: un numero di tre cifre che riassume *com'è andata* la richiesta, prima ancora del contenuto vero e proprio. È il modo con cui il server dice "fatto", "non esiste", "riprova più tardi" oppure "hai sbagliato tu".

Per ricordarli tutti conviene un'immagine sola, da tenere in testa: **sei al ristorante**. Tu sei il *client* che ordina, il **cameriere** porta l'ordine in cucina (il *server*) e torna con una risposta. Ogni codice è una delle cose che il cameriere può risponderti. E la **prima cifra** dice subito di che *tipo* di risposta si tratta:

- **1xx** — "ricevuto, ci stiamo lavorando" (informativo)
- **2xx** — "ecco fatto" (successo)
- **3xx** — "non è qui, vai da un'altra parte" (redirezione)
- **4xx** — "hai sbagliato tu l'ordine" (errore del client)
- **5xx** — "abbiamo un problema noi in cucina" (errore del server)

La regola d'oro da fissare subito è questa: **4xx è colpa tua, 5xx è colpa del server.** È la distinzione che serve più spesso quando qualcosa non funziona. In ogni tabella c'è la colonna **Significato** (la spiegazione tecnica) accanto all'**Analogia** (per ricordarla). Elenco completo di riferimento: [MDN · HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 470 200" role="img" aria-label="Le cinque classi di codici HTTP dalla prima cifra" style="width:100%;max-width:500px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="18" y="17" width="58" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="47" y="36" font-size="14" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">1xx</text><text x="92" y="36" font-size="12" text-anchor="start" font-weight="400" opacity="1" fill="currentColor">ricevuto, ci sto lavorando</text><text x="452" y="36" font-size="10.5" text-anchor="end" font-weight="400" opacity=".65" fill="currentColor">(informativo)</text><rect x="18" y="51" width="58" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="47" y="70" font-size="14" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">2xx</text><text x="92" y="70" font-size="12" text-anchor="start" font-weight="400" opacity="1" fill="currentColor">ecco fatto</text><text x="452" y="70" font-size="10.5" text-anchor="end" font-weight="400" opacity=".65" fill="currentColor">(successo)</text><rect x="18" y="85" width="58" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="47" y="104" font-size="14" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">3xx</text><text x="92" y="104" font-size="12" text-anchor="start" font-weight="400" opacity="1" fill="currentColor">non è qui, vai altrove</text><text x="452" y="104" font-size="10.5" text-anchor="end" font-weight="400" opacity=".65" fill="currentColor">(redirezione)</text><rect x="18" y="119" width="58" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="47" y="138" font-size="14" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">4xx</text><text x="92" y="138" font-size="12" text-anchor="start" font-weight="400" opacity="1" fill="currentColor">hai sbagliato tu la richiesta</text><text x="452" y="138" font-size="10.5" text-anchor="end" font-weight="400" opacity=".65" fill="currentColor">(errore client)</text><rect x="18" y="153" width="58" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="47" y="172" font-size="14" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">5xx</text><text x="92" y="172" font-size="12" text-anchor="start" font-weight="400" opacity="1" fill="currentColor">problema del server</text><text x="452" y="172" font-size="10.5" text-anchor="end" font-weight="400" opacity=".65" fill="currentColor">(errore server)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">La <strong>prima cifra</strong> dice tutto: <code>1xx</code> aspetta, <code>2xx</code> ok, <code>3xx</code> altrove, <code>4xx</code> errore tuo (client), <code>5xx</code> errore del server.</figcaption>
</figure>

## 1xx · Informativi

Sono risposte **interlocutorie**: il server dice "ho ricevuto, aspetta, non ho ancora finito". Di rado le vede lo sviluppatore, perché sono gestite sotto il cofano. Nell'analogia sono il cameriere che passa e dice *"ordine preso, la cucina ci sta lavorando"*: non è ancora il piatto, è solo un cenno che le cose procedono.

| Codice | Nome | Significato | Analogia |
| --- | --- | --- | --- |
| 100 | Continue | Il server ha accettato gli header, il client può inviare il corpo della richiesta | "Va bene l'inizio, mandami pure il resto" |
| 101 | Switching Protocols | Si cambia protocollo di comunicazione su richiesta del client (es. passaggio a WebSocket) | "Cambiamo modo di parlare" |
| 103 | Early Hints | Suggerisce risorse da precaricare mentre la risposta vera viene preparata | "Intanto che preparo, inizia a precaricare" |

## 2xx · Successo

Tutto è andato a buon fine: la cucina ha preparato ciò che serviva. È il *"ecco il tuo piatto"*. Le sfumature dicono soltanto *cosa* è arrivato.

| Codice | Nome | Significato | Analogia |
| --- | --- | --- | --- |
| 200 | OK | Richiesta riuscita; la risposta contiene il risultato richiesto | "Ecco il piatto che hai chiesto" |
| 201 | Created | Riuscita e ha **creato** una nuova risorsa (tipico dopo un POST) | "Ho preparato un piatto nuovo apposta" |
| 202 | Accepted | Richiesta accettata ma elaborata **più tardi** (asincrona), non ancora completata | "Ordine preso, lo preparo, non è pronto" |
| 204 | No Content | Riuscita ma **senza corpo** nella risposta (es. dopo un DELETE) | "Fatto, ma niente da portarti a tavola" |
| 206 | Partial Content | Consegna solo la **parte** di risorsa richiesta (download parziale o ripreso) | "Ti porto solo la porzione richiesta" |

## 3xx · Redirezione

La risorsa **non è (più) qui**: il server ti manda altrove. È il cameriere che dice *"quel piatto ora lo serve il locale di fianco, vai lì"*. La differenza tra i codici sta nel *quanto* è definitivo lo spostamento e nel *come* rifare la richiesta.

| Codice | Nome | Significato | Analogia |
| --- | --- | --- | --- |
| 301 | Moved Permanently | La risorsa ha cambiato URL **in modo definitivo**; i link vanno aggiornati (conta per la SEO) | "Ci siamo trasferiti per sempre" |
| 302 | Found | Spostamento **temporaneo** a un altro URL | "Oggi siamo temporaneamente là" |
| 303 | See Other | Prendi il risultato a un altro URL, rifacendo la richiesta in **GET** | "Per la risposta vai a quest'altro sportello" |
| 304 | Not Modified | La copia in **cache** è ancora valida: il server non rimanda il corpo | "È identico a quello che hai, tienilo" |
| 307 | Temporary Redirect | Come 302, ma **conserva il metodo** HTTP (un POST resta POST) | "Temporaneamente là, e con lo stesso ordine" |
| 308 | Permanent Redirect | Come 301, ma **conserva il metodo** HTTP | "Trasferiti per sempre, e con lo stesso ordine" |

Il **304** è uno dei motori della velocità del web: se hai già in cache la versione buona, il server evita di rimandartela.

## 4xx · Errore del client

**Colpa tua** (del client): la richiesta è malfatta, incompleta o non permessa. Il cameriere scuote la testa: *"così non posso servirti"*. Sono i codici che si incontrano più spesso sviluppando.

| Codice | Nome | Significato | Analogia |
| --- | --- | --- | --- |
| 400 | Bad Request | Richiesta **malformata**: il server non riesce a interpretarla | "Non ho capito l'ordine" |
| 401 | Unauthorized | Manca (o non è valida) l'**autenticazione**: il server non sa *chi* sei | "Non so chi sei: mostrami la tessera" |
| 403 | Forbidden | Sei autenticato ma **non hai i permessi** per quella risorsa | "So chi sei, ma non puoi ordinare questo" |
| 404 | Not Found | La risorsa richiesta **non esiste** (o non è raggiungibile) | "Quel piatto non esiste nel menù" |
| 405 | Method Not Allowed | Il **metodo** (GET/POST/…) non è ammesso su quella risorsa | "Quel piatto sì, ma non a colazione" |
| 408 | Request Timeout | Il client ha impiegato **troppo** a inviare la richiesta | "Hai impiegato troppo a ordinare" |
| 409 | Conflict | La richiesta **confligge** con lo stato attuale della risorsa | "Qualcun altro ha preso l'ultimo tavolo" |
| 410 | Gone | La risorsa è stata **rimossa per sempre**, di proposito | "Quel piatto l'abbiamo tolto per sempre" |
| 413 | Payload Too Large | Il **corpo** della richiesta supera i limiti accettati | "L'ordine è troppo grosso per la cucina" |
| 415 | Unsupported Media Type | Il **formato** del corpo non è gestito dal server | "Non cuciniamo quel tipo di ingrediente" |
| 422 | Unprocessable Entity | Sintassi corretta ma contenuto **non valido** (validazione fallita); molto usato dalle API | "L'ordine è scritto bene ma non ha senso" |
| 429 | Too Many Requests | **Troppe richieste** in poco tempo: rate limiting | "Stai ordinando troppo in fretta, rallenta" |
| 418 | I'm a teapot | Codice-scherzo (pesce d'aprile del 1998): esiste ma non si usa sul serio | "Sono una teiera, non faccio il caffè" |

Le due coppie da non confondere: **401 vs 403** ("non so chi sei" contro "so chi sei ma non puoi") e **404 vs 410** ("non c'è" contro "non c'è più, e di proposito").

## 5xx · Errore del server

**Colpa del server**: la richiesta era legittima, ma la cucina è andata in difficoltà. Non hai sbagliato tu: *"il problema è di là, non alla tua tavola"*.

| Codice | Nome | Significato | Analogia |
| --- | --- | --- | --- |
| 500 | Internal Server Error | Errore **generico e imprevisto** lato server: qualcosa è andato storto nell'elaborazione | "La cucina è andata in tilt" |
| 501 | Not Implemented | Il server **non supporta** la funzione (metodo) richiesta | "Quella pietanza non la sappiamo fare" |
| 502 | Bad Gateway | Un server intermedio (proxy/gateway) ha ricevuto una **risposta invalida** dal server a monte | "Un'altra cucina ha risposto a vanvera" |
| 503 | Service Unavailable | Server **temporaneamente non disponibile**: sovraccarico o in manutenzione | "Cucina chiusa o sovraccarica, riprova" |
| 504 | Gateway Timeout | Un server intermedio **non ha ricevuto risposta in tempo** dal server a monte | "L'altra cucina non ha risposto in tempo" |

**502, 503 e 504** compaiono tipicamente quando davanti all'applicazione c'è un intermediario (proxy, load balancer, CDN): riguardano il dialogo *tra* i server, non la tua richiesta in sé.

> [!tip]
> Il trucco per ricordarli in fretta è la **prima cifra**, non i singoli numeri: **1** aspetta, **2** ok, **3** altrove, **4** errore tuo, **5** errore loro. Da lì, i codici comuni (200, 301, 304, 401, 403, 404, 429, 500, 503) si agganciano da soli all'immagine del ristorante.

Collegamenti: [Web, browser e rete](docs/web-browser.md) (CORS, cache) · [Rendering: CSR, SSR, SSG](docs/rendering-web.md)
