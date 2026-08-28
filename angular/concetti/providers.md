---
titolo: "Providers"
tags: [tipo/concetto, di, services, angular-22]
aliases: [provider, useClass, useValue, useFactory, providedIn]
---
# Providers

I **provider** dicono al sistema di DI **cosa** restituire quando qualcuno chiede un certo token. Si possono definire a più livelli — root (via [[service|@Service()]], o pre-22 `providedIn: 'root'`), applicazione, route o componente — e la **gerarchia** di questi livelli determina sia la visibilità sia il ciclo di vita dell'istanza.

```ts
providers: [
  FlightService,                                  // short-hand (useClass implicito)
  { provide: API, useClass: RealApi },
  { provide: TOKEN, useValue: 42 },
  { provide: X, useFactory: () => new X(inject(Dep)) },
  { provide: Y, useExisting: Z },
]
```

> [!tip]
> Un provider a livello **componente o route** crea un'istanza locale (utile per lo stato di una singola feature, vedi [[lightweight-store]]); a livello **root** crea un singleton condiviso da tutta l'app. Esistono poi le **provider function** (`provideHttpClient()`, `provideRouter()`), l'API idiomatica per configurare interi sottosistemi.

> [!info|label:Angular 22+]
> Lo short-hand `providers: [FlightClient]` (dove il token coincide con l'implementazione) equivale a mettere [[service|@Service()]] sulla classe — pre-22 era `@Injectable({ providedIn: 'root' })`. Per i servizi **scambiabili** dietro un base type si usa invece `@Service({ autoProvided: false })` insieme a un provider esplicito.

**Usato in:** [[05-state-management-services-signals]], [[12-initialization-route-changes]]
