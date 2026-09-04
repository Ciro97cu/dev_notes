# 01 · Cloud, Region e account

Il cloud computing permette di ottenere capacità informatica quando serve, attraverso una rete, senza acquistare in anticipo tutti i server che potrebbero essere necessari. AWS trasforma questa idea in servizi: compute, storage, database, rete e sicurezza diventano risorse configurabili tramite Console, API o Infrastructure as Code.

> [!info|label:SAA-C03 · D1T1, D2T2, base trasversale]
> Il modulo introduce global infrastructure, Shared Responsibility Model, account e identità: concetti richiamati direttamente dal blueprint e necessari per ragionare su sicurezza, disponibilità e costo.

## Dal data center alla risorsa on demand

In un data center tradizionale la capacità viene acquistata prima di conoscere con precisione il carico futuro. Se la stima è alta, parte dell'hardware resta inutilizzata; se è bassa, l'applicazione esaurisce capacità proprio quando la domanda cresce. Il cloud non elimina la pianificazione, ma consente di sostituire una parte dell'investimento anticipato con risorse create e rimosse a richiesta.

La caratteristica decisiva non è che il server si trovi "su Internet". È il modello operativo: provisioning tramite API, capacità elastica, misurazione dell'uso e servizi managed che spostano parte del lavoro operativo sul provider. **Managed** significa che AWS assume attività definite, per esempio l'hardware e una parte della manutenzione del servizio; non significa che sicurezza, dati e configurazione diventino automaticamente responsabilità di AWS.

## L'account è il primo confine

Un **AWS account** è il contenitore amministrativo nel quale vengono create identità e risorse e al quale vengono attribuiti utilizzo e costi. Il numero a dodici cifre chiamato **account ID** identifica questo contenitore; non è una password, ma non serve pubblicarlo negli esempi o negli screenshot.

Alla creazione dell'account nasce il **root user**, identificato dall'email usata nella registrazione. Il root user possiede accesso completo e può eseguire operazioni che nessun'altra identità può compiere. Proprio per questo non è l'utente con cui studiare ogni giorno: va protetto con MFA, non deve avere access key e si usa soltanto per i task che richiedono esplicitamente credenziali root.

**Authentication** risponde alla domanda "chi sta effettuando l'accesso?"; **authorization** stabilisce "quali azioni può compiere su quali risorse?". La password e l'MFA partecipano all'autenticazione, mentre le IAM policy partecipano all'autorizzazione.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 760 245" role="img" aria-label="Confini concentrici: account AWS, identità IAM, Region eu-west-1 e risorse nelle Availability Zone" style="width:100%;max-width:760px;height:auto;color:inherit">
  <g fill="var(--bg,#fff)" stroke="currentColor">
    <rect x="22" y="20" width="716" height="205" rx="14" stroke-width="2" stroke-dasharray="8 6"/>
    <rect x="205" y="52" width="505" height="145" rx="12" stroke-width="1.7"/>
    <rect x="232" y="91" width="137" height="78" rx="9" stroke-width="1.4"/>
    <rect x="389" y="91" width="137" height="78" rx="9" stroke-width="1.4"/>
    <rect x="546" y="91" width="137" height="78" rx="9" stroke-width="1.4"/>
  </g>
  <g fill="var(--link,#9a4d00)">
    <circle cx="83" cy="104" r="21"/>
    <circle cx="144" cy="151" r="21" opacity=".72"/>
    <rect x="272" y="119" width="58" height="26" rx="4"/>
    <rect x="429" y="119" width="58" height="26" rx="4"/>
    <rect x="586" y="119" width="58" height="26" rx="4"/>
  </g>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif">
    <text x="42" y="47" font-size="13" font-weight="700">AWS account</text>
    <text x="65" y="109" font-size="11" fill="var(--bg,#fff)">root</text>
    <text x="126" y="155" font-size="11" fill="var(--bg,#fff)">IAM</text>
    <text x="221" y="78" font-size="13" font-weight="700">Region eu-west-1</text>
    <g font-size="11" text-anchor="middle">
      <text x="300" y="109">Availability Zone</text>
      <text x="457" y="109">Availability Zone</text>
      <text x="614" y="109">Availability Zone</text>
      <text x="300" y="138" fill="var(--bg,#fff)">resource</text>
      <text x="457" y="138" fill="var(--bg,#fff)">resource</text>
      <text x="614" y="138" fill="var(--bg,#fff)">resource</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">L'account contiene identità e risorse. Le identità sono globali nel caso di IAM, mentre molte risorse appartengono a una Region o persino a una singola Availability Zone.</figcaption>
