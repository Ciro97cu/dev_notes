# LAB 02 · Role a privilegi limitati e credenziali temporanee

Questo laboratorio mette in pratica il cuore del modulo [02](../docs/02-iam-identita-multi-account.md): si crea una **IAM role** con permessi volutamente ristretti, la si **assume** da AWS CloudShell ottenendo credenziali temporanee, e si osserva dal vivo la differenza fra un'operazione **consentita** e una **negata**. Tutto avviene in un solo account Free Plan, a costo zero, senza creare access key e senza mai stampare credenziali sensibili.

> [!info|label:SAA-C03 · D1T1]
> Esercita role assumption, `sts:AssumeRole`, credenziali temporanee, least privilege e l'effetto pratico della policy evaluation (un `AccessDenied` per assenza di allow). L'infrastruttura è descritta in CloudFormation per renderla ripetibile e cancellabile in modo pulito.

## Cost guardrail

| Voce | Vincolo del laboratorio |
|---|---|
| Piano | **Free Plan**, account già inizializzato nel [LAB 01](01-bootstrap-account.md) |
| Region operativa | `eu-west-1` · Europe (Ireland) |
| Risorse create | una **IAM role** via stack CloudFormation (IAM è globale, nessun costo) |
| Costo intenzionale | **0 USD** |
| Servizi da non attivare | AWS Organizations, Control Tower, qualsiasi access key |
| Durata indicativa | 30-45 minuti |

IAM e STS non hanno costo. L'unica operazione «consentita» che si esegue è `aws s3 ls`, che elenca i bucket e non ne crea alcuno: nessuna risorsa fatturabile nasce in questo laboratorio.

> [!warning|label:Niente access key, niente Organizations]
> Non si crea alcuna access key, né per il root user né per `study-admin`: la role si assume attraverso la sessione già autenticata di CloudShell. Non si abilita AWS Organizations, che nel Free Plan provocherebbe l'upgrade automatico al Paid Plan. *(verificato: 2026-09-04)*

