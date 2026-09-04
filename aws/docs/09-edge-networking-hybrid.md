# 09 · Edge networking e connettività ibrida

Due esigenze diverse condividono un tema: avvicinare il traffico. La prima è portare **contenuti e richieste** il più vicino possibile agli utenti sparsi nel mondo, riducendo la latenza con la rete di frontiera (*edge*) di AWS: CloudFront, Global Accelerator, Route 53. La seconda è collegare le reti **on-premise** dell'azienda al cloud in modo sicuro e affidabile: VPN e Direct Connect. Insieme decidono prestazioni e costo del networking di un'architettura globale o ibrida.

> [!info|label:SAA-C03 · D3T4 e D4T4, base D1T2]
> Il modulo copre *Determine high-performing and/or scalable network architectures* (D3T4) e *Design cost-optimized network architectures* (D4T4): CloudFront, Global Accelerator, Route 53 e le sue politiche di routing, la connettività ibrida con VPN e Direct Connect. Tocca anche la sicurezza della connessione (D1T2).

## Portare i contenuti vicino agli utenti: CloudFront

**Amazon CloudFront** è la **content delivery network (CDN)** di AWS: conserva copie dei contenuti in centinaia di **edge location** sparse nel mondo, così una richiesta viene servita dal punto **più vicino** all'utente invece che dall'origine, con latenza minore. Su una *cache hit* l'edge risponde subito senza disturbare l'origine; su una *miss* preleva dall'**origin** (un bucket S3, un load balancer) e mette in cache per le richieste successive. Oltre alla velocità, CloudFront **alleggerisce l'origine** (che riceve solo i miss), termina il TLS all'edge e si integra con il WAF per filtrare il traffico lontano dall'applicazione.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 210" role="img" aria-label="CloudFront serve gli utenti dall'edge location piu vicino: su una cache hit risponde l'edge, su una miss preleva dall'origin (S3 o load balancer) e riempie la cache." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="cf-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6">
      <rect x="28" y="76" width="140" height="58" rx="9"/>
      <rect x="286" y="70" width="150" height="70" rx="9"/>
      <rect x="552" y="76" width="140" height="58" rx="9"/>
    </g>
    <g text-anchor="middle">
      <text x="98" y="100" font-size="12" font-weight="700">utenti</text>
      <text x="98" y="118" font-size="9" fill-opacity=".7">nel mondo</text>
      <text x="361" y="96" font-size="12" font-weight="700">edge location</text>
      <text x="361" y="114" font-size="9.5" fill-opacity=".7">CloudFront · cache</text>
      <text x="622" y="100" font-size="12" font-weight="700">origin</text>
      <text x="622" y="118" font-size="9" fill-opacity=".7">S3 / load balancer</text>
    </g>
    <path d="M168 105 L284 105" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#cf-arrow)"/>
    <path d="M436 116 L550 116" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="6 4" marker-end="url(#cf-arrow)"/>
    <g text-anchor="middle" font-size="9" fill-opacity=".82">
      <text x="226" y="97">richiesta al punto vicino</text>
      <text x="493" y="110">solo su cache miss</text>
    </g>
    <text x="360" y="176" font-size="10" text-anchor="middle" fill-opacity=".8">hit: servito dall'edge, bassa latenza · miss: preso dall'origin e messo in cache</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">CloudFront serve dall'<strong>edge</strong> più vicino: la maggior parte delle richieste non raggiunge l'origine, che riceve solo i <em>miss</em>. Ne guadagnano latenza per l'utente e carico per l'origine.</figcaption>
</figure>

## Accelerare il traffico di rete: Global Accelerator

**AWS Global Accelerator** risolve un problema diverso: non memorizza nulla, ma **accelera** il percorso di rete. Fornisce due **indirizzi IP anycast statici** che, da qualunque parte del mondo, instradano il traffico sulla **dorsale privata di AWS** fino all'endpoint sano più vicino, saltando i tratti lenti della rete pubblica. Lavora al **livello 4** (TCP/UDP), quindi va oltre l'HTTP di CloudFront ed è la scelta per applicazioni non web, per giochi o VoIP, o quando serve un **IP fisso** globale. La distinzione d'esame è netta: **CloudFront mette in cache contenuti HTTP**, **Global Accelerator accelera la rete** senza cache, con IP statici, anche per protocolli non HTTP.