</figure>

## Region, Availability Zone ed edge

Una **AWS Region** è un'area geografica nella quale AWS raggruppa più Availability Zone. La Region scelta influenza latenza, requisiti di residenza dei dati, disponibilità dei servizi e prezzo. Nei laboratori si usa `eu-west-1`, la Region Europe (Ireland), salvo eccezioni motivate.

Una **Availability Zone**, abbreviata **AZ**, è un'infrastruttura isolata composta da uno o più data center, con alimentazione e connettività ridondanti. Le AZ della stessa Region sono collegate con reti private ad alta capacità e bassa latenza. Distribuire un'applicazione su più AZ permette di assorbire il guasto di una singola zona; collocare due risorse nella stessa AZ non produce quella separazione.

Una **edge location** porta servizi come content delivery e DNS più vicino agli utenti. Non è una quarta AZ e non ospita genericamente le stesse risorse di una Region: ha un ruolo diverso nella topologia globale.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 760 235" role="img" aria-label="Scope delle risorse AWS: servizi globali, risorse regionali e risorse zonali" style="width:100%;max-width:760px;height:auto;color:inherit">
  <defs>
    <marker id="scope-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path d="M0 0L8 4L0 8Z" fill="currentColor"/>
    </marker>
  </defs>
  <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.7">
    <ellipse cx="118" cy="116" rx="90" ry="68"/>
    <rect x="280" y="48" width="196" height="136" rx="13"/>
    <rect x="570" y="75" width="150" height="82" rx="10"/>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#scope-arrow)">
    <path d="M208 116h64"/>
    <path d="M476 116h86"/>
  </g>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" text-anchor="middle">
    <g font-size="15" font-weight="700">
      <text x="118" y="105">Global</text>
      <text x="378" y="105">Regional</text>
      <text x="645" y="105">Zonal</text>
    </g>
    <g font-size="11" opacity=".7">
      <text x="118" y="129">IAM, account</text>
      <text x="378" y="129">VPC, servizi regionali</text>
      <text x="645" y="129">subnet, EC2, EBS</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Lo scope determina dove cercare una risorsa e quale guasto può coinvolgerla. Il nome del servizio, da solo, non basta: una configurazione può contenere elementi con scope diverso.</figcaption>
</figure>

Quando una risorsa "scompare" dalla Console, il primo controllo consiste quindi nella Region selezionata. IAM e le impostazioni dell'account sono invece globali: cambiare il selettore di Region non crea un secondo utente IAM.

## Shared Responsibility Model

