# Rete: indirizzi IP

Termini legati a come i dispositivi si riconoscono e si raggiungono in rete, dalla rete di casa fino a internet.

## Indirizzo IP

Un **indirizzo IP** (*Internet Protocol address*) è il numero che identifica un dispositivo in una rete, come l'indirizzo civico identifica un edificio per la posta. Ogni dato che viaggia in rete viene spezzato in piccoli **pacchetti**, e su ciascuno sono scritti due indirizzi IP: quello del mittente e quello del destinatario. Lungo la strada, gli apparecchi che smistano il traffico fra una rete e l'altra (i **router**, e il router di casa è il primo di questi) leggono l'indirizzo del destinatario e inoltrano il pacchetto nella sua direzione; il destinatario, a sua volta, usa l'indirizzo del mittente per rispondere.

Un numero è scomodo da ricordare, quindi i siti hanno anche un nome come `google.com`: la traduzione dal nome all'indirizzo la fa il DNS, descritto nella voce [Dominio](docs/web-browser.md?id=dominio).

Gli indirizzi esistono in due formati, IPv4 e IPv6, e valgono in due ambiti diversi: la rete locale, con gli [indirizzi privati](docs/rete-indirizzi-ip.md?id=ip-privato-locale), e internet, con quelli [pubblici](docs/rete-indirizzi-ip.md?id=ip-pubblico).

## IPv4 e IPv6

