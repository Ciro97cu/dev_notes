# 05 · Storage: S3, EBS, EFS e ciclo di vita dei dati

Lo storage su AWS non è un servizio solo, ma **tre forme diverse** di conservare i dati, ciascuna adatta a un uso preciso: lo storage a **oggetti**, quello a **blocchi** e quello a **file**. Scegliere la forma giusta, e per gli oggetti anche la classe giusta, è ciò che decide prestazioni e costo di un'architettura: è il centro dei task su storage ad alte prestazioni (D3T1) e a costo ottimizzato (D4T1).

> [!info|label:SAA-C03 · D3T1 e D4T1, base D1T3 e D2T2]
> Il modulo copre *Determine high-performing and/or scalable storage solutions* (D3T1) e *Design cost-optimized storage solutions* (D4T1): Amazon S3 con le sue classi e il lifecycle, Amazon EBS, Amazon EFS. Tocca anche la protezione dei dati a riposo (D1T3) e la durabilità (D2T2).

## Tre forme di storage: object, block, file

La differenza non è di qualità ma di **modello di accesso**. Lo storage a **oggetti** (Amazon S3) conserva ogni file come un *oggetto* opaco identificato da una chiave, con i suoi metadati, in un contenitore chiamato bucket; ci si accede via API su HTTP, la capacità è virtualmente illimitata ed è **regionale**. Lo storage a **blocchi** (Amazon EBS) espone un disco grezzo che il sistema operativo formatta e monta come farebbe con un disco locale: è legato a **una singola istanza** e vive in **una sola Availability Zone**. Lo storage a **file** (Amazon EFS) offre un file system di rete condiviso che **molte istanze** possono montare insieme, ed è **regionale**, quindi distribuito su più AZ.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 240" role="img" aria-label="Tre forme di storage: object (Amazon S3), un bucket regionale illimitato a cui si accede via API; block (Amazon EBS), un volume disco legato a una singola istanza in una AZ; file (Amazon EFS), un file system condiviso che più istanze montano attraverso più AZ." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="st-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="16" y="40" width="220" height="184" rx="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="250" y="40" width="210" height="184" rx="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="474" y="40" width="230" height="184" rx="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <g text-anchor="middle" font-weight="700" font-size="12.5">
      <text x="126" y="64">Object · S3</text>
      <text x="355" y="64">Block · EBS</text>
      <text x="589" y="64">File · EFS</text>
    </g>
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.4">
      <rect x="56" y="92" width="140" height="70" rx="8"/>
      <rect x="300" y="86" width="110" height="44" rx="7"/>
      <rect x="318" y="146" width="74" height="40" rx="6"/>
      <rect x="496" y="80" width="86" height="38" rx="6"/>
      <rect x="596" y="80" width="86" height="38" rx="6"/>
      <rect x="524" y="156" width="150" height="42" rx="7"/>
    </g>
    <g text-anchor="middle" font-size="11">
      <text x="126" y="132">bucket · oggetti</text>
      <text x="355" y="112">EC2</text>
      <text x="355" y="170">EBS</text>
      <text x="539" y="104">EC2</text>
      <text x="639" y="104">EC2</text>
      <text x="599" y="181">EFS</text>
    </g>
    <g text-anchor="middle" font-size="9" fill-opacity=".7">
      <text x="126" y="192">regionale · API · illimitato</text>
      <text x="355" y="208">1 AZ · 1 istanza</text>
      <text x="589" y="212">multi-AZ · condiviso (NFS)</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.4">
      <path d="M355 130v16"/>
      <path d="M539 118 L560 154" marker-end="url(#st-arrow)"/>
      <path d="M639 118 L620 154" marker-end="url(#st-arrow)"/>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">L'EBS è un disco di <strong>una</strong> istanza in <strong>una</strong> AZ; l'EFS è un file system <strong>condiviso</strong> da molte istanze su più AZ; l'S3 è un magazzino di oggetti regionale e illimitato, raggiungibile via API.</figcaption>
</figure>

## Amazon S3: lo storage a oggetti

**Amazon S3 (Simple Storage Service)** conserva oggetti dentro **bucket**, con capacità virtualmente illimitata e una **durabilità dell'undici-nove** (99,999999999%): S3 replica ogni oggetto su **almeno tre Availability Zone**, così la perdita di una zona non intacca i dati. È la casa di file statici, backup, log, data lake e artefatti di build.

### Le classi di storage

Non tutti gli oggetti si accedono con la stessa frequenza, e S3 offre **classi** diverse per pagare in proporzione all'uso reale. Tutte condividono l'undici-nove di durabilità; cambiano la disponibilità, il tempo di recupero e il costo.

| Classe | Accesso previsto | Note |
|---|---|---|
| **S3 Standard** | frequente | il default, massima disponibilità |
| **S3 Intelligent-Tiering** | **imprevedibile** | sposta gli oggetti fra livelli in automatico, senza costi di recupero |
| **S3 Standard-IA** | poco frequente | costo di storage più basso, ma si paga il recupero |
| **S3 One Zone-IA** | poco frequente, ricreabile | come Standard-IA ma su **una sola AZ**: più economico, meno resiliente |
| **S3 Glacier Instant Retrieval** | archivio con accesso immediato | recupero in millisecondi |
| **S3 Glacier Flexible Retrieval** | archivio raro | recupero da minuti a ore |
| **S3 Glacier Deep Archive** | archivio profondo | il più economico, recupero in ore |