Il **Shared Responsibility Model** divide la sicurezza fra AWS e il cliente. AWS protegge la **security of the cloud**, cioè data center, hardware, rete globale e strato di virtualizzazione. Il cliente protegge la **security in the cloud**, cioè identità, dati, configurazioni e tutto ciò che il servizio gli lascia amministrare.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 760 285" role="img" aria-label="Shared Responsibility Model: il cliente gestisce dati, identità e configurazione; AWS gestisce infrastruttura fisica, rete e virtualizzazione" style="width:100%;max-width:760px;height:auto;color:inherit">
  <g font-family="system-ui,Arial,sans-serif">
    <rect x="60" y="35" width="640" height="102" rx="12" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.7"/>
    <rect x="60" y="148" width="640" height="102" rx="12" fill="var(--link,#9a4d00)" opacity=".16" stroke="var(--link,#9a4d00)" stroke-width="1.7"/>
    <path d="M380 35v102M380 148v102" stroke="currentColor" stroke-width="1.2" opacity=".35"/>
    <g fill="currentColor">
      <text x="84" y="66" font-size="15" font-weight="700">Cliente · security in the cloud</text>
      <text x="84" y="94" font-size="12">Dati e classificazione</text>
      <text x="84" y="116" font-size="12">Identità e autorizzazioni</text>
      <text x="405" y="94" font-size="12">Configurazione di rete</text>
      <text x="405" y="116" font-size="12">OS e applicazione, se gestiti</text>
      <text x="84" y="179" font-size="15" font-weight="700">AWS · security of the cloud</text>
      <text x="84" y="207" font-size="12">Data center e hardware</text>
      <text x="84" y="229" font-size="12">Rete globale</text>
      <text x="405" y="207" font-size="12">Hypervisor</text>
      <text x="405" y="229" font-size="12">Infrastruttura dei servizi</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Il confine non elimina le zone condivise: AWS rende sicura l'infrastruttura del servizio, mentre il cliente deve configurare correttamente ciò che controlla.</figcaption>
</figure>

Il confine cambia con il livello di gestione. Su Amazon EC2 il cliente sceglie e aggiorna il sistema operativo guest; con un servizio serverless non amministra alcun guest OS. In entrambi i casi resta responsabile dei dati, delle autorizzazioni e della configurazione applicativa. Dire "è managed" non basta quindi per concludere "la sicurezza è responsabilità di AWS".

## Least privilege e accesso quotidiano

Il **principle of least privilege** assegna soltanto le autorizzazioni necessarie per il compito e per il tempo necessario. È una direzione, non uno stato ottenuto una volta per tutte: durante il bootstrap può servire un amministratore, ma le identità dei workload e dei laboratori successivi devono ricevere policy più ristrette.

AWS raccomanda credenziali temporanee per persone e workload. In un ambiente multi-account il percorso standard usa AWS Organizations e IAM Identity Center. Il Free Plan presenta però un vincolo concreto: entrare in Organizations provoca l'upgrade automatico al Paid Plan, mentre un'istanza IAM Identity Center di tipo *account* non supporta permission set né accesso all'account.

Il [LAB 01](../labs/01-bootstrap-account.md) adotta perciò un passaggio transitorio e dichiarato: un IAM user amministrativo con password Console, MFA e **nessuna access key**. Serve a smettere subito di usare il root user senza forzare l'upgrade. Il modulo IAM successivo introdurrà ruoli, credenziali temporanee e la migrazione a IAM Identity Center quando il piano dell'account lo consentirà.

## Free Plan, crediti e budget

Per i nuovi clienti AWS offre **100 USD di crediti iniziali** e consente di guadagnarne fino ad altri 100 completando attività mostrate nella Console. Nel Free Plan non vengono addebitati costi: il piano termina dopo sei mesi o all'esaurimento dei crediti, a seconda di quale evento avvenga prima. Alla scadenza l'account viene chiuso; AWS conserva il contenuto per 90 giorni, durante i quali è possibile passare al Paid Plan e riaprire l'account.

> [!warning]
> Il Free Plan non equivale al vecchio elenco informale di servizi "sempre gratis". Ha durata, crediti e servizi eleggibili propri. Inoltre l'adesione ad AWS Organizations, la configurazione di Control Tower e alcune altre operazioni provocano l'upgrade automatico al Paid Plan. Verificare sempre la pagina **Plan** nella Billing and Cost Management console. *(verificato: 2026-09-04)*

AWS Budgets aggiunge notifiche su costo e utilizzo, ma una notifica **non è un hard cap**. I dati vengono aggiornati fino a tre volte al giorno, tipicamente ogni 8-12 ore, e altri costi possono maturare prima dell'avviso. Un budget resta indispensabile per osservare il consumo e preparare l'eventuale passaggio al Paid Plan, ma non autorizza a lasciare risorse accese.

## Well-Architected e Domain d'esame

AWS Well-Architected Framework organizza la revisione di un workload in sei Pillar:

