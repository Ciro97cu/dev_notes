---
titolo: "Security"
tags: [tipo/cert, security, legacy]
livello: [senior]
---
# Security
> Cert Angular · le difese *built-in* del framework (sanitizzazione, XSRF, CSP) — invariate tra Angular classico e moderno

Angular tratta **ogni valore come non fidato** finché non lo dimostra sicuro per il contesto del DOM in cui finisce. La cert Senior chiede di conoscere queste difese — **sanitizzazione contestuale**, escaping dell'interpolation, `DomSanitizer`, protezione **XSRF** di `HttpClient`, **CSP** e Trusted Types — perché sono il modello di sicurezza che regge sia l'app module-based che quella standalone. La minaccia principale è l'**XSS** (*Cross-Site Scripting*: iniezione di codice eseguibile nella pagina attraverso dati non fidati).

## Sanitizzazione contestuale automatica
Quando un valore entra nel DOM da un template, Angular lo **sanitizza** in base al **contesto di sicurezza** (`SecurityContext`): ciò che è innocuo in CSS può essere pericoloso in un URL, quindi la difesa dipende da *dove* il valore viene inserito. I contesti sanitizzabili:

- **HTML** — valore interpretato come markup (es. binding `[innerHTML]`): Angular rimuove `<script>`, attributi `on*` e tag pericolosi.
- **Style** — valore inserito in una proprietà CSS/`style`.
- **URL** — URL usato come navigazione/link (es. `[href]`, `[src]` di immagini): blocca schemi pericolosi come `javascript:`.
- **Resource URL** — URL **caricato ed eseguito come codice** (es. `[src]` di `<script>`/`<iframe>`): **non è sanitizzabile**, perché il contenuto è arbitrario, e Angular lo rifiuta a meno di un bypass esplicito.

Non esiste sanitizzazione per il contesto *script*: Angular non consente di bindare codice eseguibile.

## Escaping dell'interpolation
L'interpolazione `{{ ... }}` inserisce il valore come **testo**, mai come markup: Angular fa l'*escape* dei caratteri speciali, quindi un input ostile non diventa mai HTML attivo.

```html
<!-- se userComment = '<script>alert(1)</script>' -->
<p>{{ userComment }}</p>
<!-- reso come testo letterale: &lt;script&gt;alert(1)&lt;/script&gt; -->
```

## `[innerHTML]` sanitizzato
Bindare HTML con `[innerHTML]` **non** disattiva le difese: Angular sanitizza il valore nel contesto HTML, mantenendo il markup sicuro (grassetto, link) e rimuovendo ciò che è pericoloso.

```ts
@Component({
  selector: 'app-bio',
  template: `<div [innerHTML]="bio"></div>`,
})
export class BioComponent {
  // <b>ok</b> sopravvive, <script> e onerror="..." vengono rimossi
  bio = '<b>ok</b><script>steal()</script>';
}
```

## `DomSanitizer` e i metodi `bypassSecurityTrust…`
Quando serve *davvero* iniettare un valore che la sanitizzazione bloccherebbe, `DomSanitizer` espone i bypass, uno per contesto. Restituiscono un valore *Safe* (`SafeHtml`, `SafeResourceUrl`, …) che Angular inserirà **senza** ulteriori controlli.

```ts
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video',
  template: `<iframe [src]="url"></iframe>`,
})
export class VideoComponent {
  url: SafeResourceUrl;

  constructor(sanitizer: DomSanitizer) {
    // URL costante e fidato: senza bypass Angular bloccherebbe il resource URL
    this.url = sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/abc123',
    );
  }
}
```

I cinque metodi, uno per contesto: `bypassSecurityTrustHtml`, `bypassSecurityTrustStyle`, `bypassSecurityTrustScript`, `bypassSecurityTrustUrl`, `bypassSecurityTrustResourceUrl`. Esiste anche `sanitize(context, value)` per sanitizzare a mano.

