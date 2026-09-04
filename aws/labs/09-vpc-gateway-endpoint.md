# LAB 09 · Connettività privata a S3 con un gateway endpoint

Questo laboratorio crea un **gateway endpoint** per Amazon S3 dentro una VPC, come accennato nel modulo [09](09-edge-networking-hybrid.md) e nel [modulo 03](../docs/03-vpc-network-security.md): un modo di raggiungere S3 **senza uscire su internet**, senza Internet Gateway né NAT. Il gateway endpoint per S3 è **gratuito**, quindi il costo resta zero. Si osserva la rotta privata che l'endpoint aggiunge alla route table.

> [!info|label:SAA-C03 · D3T4 e base D1T2]
> Esercita la connettività privata verso i servizi AWS con un gateway endpoint, la rotta verso il *prefix list* di S3 e il principio di tenere il traffico dentro la rete AWS. È la controparte «privata» dei collegamenti ibridi.

## Cost guardrail

| Voce | Vincolo del laboratorio |
|---|---|
| Piano | **Free Plan**, account inizializzato nel [LAB 01](01-bootstrap-account.md) |
| Region operativa | `eu-west-1` · Europe (Ireland) |
| Risorse create | una VPC, una route table e un **gateway endpoint** per S3 (gratuito) |
| Costo intenzionale | **0 USD** (i gateway endpoint per S3/DynamoDB non hanno costo) |
| Servizi da non attivare | interface endpoint (a pagamento), NAT Gateway, istanze |
| Durata indicativa | 25-30 minuti |

> [!warning|label:Gateway, non interface]
> Solo i **gateway endpoint** (S3 e DynamoDB) sono gratuiti e si configurano come una rotta. Gli **interface endpoint** (PrivateLink), per gli altri servizi, hanno una tariffa oraria e di traffico: qui non si creano. *(verificato: 2026-09-04)*

## Architettura

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 200" role="img" aria-label="Dentro una VPC, la route table ha una rotta verso il prefix list di S3 che punta a un gateway endpoint; il traffico verso S3 resta nella rete AWS senza passare da Internet Gateway o NAT." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="l9-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="30" y="40" width="330" height="120" rx="11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="9 6"/>
    <text x="46" y="62" font-size="11" font-weight="700">VPC · 10.40.0.0/16</text>
    <rect x="54" y="80" width="180" height="58" rx="8" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.4"/>
    <text x="144" y="103" font-size="10.5" text-anchor="middle" font-weight="700">route table</text>
    <text x="144" y="122" font-size="8.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" fill-opacity=".75">pl-S3 → vpce-…</text>
    <rect x="262" y="82" width="82" height="54" rx="8" fill="var(--link,#9a4d00)" fill-opacity=".16" stroke="var(--link,#9a4d00)" stroke-width="1.4"/>
    <text x="303" y="104" font-size="9.5" text-anchor="middle">gateway</text>
    <text x="303" y="118" font-size="9.5" text-anchor="middle">endpoint</text>
    <rect x="560" y="76" width="130" height="60" rx="9" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6"/>
    <text x="625" y="103" font-size="12" text-anchor="middle" font-weight="700">Amazon S3</text>
    <text x="625" y="121" font-size="8.5" text-anchor="middle" fill-opacity=".7">rete AWS</text>
    <path d="M360 106 L558 106" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#l9-arrow)"/>
    <text x="458" y="98" font-size="9" text-anchor="middle" fill-opacity=".8">traffico privato · niente IGW/NAT</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Il gateway endpoint aggiunge alla route table una rotta verso il <em>prefix list</em> di S3 (<code>pl-…</code>): il traffico verso S3 esce dalla VPC restando nella rete AWS, senza Internet Gateway né NAT, e senza costo.</figcaption>
</figure>

## Prerequisiti

- Il [LAB 01](01-bootstrap-account.md) completato e una sessione **AWS CloudShell** come `study-admin` in `eu-west-1`.

## 1 · Creare VPC, route table ed endpoint in CloudFormation

Creare in CloudShell il file:

```yaml
# endpoint-lab.yaml — gateway endpoint per S3 (gratuito)
AWSTemplateFormatVersion: '2010-09-09'
Description: SAA LAB 09 - gateway endpoint S3

Resources:
  LabVpc:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.40.0.0/16
      Tags: [{ Key: Name, Value: saa-lab-endpoint-vpc }]

  RouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref LabVpc
      Tags: [{ Key: Name, Value: saa-lab-endpoint-rt }]

  S3Endpoint:
    Type: AWS::EC2::VPCEndpoint
    Properties:
      VpcId: !Ref LabVpc
      ServiceName: !Sub 'com.amazonaws.${AWS::Region}.s3'
      VpcEndpointType: Gateway
      RouteTableIds: [!Ref RouteTable]

Outputs:
  VpcId:        { Value: !Ref LabVpc }
  EndpointId:   { Value: !Ref S3Endpoint }
  RouteTableId: { Value: !Ref RouteTable }
```

