---
titolo: "Cert Angular (Senior) — Angular classico"
tags: [tipo/indice, moc, cert]
---
# Cert Angular — Angular classico

Appunti di preparazione alla **certificazione Angular** di [certificates.dev](https://certificates.dev/angular) (target **Senior**), limitati a ciò che l'esame richiede e che **non** è coperto dal vault *Modern Angular*: NgModules, forms classiche, RxJS, DI e routing classici, change detection con Zone.js, NgRx Redux, testing Jasmine/Karma, ecc.

> [!info] Perché una sezione a parte
> Il vault principale segue *Modern Angular* (standalone, signals, Signal Forms). La cert però testa anche l'**Angular classico**. Qui si copre **solo il gap**: dove un tema è già spiegato nel moderno, non si riscrive — si rimanda con un callout `> [!info] vs Modern`.

## Note (Angular classico)
- [[ngmodules]] — `@NgModule`, feature/shared module, `forRoot`/`forChild`, `CommonModule`/`BrowserModule`
- [[components-classic]] — `@Input`/`@Output`+`EventEmitter`, `@ViewChild`/`@ContentChild`, lifecycle hooks
- [[directives-pipes-classic]] — `*ngIf`/`*ngFor`/`*ngSwitch`, directive custom, pipe pure/impure, `async`
- [[di-classic]] — `@Injectable`, `InjectionToken`, `useClass`/`useValue`/`useFactory`/`useExisting`, resolution modifier
- [[routing-classic]] — `RouterModule.forRoot`/`forChild`, guard class-based, resolver, `loadChildren` di moduli
- [[forms-template-driven]] — `FormsModule`, `ngModel`, validazione e stati
- [[forms-reactive]] — `ReactiveFormsModule`, `FormControl`/`FormGroup`/`FormArray`, `FormBuilder`, validator
- [[rxjs]] — `Observable`/`Subject`, operator, unsubscribe
- [[http-classic]] — `HttpClientModule`, `HttpInterceptor` class-based, error handling
- [[change-detection]] — Zone.js, default vs `OnPush`, `ChangeDetectorRef`
- [[ngrx-classic]] — Store/Action/Reducer/Effect/Selector (Redux)
- [[testing-classic]] — `TestBed`, Jasmine/Karma, `HttpTestingController`, spie
- [[performance]] — `trackBy`, pure pipe, preloading, bundle
- [[security]] — XSS/sanitization, `DomSanitizer`, XSRF, CSP

## Già nel vault moderno (solo ripasso, non riscritto qui)
Componenti e control flow, content projection, DI `inject()`, routing moderno e guard funzionali, signals e CD signal-based, interop `toSignal`/`toObservable`, `HttpClient`/`httpResource`, NgRx **Signal** Store, structural directive custom, testing con Vitest, defer/SSR, auth → vedi i rispettivi capitoli nel vault ([[00-index]]).

---
Fonti: [certificates.dev/angular](https://certificates.dev/angular) · [topic d'esame](https://support.certificates.dev/article/97-what-topics-are-covered-in-the-angular-certification-exams) · [angular.dev](https://angular.dev/) · [rxjs.dev](https://rxjs.dev/) · [ngrx.io](https://ngrx.io/).
