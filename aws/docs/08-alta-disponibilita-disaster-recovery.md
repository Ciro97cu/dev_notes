# 08 · High availability e disaster recovery

Rendere un'architettura resiliente significa rispondere a due domande diverse. La prima è *come non cadere*: assorbire il guasto di un componente o di una zona senza interruzioni percepibili, ed è l'**alta disponibilità**. La seconda è *come rialzarsi*: recuperare dopo un disastro più grande, per esempio la perdita di un'intera Region, ed è il **disaster recovery**, misurato da due obiettivi (RTO e RPO) e realizzato con strategie che scambiano costo per velocità di ripristino. Sono cose distinte, e confonderle è uno degli errori tipici del Domain 2.

> [!info|label:SAA-C03 · D2T2]
> Il modulo copre *Design highly available and/or fault-tolerant architectures* (D2T2): la differenza fra alta disponibilità e disaster recovery, gli obiettivi RTO e RPO, le quattro strategie di DR e gli strumenti (Multi-AZ, Multi-Region, AWS Backup, Route 53) con cui si realizzano.

## Alta disponibilità e disaster recovery non sono la stessa cosa

L'**alta disponibilità (high availability)** è la capacità di un sistema di continuare a funzionare nonostante il guasto di una sua parte, con poco o nessun tempo di inattività. Si ottiene **dentro una Region** eliminando i single point of failure: istanze su più AZ dietro un load balancer, un Auto Scaling group che rimpiazza le istanze perse, un database RDS Multi-AZ che fa failover sullo standby. Il guasto avviene, ma l'utente non se ne accorge.

Il **disaster recovery** è invece il piano per **recuperare** dopo un evento che mette fuori uso l'intero ambiente, tipicamente una Region: si predispongono copie dei dati e la capacità di ricreare il sistema **altrove**. Non promette «nessuna interruzione», ma «ripristino entro obiettivi concordati». Un'architettura può essere altamente disponibile in una Region e, allo stesso tempo, avere un piano di DR verso un'altra Region: i due livelli si sommano.