> [!warning]
> **Mai** passare **input dell'utente** (o dati che ne derivano) a un `bypassSecurityTrust…`: significa disabilitare l'unica barriera anti-XSS del framework. Usarli **solo** su valori costanti o di cui ci si fida al 100%, e chiamarli il **più vicino possibile alla sorgente** del valore (così è evidente in review che quel dato è fidato). Se non serve un bypass, non usarlo.

## Protezione XSRF/CSRF con `HttpClient`
L'**XSRF** (*Cross-Site Request Forgery*: un sito ostile forza il browser a inviare richieste autenticate al backend sfruttando i cookie di sessione) si contrasta con lo schema **cookie-to-header**. `HttpClient` include un interceptor che legge un token da un **cookie** e lo rispedisce come **header**: solo il codice same-origin può leggere il cookie, quindi un sito terzo non può replicare l'header.

Di default il cookie è **`XSRF-TOKEN`** e l'header **`X-XSRF-TOKEN`**; l'header viene aggiunto sulle richieste **mutanti** (POST/PUT/DELETE) verso URL relativi o same-origin, **non** su GET/HEAD.

```ts
// classico (module-based): HttpClientXsrfModule è già importato da HttpClientModule
@NgModule({
  imports: [
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'My-Xsrf-Cookie',
      headerName: 'My-Xsrf-Header',
    }),
  ],
})
export class AppModule {}
```

```ts
// moderno (standalone): stesse chiavi, via provider
provideHttpClient(
  withXsrfConfiguration({
    cookieName: 'XSRF-TOKEN',
    headerName: 'X-XSRF-TOKEN',
  }),
)
```

> [!warning]
> La protezione XSRF di Angular richiede una **controparte server**: il backend deve **impostare** il cookie del token e **validare** l'header a ogni richiesta mutante. Angular da solo aggiunge l'header, ma se il server non genera/verifica il token la difesa non esiste. Inoltre funziona solo per URL same-origin: le chiamate cross-origin non ricevono l'header.

## CSP e Trusted Types
La **Content Security Policy** (CSP: header HTTP che dichiara da quali sorgenti la pagina può caricare/eseguire codice) è una difesa *defense-in-depth* contro l'XSS. Per un'app Angular la policy minima usa `script-src` e `style-src` con un **nonce**: Angular inietta a runtime elementi `<style>`, e serve fornirgli quel nonce perché li marchi correttamente.

Il nonce si passa via token `CSP_NONCE` in DI, oppure via attributo **`ngCspNonce`** sull'elemento radice dell'app:

```html
<app-root ngCspNonce="{{ nonce generato dal server per la richiesta }}"></app-root>
```

I **Trusted Types** (feature della piattaforma web che vincola le *sink* pericolose del DOM ad accettare solo valori "fidati") sono l'ulteriore raccomandazione per irrigidire la difesa, abilitati via header CSP `require-trusted-types-for 'script'`. Angular è compatibile con i Trusted Types.

## Template injection
Il modello di sicurezza vale per i **dati**, non per i **template**: costruire un template concatenando input dell'utente e compilarlo a runtime apre a *template injection*. La compilazione **AOT** (*Ahead-of-Time*, a build time) è la difesa strutturale — non spedisce il compilatore al browser, quindi un template ostile non può essere compilato lato client. La regola resta: **mai** generare template da dati dell'utente.

> [!info] vs Modern
> Il modello di sicurezza (sanitizzazione contestuale, `DomSanitizer`, XSRF, CSP, Trusted Types) è **identico** nell'Angular moderno: cambia solo la configurazione dell'HTTP, da `HttpClientXsrfModule` a `provideHttpClient(withXsrfConfiguration(...))`. I temi di **autenticazione/autorizzazione** (login, token, guard) sono trattati nel vault, in [[16-authentication-authorization]]; qui non si ripetono.

