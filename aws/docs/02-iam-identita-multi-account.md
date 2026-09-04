# 02 · IAM, credenziali temporanee e strategia multi-account

**AWS Identity and Access Management (IAM)** è il servizio che decide *chi* può compiere *quali* azioni su *quali* risorse dell'account. Ogni chiamata ad AWS, dalla Console, dalla CLI o da un'applicazione, passa da IAM: se la richiesta non è autorizzata, il servizio la rifiuta prima ancora di eseguirla. Capire come IAM valuta una richiesta è il cuore del Domain 1 dell'esame e la base su cui poggiano rete, dati e workload dei moduli successivi. IAM è un servizio **globale**: le identità e le policy non appartengono a una Region.

> [!info|label:SAA-C03 · D1T1 e base D1T2/D1T3]
> Il modulo copre l'intero task *Design secure access to AWS resources*: identità, policy, policy evaluation, credenziali temporanee, federation, IAM Identity Center, Organizations, SCP, Control Tower e permissions boundary. È anche il prerequisito d'identità per la protezione di workload e dati.

## Principal, authentication e authorization

Tre parole ricorrono in ogni discorso su IAM e conviene fissarle subito. Un **principal** è chi effettua una richiesta: una persona, un'applicazione o un servizio AWS che agisce per conto di qualcuno. L'**authentication** (autenticazione) risponde alla domanda «chi sei?» e avviene tramite credenziali: una password con MFA per la Console, oppure una firma crittografica calcolata con delle chiavi per la CLI e le API. L'**authorization** (autorizzazione) risponde invece a «che cosa ti è permesso fare?» e la determinano le **policy**. Un principal autenticato non è ancora autorizzato: sono due controlli distinti e successivi.

## Le identità: root, IAM user, IAM group, IAM role

Un'**identità** è un principal a cui si possono associare permessi. IAM ne offre di tipi diversi, pensati per esigenze diverse.

Il **root user** nasce con l'account, coincide con l'email di registrazione e possiede accesso completo e non limitabile. Va protetto con MFA, privato di access key e usato solo per i pochi compiti che lo richiedono (il modulo [01](01-cloud-region-account.md) ne tratta la messa in sicurezza).

Un **IAM user** rappresenta una singola persona o applicazione a lungo termine dentro l'account. Possiede **credenziali di lunga durata**: una password per la Console e, se necessario, delle access key per la CLI. Proprio perché durano finché non vengono revocate, le access key sono la forma di credenziale più rischiosa e AWS ne scoraggia l'uso quando esiste un'alternativa temporanea.

Un **IAM group** è un contenitore di IAM user che serve ad attaccare le policy una volta sola a un insieme di persone invece che a ciascuna. Non è a sua volta un principal: non lo si può «assumere» né annidare dentro un altro gruppo. È uno strumento di organizzazione, non un'identità che agisce.

Un **IAM role** è un'identità con delle policy ma **senza credenziali di lunga durata**. Non appartiene a una persona: viene **assunta** temporaneamente da un principal fidato, che in cambio riceve credenziali valide per una manciata di ore. È il meccanismo con cui AWS raccomanda di dare accesso a persone, applicazioni e servizi, perché sostituisce chiavi permanenti con credenziali che scadono da sole. Una role ha due policy che vanno tenute distinte: la **trust policy**, che stabilisce *chi* può assumerla, e la **permission policy**, che stabilisce *cosa* può fare una volta assunta.

## Le policy: identity-based e resource-based

Una **policy** è un documento JSON che elenca permessi. Si distinguono due grandi famiglie in base a *dove* vengono attaccate. Una **identity-based policy** è collegata a un'identità (user, group o role) e dice che cosa quell'identità può fare. Una **resource-based policy** è collegata direttamente a una risorsa (per esempio una bucket policy su S3 o una key policy su KMS) e dice *quali principal* possono accedere a quella risorsa; a differenza della prima contiene un elemento **`Principal`**. Le resource-based policy abilitano l'accesso **cross-account** senza bisogno di creare identità nell'altro account: la risorsa stessa nomina chi la può usare.