> [!warning|label:Non confondere disponibilità e durabilità]
> **Disponibilità** è «il dato è raggiungibile adesso»; **durabilità** è «il dato non va perso» (S3 con l'undici-nove è durabilissimo). Un dato può essere durevole ma temporaneamente non disponibile, o disponibile ma poco durevole. L'esame gioca su questa differenza, come su quella fra alta disponibilità (dentro la Region) e disaster recovery (fra Region).

## RTO e RPO

Due obiettivi misurano un piano di disaster recovery, e vanno tenuti separati. Il **Recovery Time Objective (RTO)** è il tempo massimo accettabile di **indisponibilità**: quanto a lungo il servizio può restare giù prima che il danno sia inaccettabile. Il **Recovery Point Objective (RPO)** è la quantità massima accettabile di **dati persi**, misurata come distanza dall'ultimo punto di recupero: quanto lavoro recente ci si può permettere di perdere. L'uno guarda avanti (quanto tempo per tornare su), l'altro guarda indietro (fino a quando i dati sono salvi).

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 200" role="img" aria-label="Su una linea del tempo, l'ultimo backup precede il disastro e il ripristino lo segue: l'intervallo fra ultimo backup e disastro e l'RPO (dati persi), l'intervallo fra disastro e ripristino e l'RTO (tempo di indisponibilita)." style="width:100%;max-width:720px;height:auto;color:inherit">
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <path d="M40 108 L680 108" fill="none" stroke="currentColor" stroke-width="1.6"/>
    <g stroke="currentColor" stroke-width="1.4">
      <path d="M200 96 L200 120"/>
      <path d="M400 88 L400 128"/>
      <path d="M584 96 L584 120"/>
    </g>
    <g text-anchor="middle" font-size="10.5">
      <text x="200" y="138">ultimo backup</text>
      <text x="400" y="146" font-weight="700">DISASTRO</text>
      <text x="584" y="138">servizio ripristinato</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.4">
      <path d="M200 68 L400 68"/><path d="M200 62 L200 74"/><path d="M400 62 L400 74"/>
      <path d="M400 168 L584 168"/><path d="M400 162 L400 174"/><path d="M584 162 L584 174"/>
    </g>
    <g text-anchor="middle" font-size="11">
      <text x="300" y="56" font-weight="700">RPO</text>
      <text x="300" y="86" font-size="9" fill-opacity=".72">dati persi</text>
      <text x="492" y="160" font-weight="700">RTO</text>
      <text x="492" y="188" font-size="9" fill-opacity=".72">indisponibilità</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">L'<strong>RPO</strong> misura all'indietro quanti dati si perdono fra l'ultimo punto di recupero e il disastro; l'<strong>RTO</strong> misura in avanti quanto dura l'indisponibilità fino al ripristino. Obiettivi più stretti costano di più.</figcaption>
</figure>

## Le quattro strategie di disaster recovery

AWS descrive quattro strategie, che formano uno **spettro**: da sinistra a destra RTO e RPO calano, ma costo e complessità salgono. Si sceglie il punto dello spettro che soddisfa gli obiettivi di business al minor costo.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 210" role="img" aria-label="Spettro delle quattro strategie di disaster recovery: da sinistra Backup e Restore (RTO ore-giorni), Pilot Light (RTO ore), Warm Standby (RTO minuti), Multi-Site active-active (RTO secondi); da sinistra a destra il costo cresce e RTO/RPO calano." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="dr-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <text x="360" y="24" font-size="10" text-anchor="middle" fill-opacity=".8">costo e complessità crescenti</text>
    <path d="M40 34 L680 34" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".5" marker-end="url(#dr-arrow)"/>
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.5">
      <rect x="20" y="66" width="160" height="74" rx="9"/>
      <rect x="196" y="66" width="160" height="74" rx="9"/>
      <rect x="372" y="66" width="160" height="74" rx="9"/>
      <rect x="548" y="66" width="152" height="74" rx="9"/>
    </g>
    <g text-anchor="middle">
      <text x="100" y="98" font-size="11.5" font-weight="700">Backup &amp; Restore</text>
      <text x="276" y="98" font-size="11.5" font-weight="700">Pilot Light</text>
      <text x="452" y="98" font-size="11.5" font-weight="700">Warm Standby</text>
      <text x="624" y="92" font-size="11" font-weight="700">Multi-Site</text>
      <text x="624" y="107" font-size="9.5" fill-opacity=".75">active-active</text>
    </g>
    <g text-anchor="middle" font-size="9.5" fill-opacity=".75">
      <text x="100" y="122">RTO ore-giorni</text>
      <text x="276" y="122">RTO ore</text>
      <text x="452" y="122">RTO minuti</text>
      <text x="624" y="124">RTO secondi</text>
    </g>
    <text x="360" y="176" font-size="10" text-anchor="middle" fill-opacity=".8">RTO e RPO sempre più bassi</text>
    <path d="M40 186 L680 186" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".5" marker-end="url(#dr-arrow)"/>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem"><strong>Backup &amp; Restore</strong> ripristina da copie (economico, lento). <strong>Pilot Light</strong> tiene accesi i soli elementi core. <strong>Warm Standby</strong> mantiene un ambiente ridotto sempre attivo. <strong>Multi-Site</strong> serve traffico da più Region insieme (costoso, quasi istantaneo).</figcaption>
</figure>

Nel dettaglio: **Backup & Restore** conserva i dati (per esempio su S3 con AWS Backup) e ricrea l'ambiente solo al bisogno, con RTO nell'ordine delle ore o giorni; è il più economico. **Pilot Light** tiene sempre acceso il nucleo minimo (di solito i dati replicati e le configurazioni), e al disastro accende il resto: RTO in ore. **Warm Standby** mantiene una copia **ridotta ma funzionante** già in esecuzione nella Region di DR, che scala rapidamente al carico pieno: RTO in minuti. **Multi-Site active-active** distribuisce il carico su più Region che servono traffico contemporaneamente: RTO e RPO quasi nulli, ma è il più costoso e complesso.

## Gli strumenti della resilienza

L'alta disponibilità **dentro la Region** si costruisce con i mattoni dei moduli precedenti: load balancer e Auto Scaling su più AZ, **RDS Multi-AZ**, storage intrinsecamente multi-AZ come S3 ed EFS. Il disaster recovery **fra Region** usa la replica: **S3 Cross-Region Replication**, **DynamoDB Global Tables**, **Aurora Global Database**, le **read replica cross-Region** di RDS. A orchestrare backup e ripristino aiutano due servizi in particolare. **AWS Backup** centralizza le copie di più servizi (EBS, RDS, DynamoDB, EFS e altri) con **piani** che definiscono cadenza (l'RPO), retention e passaggio ad archivio, dentro un **vault**. **Amazon Route 53**, con gli **health check** e le politiche di routing di **failover**, dirotta il traffico DNS verso la Region sana quando quella primaria smette di rispondere, ed è spesso il perno di un piano DR automatico.

