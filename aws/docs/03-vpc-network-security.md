# 03 · Amazon VPC e network security

Una **Amazon Virtual Private Cloud (VPC)** è una **rete privata e isolata** che si ritaglia dentro AWS: si sceglie l'intervallo di indirizzi IP, si divide la rete in sottoreti, si decide cosa può uscire su internet e cosa resta interno. È il luogo dove vivono le risorse (istanze, database, load balancer) e il primo perimetro di sicurezza di un'architettura. Progettare bene la rete significa decidere *chi raggiunge cosa*, ed è il cuore della protezione dei workload nel Domain 1.

> [!info|label:SAA-C03 · D1T2, base D3T4 e D4T4]
> Il modulo copre *Design secure workloads and applications* per la parte di rete: VPC, subnet, routing, gateway, security group, network ACL, VPC endpoint e connettività fra reti. È anche la base per le scelte di prestazioni (D3T4) e di costo (D4T4) del networking.

## La VPC e il suo indirizzamento

Una VPC è **regionale**: si estende su tutte le Availability Zone di una Region, ma non le attraversa. Alla creazione le si assegna un blocco di indirizzi privati in notazione **CIDR**, per esempio `10.0.0.0/16`, che definisce lo spazio da cui pescare gli indirizzi di tutto ciò che vi si colloca. Il `/16` indica quanti bit dell'indirizzo sono fissi: più piccolo è il numero, più grande è la rete (`/16` sono 65.536 indirizzi). La scelta del CIDR non è neutra, perché due reti che dovranno parlarsi non possono avere intervalli sovrapposti.

Ogni account nasce con una **default VPC** già pronta all'uso, comoda per iniziare ma non pensata per architetture curate: in produzione si costruisce una VPC su misura, con subnet e instradamenti decisi apposta.

## Subnet: pubbliche e private

Una **subnet** (sottorete) è una porzione del CIDR della VPC e, a differenza della VPC, vive in **una singola Availability Zone**. È l'unità con cui si distribuisce un'applicazione su più zone per tollerarne il guasto: si crea la stessa subnet in AZ diverse e vi si replicano le risorse.

La distinzione più importante è fra subnet **pubblica** e **privata**, e non dipende da un interruttore ma dall'**instradamento**: una subnet è pubblica se la sua route table ha una rotta verso un **Internet Gateway**, privata se non ce l'ha. In una subnet pubblica si mettono i componenti che devono essere raggiungibili da internet (un load balancer, un bastion host); in una privata i componenti che non devono esporsi (i server applicativi, i database), che al più raggiungono internet in uscita passando per un NAT.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 330" role="img" aria-label="Topologia di una VPC: un Internet Gateway collega la VPC a internet; una subnet pubblica contiene un NAT Gateway ed è raggiungibile da internet; una subnet privata ospita le istanze applicative e raggiunge internet solo in uscita attraverso il NAT." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="vpc-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="300" y="12" width="120" height="34" rx="17" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6"/>
    <text x="360" y="34" font-size="12" text-anchor="middle">Internet</text>
    <rect x="40" y="86" width="640" height="228" rx="12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-dasharray="9 6"/>
    <text x="56" y="108" font-size="12" font-weight="700">VPC · 10.0.0.0/16</text>
    <rect x="322" y="70" width="76" height="32" rx="7" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6"/>
    <text x="360" y="91" font-size="11" text-anchor="middle">IGW</text>
    <rect x="70" y="122" width="580" height="80" rx="9" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.4"/>
    <text x="86" y="142" font-size="11" fill-opacity=".8">subnet pubblica · 10.0.1.0/24</text>
    <rect x="470" y="150" width="160" height="40" rx="7" fill="var(--link,#9a4d00)" fill-opacity=".16" stroke="var(--link,#9a4d00)" stroke-width="1.4"/>
    <text x="550" y="174" font-size="11" text-anchor="middle">NAT Gateway</text>
    <rect x="70" y="220" width="580" height="80" rx="9" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.4"/>
    <text x="86" y="240" font-size="11" fill-opacity=".8">subnet privata · 10.0.2.0/24</text>
    <rect x="90" y="250" width="150" height="40" rx="7" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.4"/>
    <text x="165" y="274" font-size="11" text-anchor="middle">EC2 · app</text>
    <g fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#vpc-arrow)">
      <path d="M360 46 L360 68"/>
      <path d="M348 70 L348 48"/>
      <path d="M550 150 L392 102"/>
      <path d="M240 268 L462 180"/>
    </g>
    <text x="600" y="128" font-size="9" fill-opacity=".7" text-anchor="middle">outbound</text>
    <text x="330" y="212" font-size="9" fill-opacity=".7" text-anchor="middle">solo in uscita</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">La subnet pubblica ha una rotta verso l'<strong>Internet Gateway</strong>; la privata no, e per uscire su internet passa dal <strong>NAT Gateway</strong> collocato nella pubblica. In un'architettura resiliente questo schema si ripete su almeno due AZ.</figcaption>