La struttura di uno `Statement` è sempre la stessa, e all'esame va riconosciuta a colpo d'occhio:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::saa-lab-data",
        "arn:aws:s3:::saa-lab-data/*"
      ],
      "Condition": { "Bool": { "aws:MultiFactorAuthPresent": "true" } }
    }
  ]
}
```

I campi che contano: **`Effect`** vale `Allow` o `Deny`; **`Action`** elenca le operazioni API (`servizio:Operazione`); **`Resource`** indica gli ARN su cui l'effetto si applica; **`Principal`** (solo nelle resource-based policy) dice a chi; **`Condition`** aggiunge dei vincoli, come «solo se la sessione ha fatto MFA» o «solo da questo intervallo di IP». La combinazione di questi campi è ciò che IAM confronta con ogni richiesta.

## Come AWS decide: la policy evaluation

Di fronte a una richiesta, IAM non «cerca un permesso» in modo ingenuo: applica un **ordine di valutazione** preciso, e conoscerlo spiega la maggior parte delle risposte del Domain 1. Il principio di partenza è il **default deny**: tutto ciò che non è esplicitamente consentito è negato. Su questo si innestano due regole. La prima è che un **explicit deny** (un `"Effect": "Deny"` che combacia) **vince su qualunque allow**, sempre e comunque. La seconda è che i controlli come SCP, permissions boundary e session policy **non concedono** permessi: fissano soltanto un tetto, e la permission effettiva è l'**intersezione** di ciò che ciascuno consente.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 430" role="img" aria-label="Flusso di valutazione di una richiesta IAM: se esiste un deny esplicito la richiesta è negata; altrimenti deve stare entro i limiti di SCP, permissions boundary e session policy; poi serve un allow esplicito in una identity o resource policy; in mancanza di allow scatta il default deny." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="pe-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6">
      <rect x="210" y="16" width="200" height="40" rx="8"/>
      <rect x="188" y="84" width="244" height="52" rx="8"/>
      <rect x="188" y="172" width="244" height="52" rx="8"/>
      <rect x="188" y="260" width="244" height="52" rx="8"/>
      <rect x="210" y="350" width="200" height="46" rx="10"/>
    </g>
    <rect x="530" y="150" width="160" height="132" rx="10" fill="var(--link,#9a4d00)" fill-opacity=".16" stroke="var(--link,#9a4d00)" stroke-width="1.6"/>
    <g text-anchor="middle">
      <text x="310" y="41" font-size="12.5">richiesta di accesso</text>
      <text x="310" y="106" font-size="12">deny esplicito?</text>
      <text x="310" y="123" font-size="10" fill-opacity=".7">in una qualsiasi policy</text>
      <text x="310" y="194" font-size="12">entro i limiti?</text>
      <text x="310" y="211" font-size="10" fill-opacity=".7">SCP · boundary · session</text>
      <text x="310" y="282" font-size="12">allow esplicito?</text>
      <text x="310" y="299" font-size="10" fill-opacity=".7">identity o resource policy</text>
      <text x="310" y="378" font-size="15" font-weight="700">ALLOW</text>
      <text x="610" y="210" font-size="18" font-weight="700">DENY</text>
      <text x="610" y="230" font-size="9.5" fill-opacity=".75">esplicito o di default</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#pe-arrow)">
      <path d="M310 56v26"/>
      <path d="M310 136v34"/>
      <path d="M310 224v34"/>
      <path d="M310 312v36"/>
      <path d="M432 108 L528 175"/>
      <path d="M432 198 L528 210"/>
      <path d="M432 288 L528 245"/>
    </g>
    <g font-size="10" fill-opacity=".8">
      <text x="320" y="158">no</text>
      <text x="320" y="246">sì</text>
      <text x="320" y="334">sì</text>
      <text x="452" y="132">sì</text>
      <text x="452" y="192">no</text>
      <text x="452" y="270">no</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Un solo <code>Deny</code> che combacia chiude la richiesta, ovunque si trovi. Superato quel filtro, la richiesta deve restare <strong>dentro</strong> tutti i limiti applicabili e trovare almeno un <code>Allow</code> esplicito; se manca, resta il default deny.</figcaption>
</figure>

Riletto in parole: prima IAM cerca un deny esplicito in *tutte* le policy applicabili e, se lo trova, si ferma. Altrimenti verifica che la richiesta sia consentita da eventuali SCP dell'organizzazione, dalla permissions boundary dell'identità e dalle session policy della sessione. Solo allora conta se una identity-based o resource-based policy la consente esplicitamente. In assenza di un allow, la risposta è comunque «no».

## Least privilege

Il **principle of least privilege** prescrive di concedere solo i permessi necessari a svolgere un compito, e solo per il tempo necessario. Non è uno stato che si raggiunge una volta, ma una direzione: si parte stretti e si allarga quando un requisito concreto lo giustifica, invece di partire da `AdministratorAccess` e sperare di restringere in seguito. Le credenziali temporanee sono l'alleato naturale di questo principio, perché aggiungono al «solo i permessi giusti» anche il «solo per il tempo giusto».

## Credenziali temporanee: AWS STS e role assumption

**AWS Security Token Service (STS)** è il servizio che emette **credenziali temporanee**. A differenza delle access key di un IAM user, che durano finché non vengono revocate, quelle di STS **scadono da sole** dopo un intervallo configurabile (di norma un'ora, entro i limiti della role). Si riconoscono perché l'Access Key ID inizia con `ASIA` invece di `AKIA`, e si compongono di tre parti: Access Key ID, Secret Access Key e un **Session Token** che va inviato a ogni chiamata.

Il meccanismo centrale è la **role assumption**: un principal fidato chiama `sts:AssumeRole` indicando una role, STS verifica che la **trust policy** della role lo autorizzi e restituisce credenziali temporanee con i permessi della **permission policy** della role. Lo stesso meccanismo attraversa i confini dell'account e realizza l'**accesso cross-account**: una role nell'account B, la cui trust policy nomina l'account A, può essere assunta da un principal di A senza che in B esista alcun utente per quella persona.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 250" role="img" aria-label="Accesso cross-account: un IAM user nell'Account A assume una IAM role nell'Account B tramite STS, ottiene credenziali temporanee e accede a una risorsa dell'Account B. La trust policy della role autorizza l'Account A, la permission policy definisce cosa può fare." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="ca-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="20" y="40" width="230" height="176" rx="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="8 6"/>
    <rect x="300" y="40" width="400" height="176" rx="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="8 6"/>
    <text x="34" y="62" font-size="12" font-weight="700">Account A</text>
    <text x="314" y="62" font-size="12" font-weight="700">Account B</text>
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6">
      <rect x="48" y="110" width="180" height="56" rx="9"/>
      <rect x="330" y="92" width="210" height="66" rx="9"/>
      <rect x="575" y="106" width="105" height="50" rx="9"/>
    </g>
    <g text-anchor="middle">
      <text x="138" y="142" font-size="12.5">IAM user</text>
      <text x="435" y="114" font-size="12.5" font-weight="700">IAM role</text>
      <text x="435" y="133" font-size="9.5" fill-opacity=".72">trust: Account A</text>
      <text x="435" y="148" font-size="9.5" fill-opacity=".72">permission: S3 read</text>
      <text x="627" y="135" font-size="11">S3 bucket</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.7" marker-end="url(#ca-arrow)">
      <path d="M228 128 L326 120"/>
      <path d="M540 131 L571 131"/>
    </g>
    <g text-anchor="middle" fill-opacity=".85">
      <text x="278" y="100" font-size="9.5">AssumeRole (STS)</text>
      <text x="278" y="200" font-size="9.5">credenziali temporanee · ASIA… · ~1h</text>
      <text x="556" y="118" font-size="9">accesso</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">La <strong>trust policy</strong> della role fa da cancello (chi può assumerla), la <strong>permission policy</strong> stabilisce cosa può fare la sessione. STS emette credenziali che scadono da sole, così non esistono chiavi permanenti da custodire tra i due account.</figcaption>
</figure>

L'**MFA** rafforza sia l'autenticazione sia l'autorizzazione: oltre a proteggere il login, la sua presenza si può esigere in una `Condition` con la chiave `aws:MultiFactorAuthPresent`, così un'azione sensibile è consentita solo da una sessione che ha fatto la verifica a più fattori.

## Federation e IAM Identity Center

La **federation** (federazione) permette a identità che vivono **fuori** da IAM (la directory aziendale, un provider come Google o un social login) di ottenere credenziali AWS temporanee senza che si crei un IAM user per ciascuna persona. Il principio è sempre lo stesso: l'identità esterna viene verificata da un **identity provider** fidato, poi STS emette credenziali temporanee. Si evita così di duplicare in AWS gli account che l'azienda già gestisce altrove.

**AWS IAM Identity Center** è il servizio con cui AWS realizza questo per la *forza lavoro*: un punto unico da cui le persone accedono con un solo login (single sign-on) a più account e applicazioni, con permessi descritti da **permission set** e concessi come credenziali temporanee. Si collega a una directory esterna o ne usa una integrata. Ne esistono due forme che l'esame chiede di distinguere:

| | Organization instance | Account instance |
|---|---|---|
| dove vive | nel **management account** di AWS Organizations | dentro **un singolo account** e una singola Region |
| a cosa serve | gestire l'accesso di persone a **tutti** gli account dell'organizzazione | supportare **poche applicazioni managed** isolate (es. CodeCatalyst) |
| funzionalità | **complete** | un **sottoinsieme**: non gestisce l'accesso agli account |
| quando | uso in produzione, multi-account | prova isolata o assenza di controllo sull'organizzazione |

In pratica, per governare l'accesso umano a più account si usa l'**organization instance**; l'account instance nasce per casi isolati e non sostituisce quella scelta.

## AWS Organizations e la governance multi-account

Oltre una certa dimensione non si tiene tutto in un account solo: si separano ambienti (produzione, sviluppo, sandbox) e team in **account diversi**, così un errore o una compromissione restano confinati. **AWS Organizations** è il servizio che raggruppa più account sotto un'unica gestione, con fatturazione consolidata. Al vertice c'è il **management account** (quello che crea l'organizzazione); sotto stanno i **member account**, che si possono ordinare in **Organizational Unit (OU)**, cioè cartelle gerarchiche che raggruppano account con esigenze simili.

Sopra questa gerarchia agiscono le **Service Control Policy (SCP)**. Una SCP è un **guardrail**: fissa il **massimo** insieme di permessi disponibile per gli account di una OU o per un singolo account. Il punto che l'esame verifica di continuo è che una SCP **limita ma non concede**: anche se una SCP «consente» un'azione, quell'azione va comunque autorizzata dalle IAM policy dentro l'account; se invece la SCP la esclude, nessuna policy locale potrà riabilitarla. Le SCP non si applicano al management account, che resta perciò da maneggiare con particolare prudenza.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 300" role="img" aria-label="Gerarchia di AWS Organizations: un management account in cima, sotto due Organizational Unit (Prod e Sandbox), e sotto ancora i member account. Una Service Control Policy applicata alla OU Prod fissa il tetto dei permessi per gli account contenuti." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="org-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="70" y="96" width="250" height="164" rx="12" fill="var(--link,#9a4d00)" fill-opacity=".13" stroke="var(--link,#9a4d00)" stroke-width="1.5" stroke-dasharray="7 5"/>
    <text x="84" y="116" font-size="11" font-weight="700" fill="var(--link,#9a4d00)">SCP</text>
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6">
      <rect x="280" y="18" width="180" height="44" rx="9"/>
      <rect x="120" y="120" width="150" height="42" rx="8"/>
      <rect x="470" y="120" width="150" height="42" rx="8"/>
      <rect x="96" y="214" width="106" height="40" rx="7"/>
      <rect x="216" y="214" width="106" height="40" rx="7"/>
      <rect x="470" y="214" width="120" height="40" rx="7"/>
    </g>
    <g text-anchor="middle">
      <text x="370" y="45" font-size="12.5" font-weight="700">Management account</text>
      <text x="195" y="146" font-size="12">OU · Prod</text>
      <text x="545" y="146" font-size="12">OU · Sandbox</text>
      <text x="149" y="238" font-size="10.5">account</text>
      <text x="269" y="238" font-size="10.5">account</text>
      <text x="530" y="238" font-size="10.5">account</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#org-arrow)">
      <path d="M340 62 L210 118"/>
      <path d="M400 62 L540 118"/>
      <path d="M180 162 L155 212"/>
      <path d="M215 162 L262 212"/>
      <path d="M540 162 L532 212"/>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">La SCP applicata alla OU <em>Prod</em> vale come tetto per tutti gli account sotto di essa: nessuno di quegli account può superarla, anche con policy locali permissive. Il management account non è soggetto alle SCP.</figcaption>
</figure>

**AWS Control Tower** sta un gradino più in alto: automatizza la creazione e il governo di un ambiente multi-account (una *landing zone*) su fondamenta di Organizations, applicando **controls** (guardrail preconfezionati, in parte realizzati proprio con SCP) e fornendo un *account factory* per sfornare nuovi account già conformi. In breve, Organizations dà la struttura e le SCP, Control Tower dà l'impianto pronto e sorvegliato.

## Non confondere: SCP, permissions boundary e session policy

Tre controlli condividono la stessa natura, e l'esame gioca proprio sulla loro somiglianza: **fissano un tetto, non concedono nulla**. Cambiano il livello a cui agiscono.

| Controllo | Dove agisce | Chi lo imposta |
|---|---|---|
| **Service Control Policy** | il **massimo** per gli account di una OU/organizzazione | l'amministratore dell'organizzazione |
| **Permissions boundary** | il **massimo** per una singola identità (user o role) | l'amministratore dell'account |
| **Session policy** | il **massimo** per una singola sessione, passata all'`AssumeRole` | chi apre la sessione |

La permission effettiva di una richiesta è l'**intersezione** di tutti i tetti applicabili con ciò che le policy concedono, meno ogni deny esplicito. Una identity-based policy che «concede» S3 non basta se una permissions boundary più stretta lo esclude: l'azione resta negata.

> [!warning|label:SCP e permissions boundary non concedono]
> È l'errore classico del Domain 1. Se uno scenario chiede di *dare* un permesso, la risposta non è mai «una SCP» o «una permissions boundary»: quelle limitano soltanto. Il permesso lo concede una identity-based o resource-based policy, *dentro* i limiti che gli altri controlli impongono.

*➕ Oltre il perimetro di base: dal 2024 esistono anche le **Resource Control Policy (RCP)**, il corrispettivo delle SCP sul lato risorsa (fissano il massimo accesso a risorse come bucket S3 in tutta l'organizzazione). Utile saperle nominate; il cuore dell'esame resta la coppia SCP + permissions boundary.*

## Il modello consigliato

Mettendo insieme i pezzi, AWS raccomanda un modello preciso per i due tipi di accesso. Per le **persone** (la forza lavoro): niente IAM user individuali, ma **IAM Identity Center** federato con la directory aziendale, che concede credenziali temporanee tramite permission set. Per i **workload** (applicazioni, servizi, istanze): niente access key di lunga durata incollate nel codice, ma **IAM role** assunte dal servizio, che ricevono credenziali temporanee ruotate da AWS. Gli IAM user con access key restano l'eccezione, giustificata solo quando non esiste un'alternativa temporanea, come il ponte transitorio del [LAB 01](../labs/01-bootstrap-account.md) in attesa dell'upgrade di piano.

## Exam lens

I segnali linguistici del Domain 1 indirizzano quasi sempre verso una di queste scelte:

- *grant access across accounts* / *cross-account*: una **IAM role** con trust policy verso l'altro account, o una **resource-based policy** che nomina il principal esterno; non la copia di un utente.
- *temporary credentials* / *without long-term keys*: **STS** e role assumption; per le persone, **IAM Identity Center**.
- *centrally manage access to many accounts*: **IAM Identity Center (organization instance)** con **Organizations**, non IAM user replicati account per account.
- *restrict the maximum permissions* / *prevent member accounts from...*: **SCP** (a livello di organizzazione) o **permissions boundary** (a livello di identità); mai per *concedere*.
- *federate with corporate directory* / *SSO*: **federation** verso **IAM Identity Center**.
- *require MFA for a sensitive action*: una **`Condition`** con `aws:MultiFactorAuthPresent`.

La trappola più frequente resta lo scambio fra concedere e limitare: davanti a un'opzione «usa una SCP per dare accesso a…», si scarta senza esitare.

## Ripasso lampo

<details>
<summary>Qual è la differenza fra la trust policy e la permission policy di una <code>role</code>?</summary>

La **trust policy** stabilisce *chi* può assumere la role (quali principal, con quali condizioni); la **permission policy** stabilisce *cosa* può fare la sessione una volta assunta la role. Servono due controlli diversi: chi entra e cosa può toccare.

</details>

<details>
<summary>Una Service Control Policy può concedere un permesso a un account?</summary>

No. Una SCP fissa soltanto il **tetto** dei permessi disponibili per gli account di una OU o organizzazione. Un'azione, per essere consentita, deve comunque essere concessa da una IAM policy *dentro* l'account e non essere esclusa dalla SCP. La SCP limita, non concede. Inoltre non si applica al management account.

</details>

<details>
<summary>Perché un explicit deny è decisivo nella policy evaluation?</summary>

Perché un `"Effect": "Deny"` che combacia con la richiesta **vince su qualsiasi allow**, in qualunque policy si trovi, ed è la prima cosa che IAM verifica. Nessun `Allow`, per quanto ampio, può ribaltarlo.

</details>

<details>
<summary>Come si dà accesso a una risorsa dell'Account B a un principal dell'Account A senza creare utenti in B?</summary>

Con una **IAM role** in B la cui trust policy autorizza l'Account A: il principal di A la assume via STS e ottiene credenziali temporanee. In alternativa, con una **resource-based policy** sulla risorsa di B che nomina direttamente il principal di A. In entrambi i casi non serve un utente duplicato in B.

</details>

<details>
<summary>Qual è la differenza fra organization instance e account instance di IAM Identity Center?</summary>

L'**organization instance** vive nel management account di Organizations, offre tutte le funzionalità e gestisce l'accesso delle persone a **tutti** gli account dell'organizzazione: è la scelta per l'uso in produzione. L'**account instance** vive in un singolo account, offre un **sottoinsieme** delle funzionalità (assegnazioni a poche applicazioni managed) e **non** gestisce l'accesso agli account.

</details>

**In sintesi:** IAM decide ogni richiesta con default deny, explicit deny prevalente e intersezione dei tetti; le role e STS sostituiscono le chiavi permanenti con credenziali temporanee, anche cross-account; federation e IAM Identity Center portano le identità esterne in AWS senza duplicarle; Organizations, SCP e Control Tower governano il multi-account; SCP, permissions boundary e session policy limitano ma non concedono.

## Fonti

- [Policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html) - verificato 2026-09-04
- [IAM identities (users, groups, roles)](https://docs.aws.amazon.com/IAM/latest/UserGuide/id.html) - verificato 2026-09-04
- [Identity-based and resource-based policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_identity-vs-resource.html) - verificato 2026-09-04
- [AWS STS and temporary security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp.html) - verificato 2026-09-04
- [Permissions boundaries for IAM entities](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html) - verificato 2026-09-04
- [Service Control Policies (SCPs)](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html) - verificato 2026-09-04
- [Organization and account instances of IAM Identity Center](https://docs.aws.amazon.com/singlesignon/latest/userguide/identity-center-instances.html) - verificato 2026-09-04
- [What is AWS Control Tower?](https://docs.aws.amazon.com/controltower/latest/userguide/what-is-control-tower.html) - verificato 2026-09-04