La regola di scelta segue l'access pattern: se è **noto e frequente**, Standard; se è **noto e raro**, una classe IA o Glacier a seconda di quanto in fretta serve recuperare; se è **imprevedibile**, Intelligent-Tiering, che decide da sé. La **One Zone-IA** conviene solo per dati facilmente ricreabili, perché rinuncia alla replica multi-AZ.

### Ciclo di vita, versioni e cifratura

Il valore di un dato cala col tempo, e le **lifecycle rule** automatizzano il risparmio: spostano gli oggetti verso classi via via più economiche dopo un certo numero di giorni, e alla fine li **eliminano**. È il modo con cui S3 diventa a costo ottimizzato senza intervento manuale.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 200" role="img" aria-label="Una lifecycle rule di S3 sposta un oggetto da Standard a Standard-IA dopo 30 giorni, a Glacier Flexible dopo 90 giorni, e lo elimina dopo 365 giorni; procedendo il costo scende e il tempo di recupero aumenta." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="lc-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.5">
      <rect x="16" y="52" width="150" height="56" rx="8"/>
      <rect x="196" y="52" width="150" height="56" rx="8"/>
      <rect x="376" y="52" width="150" height="56" rx="8"/>
    </g>
    <rect x="556" y="52" width="150" height="56" rx="8" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 4"/>
    <g text-anchor="middle" font-size="11.5" font-weight="700">
      <text x="91" y="78">S3 Standard</text>
      <text x="271" y="78">Standard-IA</text>
      <text x="451" y="78">Glacier Flexible</text>
      <text x="631" y="78">scadenza</text>
    </g>
    <g text-anchor="middle" font-size="9" fill-opacity=".65">
      <text x="91" y="94">accesso frequente</text>
      <text x="271" y="94">poco frequente</text>
      <text x="451" y="94">archivio</text>
      <text x="631" y="94">oggetto eliminato</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#lc-arrow)">
      <path d="M166 80 L192 80"/>
      <path d="M346 80 L372 80"/>
      <path d="M526 80 L552 80"/>
    </g>
    <g text-anchor="middle" font-size="9" fill-opacity=".8">
      <text x="179" y="44">30 gg</text>
      <text x="359" y="44">90 gg</text>
      <text x="539" y="44">365 gg</text>
    </g>
    <text x="120" y="150" font-size="10" fill-opacity=".75">costo alto · recupero immediato</text>
    <text x="600" y="150" font-size="10" text-anchor="end" fill-opacity=".75">costo basso · recupero lento</text>
    <path d="M60 166 L660 166" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".4" marker-end="url(#lc-arrow)"/>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Procedendo lungo il ciclo di vita il costo di storage scende e il tempo di recupero cresce. La regola sposta gli oggetti da sé e alla scadenza li elimina.</figcaption>
</figure>

Due controlli completano il quadro. Il **versioning** conserva ogni versione di un oggetto: una sovrascrittura o una cancellazione non distruggono il dato precedente, che resta recuperabile, ottima difesa contro l'errore umano. La **cifratura a riposo** è attiva di default (**SSE-S3**): ogni nuovo oggetto viene cifrato senza che si debba fare nulla; per un controllo più fine sulle chiavi si sceglie **SSE-KMS**. Infine, un bucket è **privato di default**, e il **Block Public Access** impedisce a policy o ACL di esporlo per errore: renderlo pubblico è una decisione esplicita, non un rischio di distrazione.

## Amazon EBS: lo storage a blocchi per EC2

**Amazon EBS (Elastic Block Store)** fornisce volumi disco per le istanze EC2. Un volume vive in **una sola AZ** e si attacca a **una sola istanza** per volta (salvo il Multi-Attach di alcuni tipi, entro la stessa AZ). I tipi si scelgono in base al profilo di I/O:

| Tipo | Tecnologia | Adatto a |
|---|---|---|
| **gp3** | SSD general purpose | il **default**: IOPS e throughput configurabili a parte, buon rapporto prezzo/prestazioni |
| **io2 / io1** | SSD a IOPS provisionati | database esigenti, IOPS elevati e prevedibili |
| **st1** | HDD a throughput | carichi sequenziali, analytics, big data |
| **sc1** | HDD cold | dati freddi, il più economico |

Per proteggere e spostare un volume si usano gli **snapshot**, copie incrementali salvate su S3 (quindi **regionali**): servono da backup, per ricreare un volume in un'altra AZ o per copiarlo in un'altra Region. Anche i volumi EBS si possono cifrare con KMS.

## Amazon EFS: lo storage a file condiviso

