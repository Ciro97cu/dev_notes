---
titolo: "HttpClient classico"
tags: [tipo/cert, http, legacy]
livello: [mid]
---
# HttpClient classico
> Cert Angular · `HttpClientModule`, interceptor class-based ed error handling RxJS; il fetch reattivo moderno è nel vault ([[02-signal-based-components]])

Nel classico `HttpClient` si abilita importando `HttpClientModule`, i dati arrivano come **Observable** (non come signal), e gli **interceptor** sono classi che implementano `HttpInterceptor` registrate sul token multi `HTTP_INTERCEPTORS`. La cert lo richiede perché è così che quasi tutte le codebase parlano col backend, e perché il pattern *clone-and-forward* degli interceptor è un tema d'esame classico.

## Setup: `HttpClientModule` vs `provideHttpClient`
Prima di poter iniettare `HttpClient` occorre registrarne i provider. Nel mondo module-based questo significa importare `HttpClientModule` **una volta sola** nel root module: da quel momento `HttpClient` diventa iniettabile in qualunque service o componente dell'app.

```ts
// app.module.ts
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [BrowserModule, HttpClientModule],   // classico
})
export class AppModule {}
```

L'equivalente moderno è la provider function `provideHttpClient()` nei provider di bootstrap (vedi *Stato attuale*).

## Verbi e risposte tipizzate
`HttpClient` espone un metodo per verbo HTTP (`get`, `post`, `put`, `patch`, `delete`, `head`, `options`), più il generico `request`. Ogni metodo è **generico**: il tipo passato tipizza il corpo della risposta.

```ts
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FlightService {
  constructor(private http: HttpClient) {}

  find(from: string): Observable<Flight[]> {
    return this.http.get<Flight[]>('/api/flight', {   // risposta tipizzata come Flight[]
      params: new HttpParams().set('from', from),
      headers: new HttpHeaders({ Accept: 'application/json' }),
    });
  }

  save(flight: Flight): Observable<Flight> {
    return this.http.post<Flight>('/api/flight', flight);
  }
}
```

## Opzioni della richiesta
L'ultimo argomento di ogni metodo è un oggetto di **opzioni** che regola i dettagli della richiesta e la forma della risposta. Le voci che ricorrono più spesso sono quattro.

- **`params`** — un `HttpParams` (o un oggetto semplice) per la query string. `HttpParams` è **immutabile**: `set`/`append` restituiscono una **nuova** istanza.
- **`headers`** — un `HttpHeaders` (anch'esso immutabile) per gli header.
- **`observe`** — cosa emette l'Observable: `'body'` (default, il solo corpo `T`), `'response'` (l'intera `HttpResponse<T>` con status e header), `'events'` (stream di `HttpEvent`, per il progress di upload/download).
- **`responseType`** — `'json'` (default) | `'text'` | `'blob'` | `'arraybuffer'`.

```ts
// observe: 'response' → si accede a status e header, non solo al body
this.http.get<Flight[]>('/api/flight', { observe: 'response' }).subscribe((resp) => {
  console.log(resp.status);                    // 200
  console.log(resp.headers.get('X-Total'));    // header di risposta
  console.log(resp.body);                      // Flight[] (il body tipizzato)
});
```

> [!warning]
> `HttpParams` e `HttpHeaders` sono **immutabili**: `params.set(...)` **non** modifica l'istanza ma ne ritorna una nuova. Vanno concatenati (`new HttpParams().set('a', '1').set('b', '2')`) o riassegnati; assegnare senza usare il valore di ritorno è un bug classico.

## Interceptor class-based
Un interceptor intercetta **ogni** richiesta uscente (e la relativa risposta). È una classe che implementa `HttpInterceptor`; il metodo `intercept(req, next)` deve inoltrare la richiesta con `next.handle(...)`. Poiché `HttpRequest` è **immutabile**, per modificarla la si **clona**.

```ts
import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    // la richiesta è immutabile → clone() per aggiungere l'header
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${this.auth.token}` },
    });
    return next.handle(authReq);   // inoltra al prossimo anello della catena
  }
}
```

La registrazione avviene sul token **multi** `HTTP_INTERCEPTORS` (`multi: true` obbligatorio):

```ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
  ],
})
export class AppModule {}
```

> [!warning]
> Senza `multi: true` il secondo interceptor **sovrascrive** il primo invece di aggiungersi. L'ordine di registrazione è l'ordine di esecuzione sulla **richiesta** (e inverso sulla **risposta**): la catena si costruisce come una pipeline, ogni interceptor decide se e come passare al successivo con `next.handle`.

Da Angular 15 esistono anche gli **interceptor funzionali** (`HttpInterceptorFn`), preferiti nel moderno: una funzione che usa [[inject]] e chiama `next(req)` (una funzione, non `next.handle`).

```ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${auth.token}` } }));
};
// registrazione moderna: provideHttpClient(withInterceptors([authInterceptor]))
```

## Error handling
Poiché la risposta è un Observable, anche gli errori HTTP si gestiscono dentro la `pipe` RxJS, con gli stessi operatori di resilienza validi per qualsiasi stream. I due che contano sono `retry`, che ri-sottoscrive lo stream ritentando la richiesta un certo numero di volte, e `catchError`, che intercetta l'`HttpErrorResponse` per trasformarla, gestirla o ri-lanciarla.