Un indirizzo **IPv4** (la versione 4 del protocollo, definita nel 1981 dalla [RFC 791](https://www.rfc-editor.org/rfc/rfc791)) è formato da 32 bit, che per comodità si scrivono come quattro numeri da 0 a 255 separati da punti:

```
192.168.1.23
```

Con 32 bit si ottengono 2³² indirizzi, circa 4,3 miliardi: meno degli abitanti della Terra. La riserva centrale di indirizzi liberi, gestita dall'**IANA** (*Internet Assigned Numbers Authority*, l'ente che coordina la distribuzione degli indirizzi nel mondo), si è esaurita il 3 febbraio 2011 ([NRO](https://www.nro.net/ipv4-free-pool-depleted/)). Alla scarsità si rimedia in due modi, che convivono: il [NAT](docs/rete-indirizzi-ip.md?id=nat), con cui molti dispositivi condividono un solo indirizzo pubblico, e IPv6.

Un indirizzo **IPv6** ([RFC 8200](https://www.rfc-editor.org/rfc/rfc8200)) è formato da 128 bit, abbastanza per circa 3,4 × 10³⁸ indirizzi. Si scrive come otto gruppi di quattro cifre **esadecimali** (le cifre da `0` a `9` più le lettere da `a` a `f`) separati da due punti. Per accorciarlo si tolgono gli zeri iniziali di ogni gruppo, e una sola sequenza di gruppi tutti a zero si può sostituire con `::` ([RFC 5952](https://www.rfc-editor.org/rfc/rfc5952)):

```
2001:0db8:0000:0000:0000:0000:0000:0001   forma completa
2001:db8::1                               lo stesso indirizzo, abbreviato
```

Anche IPv6 ha il suo indirizzo che indica il computer stesso, `::1`, equivalente di `127.0.0.1` (si veda [localhost](docs/rete-indirizzi-ip.md?id=localhost-e-127001)).

Oggi un computer ha spesso entrambi i tipi di indirizzo, e usa l'uno o l'altro in base a ciò che supportano la rete e il sito dall'altra parte: si parla di *dual stack*. Per questo le impostazioni di rete del Mac mostrano sia un indirizzo IPv4 sia uno o più indirizzi IPv6. Questi ultimi sono più d'uno perché il sistema ne crea di diversi tipi, e alcuni li sostituisce periodicamente perché il dispositivo non resti riconoscibile nel tempo ([RFC 8981](https://www.rfc-editor.org/rfc/rfc8981)).

Con IPv6 gli indirizzi bastano per tutti, quindi ogni dispositivo di casa può ricevere un proprio indirizzo pubblico e il NAT di solito non serve. Un indirizzo pubblico per ogni dispositivo non lo lascia comunque esposto: il router di casa, di norma, blocca le connessioni che arrivano da internet senza essere state richieste ([RFC 6092](https://www.rfc-editor.org/rfc/rfc6092)).

## IP privato (locale)

Un **IP privato** è un indirizzo che vale solo dentro una rete locale (la rete di casa o dell'ufficio, detta anche **LAN**, *Local Area Network*) e che su internet non viene mai instradato. È l'indirizzo che si intende quando si parla di «IP locale». Tre intervalli sono riservati a questo uso ([RFC 1918](https://www.rfc-editor.org/rfc/rfc1918)):

| Intervallo | Uso tipico |
|------------|------------|
| da `192.168.0.0` a `192.168.255.255` | reti di casa |
| da `10.0.0.0` a `10.255.255.255` | reti aziendali e cloud (le VPC di AWS) |
| da `172.16.0.0` a `172.31.255.255` | reti aziendali, container Docker |

Siccome questi indirizzi non escono dalla rete locale, milioni di case possono usare gli stessi senza conflitti: il `192.168.1.23` di una casa e quello della casa accanto sono due dispositivi diversi, che non si vedono a vicenda. Gli intervalli si scrivono anche in forma compatta, come `192.168.0.0/16`: è la notazione **CIDR**, spiegata nel <a href="../aws/#/docs/03-vpc-network-security?id=la-vpc-e-il-suo-indirizzamento" target="_blank" rel="noopener">modulo AWS sulla VPC</a>.

L'indirizzo privato di solito non lo si sceglie a mano. Quando un dispositivo si collega al Wi-Fi chiede un indirizzo al router, che glielo assegna con il **DHCP** (*Dynamic Host Configuration Protocol*, il protocollo che distribuisce automaticamente gli indirizzi in una rete, [RFC 2131](https://www.rfc-editor.org/rfc/rfc2131)). L'assegnazione vale per un tempo limitato e viene rinnovata, quindi l'IP privato di un computer può cambiare, per esempio dopo un riavvio del router. Anche il router ha un proprio indirizzo privato, spesso `192.168.1.1` o `192.168.0.1`, ed è il punto d'uscita (*gateway*) verso internet per tutti i dispositivi della rete.

## IP pubblico

Un **IP pubblico** è un indirizzo unico in tutta internet, quello con cui una connessione si presenta ai siti che visita. In una rete di casa l'indirizzo pubblico è uno solo e appartiene al router, che lo riceve dal **provider** (il fornitore della connessione) sul lato rivolto verso internet. Tutti i dispositivi della casa escono quindi con lo stesso indirizzo pubblico: è quello che un sito vede arrivare, e quello che mostrano le pagine del tipo «qual è il mio IP».

Il provider può assegnarlo in due modi. Un IP **dinamico** cambia nel tempo, per esempio quando il router si riconnette; un IP **statico** resta sempre lo stesso, spesso come opzione a parte, e serve a chi deve rendere raggiungibile un server di casa. Dall'indirizzo pubblico un sito può ricavare il provider e una posizione approssimativa, in genere la città o la zona, ma non l'indirizzo di casa.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 680 230" role="img" aria-label="Rete di casa: Mac, iPhone e smart TV hanno ciascuno un IP privato e sono collegati al router, che ha l'indirizzo privato 192.168.1.1 verso casa e l'indirizzo pubblico 203.0.113.7 verso internet, dove si trova un sito web con il suo IP pubblico" style="width:100%;max-width:680px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="12" y="12" width="430" height="206" rx="12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="5 4" opacity=".55"/><text x="28" y="36" font-size="11.5" font-weight="700">Rete di casa · IP privati</text><rect x="462" y="12" width="206" height="206" rx="12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="5 4" opacity=".55"/><text x="478" y="36" font-size="11.5" font-weight="700">Internet · IP pubblici</text><g font-size="10.5"><rect x="32" y="52" width="150" height="40" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="107" y="68" text-anchor="middle" font-weight="700">Mac</text><text x="107" y="84" text-anchor="middle" font-family="ui-monospace,SFMono-Regular,Menlo,monospace">192.168.1.23</text><rect x="32" y="106" width="150" height="40" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="107" y="122" text-anchor="middle" font-weight="700">iPhone</text><text x="107" y="138" text-anchor="middle" font-family="ui-monospace,SFMono-Regular,Menlo,monospace">192.168.1.24</text><rect x="32" y="160" width="150" height="40" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="107" y="176" text-anchor="middle" font-weight="700">Smart TV</text><text x="107" y="192" text-anchor="middle" font-family="ui-monospace,SFMono-Regular,Menlo,monospace">192.168.1.30</text></g><path d="M182 72 L262 108 M182 126 L262 126 M182 180 L262 144" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="262" y="84" width="164" height="84" rx="10" fill="var(--link,#78716c)" fill-opacity=".16" stroke="currentColor" stroke-width="1.7"/><text x="344" y="106" font-size="12.5" text-anchor="middle" font-weight="700">Router · NAT</text><g font-size="9.5" text-anchor="middle"><text x="344" y="126">privato: <tspan font-family="ui-monospace,SFMono-Regular,Menlo,monospace">192.168.1.1</tspan></text><text x="344" y="146">pubblico: <tspan font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-weight="700">203.0.113.7</tspan></text></g><path d="M426 126 L494 126" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="494" y="96" width="150" height="60" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="569" y="120" font-size="11.5" text-anchor="middle" font-weight="700">Sito web</text><text x="569" y="140" font-size="10.5" text-anchor="middle" font-family="ui-monospace,SFMono-Regular,Menlo,monospace">198.51.100.10</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">In casa ogni dispositivo ha un <strong>IP privato</strong>, assegnato dal router con il DHCP. Il router ha due indirizzi: uno privato rivolto verso casa e l'unico <strong>IP pubblico</strong>, rivolto verso internet. Tutto il traffico della casa esce con <code>203.0.113.7</code>, quindi il sito vede solo quello, e il NAT del router riporta ogni risposta al dispositivo che l'aveva chiesta.</figcaption>
</figure>

## NAT

Il **NAT** (*Network Address Translation*, traduzione degli indirizzi di rete) è il meccanismo con cui il router fa uscire su internet tutti i dispositivi di casa con l'unico indirizzo pubblico, e poi riporta ogni risposta al dispositivo che l'aveva chiesta ([RFC 3022](https://www.rfc-editor.org/rfc/rfc3022)).

Quando il Mac (`192.168.1.23`) apre una pagina, il router riscrive il mittente del pacchetto: al posto dell'indirizzo privato mette quello pubblico (`203.0.113.7`) insieme a un numero di [porta](docs/rete-indirizzi-ip.md?id=porta) scelto da lui, e annota la corrispondenza in una tabella. Quando la risposta del sito arriva a `203.0.113.7` su quella porta, il router consulta la tabella, rimette l'indirizzo del Mac e gliela consegna.

| Dentro casa (mittente originale) | Su internet (dopo il NAT) |
|----------------------------------|---------------------------|
| `192.168.1.23`, porta `52100` (Mac) | `203.0.113.7`, porta `40001` |
| `192.168.1.24`, porta `61500` (iPhone) | `203.0.113.7`, porta `40002` |

Una connessione che parte da internet verso la casa, invece, non corrisponde a nessuna riga della tabella: il router non sa a quale dispositivo consegnarla e la scarta. Per questo un computer di casa non è raggiungibile dall'esterno, a meno di configurare sul router un *port forwarding*, cioè una regola del tipo «ciò che arriva su questa porta va a questo dispositivo». Nel cloud lo stesso principio prende la forma del <a href="../aws/#/docs/03-vpc-network-security?id=instradamento-route-table-internet-gateway-e-nat-gateway" target="_blank" rel="noopener">NAT Gateway di AWS</a>.

Alcuni provider, soprattutto sulle reti mobili, applicano un secondo NAT a monte, detto *carrier-grade NAT*. In quel caso anche l'indirizzo che riceve il router è condiviso con altri clienti, e appartiene spesso all'intervallo da `100.64.0.0` a `100.127.255.255`, riservato a questo scopo ([RFC 6598](https://www.rfc-editor.org/rfc/rfc6598)).

## localhost e 127.0.0.1

`localhost` è il nome con cui un computer indica sé stesso, e `127.0.0.1` è l'indirizzo corrispondente (in IPv6 `::1`). Un pacchetto spedito a questo indirizzo, detto di *loopback* («anello di ritorno»), non lascia mai il computer: il sistema lo rigira subito al computer stesso, senza passare dalla scheda di rete né dal router. L'intero intervallo da `127.0.0.0` a `127.255.255.255` è riservato a questo uso ([RFC 6890](https://www.rfc-editor.org/rfc/rfc6890)), come il nome `localhost` ([RFC 6761](https://www.rfc-editor.org/rfc/rfc6761)); sul Mac l'associazione fra il nome e i due indirizzi è scritta nel file `/etc/hosts`.

Per questo i server di sviluppo usano `localhost`: `ng serve` pubblica l'app su `http://localhost:4200`, Vite su `http://localhost:5173`. Di default questi server accettano connessioni solo su `localhost`, quindi l'app si apre dal computer su cui gira e da nessun altro. Per provarla da un telefono collegato alla stessa rete Wi-Fi, il telefono deve usare l'[IP privato](docs/rete-indirizzi-ip.md?id=ip-privato-locale) del computer (per esempio `http://192.168.1.23:5173`), e il server deve accettare anche le connessioni dalla rete locale. Sia Vite sia Angular CLI lo fanno con l'opzione `--host 0.0.0.0`, dove `0.0.0.0` vuol dire «su tutti gli indirizzi del computer» ([Vite](https://vite.dev/config/server-options), [Angular CLI](https://angular.dev/cli/serve)).

## Porta

Una **porta** è un numero da 0 a 65535 che, insieme all'indirizzo IP, indica a quale programma di un computer vanno consegnati i dati. Se l'IP è l'indirizzo di un palazzo, la porta è il numero dell'interno: sullo stesso computer possono girare insieme un database e un dev server, e ciascuno riceve solo ciò che arriva sulla sua porta. Nell'indirizzo si scrive dopo i due punti: in `localhost:4200` l'IP è quello di `localhost` e la porta è `4200`.

Alcuni servizi hanno una porta standard, registrata presso l'IANA ([registro delle porte](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml)):

| Porta | Servizio |
|-------|----------|
| `80` | HTTP |
| `443` | HTTPS |
| `22` | [SSH](docs/ssh.md) |

Quando la porta è quella standard il browser la sottintende: `https://example.com` equivale a `https://example.com:443`. I dev server usano invece numeri alti e liberi (`4200`, `5173`, `3000`). Due programmi non possono ascoltare sulla stessa porta dello stesso indirizzo, quindi se un dev server è già attivo il secondo segnala che la porta è occupata, oppure ne sceglie da solo un'altra.

La porta fa parte anche dell'**origin** di una pagina, insieme a schema e host: un'app su `localhost:4200` che chiama un'API su `localhost:3000` fa quindi una richiesta *cross-origin*, regolata dal [CORS](docs/web-browser.md?id=cross-origin-cors).

---

Fonti: [RFC 791 (IPv4)](https://www.rfc-editor.org/rfc/rfc791) · [RFC 8200 (IPv6)](https://www.rfc-editor.org/rfc/rfc8200) · [RFC 4291 (indirizzi IPv6)](https://www.rfc-editor.org/rfc/rfc4291) · [RFC 1918 (indirizzi privati)](https://www.rfc-editor.org/rfc/rfc1918) · [RFC 3022 (NAT)](https://www.rfc-editor.org/rfc/rfc3022) · [RFC 6890 (indirizzi per usi speciali)](https://www.rfc-editor.org/rfc/rfc6890) · [IANA: registro delle porte](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml). Gli indirizzi degli esempi (`203.0.113.x`, `198.51.100.x`, `2001:db8::`) appartengono agli intervalli riservati alla documentazione ([RFC 5737](https://www.rfc-editor.org/rfc/rfc5737), [RFC 3849](https://www.rfc-editor.org/rfc/rfc3849)).

Collegamenti: [Web, browser e rete](docs/web-browser.md) (Dominio e DNS, CORS) · [SSH e chiavi](docs/ssh.md) · <a href="../aws/#/docs/03-vpc-network-security" target="_blank" rel="noopener">AWS · Amazon VPC</a> (CIDR, subnet, NAT Gateway).