</figure>

## Instradamento: route table, Internet Gateway e NAT Gateway

Una **route table** è l'elenco di regole che dice, per ogni destinazione, dove mandare il traffico: una rotta associa un intervallo di indirizzi (per esempio `0.0.0.0/0`, «ovunque») a un **target** (un gateway, un'interfaccia). Ogni subnet è associata a una route table, ed è quella tabella a renderla pubblica o privata.

L'**Internet Gateway (IGW)** è il componente che collega la VPC a internet. È **gratuito**, orizzontalmente scalabile e ridondato da AWS; perché una risorsa comunichi con internet servono però tre cose insieme: una rotta `0.0.0.0/0` verso l'IGW, un indirizzo IP pubblico sulla risorsa e regole di sicurezza che lo consentano.

Il **NAT Gateway** risolve il bisogno opposto: permettere alle risorse di una subnet **privata** di raggiungere internet **solo in uscita** (per scaricare aggiornamenti, chiamare un'API esterna) senza diventare raggiungibili dall'esterno. Vive in una subnet pubblica e le risorse private lo indicano come target della loro rotta verso internet. A differenza dell'IGW, il NAT Gateway è un servizio **a pagamento** (una tariffa oraria più il traffico elaborato), quindi conta nelle domande di costo. *(La tariffa va verificata sul pricing ufficiale al momento dell'uso.)*

## Security group e network ACL

Dentro la VPC, due controlli filtrano il traffico a livelli diversi, e l'esame ne verifica di continuo la differenza. Un **security group** è un firewall **stateful** attaccato alla **risorsa** (all'interfaccia di rete di un'istanza): contiene **solo regole allow** e, poiché è stateful, se una richiesta in ingresso è consentita, la **risposta è automaticamente permessa** senza una regola in uscita dedicata. Una **network ACL (NACL)** è invece un firewall **stateless** che agisce a livello di **subnet**: valuta ogni pacchetto per conto suo, ammette regole di **allow e di deny** ordinate per numero, e proprio perché stateless **non ricorda** le connessioni. Ne segue il tranello classico: se una NACL consente il traffico in ingresso su una porta, la risposta in uscita **non** è automatica e va abilitata a mano aprendo le **porte effimere** (l'intervallo alto, tipicamente `1024-65535`) in uscita, altrimenti la risposta viene scartata.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 250" role="img" aria-label="Confronto fra security group e network ACL: il security group è stateful, consente la risposta automaticamente; la network ACL è stateless e richiede una regola esplicita in uscita sulle porte effimere per lasciar passare la risposta." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="sg-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="20" y="40" width="330" height="190" rx="11" fill="none" stroke="currentColor" stroke-width="1.6"/>
    <rect x="370" y="40" width="330" height="190" rx="11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="7 5"/>
    <text x="185" y="64" font-size="12.5" text-anchor="middle" font-weight="700">Security group · stateful</text>
    <text x="535" y="64" font-size="12.5" text-anchor="middle" font-weight="700">Network ACL · stateless</text>
    <text x="185" y="82" font-size="9.5" text-anchor="middle" fill-opacity=".7">a livello di risorsa (ENI)</text>
    <text x="535" y="82" font-size="9.5" text-anchor="middle" fill-opacity=".7">a livello di subnet</text>
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.5">
      <rect x="150" y="110" width="120" height="90" rx="8"/>
      <rect x="500" y="110" width="120" height="90" rx="8"/>
    </g>
    <text x="210" y="160" font-size="11" text-anchor="middle">risorsa</text>
    <text x="560" y="160" font-size="11" text-anchor="middle">subnet</text>
    <g fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#sg-arrow)">
      <path d="M40 130 L148 130"/>
      <path d="M270 180 L42 180"/>
      <path d="M390 130 L498 130"/>
      <path d="M620 180 L392 180"/>
    </g>
    <g text-anchor="middle" font-size="9">
      <text x="95" y="123">inbound: allow 443</text>
      <text x="150" y="196" fill-opacity=".75">risposta: automatica</text>
      <text x="445" y="123">inbound: allow 443</text>
      <text x="505" y="196" fill-opacity=".75">risposta: serve allow</text>
      <text x="505" y="212" fill-opacity=".75">porte effimere in uscita</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Con il security group basta la regola in ingresso: la risposta torna da sé. Con la network ACL, stateless, la risposta esce solo se una regola in uscita apre le porte effimere. Nella pratica il security group è il controllo primario, la NACL uno strato aggiuntivo a livello di subnet.</figcaption>