> [!info] Stato attuale
> Sanitizzazione, `DomSanitizer`, XSRF, `CSP_NONCE`/`ngCspNonce` e il supporto Trusted Types sono **validi e non deprecati** su Angular 22. Nelle app standalone `HttpClientModule`/`HttpClientXsrfModule` sono sostituiti da `provideHttpClient(...)` con le funzioni `with…`, ma nome cookie/header di default e comportamento dell'interceptor restano invariati. L'AOT è il default di build da molte versioni: il rischio *template injection* riguarda quasi solo chi usa ancora la compilazione JIT.

## Ripasso lampo

**1.** Cosa significa che la sanitizzazione di Angular è "contestuale" e quali sono i contesti?
> [!success]- Risposta
> Il modo in cui un valore viene ripulito dipende da **dove** finisce nel DOM: i contesti sono **HTML** (`[innerHTML]`), **Style** (CSS), **URL** (link/`href`) e **Resource URL** (risorse eseguite come codice, es. `<iframe src>`). Il resource URL non è sanitizzabile e richiede un bypass esplicito; non esiste sanitizzazione per il contesto *script*.

**2.** Bindare `[innerHTML]="userInput"` è pericoloso?
> [!success]- Risposta
> No di per sé: Angular sanitizza il valore nel contesto HTML, mantenendo il markup sicuro e rimuovendo `<script>`, attributi `on*` e tag pericolosi. Diventa pericoloso solo se si aggira la sanitizzazione con `bypassSecurityTrustHtml` su dati non fidati.

**3.** Quando si usa `DomSanitizer.bypassSecurityTrust…` e quale è la regola d'oro?
> [!success]- Risposta
> Solo quando serve iniettare un valore che la sanitizzazione bloccherebbe (tipicamente un resource URL costante). La regola d'oro: **mai** su input dell'utente — significa disattivare la difesa anti-XSS — e chiamarlo il più vicino possibile alla sorgente del valore fidato.

**4.** Come protegge `HttpClient` dall'XSRF e cosa deve fare il server?
> [!success]- Risposta
> Un interceptor legge un token dal cookie `XSRF-TOKEN` (default) e lo rispedisce nell'header `X-XSRF-TOKEN` sulle richieste mutanti same-origin. Poiché solo il codice same-origin legge il cookie, un sito terzo non può replicarlo. Il **server** deve però impostare il cookie e **validare** l'header a ogni richiesta mutante: senza la controparte server la difesa non esiste.

**5.** A cosa serve la CSP in un'app Angular e cosa richiede a runtime?
> [!success]- Risposta
> È una difesa *defense-in-depth* contro l'XSS: dichiara le sorgenti ammesse per script e stili. La policy minima per Angular usa `script-src`/`style-src` con un **nonce**, che va fornito al framework (token `CSP_NONCE` o attributo `ngCspNonce` sulla root) perché marchi gli `<style>` iniettati a runtime. In aggiunta si raccomandano i **Trusted Types**.

**In sintesi:**
- Angular **sanitizza per contesto** (HTML, Style, URL, Resource URL) ogni valore che entra nel DOM; l'**interpolation** fa escaping (testo, mai markup) e `[innerHTML]` resta sanitizzato.
- `DomSanitizer` + `bypassSecurityTrust…` aggirano la difesa: **solo** su valori fidati, **mai** su input utente.
- **XSRF**: `HttpClient` invia il token dal cookie `XSRF-TOKEN` all'header `X-XSRF-TOKEN` (config via `HttpClientXsrfModule.withOptions` / `withXsrfConfiguration`); serve la validazione **lato server**.
- **CSP** con nonce (`CSP_NONCE`/`ngCspNonce`) + **Trusted Types** come difesa in profondità; **AOT** previene la *template injection* (mai template da dati utente).
- Autenticazione/autorizzazione: si veda [[16-authentication-authorization]].

---
Fonti: [Security](https://angular.dev/best-practices/security) · [`DomSanitizer`](https://angular.dev/api/platform-browser/DomSanitizer) · [`SecurityContext`](https://angular.dev/api/core/SecurityContext) · [`withXsrfConfiguration`](https://angular.dev/api/common/http/withXsrfConfiguration) · [`CSP_NONCE`](https://angular.dev/api/core/CSP_NONCE) — angular.dev.