```ts
import { catchError, retry, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

find(): Observable<Flight[]> {
  return this.http.get<Flight[]>('/api/flight').pipe(
    retry(2),                                   // ritenta 2 volte prima di propagare l'errore
    catchError((err: HttpErrorResponse) => {
      if (err.status === 0) {
        // errore lato client/rete (offline, CORS, richiesta non partita)
      } else {
        // il backend ha risposto con un codice di errore: err.status, err.error (body)
      }
      return throwError(() => new Error('Caricamento voli fallito'));
    }),
  );
}
```

> [!warning]
> Insidie da esame:
> - `HttpClient` ritorna un Observable **cold**: senza `subscribe` (o `async` pipe / `firstValueFrom`) la richiesta **non parte**.
> - `HttpErrorResponse.status === 0` indica un errore **lato client/rete** (nessuna risposta dal server), non un `500`: `err.error` contiene l'oggetto di errore JS, non il body del backend.
> - `observe: 'response'` cambia il **tipo emesso** da `T` a `HttpResponse<T>`: il body va letto da `resp.body`.
> - `throwError(() => new Error(...))` va nella forma con **factory** (la vecchia `throwError(error)` è deprecata).

> [!info] vs Modern
> Nel moderno `HttpClient` si registra con `provideHttpClient(...)` (feature: `withInterceptors`, `withFetch`, `withInterceptorsFromDi` per ri-usare gli interceptor class-based) invece di importare `HttpClientModule`. Gli interceptor preferiti sono **funzionali** (`HttpInterceptorFn` con [[inject]], `next(req)` invece di `next.handle(req)`), trattati in [[12-initialization-route-changes]]. Per il fetch di dati **reattivo** il vault usa `httpResource()` / `resource()`, che avvolgono `HttpClient` esponendo stato/valore/errore come **signal**, come spiegato in [[02-signal-based-components]]. Verbi, opzioni (`HttpParams`/`HttpHeaders`/`observe`/`responseType`), risposte tipizzate ed error handling RxJS restano **identici**. Qui non ripetuti.

> [!info] Stato attuale
> `HttpClientModule` (con `HttpClientJsonpModule` e `HttpClientTestingModule`) è **deprecato dalla v18** in favore di `provideHttpClient()` / `provideHttpClientTesting()`: non offre nulla in più ed è meno tree-shakable. `HttpClient`, i suoi verbi, `HttpParams`/`HttpHeaders`, l'interfaccia `HttpInterceptor` e `HttpErrorResponse` **non** sono deprecati; gli interceptor class-based restano usabili col moderno via `withInterceptorsFromDi()`. Fonte: [angular.dev/guide/http](https://angular.dev/guide/http).

## Ripasso lampo

<details>
<summary><code>HttpClientModule</code> vs <code>provideHttpClient</code>: come si abilita <code>HttpClient</code> nei due mondi?</summary>

Nel classico si importa `HttpClientModule` **una volta** nel root module (`@NgModule.imports`); da lì `HttpClient` è iniettabile ovunque. Nel moderno si chiama la provider function `provideHttpClient(...)` nei provider di bootstrap. `HttpClientModule` è deprecato dalla v18.

</details>

<details>
<summary>Cosa cambia tra <code>observe: 'body'</code>, <code>'response'</code> e <code>'events'</code>?</summary>

`'body'` (default) fa emettere solo il corpo tipizzato (`T`). `'response'` emette l'intera `HttpResponse<T>`, con `status` e `headers` oltre a `body`. `'events'` emette lo stream di `HttpEvent` (utile con `reportProgress: true` per il progress di upload/download). Cambiare `observe` cambia il **tipo** emesso dall'Observable.

</details>

<details>
<summary>Perché in un interceptor si clona la richiesta e come si registra un interceptor class-based?</summary>

Perché `HttpRequest` è **immutabile**: per aggiungere header o modificarla si usa `req.clone({ ... })` e si inoltra il clone con `next.handle(...)`. La registrazione avviene sul token **multi** `HTTP_INTERCEPTORS`: `{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }`.

</details>

<details>
<summary>Cosa succede se si dimentica <code>multi: true</code> su <code>HTTP_INTERCEPTORS</code>?</summary>

Il provider senza `multi: true` **sovrascrive** i precedenti invece di accodarsi: si registra un solo interceptor e gli altri vengono persi. `multi: true` va messo su **tutti** i provider del token, così Angular li raccoglie in un array/catena.

</details>

<details>
<summary>Cosa indica <code>HttpErrorResponse.status === 0</code> e come si ritenta una richiesta?</summary>

`status === 0` indica un errore **lato client/rete** (offline, CORS, richiesta mai partita): non c'è risposta dal server e `err.error` contiene l'errore JS, non un body del backend. Per ritentare si mette `retry(n)` nella pipe **prima** di `catchError(...)`, che intercetta l'`HttpErrorResponse` e in genere ri-lancia con `throwError(() => ...)`.

</details>

**In sintesi:**
- Setup classico via `HttpClientModule` (root); moderno via `provideHttpClient()` (deprecazione di `HttpClientModule` dalla v18).
- Verbi tipizzati (`http.get<T>(...)`); opzioni `params`/`headers` (immutabili), `observe` (`'body'`/`'response'`/`'events'`), `responseType`.
- Interceptor = classe `HttpInterceptor`, pattern **clone-and-forward** (`req.clone` + `next.handle`), registrata su `HTTP_INTERCEPTORS` con `multi: true`; alternativa moderna funzionale (`withInterceptors`).
- Error handling RxJS con `retry`, `catchError` e `HttpErrorResponse` (`status === 0` = errore client/rete).
- Fetch reattivo moderno via `httpResource`/`resource` (signal), in [[02-signal-based-components]]; interceptor funzionali in [[12-initialization-route-changes]].