</figure>

Il confronto, riga per riga:

| | Security group | Network ACL |
|---|---|---|
| stato | **stateful** (ricorda la connessione) | **stateless** (ogni pacchetto a sé) |
| livello | risorsa / interfaccia di rete | subnet |
| regole | solo **allow** | **allow** e **deny**, ordinate per numero |
| risposta | consentita in automatico | richiede una regola esplicita (porte effimere) |
| uso tipico | controllo primario | strato aggiuntivo, deny mirati a livello di subnet |

## Raggiungere i servizi AWS in privato: i VPC endpoint

Molti servizi AWS (S3, DynamoDB, le API di gestione) vivono **fuori** dalla VPC. Per raggiungerli, una risorsa in una subnet privata dovrebbe passare da un NAT verso internet, con costo e superficie d'attacco aggiuntivi. Un **VPC endpoint** evita questo giro tenendo il traffico **dentro la rete AWS**, senza IGW né NAT. Ne esistono due tipi che l'esame chiede di distinguere:

- un **gateway endpoint** serve **solo S3 e DynamoDB**, si configura come una rotta nella route table ed è **gratuito**;
- un **interface endpoint**, basato su **AWS PrivateLink**, copre **quasi tutti gli altri servizi**, si materializza come un'interfaccia di rete privata nella subnet ed è **a pagamento** (tariffa oraria per AZ più il traffico). *(Verificare il pricing ufficiale al momento dell'uso.)*

La regola pratica che ne deriva, utile anche nelle domande di costo: per S3 e DynamoDB si preferisce sempre il gateway endpoint, gratuito; l'interface endpoint si valuta per gli altri servizi quando serve l'accesso privato.

## Collegare più reti: peering e Transit Gateway

Due VPC che devono comunicare si collegano con un **VPC peering**: un collegamento **uno-a-uno**, che richiede CIDR **non sovrapposti** e **non è transitivo** (se A è in peering con B e B con C, A non raggiunge C). Quando le reti da collegare diventano molte, il peering esplode in un intrico di collegamenti; allora si usa un **Transit Gateway**, un hub centrale a cui si agganciano VPC e reti on-premise, con instradamento **transitivo**. Sono anche leve di prestazioni e costo: il numero di passaggi fra AZ e Region e la scelta del collegamento (peering, Transit Gateway, VPN, Direct Connect) pesano su latenza e fattura.

## Difesa in profondità e osservabilità

La sicurezza di rete su AWS si costruisce **a strati**: la network ACL filtra al confine della subnet, il security group al confine della risorsa, e i due controlli si sommano invece di sostituirsi. A completare il quadro, i **VPC Flow Log** registrano i metadati del traffico (chi ha parlato con chi, accettato o rifiutato), fornendo la visibilità necessaria per diagnosticare e per rispondere «quale guasto o quale accesso» quando qualcosa non torna.

