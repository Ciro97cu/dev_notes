# LAB 01 · Bootstrap sicuro dell'account

Il bootstrap prepara un account AWS nuovo per studiare senza usare ogni giorno il root user e senza creare risorse fatturabili. Al termine saranno attivi MFA, un'identità amministrativa separata, un budget di allerta e una sessione AWS CloudShell nella Region `eu-west-1`.

> [!info|label:SAA-C03 · D1T1 e fondamenti D4]
> Il laboratorio mette in pratica root user, MFA, IAM, least privilege come percorso evolutivo e controllo dei costi. CloudShell è uno strumento operativo **out of scope**, non un servizio da studiare per l'esame.

## Cost guardrail

| Voce | Vincolo del laboratorio |
|---|---|
| Piano | **Free Plan** per un nuovo account |
| Region operativa | `eu-west-1` · Europe (Ireland) |
| Risorse applicative create | Nessuna |
| Costo intenzionale | **0 USD** |
| Servizi da non attivare | AWS Organizations, Control Tower, CloudShell VPC environment |
| Durata indicativa | 45-60 minuti |

Il Free Plan evita addebiti, ma i crediti e il periodo di sei mesi restano limitati. Il laboratorio non crea compute, storage, indirizzi IP o networking.

> [!warning|label:Non attivare Organizations nel Free Plan]
> Entrare in AWS Organizations o configurare una Control Tower landing zone provoca l'upgrade automatico al Paid Plan. IAM Identity Center verrà studiato nel modulo dedicato; non va anticipato seguendo tutorial multi-account durante questo bootstrap. *(verificato: 2026-09-04)*

## Prerequisiti

Preparare prima di iniziare:

- un indirizzo email controllato e non riutilizzato per altri account AWS;
- un numero di telefono raggiungibile;
- un metodo di pagamento accettato da AWS per la verifica dell'identità;
- un password manager;
- una security key FIDO oppure un'app TOTP;
- un indirizzo email sul quale ricevere gli alert di costo.

La password, i codici MFA, le chiavi di recupero e qualsiasi eventuale credential non devono comparire in note, repository, screenshot o output condivisi.

## Architettura delle identità iniziali

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 760 260" role="img" aria-label="Il root user viene usato soltanto per il bootstrap; l'IAM user study-admin con MFA viene usato per Console e CloudShell senza access key" style="width:100%;max-width:760px;height:auto;color:inherit">
  <defs>
    <marker id="identity-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path d="M0 0L8 4L0 8Z" fill="currentColor"/>
    </marker>
  </defs>
  <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.7">
    <rect x="35" y="65" width="175" height="118" rx="12"/>
    <rect x="292" y="42" width="205" height="164" rx="12"/>
    <rect x="580" y="65" width="145" height="118" rx="12"/>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#identity-arrow)">
    <path d="M210 124h74"/>
    <path d="M497 124h75"/>
  </g>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" text-anchor="middle">
    <g font-size="15" font-weight="700">
      <text x="122" y="101">root user</text>
      <text x="394" y="78">IAM user</text>
      <text x="652" y="101">CloudShell</text>
    </g>
    <g font-size="12">
      <text x="122" y="127">MFA multiplo</text>
      <text x="122" y="149">nessuna access key</text>
      <text x="394" y="106">study-admin</text>
      <text x="394" y="131">Console password + MFA</text>
      <text x="394" y="156">nessuna access key</text>
      <text x="394" y="181">AdministratorAccess</text>
      <text x="652" y="127">credential della</text>
      <text x="652" y="149">sessione Console</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Il root user esegue soltanto il bootstrap. L'IAM user amministrativo è una soluzione transitoria per il Free Plan: non riceve access key e usa CloudShell già autenticata dalla Console.</figcaption>
</figure>

AWS raccomanda credenziali temporanee. Per più account, la soluzione di destinazione è IAM Identity Center con un'istanza di tipo *organization*. Il Free Plan crea però un conflitto reale: Organizations lo converte automaticamente in Paid Plan, mentre un'istanza Identity Center di tipo *account* non supporta permission set né accesso all'account. L'IAM user amministrativo di questo laboratorio è quindi un compromesso iniziale esplicito, non il modello finale.

## 1 · Creare l'account con Free Plan