## Dirigere gli utenti: Route 53

**Amazon Route 53** è il servizio **DNS** di AWS, ma è anche uno strumento di **instradamento intelligente**: le sue *routing policy* decidono a quale risorsa mandare ciascun utente. Le principali sono **simple** (una risorsa), **weighted** (percentuali di traffico fra più risorse, utile per rilasci graduali), **latency** (verso la Region a latenza minore per l'utente), **geolocation** e **geoproximity** (in base alla posizione), **failover** (attivo-passivo, il perno del DR visto nel [modulo 08](08-alta-disponibilita-disaster-recovery.md)) e **multivalue**. Combinate con gli **health check**, permettono di distribuire il traffico per prestazioni, per costo o per resilienza.

## Collegare l'on-premise: connettività ibrida

Molte aziende non partono da zero: hanno un data center che deve dialogare con AWS. Due strade lo collegano, con profili opposti. Una **Site-to-Site VPN** crea un **tunnel cifrato sopra internet** fra la rete on-premise e la VPC: è **economica** e si attiva in fretta, ma passa per la rete pubblica, quindi banda e latenza **fluttuano**. **AWS Direct Connect** stabilisce invece una **connessione fisica dedicata e privata** verso AWS: offre prestazioni **costanti** e alta banda (fino a 100 Gbps), ma **costa di più** e richiede tempo per essere installata. Spesso si combinano (VPN sopra Direct Connect) per unire la costanza del collegamento privato alla cifratura del tunnel.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 220" role="img" aria-label="Due modi di collegare un data center on-premise a una VPC: una Site-to-Site VPN come tunnel cifrato su internet (economica, variabile) e AWS Direct Connect come linea privata dedicata (costante, costosa)." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="hy-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="26" y="86" width="150" height="54" rx="9" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6"/>
    <text x="101" y="110" font-size="11.5" text-anchor="middle" font-weight="700">data center</text>
    <text x="101" y="126" font-size="9.5" text-anchor="middle" fill-opacity=".7">on-premise</text>
    <rect x="544" y="86" width="150" height="54" rx="9" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6"/>
    <text x="619" y="117" font-size="12" text-anchor="middle" font-weight="700">VPC</text>
    <rect x="288" y="34" width="150" height="46" rx="8" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.5"/>
    <text x="363" y="53" font-size="11" text-anchor="middle" font-weight="700">Site-to-Site VPN</text>
    <text x="363" y="69" font-size="9" text-anchor="middle" fill-opacity=".7">tunnel cifrato su internet</text>
    <rect x="288" y="148" width="150" height="46" rx="8" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.5"/>
    <text x="363" y="167" font-size="11" text-anchor="middle" font-weight="700">Direct Connect</text>
    <text x="363" y="183" font-size="9" text-anchor="middle" fill-opacity=".7">linea privata dedicata</text>
    <g fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#hy-arrow)">
      <path d="M176 100 L286 62"/>
      <path d="M438 60 L542 100"/>
      <path d="M176 126 L286 168"/>
      <path d="M438 172 L542 126"/>
    </g>
    <g font-size="8.5" text-anchor="middle" fill-opacity=".72">
      <text x="363" y="96">economico · rapido · banda variabile</text>
      <text x="363" y="130">privato · costante · costoso · lento da attivare</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">La <strong>VPN</strong> è cifrata ma viaggia su internet, quindi economica e variabile; <strong>Direct Connect</strong> è una linea privata dedicata, costante e più costosa. Per connettere molte VPC e reti on-premise attraverso un hub si usa il <strong>Transit Gateway</strong>.</figcaption>
</figure>

A completare la connettività privata ci sono due servizi visti nel [modulo 03](03-vpc-network-security.md): il **Transit Gateway**, hub che collega molte VPC e reti on-premise con instradamento transitivo, e **AWS PrivateLink** (gli interface endpoint), che espone servizi in modo privato senza passare da internet.

## Exam lens

- *mettere in cache contenuti vicino agli utenti e alleggerire l'origine*: **CloudFront**.
- *accelerare traffico non-HTTP (TCP/UDP) a livello globale, con IP statici*: **Global Accelerator** (non fa cache).
- *mandare gli utenti alla Region a latenza minore*: **Route 53** con la policy **latency**.
- *failover DNS attivo-passivo verso un'altra Region*: **Route 53** policy **failover** con health check.
- *rilascio graduale del traffico fra due versioni*: **Route 53** policy **weighted**.
- *collegare l'on-premise ad AWS in modo cifrato, rapido ed economico*: **Site-to-Site VPN**.
- *collegamento privato, costante e ad alta banda verso l'on-premise*: **Direct Connect**.
- *collegare molte VPC e l'on-premise attraverso un hub*: **Transit Gateway**.
- La trappola tipica: CloudFront **mette in cache** (HTTP), Global Accelerator **no** (accelera la rete). VPN è internet+cifrato+economico, Direct Connect è privato+costante+costoso.

## Ripasso lampo

<details>
<summary>Qual è la differenza fra CloudFront e Global Accelerator?</summary>

**CloudFront** è una CDN di **livello 7**: mette in **cache** contenuti HTTP negli edge e li serve dal punto più vicino, alleggerendo l'origine. **Global Accelerator** è di **livello 4**: **non fa cache**, ma instrada il traffico (anche TCP/UDP) sulla dorsale privata di AWS verso l'endpoint sano più vicino, con IP anycast statici. Uno mette in cache i contenuti, l'altro accelera la rete.

</details>

<details>
<summary>Quale routing policy di Route 53 manda gli utenti alla Region più veloce per loro?</summary>

La policy **latency**: instrada ciascun utente verso la Region che gli offre la latenza minore, quando la stessa applicazione è distribuita su più Region. Per il failover attivo-passivo si usa invece la policy **failover** con gli health check.

</details>

<details>
<summary>Quando si sceglie una Site-to-Site VPN e quando Direct Connect?</summary>

La **VPN** quando serve un collegamento **cifrato, rapido da attivare ed economico**, accettando che passi per internet con banda e latenza variabili. **Direct Connect** quando servono prestazioni **costanti** e alta banda su una **linea privata dedicata**, accettando costo e tempi di installazione maggiori.

</details>

<details>
<summary>CloudFront riduce anche il carico sull'origine, non solo la latenza?</summary>

Sì. Poiché la maggior parte delle richieste è servita dalla **cache** all'edge, l'origine riceve solo le *miss*: meno richieste da gestire. CloudFront riduce quindi sia la latenza per l'utente sia il carico (e spesso il costo) dell'origine.

</details>

<details>
<summary>Come si collegano molte VPC e reti on-premise senza un intrico di collegamenti?</summary>

Con un **Transit Gateway**, un hub centrale a cui si agganciano VPC e connessioni on-premise (VPN o Direct Connect) con instradamento **transitivo**. Sostituisce la rete a maglia dei peering uno-a-uno quando i collegamenti diventano molti.

</details>

**In sintesi:** l'edge avvicina il traffico agli utenti (CloudFront mette in cache i contenuti HTTP, Global Accelerator accelera la rete a livello 4 con IP statici, Route 53 instrada per latenza, peso, geografia o failover); la connettività ibrida collega l'on-premise ad AWS con la VPN (cifrata, economica, variabile) o Direct Connect (privata, costante, costosa), mentre Transit Gateway e PrivateLink completano il collegamento privato.

## Fonti

- [What is Amazon CloudFront?](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html) - verificato 2026-09-04
- [What is AWS Global Accelerator?](https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html) - verificato 2026-09-04
- [Choosing a Route 53 routing policy](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html) - verificato 2026-09-04
- [What is AWS Site-to-Site VPN?](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html) - verificato 2026-09-04
- [What is AWS Direct Connect?](https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html) - verificato 2026-09-04
- [What is a transit gateway?](https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html) - verificato 2026-09-04