## Exam lens

- *sopravvivere al guasto di una AZ con interruzione minima*: **Multi-AZ** (load balancer + Auto Scaling, RDS Multi-AZ), non un piano di DR cross-Region.
- *recuperare da un guasto di Region al minor costo, con RTO di ore accettabile*: **Backup & Restore**.
- *RTO in minuti con un ambiente ridotto sempre attivo altrove*: **Warm Standby**.
- *attivo-attivo su più Region, RTO/RPO quasi nulli*: **Multi-Site**.
- *dirottare in automatico il traffico verso un'altra Region al guasto*: **Route 53** con health check e routing di failover.
- *backup centralizzati e regolari su più servizi*: **AWS Backup** con un piano.
- *RPO vicino a zero per un database fra Region*: **Aurora Global Database** o **DynamoDB Global Tables**.
- La trappola ricorrente: scambiare alta disponibilità (dentro la Region) con disaster recovery (fra Region), o durabilità con disponibilità.

## Ripasso lampo

<details>
<summary>Qual è la differenza fra RTO e RPO?</summary>

L'**RTO** è il tempo massimo accettabile di **indisponibilità** (quanto a lungo il servizio può restare giù). L'**RPO** è la quantità massima accettabile di **dati persi**, misurata come distanza dall'ultimo punto di recupero. RTO guarda avanti (tornare su), RPO guarda indietro (fin dove i dati sono salvi).

</details>

<details>
<summary>Alta disponibilità e disaster recovery sono la stessa cosa?</summary>

No. L'**alta disponibilità** assorbe guasti di componenti o AZ **dentro una Region** con interruzione minima (Multi-AZ). Il **disaster recovery** è il piano per **recuperare** dopo un evento che colpisce l'intero ambiente, tipicamente una Region, verso un'altra Region, misurato da RTO e RPO. Si possono avere entrambi.

</details>

<details>
<summary>Quale strategia DR ha il costo più basso e quale l'RTO più basso?</summary>

Il costo più basso è **Backup & Restore** (si ripristina da copie, RTO ore-giorni). L'RTO più basso è **Multi-Site active-active** (più Region servono traffico insieme, RTO/RPO quasi nulli), che è però la più costosa. In mezzo stanno Pilot Light e Warm Standby.

</details>

<details>
<summary>Come si dirotta il traffico verso un'altra Region quando la primaria è giù?</summary>

Con **Amazon Route 53**: un **health check** verifica la salute dell'endpoint primario e una politica di routing di **failover** indirizza il DNS verso la Region secondaria quando la primaria non risponde. È il meccanismo che rende automatico il passaggio in molti piani di DR.

</details>

<details>
<summary>A cosa serve AWS Backup?</summary>

A **centralizzare** i backup di più servizi (EBS, RDS, DynamoDB, EFS e altri) con **piani** che fissano cadenza (l'RPO), retention e archiviazione, in un **vault**. Evita di gestire i backup servizio per servizio e dà un punto unico di governo delle copie.

</details>

**In sintesi:** l'alta disponibilità assorbe i guasti dentro la Region (Multi-AZ), il disaster recovery recupera fra Region ed è misurato da RTO (indisponibilità) e RPO (dati persi); le quattro strategie DR (Backup & Restore, Pilot Light, Warm Standby, Multi-Site) scambiano costo per velocità; gli strumenti sono la replica multi-Region, AWS Backup per le copie e Route 53 per il failover del traffico.

## Fonti

- [Disaster recovery options in the cloud](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html) - verificato 2026-09-04
- [Recovery objectives (RTO and RPO)](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-of-on-premises-applications-to-aws/recovery-objectives.html) - verificato 2026-09-04
- [Reliability Pillar - AWS Well-Architected](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html) - verificato 2026-09-04
- [What is AWS Backup?](https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html) - verificato 2026-09-04
- [Amazon Route 53 DNS failover](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover.html) - verificato 2026-09-04