Distribuire lo stack:

```bash
aws cloudformation deploy \
  --stack-name saa-lab-09-endpoint \
  --template-file endpoint-lab.yaml \
  --region eu-west-1 --no-cli-pager
```

## 2 · Osservare l'endpoint

```bash
VPC_ID=$(aws cloudformation describe-stacks \
  --stack-name saa-lab-09-endpoint \
  --query "Stacks[0].Outputs[?OutputKey=='VpcId'].OutputValue" \
  --output text --no-cli-pager)

aws ec2 describe-vpc-endpoints \
  --filters "Name=vpc-id,Values=${VPC_ID}" \
  --query 'VpcEndpoints[].{Servizio:ServiceName, Tipo:VpcEndpointType, Stato:State}' \
  --output table --no-cli-pager
```

La tabella mostra il servizio `...s3`, il tipo `Gateway` e lo stato `available`.

## 3 · Verificare la rotta privata nella route table

Il valore didattico è qui: l'endpoint ha aggiunto alla route table una rotta verso il **prefix list** di S3.

```bash
RT_ID=$(aws cloudformation describe-stacks \
  --stack-name saa-lab-09-endpoint \
  --query "Stacks[0].Outputs[?OutputKey=='RouteTableId'].OutputValue" \
  --output text --no-cli-pager)

aws ec2 describe-route-tables \
  --route-table-ids "$RT_ID" \
  --query 'RouteTables[].Routes[].{Destinazione:DestinationPrefixListId, Target:GatewayId, Stato:State}' \
  --output table --no-cli-pager
```

Compare una rotta con **Destinazione** un `pl-…` (il prefix list di S3) e **Target** un `vpce-…` (l'endpoint): è la via privata verso S3. Non c'è alcuna rotta `0.0.0.0/0` verso un Internet Gateway, perché non serve uscire su internet.

## Failure drill · un gateway endpoint per un servizio non supportato

I gateway endpoint esistono **solo** per S3 e DynamoDB. Chiederne uno per un altro servizio è un errore controllato:

```bash
aws ec2 create-vpc-endpoint \
  --vpc-id "$VPC_ID" \
  --vpc-endpoint-type Gateway \
  --service-name "com.amazonaws.eu-west-1.ec2" \
  --region eu-west-1 --no-cli-pager
```

Il comando fallisce con un messaggio simile a:

```text
An error occurred (InvalidServiceName) when calling the CreateVpcEndpoint operation:
The Vpc Endpoint Service 'com.amazonaws.eu-west-1.ec2' does not support the endpoint type 'Gateway'.
```

Per un servizio diverso da S3/DynamoDB servirebbe un **interface endpoint** (a pagamento). Nulla viene creato.

## Teardown e verifica finale

```bash
aws cloudformation delete-stack --stack-name saa-lab-09-endpoint --region eu-west-1 --no-cli-pager
aws cloudformation wait stack-delete-complete --stack-name saa-lab-09-endpoint --region eu-west-1
```

Verificare che la VPC non esista più:

```bash
aws ec2 describe-vpcs \
  --filters "Name=tag:Name,Values=saa-lab-endpoint-vpc" \
  --query 'Vpcs[].VpcId' --output text --no-cli-pager
```

L'output deve essere vuoto: VPC, route table ed endpoint sono spariti con lo stack. Nessuna risorsa fatturabile è mai stata creata.

## Criteri di completamento

| Controllo | Risultato richiesto |
|---|---|
| Stack | `saa-lab-09-endpoint` creato |
| Endpoint | tipo `Gateway`, servizio `s3`, stato `available` |
| Rotta | la route table ha `pl-… → vpce-…` (nessun IGW) |
| Failure drill | il gateway endpoint per `ec2` restituisce `InvalidServiceName` |
| Teardown | stack eliminato, la VPC non esiste più |

## Exam lens

- Per raggiungere **S3 o DynamoDB** da subnet private senza internet, la risposta è un **gateway endpoint**, gratuito: evita il NAT e riduce sia la superficie d'attacco sia il costo del traffico.
- Per gli **altri** servizi serve un **interface endpoint** (PrivateLink), che è a pagamento: una domanda di costo che confronta «S3 via NAT» e «S3 via endpoint» premia il gateway endpoint.
- Un gateway endpoint si materializza come una **rotta** verso il prefix list del servizio, non come un'interfaccia: sta nella route table, non nella subnet.

## Fonti

- [Gateway endpoints (S3, DynamoDB)](https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html) - verificato 2026-09-04
- [`AWS::EC2::VPCEndpoint` (CloudFormation)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-vpcendpoint.html) - verificato 2026-09-04
- [`ec2 describe-route-tables` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-route-tables.html) - verificato 2026-09-04
- [`ec2 create-vpc-endpoint` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/ec2/create-vpc-endpoint.html) - verificato 2026-09-04