| Pillar | Domanda essenziale |
|---|---|
| Operational Excellence | Come si esegue e si migliora il workload? |
| Security | Come si proteggono identità, sistemi e dati? |
| Reliability | Come si recupera dai guasti e si soddisfa la domanda? |
| Performance Efficiency | Come si usano le risorse in modo efficiente al variare dei requisiti? |
| Cost Optimization | Come si evita spesa inutile mantenendo il risultato richiesto? |
| Sustainability | Come si riduce l'impatto ambientale del workload? |

I quattro Domain SAA-C03 non coincidono uno a uno con i sei Pillar. Per esempio, Operational Excellence e Sustainability non hanno un Domain omonimo, ma influenzano comunque decisioni su automazione, servizi managed e uso efficiente delle risorse.

## Exam lens

Si consideri una società con utenti europei, dati soggetti a vincoli di residenza e requisito di tollerare il guasto di un singolo data center. La scelta non consiste nel trovare "la Region migliore" in assoluto:

1. una Region europea risponde al vincolo geografico e deve offrire i servizi richiesti;
2. almeno due AZ rispondono al failure domain dichiarato;
3. edge location e CDN possono ridurre la latenza di distribuzione, ma non sostituiscono la replica del workload fra AZ;
4. una seconda Region sarebbe giustificata soltanto da requisiti di disaster recovery, sovranità, latenza globale o continuità più ampi, perché introduce costo e complessità.

La risposta corretta nasce quindi dal requisito più restrittivo, non dal maggior numero di componenti.

## Ripasso lampo

<details>
<summary>Qual è la differenza fra una Region e una Availability Zone?</summary>

La Region è un'area geografica che contiene più Availability Zone. Una AZ è un failure domain isolato formato da uno o più data center. Più AZ nella stessa Region permettono high availability regionale senza equivalere a un'architettura Multi-Region.

</details>

<details>
<summary>Cambiare Region nella Console crea un secondo IAM user?</summary>

No. IAM è un servizio globale; l'identità resta la stessa. Il selettore di Region cambia invece il contesto nel quale vengono elencate o create molte risorse regionali e zonali.

</details>

<details>
<summary>In un servizio managed il cliente smette di essere responsabile della sicurezza?</summary>

No. AWS assume più attività infrastrutturali, ma il cliente resta responsabile almeno di dati, identità, autorizzazioni e configurazioni che controlla. Il confine preciso dipende dal servizio.

</details>

<details>
<summary>Un alert di AWS Budgets impedisce di superare la soglia?</summary>

No. È una notifica basata su dati di billing aggiornati con ritardo. Eventuali budget action vanno configurate esplicitamente e non trasformano la fatturazione in un limite istantaneo universale.

</details>

<details>
<summary>Perché il laboratorio iniziale non abilita subito AWS Organizations?</summary>

Perché nel Free Plan l'adesione a Organizations provoca l'upgrade automatico al Paid Plan. Il laboratorio protegge prima il root user e usa un amministratore IAM senza access key come soluzione transitoria; IAM Identity Center verrà adottato consapevolmente dopo l'upgrade.

</details>

**In sintesi:** l'account è il primo confine amministrativo; Region e AZ descrivono failure domain diversi; lo scope può essere global, Regional o zonal; Shared Responsibility cambia con il servizio ma non scompare; Free Plan, budget e least privilege sono controlli distinti.

## Fonti

- [AWS Global Infrastructure](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/) - verificato 2026-09-04
- [AWS Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/) - verificato 2026-09-04
- [Root user best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html) - verificato 2026-09-04
- [Plan access to your AWS account](https://docs.aws.amazon.com/IAM/latest/UserGuide/gs-identities.html) - verificato 2026-09-04
- [Account instances of IAM Identity Center](https://docs.aws.amazon.com/singlesignon/latest/userguide/account-instances-identity-center.html) - verificato 2026-09-04
- [Choosing a plan](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html) - verificato 2026-09-04
- [Managing your costs with AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html) - verificato 2026-09-04
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html) - verificato 2026-09-04
