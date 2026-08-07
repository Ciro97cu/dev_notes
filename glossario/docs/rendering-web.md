# Rendering web: CSR, SSR, SSG

Con "rendering" si intende **dove e quando** viene prodotto l'HTML che il browser mostra. La stessa pagina può nascere in tre momenti diversi — nel browser a runtime, su un server a ogni richiesta, oppure una volta sola in fase di build — e la scelta cambia prestazioni, SEO e complessità dell'infrastruttura. Le tre strategie principali sono CSR, SSR e SSG.

## CSR — Client-Side Rendering

Nel Client-Side Rendering il server invia un HTML quasi vuoto insieme a un bundle JavaScript, ed è il **browser a costruire il contenuto a runtime**. Al primo accesso l'utente vede una pagina spoglia finché il JavaScript non è stato scaricato ed eseguito; da quel momento, però, la navigazione tra le pagine è istantanea, perché avviene tutta lato client senza ricaricare (è il modello delle SPA, Single Page Application).

Il pregio è la semplicità: non serve un server applicativo né una fase di build, perché bastano file statici, e tutta la logica vive in un posto solo. I difetti sono il rovescio della medaglia: la **prima pittura** è più lenta (schermata vuota finché gira il JS), la **SEO** è più debole perché i crawler devono eseguire il JavaScript per vedere il contenuto (Google lo fa, ma più lentamente e in modo meno affidabile, e molti altri bot non lo fanno affatto), e senza JavaScript non si vede nulla.

Conviene quando SEO e prima pittura non contano: applicazioni dietro login come dashboard, strumenti interni e gestionali, oppure siti piccoli e personali dove la semplicità vale più dell'ottimizzazione. docsify — il motore di questo hub — è CSR.

## SSR — Server-Side Rendering

Nel Server-Side Rendering l'HTML viene generato **da un server a ogni richiesta**, con i dati aggiornati al momento, e spedito già pronto al browser; il JavaScript poi "idrata" la pagina, cioè le riaggancia gli event handler, per renderla interattiva.

Il pregio è avere insieme HTML immediato (prima pittura veloce), SEO piena e contenuto sempre fresco, che può essere personalizzato per il singolo utente. Il prezzo è l'infrastruttura: serve un server che gira e ricalcola a ogni richiesta, perché non bastano più file statici su una CDN, con il relativo costo e la relativa complessità.

Conviene quando il contenuto è **dinamico e personalizzato** ma deve comunque essere veloce e indicizzabile: un e-commerce con prezzi e disponibilità in tempo reale, un feed che dipende dall'utente loggato, pagine che cambiano a ogni richiesta. In Angular è il ruolo di `@angular/ssr`, approfondito in [17 · Defer, SSR e Hydration](../../angular/capitoli/17-defer-ssr-hydration.md) del vault Angular.

## SSG — Static Site Generation

Nella Static Site Generation l'HTML di **ogni** pagina viene pre-generato **una volta sola, in fase di build**: il risultato è un insieme di file statici, serviti da una CDN senza alcun server applicativo. Spesso il JavaScript idrata comunque le pagine, così dopo il primo caricamento la navigazione diventa fluida come in una SPA.

I pregi sono quelli che rendono l'SSG lo standard per la documentazione: prima pittura immediata perché l'HTML è già pronto, SEO piena perché il crawler legge il testo senza eseguire nulla, pagine leggibili anche senza JavaScript e cache su CDN economica e scalabile. Il limite è che ogni modifica al contenuto richiede una **nuova build**, e che il modello non si adatta a contenuto che cambia per singolo utente o a ogni richiesta, che resta compito dell'SSR o dell'idratazione lato client.

Conviene quando il contenuto è **prevalentemente statico e uguale per tutti**: documentazioni, blog, landing page, siti di marketing. È il modello dietro strumenti come Docusaurus, VitePress, MkDocs e Astro Starlight.

## Come scegliere

| Strategia | Dove nasce l'HTML | Quando conviene |
| --- | --- | --- |
| **CSR** | nel browser, a runtime | SEO e prima pittura irrilevanti (app dietro login), oppure priorità alla semplicità e allo zero-build |
| **SSR** | su un server, a ogni richiesta | contenuto dinamico e per-utente che deve essere anche veloce e indicizzabile |
| **SSG** | in fase di build, una volta sola | contenuto statico e uguale per tutti, dove SEO e velocità contano (documentazioni, blog) |

La linea, oggi, è sfumata: framework come Next.js o Astro mescolano le tre strategie **per singola rotta** nello stesso progetto, e con le "islands" idratano solo i frammenti interattivi lasciando statico tutto il resto. Questo hub sta sul lato più semplice della scala, cioè CSR con docsify, per una scelta deliberata di zero-build; il perché è spiegato nell'architettura del progetto ([README](../../README.md)).