**Amazon EFS (Elastic File System)** è un file system **NFS** gestito, **regionale** e **elastico**: cresce e si restringe da solo con i dati, ed è montabile **contemporaneamente da molte istanze** Linux su AZ diverse. È la scelta quando più server devono **condividere** gli stessi file: una cartella di contenuti, un'area di lavoro comune, file caricati da un cluster di web server. Come S3, offre classi meno costose (Standard, IA, Archive) e regole per spostarci i file poco usati. Rispetto a EBS, si paga di più per GB, ma il prezzo include la condivisione e la durabilità multi-AZ.

*➕ Oltre EFS, per esigenze specifiche c'è **Amazon FSx**, che offre file system gestiti di altro tipo: **FSx for Windows File Server** (protocollo SMB), **FSx for Lustre** (calcolo ad alte prestazioni), **NetApp ONTAP** e **OpenZFS**. All'esame basta riconoscere che «file system Windows/SMB» o «HPC» puntano a FSx, non a EFS.*

## Scegliere la forma e la classe

La decisione parte sempre dal modello di accesso, non dal servizio. Se più istanze devono **condividere** file, la risposta è **EFS**; se serve un **disco** per una singola istanza (il volume di avvio, il disco di un database), è **EBS**; se i dati sono **oggetti** da conservare, servire o archiviare in quantità, è **S3**. Scelto S3, la **classe** segue la frequenza d'accesso e la fretta di recupero; scelto EBS, il **tipo** segue IOPS e throughput.

## Exam lens

- *un file system condiviso da molte istanze*: **EFS** (non EBS, che è di una sola istanza).
- *il disco di avvio o di un database di una singola istanza*: **EBS** (gp3 di default, io2 per IOPS elevati).
- *oggetti, backup, data lake, capacità illimitata, undici-nove di durabilità*: **S3**.
- *access pattern imprevedibile, ottimizzazione automatica dei costi*: **S3 Intelligent-Tiering**.
- *archivio a costo minimo, recupero in ore accettabile*: **S3 Glacier Deep Archive**.
- *spostare in automatico verso classi più economiche col tempo*: una **lifecycle rule**.
- *proteggere da sovrascritture o cancellazioni accidentali*: **versioning**.
- *impedire l'esposizione pubblica per errore*: **Block Public Access**.
- Trappola di resilienza: **One Zone-IA** costa meno ma sta in una sola AZ, quindi non va per dati non ricreabili.

## Ripasso lampo

<details>
<summary>Quando si sceglie EFS e quando EBS?</summary>

**EFS** quando più istanze devono **condividere** lo stesso file system, anche su AZ diverse (è NFS, regionale). **EBS** quando serve un disco a blocchi per **una singola** istanza in una AZ (volume di avvio, disco di un database). EBS non è condiviso; EFS sì.

</details>

<details>
<summary>Tutte le classi S3 hanno la stessa durabilità?</summary>

Sì: tutte offrono l'**undici-nove** (99,999999999%) di durabilità. Cambiano la disponibilità, il tempo di recupero e il costo. L'unica con una riserva è **One Zone-IA**, che conserva i dati in **una sola AZ**: la durabilità è la stessa, ma la perdita di quella zona può far perdere i dati.

</details>

<details>
<summary>Come si ottiene automaticamente un costo di storage più basso su S3 nel tempo?</summary>

Con una **lifecycle rule**, che sposta gli oggetti verso classi più economiche (per esempio Standard → Standard-IA → Glacier) dopo un numero di giorni definito, e alla fine li elimina. Se l'access pattern è imprevedibile, **Intelligent-Tiering** fa lo stesso senza regole manuali.

</details>

<details>
<summary>Un oggetto caricato su S3 è cifrato a riposo?</summary>

Sì. La cifratura lato server **SSE-S3** è attiva **di default**: ogni nuovo oggetto viene cifrato senza configurazione. Per gestire le chiavi in modo più granulare (rotazione, permessi, audit) si usa **SSE-KMS**.

</details>

<details>
<summary>A cosa serve uno snapshot EBS e dove vive?</summary>

È una copia **incrementale** di un volume EBS, salvata su **S3** e quindi **regionale**. Serve da backup e permette di ricreare il volume in un'altra Availability Zone o di copiarlo in un'altra Region, superando il vincolo del singolo AZ dei volumi EBS.

</details>

**In sintesi:** lo storage ha tre forme (object S3, block EBS, file EFS) che si scelgono dal modello di accesso; S3 è regionale, illimitato, undici-nove, con classi per frequenza d'accesso, lifecycle per il risparmio, versioning e cifratura di default; EBS è un disco di una singola istanza in una AZ, con tipi per IOPS/throughput e snapshot su S3; EFS è un file system NFS condiviso e multi-AZ.

## Fonti

- [What is Amazon S3?](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html) - verificato 2026-09-04
- [Amazon S3 storage classes](https://aws.amazon.com/s3/storage-classes/) - verificato 2026-09-04
- [Managing the lifecycle of objects](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html) - verificato 2026-09-04
- [Blocking public access to your Amazon S3 storage](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html) - verificato 2026-09-04
- [Amazon EBS volume types](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html) - verificato 2026-09-04
- [Amazon EBS snapshots](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html) - verificato 2026-09-04
- [What is Amazon EFS?](https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html) - verificato 2026-09-04