1. Aprire la pagina ufficiale [AWS Free Tier](https://aws.amazon.com/free/) e avviare la creazione dell'account.
2. Usare una password root unica, generata e conservata nel password manager.
3. Completare verifica email, telefono e metodo di pagamento.
4. Quando AWS propone il piano, scegliere **Free Plan**.
5. Entrare nella **Billing and Cost Management console** e verificare che la pagina del piano riporti Free Plan, data di scadenza e saldo dei crediti.

Il nuovo schema assegna 100 USD di crediti iniziali e permette di guadagnarne fino ad altri 100 tramite attività elencate nella Console. Non si assumono in anticipo quali attività siano disponibili: l'elenco può cambiare e va letto nel widget mostrato nell'account. *(verificato: 2026-09-04)*

## 2 · Proteggere il root user

Restando autenticati come root user:

1. Aprire il menu dell'account, scegliere **Security credentials** e raggiungere la sezione MFA.
2. Registrare una security key FIDO oppure un virtual MFA device TOTP.
3. Registrare un secondo dispositivo MFA, se disponibile, per evitare che la perdita dell'unico dispositivo blocchi l'accesso. AWS permette fino a otto dispositivi MFA sul root user.
4. Verificare nella sezione **Access keys** che non esista alcuna root access key.
5. Controllare che email e telefono di recupero siano aggiornati.

> [!warning]
> Non creare una root access key "per configurare la CLI". Una access key del root concede potere completo e permanente finché non viene disattivata. Questo percorso userà CloudShell senza configurare chiavi statiche.

## 3 · Consentire all'amministratore di vedere i costi

Per impostazione dell'account, una policy IAM amministrativa non basta necessariamente a mostrare le pagine di billing. Come root user:

1. Aprire **Account** nella Billing and Cost Management console.
2. Individuare **IAM user and role access to Billing information**.
3. Attivare **IAM Access** e salvare.

Questa impostazione abilita la possibilità di delegare l'accesso; sono comunque le IAM policy dell'identità a stabilire quali operazioni di billing siano consentite.

## 4 · Creare l'identità amministrativa quotidiana

Aprire IAM, che è un servizio globale, e creare:

1. un user group chiamato `StudyAdministrators`;
2. nel gruppo, collegare la AWS managed policy `AdministratorAccess`;
3. un IAM user chiamato `study-admin`, con accesso alla AWS Management Console;
4. aggiungere `study-admin` al gruppo `StudyAdministrators`;
5. non creare access key per l'utente.

`AdministratorAccess` è volutamente ampio perché serve al bootstrap e ai primi laboratori. Non va riutilizzato come policy dei workload: ruoli e policy specifiche verranno introdotti nel modulo IAM.

Uscire completamente dalla sessione root. Accedere quindi come **IAM user** usando l'account ID o l'eventuale account alias e il nome `study-admin`. Dalla pagina **Security credentials** dell'utente registrare MFA anche per questa identità.

> [!tip]
> Un account alias rende più leggibile l'URL di accesso, ma deve essere globalmente unico ed entra nell'URL pubblico. Se viene creato, evitare nomi personali o informazioni riservate.

## 5 · Creare l'alert di costo

Dalla Billing and Cost Management console:

1. aprire **Budgets** e scegliere **Create budget**;
2. selezionare **Use a template (simplified)**;
3. scegliere **Zero spend budget**;
4. usare il nome `saa-zero-spend`;
5. indicare l'email preparata per gli alert;
6. creare il budget e confermare l'email se richiesto.

Il template Zero spend invia una notifica quando la spesa supera i limiti gratuiti applicabili. Nel Free Plan completa il monitoraggio del saldo crediti; diventa ancora più importante dopo un eventuale upgrade.

> [!warning|label:Un budget non blocca la spesa]
> AWS Budgets aggiorna i dati fino a tre volte al giorno, tipicamente ogni 8-12 ore. La notifica può quindi arrivare dopo che altro utilizzo è maturato. Un alert non è un hard cap e non sostituisce il teardown. *(verificato: 2026-09-04)*

## 6 · Aprire CloudShell in `eu-west-1`

Verificare di essere autenticati come `study-admin`, non come root user. Nel selettore della Console scegliere **Europe (Ireland) `eu-west-1`**, quindi aprire **AWS CloudShell**.

Usare l'ambiente standard. Un **CloudShell VPC environment** ha scopi diversi, dipende dalla rete scelta e non conserva la home directory dopo il timeout; non serve in questo laboratorio.

CloudShell include AWS CLI v2 e rende disponibili le credential della sessione Console, quindi non occorre eseguire `aws configure`.

```bash
aws --version
aws configure list
aws sts get-caller-identity --output json --no-cli-pager
```

L'ultimo comando restituisce `UserId`, `Account` e `Arn`. L'ARN deve identificare `user/study-admin`; se contiene `root`, chiudere CloudShell, uscire dalla Console e ripetere l'accesso come IAM user. Prima di condividere uno screenshot, oscurare account ID e ARN.

Controllare la Region della sessione:

```bash
printf 'AWS_REGION=%s\n' "${AWS_REGION:-non-impostata}"
printf 'AWS_DEFAULT_REGION=%s\n' "${AWS_DEFAULT_REGION:-non-impostata}"
```

Almeno la Region effettiva mostrata dalla configurazione di CloudShell deve essere `eu-west-1`. `aws configure list` permette di vedere se il valore proviene da variabile d'ambiente, profilo o altra sorgente.

## 7 · Verificare MFA e assenza di access key

Le verifiche seguenti interrogano IAM senza modificare l'account:

```bash
aws iam get-account-summary \
  --query 'SummaryMap.AccountMFAEnabled' \
  --output text \
  --no-cli-pager
```

Il risultato atteso è `1`, che indica MFA sul root user.

```bash
aws iam list-mfa-devices \
  --user-name study-admin \
  --query 'MFADevices[].SerialNumber' \
  --output table \
  --no-cli-pager
```

La tabella deve contenere almeno il dispositivo MFA associato a `study-admin`.

```bash
aws iam list-access-keys \
  --user-name study-admin \
  --query 'AccessKeyMetadata' \
  --output json \
  --no-cli-pager
```

Il risultato atteso è:

```json
[]
```

Un array vuoto conferma che l'IAM user non possiede access key di lunga durata. CloudShell continua a funzionare perché riceve credential dalla sessione Console.

## Failure drill · Region sbagliata

Una Region errata produce spesso il falso sintomo "la risorsa non esiste". Il drill modifica soltanto le variabili della sessione CloudShell e non crea risorse.

```bash
export AWS_REGION=us-east-1
export AWS_DEFAULT_REGION=us-east-1

if [ "$AWS_REGION" != "eu-west-1" ]; then
  printf 'ERRORE CONTROLLATO: Region attuale %s, attesa eu-west-1\n' "$AWS_REGION"
fi
```

Il messaggio deve segnalare `us-east-1`. Ripristinare quindi la Region di laboratorio:

```bash
export AWS_REGION=eu-west-1
export AWS_DEFAULT_REGION=eu-west-1
aws configure list
```

Il drill mostra perché ogni laboratorio dichiara la Region e la verifica prima del provisioning.

## Teardown e verifica finale

Questo laboratorio non ha creato risorse applicative, quindi non esiste uno stack da eliminare. Chiudere la sessione CloudShell; l'ambiente standard e il suo storage persistente fino a 1 GB non hanno costo aggiuntivo.

Conservare intenzionalmente:

- MFA del root user;
- gruppo `StudyAdministrators`;
- IAM user `study-admin` con MFA e senza access key;
- budget `saa-zero-spend`;
- impostazione di accesso IAM al billing.

Controllare infine nella Billing and Cost Management console:

1. piano ancora **Free Plan**;
2. saldo crediti visibile;
3. budget `saa-zero-spend` attivo;
4. nessuna risorsa o costo inatteso nel riepilogo.

## Criteri di completamento

| Controllo | Risultato richiesto |
|---|---|
| Root user | MFA attivo, nessuna access key, non usato per CloudShell |
| `study-admin` | Console access, MFA attivo, gruppo amministrativo |
| Access key IAM | `[]` da `list-access-keys` |
| Region | `eu-west-1` dopo il recovery drill |
| Budget | `saa-zero-spend` attivo |
| Piano | Free Plan, senza Organizations o Control Tower |
| Risorse fatturabili | Nessuna creata |

## Exam lens

- Se una domanda chiede come proteggere il root user, MFA e assenza di root access key sono controlli fondamentali; creare un secondo root user non è possibile.
- Se lo scenario coinvolge più account e workforce access, IAM Identity Center e Organizations sono in genere più adatti di IAM user replicati.
- Una **SCP** limita il massimo insieme di permessi negli account di un'Organization, ma non concede da sola autorizzazioni.
- Un budget alert migliora visibility e governance, ma non garantisce un blocco istantaneo della spesa.

## Fonti

- [Choosing a plan](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html) - verificato 2026-09-04
- [Root user best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html) - verificato 2026-09-04
- [Plan access to your AWS account](https://docs.aws.amazon.com/IAM/latest/UserGuide/gs-identities.html) - verificato 2026-09-04
- [Account instances of IAM Identity Center](https://docs.aws.amazon.com/singlesignon/latest/userguide/account-instances-identity-center.html) - verificato 2026-09-04
- [Controlling access to the Billing and Cost Management console](https://docs.aws.amazon.com/cost-management/latest/userguide/control-access-billing.html) - verificato 2026-09-04
- [Using a budget template](https://docs.aws.amazon.com/cost-management/latest/userguide/budget-templates.html) - verificato 2026-09-04
- [Managing your costs with AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html) - verificato 2026-09-04
- [What is AWS CloudShell?](https://docs.aws.amazon.com/cloudshell/latest/userguide/welcome.html) - verificato 2026-09-04
- [AWS CLI · `sts get-caller-identity`](https://docs.aws.amazon.com/cli/latest/reference/sts/get-caller-identity.html) - verificato 2026-09-04
- [AWS CLI · `iam list-mfa-devices`](https://docs.aws.amazon.com/cli/latest/reference/iam/list-mfa-devices.html) - verificato 2026-09-04
- [AWS CLI · `iam list-access-keys`](https://docs.aws.amazon.com/cli/latest/reference/iam/list-access-keys.html) - verificato 2026-09-04
