# Licenze software (open source)

Una **licenza software** è il testo legale che stabilisce **cosa si può fare** con un pezzo di codice: usarlo, modificarlo, ridistribuirlo, incorporarlo in un prodotto commerciale, e a quali condizioni. È il documento che trasforma del codice pubblicato in codice *utilizzabile* da altri, perché senza una licenza esplicita vale la regola di default del diritto d'autore: **«tutti i diritti riservati»**. Codice messo online senza licenza non è «libero»: nessuno può legalmente copiarlo, modificarlo o ridistribuirlo, anche se il sorgente è visibile su GitHub.

La distinzione che conta più di ogni altra non è tra le singole licenze, ma tra due **famiglie** con filosofie opposte: le licenze **permissive** e quelle **copyleft**.

## Permissive vs copyleft

Una licenza **permissiva** concede quasi ogni libertà chiedendo pochissimo in cambio, di norma solo di **mantenere l'avviso di copyright** (l'attribuzione all'autore originale). In particolare **non obbliga** a rendere aperto il codice derivato: si può prendere una libreria permissiva, modificarla e includerla in un prodotto **proprietario e chiuso**, senza dover pubblicare nulla. Sono le licenze preferite dalle aziende e dominano l'ecosistema npm.

Una licenza **copyleft** concede le stesse libertà (usare, studiare, modificare, ridistribuire) ma vi lega un obbligo di reciprocità: chi **ridistribuisce** il software, anche modificato, deve rilasciare il risultato **sotto la stessa licenza**, tenendo aperto il sorgente. È il meccanismo *share-alike* («condividi allo stesso modo»), pensato perché il codice libero e i suoi discendenti restino liberi. Il nome è un gioco di parole su *copyright*: invece di riservare i diritti, li usa per **imporre** che restino aperti.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 720 156" role="img" aria-label="Spettro delle licenze open source per obblighi crescenti verso chi riusa il codice: public domain, permissive, copyleft debole, copyleft forte, copyleft di rete" style="width:100%;max-width:700px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="360" y="22" font-size="11" text-anchor="middle" opacity=".8">obblighi per chi riusa il codice: crescenti</text><path d="M40 38 L672 38" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M680 38 L668 32 L668 44 Z" fill="currentColor"/><g><rect x="20" y="60" width="120" height="70" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="80" y="90" font-size="11" text-anchor="middle" font-weight="700">Public domain</text><text x="80" y="110" font-size="9" text-anchor="middle" opacity=".7">CC0, Unlicense</text></g><g><rect x="160" y="60" width="120" height="70" rx="8" fill="var(--link,#78716c)" fill-opacity=".08" stroke="currentColor" stroke-width="1.5"/><text x="220" y="90" font-size="11" text-anchor="middle" font-weight="700">Permissive</text><text x="220" y="110" font-size="9" text-anchor="middle" opacity=".7">MIT, BSD, Apache</text></g><g><rect x="300" y="60" width="120" height="70" rx="8" fill="var(--link,#78716c)" fill-opacity=".14" stroke="currentColor" stroke-width="1.5"/><text x="360" y="86" font-size="11" text-anchor="middle" font-weight="700">Copyleft</text><text x="360" y="100" font-size="11" text-anchor="middle" font-weight="700">debole</text><text x="360" y="118" font-size="9" text-anchor="middle" opacity=".7">LGPL, MPL</text></g><g><rect x="440" y="60" width="120" height="70" rx="8" fill="var(--link,#78716c)" fill-opacity=".22" stroke="currentColor" stroke-width="1.5"/><text x="500" y="86" font-size="11" text-anchor="middle" font-weight="700">Copyleft</text><text x="500" y="100" font-size="11" text-anchor="middle" font-weight="700">forte</text><text x="500" y="118" font-size="9" text-anchor="middle" opacity=".7">GPLv2, GPLv3</text></g><g><rect x="580" y="60" width="120" height="70" rx="8" fill="var(--link,#78716c)" fill-opacity=".3" stroke="currentColor" stroke-width="1.5"/><text x="640" y="86" font-size="11" text-anchor="middle" font-weight="700">Copyleft</text><text x="640" y="100" font-size="11" text-anchor="middle" font-weight="700">di rete</text><text x="640" y="118" font-size="9" text-anchor="middle" opacity=".7">AGPL</text></g></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Da sinistra a destra crescono gli obblighi verso chi riusa il codice: dal <strong>public domain</strong> (nessun vincolo) alle <strong>permissive</strong> (solo l'attribuzione), fino al <strong>copyleft</strong> via via più stringente. La licenza <strong>proprietaria</strong> sta fuori da questo spettro: non è open source, il sorgente è chiuso e i diritti sono riservati.</figcaption>
</figure>

## Le licenze permissive

Le permissive si assomigliano molto: cambiano i dettagli, non la sostanza («fai ciò che vuoi, tieni l'avviso di copyright, nessuna garanzia»).

- **MIT** è la più diffusa in assoluto, adottata da React, Angular, Vue, Node.js e dalla grande maggioranza dei pacchetti npm. È lunga una decina di righe: concede uso, copia, modifica e vendita, a patto di riprodurre l'avviso di copyright, e declina ogni garanzia. La sua brevità e chiarezza sono il motivo del suo successo.
- **ISC** è funzionalmente equivalente a MIT, con un testo ancora più asciutto (rimuove due clausole ritenute ridondanti). È la licenza di default che npm propone quando si crea un pacchetto con `npm init`.
- **BSD** esiste in due varianti comuni: la **2-clause** (di fatto come MIT) e la **3-clause**, che aggiunge il divieto di usare il nome degli autori per promuovere prodotti derivati senza permesso (clausola *no-endorsement*).
- **Apache 2.0** è permissiva ma più strutturata e pensata per l'uso aziendale: include una **concessione esplicita di brevetto** (chi contribuisce non può poi far causa agli utenti per i brevetti sul codice donato) e obbliga a segnalare le modifiche. La usano progetti come Kubernetes, Android e TypeScript.

## Il copyleft: la famiglia GPL

La **GPL** (*GNU General Public License*), nata nel progetto GNU di Richard Stallman, è la licenza copyleft per eccellenza. Le sue varianti si distinguono per **quanto forte** è l'obbligo di reciprocità.

- **GPLv2** è la versione storica, del 1991: chi ridistribuisce un derivato deve rilasciarlo a sua volta sotto GPL, con il sorgente disponibile. Il **kernel Linux** è (e resta) su GPLv2.
- **GPLv3** (2007) rafforza la GPLv2 su tre fronti: chiude la *tivoizzazione* (hardware che gira software GPL ma ne impedisce tecnicamente la modifica), aggiunge tutele esplicite sui **brevetti** e migliora la compatibilità con altre licenze. Proprio il passaggio a GPLv3 spiega un fatto concreto: Apple ha **congelato bash** alla versione 3.2.57 (l'ultima GPLv2) e ha scelto **zsh** come shell predefinita di macOS, perché non voleva distribuire software GPLv3 col sistema. La storia per esteso è in <a href="../terminale/#/docs/02-shell-sh-bash-zsh" target="_blank" rel="noopener">Terminale · Le shell</a>.
- **LGPL** (*Lesser* GPL) è un copyleft **debole** pensato per le **librerie**: si può **collegare** (linkare) una libreria LGPL da un programma proprietario senza che l'intero programma diventi GPL; l'obbligo di condividere riguarda solo le modifiche **alla libreria** stessa.
- **AGPL** (*Affero* GPL) chiude quella che viene chiamata la «scappatoia SaaS»: la GPL scatta sulla **ridistribuzione**, ma un servizio web non distribuisce nulla, gira sui server di chi lo offre. L'AGPL estende l'obbligo anche all'**uso in rete**: se si offre come servizio un software AGPL modificato, si devono rendere disponibili le proprie modifiche agli utenti. Per questo molte aziende la vietano nelle dipendenze. La usava, storicamente, MongoDB.

## Nessuna licenza, public domain, doppia licenza

Tre casi ai margini dello spettro completano il quadro.

- **Nessuna licenza** significa **tutti i diritti riservati**: è la conseguenza automatica del diritto d'autore. Un repository pubblico senza file di licenza si può *guardare*, ma non riusare legalmente. Aggiungere una licenza è ciò che rende un progetto davvero open source.
- **Public domain e rinunce**: strumenti come **CC0** (Creative Commons Zero) e la **Unlicense** servono a rinunciare esplicitamente a ogni diritto, avvicinandosi il più possibile al pubblico dominio, che in alcuni ordinamenti non si può dichiarare direttamente.
- **Doppia licenza** (*dual licensing*): lo stesso codice viene offerto sotto due licenze, tipicamente una copyleft per l'uso libero **e** una licenza commerciale a pagamento per chi non vuole gli obblighi del copyleft. È il modello storico di Qt e MySQL: chi accetta la GPL usa gratis, chi vuole tenere chiuso il proprio prodotto compra la licenza commerciale.

## In pratica: il campo `license` e SPDX

Nell'ecosistema npm la licenza di un pacchetto si dichiara nel `package.json`, nel campo `license`, usando un **identificatore SPDX**: un codice breve e standardizzato preso da un elenco ufficiale (`MIT`, `ISC`, `Apache-2.0`, `GPL-3.0-or-later`, `AGPL-3.0-only`…), così che sia leggibile sia dalle persone sia dagli strumenti automatici.

```json
{
  "name": "mia-libreria",
  "version": "1.0.0",
  "license": "MIT"
}
```

La cosa conta quando si scelgono le **dipendenze** di un prodotto: una dipendenza permissiva (MIT, ISC, BSD, Apache 2.0) si integra senza vincoli, mentre una dipendenza **copyleft** (specialmente GPL o AGPL) può imporre obblighi all'intero prodotto e va valutata con attenzione, spesso legale. Per questo nei progetti aziendali si tende a preferire, o addirittura a imporre via tooling, le sole licenze permissive.

> [!tip]
> Per scegliere una licenza o capire cosa concede una che si è trovata, il riferimento pratico è <a href="https://choosealicense.com/" target="_blank" rel="noopener">choosealicense.com</a> (di GitHub); l'elenco completo degli identificatori è su <a href="https://spdx.org/licenses/" target="_blank" rel="noopener">spdx.org/licenses</a>, e le licenze approvate come «open source» sono quelle certificate dalla <a href="https://opensource.org/licenses" target="_blank" rel="noopener">Open Source Initiative</a>.