*➕ Oltre il perimetro di base: dal 2024 esiste **VPC Block Public Access**, un interruttore a livello di VPC o account che blocca in blocco il traffico internet, utile come rete di sicurezza contro esposizioni accidentali. Buono da conoscere; il cuore dell'esame resta la coppia security group + network ACL.*

## Exam lens

- *le istanze private devono raggiungere internet in uscita*: **NAT Gateway** (solo outbound), non un Internet Gateway diretto.
- *accesso privato a S3 senza passare da internet*: **gateway endpoint** (gratuito), non un NAT.
- *firewall a livello di istanza, con risposta automatica*: **security group** (stateful).
- *negare un intervallo di IP a un'intera subnet*: **network ACL** (ha le regole di deny; il security group no).
- *collegare due sole VPC in modo privato*: **VPC peering**; *collegarne molte, anche con l'on-premise*: **Transit Gateway**.
- *ridurre il costo del traffico verso S3 da subnet private*: **gateway endpoint** al posto del NAT.
- La trappola ricorrente è chiedere una regola di **deny** su un security group: non esistono, il security group ha solo allow. Il deny mirato lo dà la network ACL.

## Ripasso lampo

<details>
<summary>Che cosa rende una subnet «pubblica»?</summary>

Non un'impostazione dedicata, ma la sua **route table**: una subnet è pubblica se ha una rotta `0.0.0.0/0` verso un **Internet Gateway**. Senza quella rotta è privata, indipendentemente dal nome che le si dà.

</details>

<details>
<summary>Perché con una network ACL bisogna aprire le porte effimere in uscita e con un security group no?</summary>

Perché il security group è **stateful**: ricorda la connessione e lascia tornare la risposta in automatico. La network ACL è **stateless**: valuta ogni pacchetto isolatamente, quindi la risposta in uscita passa solo se una regola esplicita apre l'intervallo di porte effimere (`1024-65535`).

</details>

<details>
<summary>Come raggiunge internet in uscita un'istanza in una subnet privata?</summary>

Attraverso un **NAT Gateway** collocato in una subnet pubblica: la route table della subnet privata manda `0.0.0.0/0` al NAT, che inoltra il traffico verso l'Internet Gateway. La connessione può partire solo dall'interno; dall'esterno l'istanza resta irraggiungibile.

</details>

<details>
<summary>Quando conviene un gateway endpoint e quando un interface endpoint?</summary>

Il **gateway endpoint** serve solo **S3 e DynamoDB** ed è **gratuito**: è la scelta di default per quei due servizi. L'**interface endpoint** (PrivateLink) copre gli **altri** servizi ma è **a pagamento**: si usa quando serve l'accesso privato a un servizio diverso da S3/DynamoDB.

</details>

<details>
<summary>Un security group può contenere una regola di deny?</summary>

No. Un security group ha **solo regole allow**; tutto ciò che non è esplicitamente consentito è implicitamente negato. Per un **deny** esplicito (per esempio bloccare un intervallo di IP) serve una **network ACL**, che ammette regole di deny a livello di subnet.

</details>

**In sintesi:** la VPC è una rete isolata con un CIDR proprio; le subnet vivono in una AZ e sono pubbliche o private a seconda della route table; IGW (gratis) e NAT Gateway (a pagamento, solo outbound) governano l'accesso a internet; security group (stateful, risorsa) e network ACL (stateless, subnet) filtrano a strati; i VPC endpoint tengono privato il traffico verso i servizi AWS; peering e Transit Gateway collegano le reti.

## Fonti

- [What is Amazon VPC?](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html) - verificato 2026-09-04
- [Subnets for your VPC](https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html) - verificato 2026-09-04
- [Security groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) - verificato 2026-09-04
- [Network ACLs](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html) - verificato 2026-09-04
- [NAT gateways](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html) - verificato 2026-09-04
- [Gateway endpoints (S3, DynamoDB)](https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html) - verificato 2026-09-04
- [AWS PrivateLink interface endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/create-interface-endpoint.html) - verificato 2026-09-04
- [Transit Gateway](https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html) - verificato 2026-09-04