## Architettura

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 230" role="img" aria-label="study-admin da CloudShell assume la role saa-lab-inspector, che concede solo s3:ListAllMyBuckets; l'operazione aws s3 ls è consentita, mentre aws iam list-users viene negata con AccessDenied." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="lab-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6">
      <rect x="24" y="84" width="160" height="62" rx="9"/>
      <rect x="258" y="80" width="204" height="70" rx="9"/>
      <rect x="536" y="32" width="172" height="52" rx="8"/>
    </g>
    <rect x="536" y="146" width="172" height="52" rx="8" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6" stroke-dasharray="6 4"/>
    <g text-anchor="middle">
      <text x="104" y="111" font-size="12" font-weight="700">study-admin</text>
      <text x="104" y="130" font-size="9.5" fill-opacity=".72">in CloudShell</text>
      <text x="360" y="107" font-size="12.5" font-weight="700">role saa-lab-inspector</text>
      <text x="360" y="127" font-size="9.5" fill-opacity=".72" font-family="ui-monospace,Menlo,monospace">s3:ListAllMyBuckets</text>
      <text x="622" y="54" font-size="10.5" font-family="ui-monospace,Menlo,monospace">aws s3 ls</text>
      <text x="622" y="71" font-size="9.5" fill-opacity=".72">consentito</text>
      <text x="622" y="168" font-size="10" font-family="ui-monospace,Menlo,monospace">aws iam list-users</text>
      <text x="622" y="185" font-size="9.5" fill-opacity=".72">AccessDenied</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.7" marker-end="url(#lab-arrow)">
      <path d="M184 115 L254 115"/>
      <path d="M462 104 L532 62"/>
      <path d="M462 128 L532 168"/>
    </g>
    <text x="219" y="107" font-size="9" text-anchor="middle" fill-opacity=".8">AssumeRole</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">La role concede un solo permesso. La stessa sessione che la assume può fare <code>s3 ls</code> ma non <code>iam list-users</code>: il secondo comando ricade nel default deny e restituisce <code>AccessDenied</code>.</figcaption>
</figure>

Il dettaglio interessante è che `study-admin` possiede `AdministratorAccess` e da solo *potrebbe* elencare gli utenti IAM; assumendo la role, però, opera con i **soli** permessi della role, più stretti dei propri. È least privilege in azione: si scende di privilegio assumendo un'identità apposita.

## Prerequisiti

- Il [LAB 01](01-bootstrap-account.md) completato: `study-admin` con MFA e accesso alla Console, nessuna access key.
- Una sessione **AWS CloudShell** aperta come `study-admin` nella Region `eu-west-1`.
- Nessuna credenziale statica configurata: CloudShell fornisce da sé le credenziali della sessione.

Verificare l'identità di partenza prima di cominciare:

```bash
aws sts get-caller-identity --output json --no-cli-pager
```

L'`Arn` deve contenere `user/study-admin`. Se contiene `root`, uscire e rientrare come IAM user.

## 1 · Creare la role con CloudFormation

Descrivere la role in un template rende lo scenario ripetibile e, soprattutto, cancellabile in un colpo solo. Nella home di CloudShell creare il file:

```yaml
# inspector-role.yaml — una role a privilegi minimi per esercitare STS
AWSTemplateFormatVersion: '2010-09-09'
Description: SAA LAB 02 - role a privilegi limitati per role assumption

Resources:
  InspectorRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: saa-lab-inspector
      AssumeRolePolicyDocument:          # trust policy: CHI puo assumerla
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              AWS: !Sub 'arn:aws:iam::${AWS::AccountId}:root'
            Action: 'sts:AssumeRole'
      Policies:
        - PolicyName: inspector-readonly  # permission policy: COSA puo fare
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action: 's3:ListAllMyBuckets'
                Resource: '*'
      Tags:
        - { Key: Project, Value: dev-notes-saa }
        - { Key: Environment, Value: lab }
        - { Key: ManagedBy, Value: cloudformation }
```

La trust policy nomina `arn:aws:iam::<ACCOUNT_ID>:root`, cioè delega la decisione alle IAM policy dell'account: qualunque principal dell'account che possieda `sts:AssumeRole` (come `study-admin` con `AdministratorAccess`) può assumerla. La permission policy concede **una sola** azione. Distribuire lo stack:

```bash
aws cloudformation deploy \
  --stack-name saa-lab-02-iam \
  --template-file inspector-role.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --region eu-west-1 \
  --no-cli-pager
```

> [!warning|label:Perché CAPABILITY_NAMED_IAM]
> Lo stack crea una risorsa IAM con un **nome esplicito** (`RoleName: saa-lab-inspector`). CloudFormation esige che questa capacità sia dichiarata apposta: senza `--capabilities CAPABILITY_NAMED_IAM` il deploy viene rifiutato. È un consenso esplicito a creare identità con nomi fissi.

## 2 · Configurare il profilo che assume la role

Per assumere la role **senza** mai maneggiare Access Key, Secret o Session Token, si definisce un profilo della CLI che la assume da sé. Recuperare l'account ID e scrivere il profilo:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --no-cli-pager)

cat >> ~/.aws/config <<EOF

[profile saa-lab]
role_arn = arn:aws:iam::${ACCOUNT_ID}:role/saa-lab-inspector
credential_source = EcsContainer
region = eu-west-1
EOF
```

Con `credential_source = EcsContainer` la CLI usa le credenziali che CloudShell espone tramite l'endpoint del container come **sorgente** per chiamare `sts:AssumeRole`; le credenziali temporanee restano interne alla CLI e non vengono mai stampate. Da qui in avanti, ogni comando con `--profile saa-lab` gira **come la role**.

## 3 · Verificare l'assunzione della role

```bash
aws sts get-caller-identity --profile saa-lab --output json --no-cli-pager
```

L'`Arn` non contiene più `user/study-admin` ma qualcosa come `assumed-role/saa-lab-inspector/botocore-session-…`. È la prova che la sessione ora agisce come la role. Nessun secret è comparso a schermo: la CLI ha assunto la role internamente.

## 4 · L'operazione consentita

La role concede `s3:ListAllMyBuckets`, quindi elencare i bucket è permesso:

```bash
aws s3 ls --profile saa-lab --no-cli-pager
```

Il comando restituisce l'elenco dei bucket (eventualmente vuoto, se non ne esistono) e termina senza errore. È il ramo «allow esplicito» della policy evaluation.

## 5 · Failure drill · l'operazione negata (`AccessDenied`)

Ora un'operazione che la role **non** concede. Elencare gli utenti IAM richiede `iam:ListUsers`, assente dalla permission policy:

```bash
aws iam list-users --profile saa-lab --no-cli-pager
```

Il comando fallisce con un errore simile a:

```text
An error occurred (AccessDenied) when calling the ListUsers operation:
User: arn:aws:sts::<ACCOUNT_ID>:assumed-role/saa-lab-inspector/... is not authorized
to perform: iam:ListUsers because no identity-based policy allows the iam:ListUsers action
```

È il **default deny** al lavoro: nessuna policy concede l'azione, quindi la richiesta è negata. Il drill è sicuro e reversibile, perché non modifica nulla. Per rendere evidente il contrasto, eseguire lo **stesso** comando con l'identità di partenza:

```bash
aws iam list-users --query 'Users[].UserName' --output table --no-cli-pager
```

Senza `--profile`, il comando gira come `study-admin` (amministratore) e **riesce**. La stessa persona, attraverso la role, ha meno potere: è esattamente ciò che si vuole ottenere con il least privilege.

## Teardown e verifica finale

Rimuovere prima lo stack, che elimina la role:

```bash
aws cloudformation delete-stack --stack-name saa-lab-02-iam --region eu-west-1 --no-cli-pager
aws cloudformation wait stack-delete-complete --stack-name saa-lab-02-iam --region eu-west-1
```

Poi togliere il blocco `[profile saa-lab]` aggiunto a `~/.aws/config` (aprirlo con `nano ~/.aws/config` ed eliminare quelle righe). Verificare infine che la role non esista più:

```bash
aws iam get-role --role-name saa-lab-inspector --no-cli-pager
```

Il comando deve fallire con `NoSuchEntity`: conferma che nulla è rimasto. Nessuna risorsa fatturabile è mai stata creata.

## Criteri di completamento

| Controllo | Risultato richiesto |
|---|---|
| Stack | `saa-lab-02-iam` creato con `CAPABILITY_NAMED_IAM`, poi eliminato |
| Assunzione | `get-caller-identity --profile saa-lab` mostra `assumed-role/saa-lab-inspector` |
| Operazione consentita | `aws s3 ls --profile saa-lab` termina senza errore |
| Operazione negata | `aws iam list-users --profile saa-lab` restituisce `AccessDenied` |
| Contrasto di privilegio | lo stesso comando riesce come `study-admin`, fallisce come la role |
| Credenziali | nessuna access key creata, nessun secret o session token stampato |
| Teardown | `get-role` su `saa-lab-inspector` restituisce `NoSuchEntity` |

## Exam lens

- Un `AccessDenied` «because no identity-based policy allows…» indica un **implicit deny**: manca l'allow, non c'è un deny esplicito. La correzione è aggiungere il permesso mancante alla policy della role, non «togliere un divieto».
- Dare a un principal permessi **temporanei e ristretti** è un caso da **role + STS**, non da nuove access key sull'utente.
- Se un requisito chiede che un'identità non possa mai superare un certo insieme di azioni, la leva è una **permissions boundary** (sull'identità) o una **SCP** (sull'organizzazione), non la sola permission policy.
- La trust policy risponde a «chi può assumere», la permission policy a «cosa può fare»: uno scenario che confonde le due porta a diagnosi sbagliate.

## Fonti

- [`sts assume-role` (AWS CLI Reference)](https://docs.aws.amazon.com/cli/latest/reference/sts/assume-role.html) - verificato 2026-09-04
- [`sts get-caller-identity` (AWS CLI Reference)](https://docs.aws.amazon.com/cli/latest/reference/sts/get-caller-identity.html) - verificato 2026-09-04
- [Using an IAM role in the AWS CLI (`role_arn`, `credential_source`)](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-role.html) - verificato 2026-09-04
- [AWS::IAM::Role (CloudFormation)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-iam-role.html) - verificato 2026-09-04
- [Acknowledging IAM resources in CloudFormation templates (CAPABILITY_NAMED_IAM)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-iam-template.html) - verificato 2026-09-04
- [Policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html) - verificato 2026-09-04
