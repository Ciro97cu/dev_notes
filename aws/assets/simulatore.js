/*
 * Simulatore d'esame SAA-C03 — quiz client-side, zero-build.
 *
 * Domande ORIGINALI scenario-based (nessun exam dump, nessuna domanda reale
 * trafugata), scritte a partire dai moduli del vault e mappate a Domain/Task.
 * Il risultato è un "punteggio didattico": NON replica né predice lo scaled
 * score AWS (che normalizza forme d'esame di difficoltà diversa).
 *
 * Si monta da sé sulla pagina che contiene <div id="dn-quiz"></div>, tramite il
 * plugin docsify `simulatorePlugin` (registrato in app.js). Nessuna dipendenza,
 * nessuna rete: tutto same-origin.
 */
(function () {
  'use strict';

  // ─────────────────────────── banca domande ───────────────────────────
  // ok:true = risposta corretta. `why` motiva ogni opzione (anche i distrattori).
  var QUESTIONS = [
    { id: 'q1', dom: 'D1', task: 'D1T1', type: 'single',
      q: "Un'applicazione nell'Account A deve leggere oggetti da un bucket S3 nell'Account B. Qual è l'approccio più sicuro e gestibile?",
      opts: [
        { t: "Creare nell'Account B una IAM role con trust policy verso l'Account A, e farla assumere via STS", ok: true, why: "È il pattern cross-account: la role in B autorizza A ad assumerla e concede solo i permessi necessari, con credenziali temporanee." },
        { t: "Creare un IAM user nell'Account B e condividerne le access key con l'Account A", ok: false, why: "Le access key di lunga durata condivise sono un rischio di sicurezza e non seguono il least privilege temporaneo." },
        { t: "Usare le credenziali root dell'Account B", ok: false, why: "Il root non va mai usato per l'accesso quotidiano né condiviso." },
        { t: "Rendere pubblico il bucket dell'Account B", ok: false, why: "Esporrebbe i dati a chiunque: viola la sicurezza e non limita l'accesso all'Account A." }
      ],
      exp: "L'accesso cross-account si realizza con una IAM role (o una resource-based policy) che nomina il principal esterno, mai con chiavi condivise o accesso pubblico." },

    { id: 'q2', dom: 'D1', task: 'D1T1', type: 'single',
      q: "In un'organizzazione multi-account, si vuole impedire che qualunque account membro possa usare una certa Region, anche se un amministratore locale concedesse il permesso. Cosa si usa?",
      opts: [
        { t: "Una Service Control Policy (SCP) sull'OU o sull'organizzazione", ok: true, why: "La SCP fissa il tetto massimo dei permessi: se esclude un'azione/Region, nessuna policy locale può riabilitarla." },
        { t: "Una IAM policy applicata a ogni utente", ok: false, why: "Una policy per utente non è un limite a livello di organizzazione e può essere aggirata concedendo altrove." },
        { t: "Una permissions boundary sull'account", ok: false, why: "La boundary limita una singola identità, non tutti gli account di un'OU." },
        { t: "Una bucket policy", ok: false, why: "Una resource-based policy vale per una risorsa, non impone un confine sull'intero account." }
      ],
      exp: "Le SCP sono guardrail a livello di Organizations: limitano il massimo, non concedono, e non sono aggirabili dagli amministratori degli account membri." },

    { id: 'q3', dom: 'D1', task: 'D1T1', type: 'single',
      q: "Un'applicazione su un'istanza EC2 deve chiamare le API di AWS. Come le si danno le credenziali nel modo raccomandato?",
      opts: [
        { t: "Assegnando all'istanza una IAM role (instance profile)", ok: true, why: "La role fornisce credenziali temporanee ruotate da AWS, senza chiavi da gestire o custodire." },
        { t: "Scrivendo le access key nello user data", ok: false, why: "Le chiavi statiche nello user data sono di lunga durata e facilmente esposte." },
        { t: "Creando un IAM user per ogni istanza", ok: false, why: "È ingestibile e usa credenziali permanenti al posto di quelle temporanee." },
        { t: "Usando le credenziali root", ok: false, why: "Il root non va usato dalle applicazioni." }
      ],
      exp: "Ai workload si danno IAM role, non access key: credenziali temporanee, nessun segreto da custodire." },

    { id: 'q4', dom: 'D1', task: 'D1T2', type: 'single',
      q: "Le istanze in una subnet privata devono scaricare aggiornamenti da internet, ma non devono essere raggiungibili dall'esterno. Cosa si usa?",
      opts: [
        { t: "Un NAT Gateway in una subnet pubblica", ok: true, why: "Il NAT consente il traffico in uscita dalle subnet private senza renderle raggiungibili dall'esterno." },
        { t: "Un Internet Gateway con un indirizzo IP pubblico sulle istanze", ok: false, why: "Renderebbe le istanze raggiungibili dall'esterno: viola il requisito." },
        { t: "Un gateway endpoint", ok: false, why: "Serve solo per S3 e DynamoDB, non per internet generico." },
        { t: "Un Transit Gateway", ok: false, why: "Collega reti tra loro, non fornisce accesso a internet in uscita." }
      ],
      exp: "Uscita verso internet dalle subnet private, senza ingresso: è il ruolo del NAT Gateway (solo outbound)." },

    { id: 'q5', dom: 'D1', task: 'D1T3', type: 'single',
      q: "I dati su S3 devono essere cifrati a riposo, con controllo sulla rotazione delle chiavi e un audit di chi le usa. Quale opzione di cifratura?",
      opts: [
        { t: "SSE-KMS", ok: true, why: "Usa chiavi gestite in AWS KMS: si controllano permessi, rotazione e si ha l'audit del loro uso via CloudTrail." },
        { t: "SSE-S3", ok: false, why: "Cifra di default ma non dà controllo granulare né audit sulle chiavi." },
        { t: "SSE-C", ok: false, why: "Le chiavi le fornisce e gestisce il client a ogni richiesta: nessun controllo/audit lato AWS." },
        { t: "Nessuna cifratura", ok: false, why: "Non soddisfa il requisito di cifratura a riposo." }
      ],
      exp: "Quando servono controllo, rotazione e audit delle chiavi, la scelta è SSE-KMS." },

    { id: 'q6', dom: 'D2', task: 'D2T1', type: 'single',
      q: "Un servizio riceve picchi di ordini che il backend non riesce ad assorbire in tempo reale. Come si disaccoppiano produttore e consumatore assorbendo i picchi?",
      opts: [
        { t: "Mettendo una coda Amazon SQS fra i due", ok: true, why: "La coda fa da cuscinetto: il produttore invia e prosegue, il consumatore preleva al proprio ritmo, un messaggio alla volta." },
        { t: "Chiamando il backend in modo sincrono con un timeout più lungo", ok: false, why: "Resta accoppiato: un picco o un guasto del backend blocca comunque il produttore." },
        { t: "Aumentando la dimensione dell'istanza del backend", ok: false, why: "Non disaccoppia e non assorbe i picchi in modo elastico." },
        { t: "Usando Amazon SNS come coda", ok: false, why: "SNS è pub/sub push a molti, non una coda da cui un consumatore preleva un lavoro alla volta." }
      ],
      exp: "Per bufferizzare i picchi e disaccoppiare un produttore da un consumatore che elabora un lavoro per volta, la risposta è SQS." },

    { id: 'q7', dom: 'D2', task: 'D2T1', type: 'single',
      q: "Un evento (ordine creato) deve raggiungere contemporaneamente più sistemi indipendenti (fatturazione, magazzino, email). Quale servizio?",
      opts: [
        { t: "Amazon SNS (pub/sub), eventualmente con code SQS iscritte (fan-out)", ok: true, why: "SNS spinge lo stesso messaggio a tutti i sottoscrittori insieme; con SQS iscritte si aggiunge l'affidabilità della coda." },
        { t: "Una singola coda SQS letta da tutti", ok: false, why: "Un messaggio in coda viene preso da un solo consumatore: non raggiunge tutti i sistemi." },
        { t: "Chiamate sincrone a catena da un sistema all'altro", ok: false, why: "Accoppia i sistemi: il guasto di uno blocca gli altri." },
        { t: "Un gateway endpoint", ok: false, why: "Non c'entra con la messaggistica: è connettività privata a S3/DynamoDB." }
      ],
      exp: "Per il fan-out di un evento a più destinatari insieme si usa SNS (spesso con SQS a valle)." },

    { id: 'q8', dom: 'D2', task: 'D2T2', type: 'single',
      q: "Un database relazionale gestito deve restare disponibile con failover automatico se l'Availability Zone primaria cade. Cosa si configura?",
      opts: [
        { t: "RDS Multi-AZ", ok: true, why: "Mantiene uno standby sincrono in un'altra AZ e fa failover automatico: è alta disponibilità." },
        { t: "Una Read Replica", ok: false, why: "È asincrona e serve a scalare le letture, non fa failover automatico." },
        { t: "Uno snapshot giornaliero", ok: false, why: "È un backup: aiuta il ripristino, non dà disponibilità continua con failover." },
        { t: "Una cache ElastiCache davanti al database", ok: false, why: "Riduce latenza/carico ma non rende il database ad alta disponibilità." }
      ],
      exp: "Alta disponibilità con failover automatico di un database RDS = Multi-AZ. La Read Replica scala le letture, non fa HA." },

    { id: 'q9', dom: 'D2', task: 'D2T2', type: 'single',
      q: "Un'azienda vuole un piano di disaster recovery cross-Region al costo più basso, accettando un RTO di alcune ore. Quale strategia?",
      opts: [
        { t: "Backup & Restore", ok: true, why: "È la più economica: si conservano i backup nella Region di DR e si ricrea l'ambiente al bisogno, con RTO di ore." },
        { t: "Multi-Site active-active", ok: false, why: "Ha RTO quasi nullo ma è la più costosa: eccessiva per un RTO di ore." },
        { t: "Warm Standby", ok: false, why: "Tiene un ambiente ridotto sempre acceso: più veloce ma più costoso del necessario." },
        { t: "Nessun piano, si ricrea a mano al momento", ok: false, why: "Non è una strategia governata né affidabile." }
      ],
      exp: "RTO di ore al minor costo: Backup & Restore. Le altre strategie riducono l'RTO ma costano di più." },

    { id: 'q10', dom: 'D3', task: 'D3T1', type: 'single',
      q: "Più istanze EC2, anche in AZ diverse, devono condividere lo stesso file system in lettura e scrittura. Quale storage?",
      opts: [
        { t: "Amazon EFS", ok: true, why: "È un file system NFS regionale e condiviso, montabile da molte istanze su più AZ." },
        { t: "Amazon EBS", ok: false, why: "Un volume è legato a una singola istanza in una AZ: non è condiviso in questo modo." },
        { t: "Amazon S3 montato come disco", ok: false, why: "S3 è storage a oggetti via API, non un file system POSIX condiviso." },
        { t: "Uno snapshot EBS condiviso", ok: false, why: "Uno snapshot è una copia, non uno storage condiviso in scrittura simultanea." }
      ],
      exp: "File system condiviso da molte istanze su più AZ = EFS. EBS è di una sola istanza in una AZ." },

    { id: 'q11', dom: 'D3', task: 'D3T2', type: 'multi',
      q: "Un'applicazione web deve scalare con la domanda ED essere resiliente al guasto di una singola Availability Zone. Quali DUE elementi sono essenziali? (scegliere due)",
      opts: [
        { t: "Un Auto Scaling group con istanze distribuite su almeno due AZ", ok: true, why: "Scala con la domanda e, distribuendo su più AZ, sopravvive al guasto di una zona sostituendo le istanze perse." },
        { t: "Un load balancer (ALB) davanti alle istanze, su più AZ", ok: true, why: "Distribuisce il traffico sulle istanze sane in più AZ e nasconde le singole istanze." },
        { t: "Una singola istanza EC2 di taglia molto grande", ok: false, why: "Un singolo server è un single point of failure: non scala elasticamente né sopravvive alla sua AZ." },
        { t: "Un'architettura Multi-Region active-active", ok: false, why: "Risolve il guasto di Region, non è richiesta per il guasto di una AZ ed è sproporzionata/costosa qui." }
      ],
      exp: "Il pattern «elastico e resiliente» è ALB + Auto Scaling group su ≥2 AZ. Multi-Region riguarda il guasto di Region, non di AZ." },

    { id: 'q12', dom: 'D3', task: 'D3T3', type: 'single',
      q: "Serve un database key-value che scali a milioni di richieste con latenza a millisecondi a cifra singola, senza gestire server. Quale servizio?",
      opts: [
        { t: "Amazon DynamoDB", ok: true, why: "NoSQL serverless, scala orizzontalmente da sé, risponde in millisecondi a cifra singola per accesso a chiave." },
        { t: "Amazon RDS", ok: false, why: "Relazionale: adatto a query con join e transazioni, non pensato per questa scala key-value serverless." },
        { t: "Amazon Redshift", ok: false, why: "È un data warehouse per analisi, non un key-value a bassa latenza." },
        { t: "Amazon Athena", ok: false, why: "Interroga file su S3 in modo ad-hoc, non è un database operativo key-value." }
      ],
      exp: "Key-value a grande scala, serverless, millisecondi: DynamoDB." },

    { id: 'q13', dom: 'D3', task: 'D3T4', type: 'single',
      q: "Utenti sparsi nel mondo scaricano gli stessi contenuti statici, e l'origine è sovraccarica. Come si riducono latenza e carico sull'origine?",
      opts: [
        { t: "Mettere Amazon CloudFront (CDN) davanti all'origine", ok: true, why: "Mette in cache i contenuti negli edge vicino agli utenti: serve dalla cache e l'origine riceve solo i miss." },
        { t: "AWS Global Accelerator", ok: false, why: "Accelera il percorso di rete ma non mette in cache i contenuti: non alleggerisce l'origine." },
        { t: "Un NAT Gateway più grande", ok: false, why: "Non c'entra con la distribuzione di contenuti agli utenti." },
        { t: "Spostare l'origine in una sola Region centrale", ok: false, why: "Non risolve la latenza globale né il carico." }
      ],
      exp: "Cache di contenuti vicino agli utenti + alleggerimento dell'origine = CloudFront. Global Accelerator non fa cache." },

    { id: 'q14', dom: 'D3', task: 'D3T5', type: 'single',
      q: "Uno stream di eventi in tempo reale va elaborato da consumatori personalizzati, con possibilità di rileggere i dati (replay). Quale servizio di ingestione?",
      opts: [
        { t: "Amazon Kinesis Data Streams", ok: true, why: "Cattura in tempo reale, conserva i dati per un periodo (replay) e li espone a consumatori propri." },
        { t: "Amazon Data Firehose", ok: false, why: "Consegna lo stream in modo gestito a destinazioni (S3/Redshift), senza consumatori propri né replay." },
        { t: "Amazon SQS", ok: false, why: "È una coda per disaccoppiare, non uno stream con replay e consumatori multipli sullo stesso dato." },
        { t: "Amazon Athena", ok: false, why: "È un motore di query su S3, non un servizio di ingestione streaming." }
      ],
      exp: "Streaming real-time con consumatori propri e replay = Kinesis Data Streams. Firehose è consegna gestita, senza replay." },

    { id: 'q15', dom: 'D4', task: 'D4T1', type: 'single',
      q: "Dei log vanno conservati per anni per obblighi normativi, con accesso rarissimo e un recupero in ore accettabile. Quale classe S3 minimizza il costo?",
      opts: [
        { t: "S3 Glacier Deep Archive", ok: true, why: "È la classe più economica per l'archivio profondo, con recupero nell'ordine delle ore: adatta a dati rarissimi da conservare a lungo." },
        { t: "S3 Standard", ok: false, why: "Ottimizzata per accesso frequente: costa molto di più del necessario per dati quasi mai letti." },
        { t: "S3 Standard-IA", ok: false, why: "Più economica di Standard ma non quanto Glacier Deep Archive per un archivio così raro." },
        { t: "S3 One Zone-IA", ok: false, why: "Riduce la resilienza (una sola AZ) e non è la più economica per l'archivio a lungo termine." }
      ],
      exp: "Archivio rarissimo, recupero in ore, costo minimo: S3 Glacier Deep Archive." },

    { id: 'q16', dom: 'D4', task: 'D4T2', type: 'single',
      q: "Un elaborato batch tollera le interruzioni e può riprendere. Qual è l'opzione d'acquisto EC2 più conveniente?",
      opts: [
        { t: "Istanze Spot", ok: true, why: "Scontate fino al ~90%: AWS può revocarle con preavviso, ma il batch tollerante alle interruzioni può riprendere." },
        { t: "On-Demand", ok: false, why: "Nessuno sconto: pagando il prezzo pieno non è la scelta più economica per un carico interrompibile." },
        { t: "Savings Plans", ok: false, why: "Convengono per carichi stabili e continui con impegno pluriennale, non per un batch occasionale interrompibile." },
        { t: "Dedicated Hosts", ok: false, why: "Servono a vincoli di compliance/licenze, non a minimizzare il costo di un batch." }
      ],
      exp: "Carico tollerante alle interruzioni al minor costo: Spot." },

    { id: 'q17', dom: 'D4', task: 'D4T3', type: 'single',
      q: "Una tabella DynamoDB ha traffico molto imprevedibile, con picchi improvvisi. Come si sceglie la capacità minimizzando pianificazione e spreco?",
      opts: [
        { t: "Modalità on-demand (pay-per-request)", ok: true, why: "Assorbe i picchi da sé e si paga per richiesta: niente capacità da pianificare, nessuno spreco su traffico imprevedibile." },
        { t: "Modalità provisioned con capacità alta fissa", ok: false, why: "Si paga la capacità anche quando è inutilizzata: spreco su traffico variabile." },
        { t: "Passare a RDS", ok: false, why: "Cambia tipo di database senza motivo: il requisito è di capacità, non di modello dati." },
        { t: "Aggiungere una Read Replica", ok: false, why: "Le read replica sono un concetto relazionale (RDS), non la leva di capacità di DynamoDB." }
      ],
      exp: "Traffico DynamoDB imprevedibile: capacità on-demand. La provisioned conviene solo su traffico stabile e prevedibile." },

    { id: 'q18', dom: 'D4', task: 'D4T4', type: 'multi',
      q: "Delle istanze in subnet private accedono spesso a S3 passando da un NAT Gateway, con costi di trasferimento elevati. Quali DUE interventi riducono il costo? (scegliere due)",
      opts: [
        { t: "Creare un gateway endpoint per S3", ok: true, why: "È gratuito e instrada il traffico verso S3 restando nella rete AWS, eliminando il passaggio (e il costo) dal NAT." },
        { t: "Servire i contenuti ripetuti tramite CloudFront", ok: true, why: "La cache all'edge riduce le richieste che raggiungono l'origine e il relativo trasferimento dati." },
        { t: "Aggiungere un secondo NAT Gateway", ok: false, why: "Aggiunge costo invece di ridurlo." },
        { t: "Attivare la Cross-Region Replication del bucket", ok: false, why: "Introduce storage e trasferimento aggiuntivi in un'altra Region: aumenta il costo." }
      ],
      exp: "Per abbattere il costo di accesso a S3 dalle subnet private: gateway endpoint (gratis, niente NAT) ed eventualmente CloudFront per i contenuti ripetuti." },

    { id: 'q19', dom: 'D1', task: 'D1T2', type: 'single',
      q: "Serve bloccare esplicitamente un intervallo di indirizzi IP in ingresso su un'intera subnet. Cosa si usa?",
      opts: [
        { t: "Una Network ACL con una regola di deny", ok: true, why: "La NACL agisce a livello di subnet e ammette regole di deny esplicite." },
        { t: "Un security group con una regola di deny", ok: false, why: "I security group hanno solo regole di allow: non possono negare esplicitamente." },
        { t: "Una IAM policy", ok: false, why: "IAM controlla le azioni sulle API, non il traffico di rete a livello di subnet." },
        { t: "Una bucket policy", ok: false, why: "Riguarda l'accesso a un bucket, non il traffico di rete della subnet." }
      ],
      exp: "Deny esplicito a livello di subnet = Network ACL. Il security group ha solo allow." },

    { id: 'q20', dom: 'D2', task: 'D2T2', type: 'single',
      q: "Quando la Region primaria smette di rispondere, il traffico deve essere dirottato in automatico verso un'altra Region. Cosa lo realizza?",
      opts: [
        { t: "Amazon Route 53 con health check e routing di failover", ok: true, why: "Il DNS instrada verso la Region secondaria quando l'health check della primaria fallisce." },
        { t: "Un security group", ok: false, why: "Filtra il traffico, non instrada fra Region." },
        { t: "Un Auto Scaling group", ok: false, why: "Scala le istanze dentro una Region, non fa failover cross-Region del traffico." },
        { t: "Un gateway endpoint", ok: false, why: "È connettività privata a S3/DynamoDB, non instradamento del traffico utente." }
      ],
      exp: "Failover automatico del traffico verso un'altra Region = Route 53 (health check + routing di failover)." }
  ];

  var DOMAIN_NAME = { D1: 'Secure', D2: 'Resilient', D3: 'High-Performing', D4: 'Cost-Optimized' };

  // ─────────────────────────── stile (iniettato) ───────────────────────────
  function injectStyle() {
    if (document.getElementById('dnq-style')) return;
    var css = [
      '.dnq{max-width:820px;margin:1rem 0}',
      '.dnq-card{border:1px solid var(--border,#e2e2e2);border-radius:12px;background:var(--bg-soft,rgba(128,128,128,.06));padding:1.1rem 1.2rem;margin:1rem 0}',
      '.dnq h3{margin:.1rem 0 .5rem}',
      '.dnq-lead{opacity:.82;font-size:.94rem;line-height:1.5}',
      '.dnq-controls{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;margin-top:1rem}',
      '.dnq-btn{font:inherit;font-weight:600;cursor:pointer;border:1px solid var(--link,#ff9900);color:var(--link,#ff9900);background:transparent;border-radius:999px;padding:.5rem 1.1rem;transition:transform .12s ease,background .2s ease}',
      '.dnq-btn:hover{transform:translateY(-1px);background:color-mix(in srgb,var(--link,#ff9900) 12%,transparent)}',
      '.dnq-btn.is-primary{background:var(--link,#ff9900);color:var(--on-accent,#182939);border-color:var(--link,#ff9900)}',
      '.dnq-sel{font:inherit;padding:.45rem .6rem;border-radius:8px;border:1px solid var(--border,#ccc);background:var(--bg,#fff);color:inherit}',
      '.dnq-q{border:1px solid var(--border,#e2e2e2);border-radius:12px;padding:1rem 1.15rem;margin:1rem 0;background:var(--bg,#fff)}',
      '.dnq-qhead{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;font-size:.72rem;opacity:.8;margin-bottom:.5rem}',
      '.dnq-badge{border:1px solid var(--border,#ccc);border-radius:999px;padding:.05rem .5rem;font-weight:700}',
      '.dnq-qtext{font-weight:600;line-height:1.5;margin-bottom:.7rem}',
      '.dnq-opt{display:flex;gap:.6rem;align-items:flex-start;padding:.55rem .7rem;border:1px solid var(--border,#e2e2e2);border-radius:9px;margin:.4rem 0;cursor:pointer;line-height:1.45}',
      '.dnq-opt input{margin-top:.2rem;flex:0 0 auto}',
      '.dnq-opt.ok{border-color:#2da44e;background:rgba(45,164,78,.13)}',
      '.dnq-opt.ko{border-color:#cf222e;background:rgba(207,34,46,.11)}',
      '.dnq-why{font-size:.85rem;opacity:.85;margin:.35rem 0 .2rem .1rem;line-height:1.45}',
      '.dnq-why b{font-weight:700}',
      '.dnq-exp{font-size:.88rem;margin-top:.6rem;padding:.6rem .75rem;border-left:3px solid var(--link,#ff9900);background:color-mix(in srgb,var(--link,#ff9900) 8%,transparent);border-radius:0 8px 8px 0;line-height:1.5}',
      '.dnq-mark{font-weight:700;margin-left:.2rem}',
      '.dnq-score{font-size:2rem;font-weight:800;line-height:1.1}',
      '.dnq-dom{display:flex;flex-wrap:wrap;gap:.5rem;margin:.7rem 0}',
      '.dnq-dompill{border:1px solid var(--border,#ccc);border-radius:999px;padding:.2rem .7rem;font-size:.82rem}',
      '.dnq-note{font-size:.8rem;opacity:.72;line-height:1.5;margin-top:.6rem}'
    ].join('');
    var s = document.createElement('style');
    s.id = 'dnq-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ─────────────────────────── util ───────────────────────────
  function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }

  // ─────────────────────────── UI ───────────────────────────
  function startScreen(root) {
    var doms = ['tutti', 'D1', 'D2', 'D3', 'D4'];
    var optsHtml = doms.map(function (d) {
      var lbl = d === 'tutti' ? 'Tutti i Domain' : (d + ' · ' + DOMAIN_NAME[d]);
      return '<option value="' + d + '">' + lbl + '</option>';
    }).join('');
    root.innerHTML =
      '<div class="dnq"><div class="dnq-card">' +
        '<h3>Simulatore SAA-C03</h3>' +
        '<p class="dnq-lead">Domande a scelta scenario-based, con la spiegazione di ogni opzione a fine prova. ' +
        'Il risultato è un <strong>punteggio didattico</strong>: non replica né predice lo <em>scaled score</em> ufficiale AWS.</p>' +
        '<div class="dnq-controls">' +
          '<label>Ambito: <select class="dnq-sel" id="dnq-dom">' + optsHtml + '</select></label>' +
          '<button class="dnq-btn is-primary" data-n="10">10 domande</button>' +
          '<button class="dnq-btn" data-n="all">Tutte</button>' +
        '</div>' +
      '</div></div>';
    Array.prototype.forEach.call(root.querySelectorAll('.dnq-btn'), function (b) {
      b.addEventListener('click', function () {
        var dom = root.querySelector('#dnq-dom').value;
        var pool = QUESTIONS.filter(function (q) { return dom === 'tutti' || q.dom === dom; });
        var n = b.getAttribute('data-n');
        pool = shuffle(pool);
        if (n !== 'all') pool = pool.slice(0, Math.min(parseInt(n, 10), pool.length));
        examScreen(root, pool);
      });
    });
  }

  function examScreen(root, questions) {
    var html = '<div class="dnq"><div class="dnq-card"><h3>Prova · ' + questions.length + ' domande</h3>' +
      '<p class="dnq-lead">Rispondi a tutte, poi premi <strong>Consegna</strong>. Le domande con «più risposte» richiedono di selezionare <em>tutte</em> le opzioni corrette.</p></div>';
    questions.forEach(function (q, i) {
      var type = q.type === 'multi' ? 'checkbox' : 'radio';
      var typeLbl = q.type === 'multi' ? 'più risposte' : 'una risposta';
      html += '<div class="dnq-q" data-qid="' + q.id + '"><div class="dnq-qhead">' +
        '<span class="dnq-badge">' + (i + 1) + '/' + questions.length + '</span>' +
        '<span class="dnq-badge">' + q.task + '</span>' +
        '<span>' + typeLbl + '</span></div>' +
        '<div class="dnq-qtext">' + esc(q.q) + '</div>';
      q.opts.forEach(function (o, oi) {
        html += '<label class="dnq-opt"><input type="' + type + '" name="' + q.id + '" value="' + oi + '">' +
          '<span>' + esc(o.t) + '</span></label>';
      });
      html += '</div>';
    });
    html += '<div class="dnq-controls"><button class="dnq-btn is-primary" id="dnq-submit">Consegna</button>' +
      '<button class="dnq-btn" id="dnq-cancel">Annulla</button></div></div>';
    root.innerHTML = html;
    root.querySelector('#dnq-cancel').addEventListener('click', function () { startScreen(root); });
    root.querySelector('#dnq-submit').addEventListener('click', function () { grade(root, questions); });
  }

  function grade(root, questions) {
    var correct = 0;
    var perDom = {};
    questions.forEach(function (q) {
      var qEl = root.querySelector('.dnq-q[data-qid="' + q.id + '"]');
      var chosen = [];
      Array.prototype.forEach.call(qEl.querySelectorAll('input:checked'), function (inp) { chosen.push(parseInt(inp.value, 10)); });
      var correctIdx = [];
      q.opts.forEach(function (o, oi) { if (o.ok) correctIdx.push(oi); });
      var isRight = chosen.length === correctIdx.length && correctIdx.every(function (ci) { return chosen.indexOf(ci) !== -1; });
      perDom[q.dom] = perDom[q.dom] || { ok: 0, tot: 0 };
      perDom[q.dom].tot++;
      if (isRight) { correct++; perDom[q.dom].ok++; }

      // rivela: marca ogni opzione + why + spiegazione
      var labels = qEl.querySelectorAll('.dnq-opt');
      q.opts.forEach(function (o, oi) {
        var lab = labels[oi];
        var inp = lab.querySelector('input');
        var wasChosen = chosen.indexOf(oi) !== -1;
        inp.disabled = true;
        if (o.ok) lab.classList.add('ok');
        else if (wasChosen) lab.classList.add('ko');
        var mark = o.ok ? '<span class="dnq-mark">✓</span>' : (wasChosen ? '<span class="dnq-mark">✗</span>' : '');
        lab.querySelector('span').innerHTML += mark;
        var why = document.createElement('div');
        why.className = 'dnq-why';
        why.innerHTML = '<b>' + (o.ok ? 'Corretta' : 'Errata') + '.</b> ' + esc(o.why);
        lab.insertAdjacentElement('afterend', why);
      });
      var exp = document.createElement('div');
      exp.className = 'dnq-exp';
      exp.innerHTML = '<b>' + (isRight ? 'Risposta esatta.' : 'Risposta non corretta.') + '</b> ' + esc(q.exp);
      qEl.appendChild(exp);
      qEl.style.borderColor = isRight ? '#2da44e' : '#cf222e';
    });

    var pct = Math.round((correct / questions.length) * 100);
    var domPills = Object.keys(perDom).sort().map(function (d) {
      var p = perDom[d];
      return '<span class="dnq-dompill">' + d + ' · ' + DOMAIN_NAME[d] + ': <strong>' + p.ok + '/' + p.tot + '</strong></span>';
    }).join('');
    var summary = document.createElement('div');
    summary.className = 'dnq-card';
    summary.innerHTML =
      '<h3>Punteggio didattico</h3>' +
      '<div class="dnq-score">' + correct + '/' + questions.length + ' &middot; ' + pct + '%</div>' +
      '<div class="dnq-dom">' + domPills + '</div>' +
      '<p class="dnq-note">Questo punteggio misura solo le domande di questo set e serve allo studio. ' +
      'Non è lo <em>scaled score</em> AWS (100-1000, soglia 720), che normalizza forme d\'esame di difficoltà diversa. ' +
      'Le domande sono originali, scritte per il ripasso.</p>' +
      '<div class="dnq-controls"><button class="dnq-btn is-primary" id="dnq-again">Rifai</button></div>';
    var wrap = root.querySelector('.dnq');
    wrap.insertBefore(summary, wrap.firstChild);
    summary.querySelector('#dnq-again').addEventListener('click', function () { startScreen(root); });
    summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function mountQuiz(root) {
    injectStyle();
    startScreen(root);
  }

  // ─────────────────────────── plugin docsify ───────────────────────────
  function simulatorePlugin(hook) {
    hook.doneEach(function () {
      var root = document.getElementById('dn-quiz');
      if (root && root.dataset.mounted !== '1') {
        root.dataset.mounted = '1';
        mountQuiz(root);
      }
    });
  }

  window.simulatorePlugin = simulatorePlugin;
  window.__dnqMount = mountQuiz;   // hook interno per test/anteprima
})();
