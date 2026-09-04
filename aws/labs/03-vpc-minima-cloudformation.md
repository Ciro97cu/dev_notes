# LAB 03 · Una VPC minima con CloudFormation

Questo laboratorio costruisce la rete descritta nel modulo [03](../docs/03-vpc-network-security.md): una VPC con una **subnet pubblica** (con rotta verso l'Internet Gateway) e una **subnet privata** (senza), più un **security group**. Tutto viene creato da un template CloudFormation, ispezionato dalla CLI e infine rimosso. Non si accende alcun NAT Gateway né alcuna istanza EC2, quindi il costo resta zero: VPC, subnet, Internet Gateway, route table e security group non hanno tariffa.

> [!info|label:SAA-C03 · D1T2]
> Esercita la costruzione di una VPC, la differenza pratica fra subnet pubblica e privata (che dipende dalla route table), il security group e l'Infrastructure as Code con CloudFormation. Rende evidente il confine di rete su cui poggiano tutti i workload successivi.

## Cost guardrail

| Voce | Vincolo del laboratorio |
|---|---|
| Piano | **Free Plan**, account inizializzato nel [LAB 01](01-bootstrap-account.md) |
| Region operativa | `eu-west-1` · Europe (Ireland) |
| Risorse create | VPC, IGW, 2 subnet, route table, security group (**tutte gratuite**) |
| Costo intenzionale | **0 USD** |
| Servizi da non attivare | NAT Gateway, EC2, Elastic IP (hanno costo) |
| Durata indicativa | 30-40 minuti |

> [!warning|label:Cosa NON si crea, e perché]
> Il NAT Gateway, gli Elastic IP in uso e le istanze EC2 hanno un costo. Questo laboratorio si ferma allo strato di rete, che è gratuito: costruisce e ispeziona la topologia senza accendere nulla di fatturabile. Chi volesse provare la connettività reale lo farà in una finestra breve e con costo dichiarato, oppure in un sandbox gestito. *(verificato: 2026-09-04)*

## Architettura

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 250" role="img" aria-label="Lo stack crea una VPC 10.20.0.0/16 con una subnet pubblica (route table con rotta 0.0.0.0/0 verso l'Internet Gateway e un security group che consente la 443) e una subnet privata senza rotta verso internet." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="lab3-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="305" y="12" width="110" height="32" rx="7" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6"/>
    <text x="360" y="33" font-size="11" text-anchor="middle">Internet Gateway</text>
    <rect x="40" y="64" width="640" height="170" rx="12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-dasharray="9 6"/>
    <text x="56" y="86" font-size="12" font-weight="700">VPC · 10.20.0.0/16</text>
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.4">
      <rect x="70" y="100" width="290" height="114" rx="8"/>
      <rect x="390" y="100" width="260" height="114" rx="8"/>
    </g>
    <g text-anchor="middle">
      <text x="215" y="126" font-size="12" font-weight="700">subnet pubblica</text>
      <text x="215" y="146" font-size="10" fill-opacity=".72" font-family="ui-monospace,Menlo,monospace">10.20.1.0/24</text>
      <text x="215" y="172" font-size="10.5">route table → IGW</text>
      <text x="215" y="194" font-size="10.5">security group: allow 443</text>
      <text x="520" y="126" font-size="12" font-weight="700">subnet privata</text>
      <text x="520" y="146" font-size="10" fill-opacity=".72" font-family="ui-monospace,Menlo,monospace">10.20.2.0/24</text>
      <text x="520" y="174" font-size="10.5">nessuna rotta a internet</text>
      <text x="520" y="194" font-size="9" fill-opacity=".7">(usa la main route table)</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#lab3-arrow)">
      <path d="M215 100 L352 46"/>
    </g>
    <text x="300" y="74" font-size="9" fill-opacity=".75" text-anchor="middle">0.0.0.0/0</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">La differenza fra le due subnet non è un'etichetta ma la <strong>route table</strong>: la pubblica ha una rotta <code>0.0.0.0/0</code> verso l'IGW, la privata no. Lo stack non crea né NAT né istanze.</figcaption>
</figure>

## Prerequisiti

- Il [LAB 01](01-bootstrap-account.md) completato e una sessione **AWS CloudShell** aperta come `study-admin` in `eu-west-1`.
- Nessuna access key: CloudShell fornisce da sé le credenziali della sessione.

## 1 · Descrivere la rete in CloudFormation

Nella home di CloudShell creare il file:

```yaml
# vpc-lab.yaml — VPC minima a costo zero: subnet pubblica e privata, IGW, security group
AWSTemplateFormatVersion: '2010-09-09'
Description: SAA LAB 03 - VPC minima con subnet pubblica/privata e security group

Resources:
  LabVpc:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.20.0.0/16
      EnableDnsHostnames: true
      Tags: [{ Key: Name, Value: saa-lab-vpc }, { Key: Project, Value: dev-notes-saa }]

  Igw:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags: [{ Key: Name, Value: saa-lab-igw }]

  IgwAttach:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      VpcId: !Ref LabVpc
      InternetGatewayId: !Ref Igw

  PublicSubnet:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref LabVpc
      CidrBlock: 10.20.1.0/24
      AvailabilityZone: eu-west-1a
      Tags: [{ Key: Name, Value: saa-lab-public }]

  PrivateSubnet:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref LabVpc
      CidrBlock: 10.20.2.0/24
      AvailabilityZone: eu-west-1a
      Tags: [{ Key: Name, Value: saa-lab-private }]

  PublicRouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref LabVpc
      Tags: [{ Key: Name, Value: saa-lab-public-rt }]

  PublicDefaultRoute:                 # la rotta che rende "pubblica" la subnet
    Type: AWS::EC2::Route
    DependsOn: IgwAttach
    Properties:
      RouteTableId: !Ref PublicRouteTable
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref Igw

  PublicAssoc:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref PublicSubnet
      RouteTableId: !Ref PublicRouteTable

  WebSg:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: consente HTTPS in ingresso
      VpcId: !Ref LabVpc
      SecurityGroupIngress:
        - { IpProtocol: tcp, FromPort: 443, ToPort: 443, CidrIp: 0.0.0.0/0, Description: HTTPS }
      Tags: [{ Key: Name, Value: saa-lab-web-sg }]

Outputs:
  VpcId:            { Value: !Ref LabVpc }
  PublicSubnetId:   { Value: !Ref PublicSubnet }
  PrivateSubnetId:  { Value: !Ref PrivateSubnet }
```

La subnet privata **non** è associata ad alcuna route table: eredita quindi la **main route table** della VPC, che contiene solo la rotta locale e nessuna via verso internet. È privata proprio per questo. Distribuire lo stack (nessuna capability IAM richiesta, perché non crea identità):

```bash
aws cloudformation deploy \
  --stack-name saa-lab-03-vpc \
  --template-file vpc-lab.yaml \
  --region eu-west-1 \
  --no-cli-pager
```

## 2 · Ispezionare la VPC e le subnet

Recuperare l'ID della VPC dagli output dello stack e osservare le due subnet:

```bash
VPC_ID=$(aws cloudformation describe-stacks \
  --stack-name saa-lab-03-vpc \
  --query "Stacks[0].Outputs[?OutputKey=='VpcId'].OutputValue" \
  --output text --no-cli-pager)

aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=${VPC_ID}" \
  --query 'Subnets[].{Nome:Tags[?Key==`Name`]|[0].Value, CIDR:CidrBlock, AZ:AvailabilityZone}' \
  --output table --no-cli-pager
```

La tabella deve mostrare `saa-lab-public` (10.20.1.0/24) e `saa-lab-private` (10.20.2.0/24), entrambe in `eu-west-1a`.

## 3 · Verificare la differenza pubblica / privata

È qui che il concetto diventa concreto. La route table della subnet **pubblica** deve contenere una rotta verso l'IGW:

```bash
PUBLIC_SUBNET_ID=$(aws cloudformation describe-stacks \
  --stack-name saa-lab-03-vpc \
  --query "Stacks[0].Outputs[?OutputKey=='PublicSubnetId'].OutputValue" \
  --output text --no-cli-pager)

aws ec2 describe-route-tables \
  --filters "Name=association.subnet-id,Values=${PUBLIC_SUBNET_ID}" \
  --query 'RouteTables[].Routes[].{Destinazione:DestinationCidrBlock, Target:GatewayId}' \
  --output table --no-cli-pager
```

Nell'output compare una rotta `0.0.0.0/0` con target un `igw-…`: è la firma di una subnet pubblica. La subnet **privata**, non associata a route table custom, ricade sulla main route table della VPC:

```bash
aws ec2 describe-route-tables \
  --filters "Name=vpc-id,Values=${VPC_ID}" "Name=association.main,Values=true" \
  --query 'RouteTables[].Routes[].{Destinazione:DestinationCidrBlock, Target:GatewayId}' \
  --output table --no-cli-pager
```

Qui c'è **solo** la rotta locale (`10.20.0.0/16` con target `local`) e **nessun** `igw-…`: la subnet privata non ha una via verso internet. La differenza fra le due subnet è tutta in queste due tabelle.

## 4 · Osservare il security group

```bash
aws ec2 describe-security-groups \
  --filters "Name=vpc-id,Values=${VPC_ID}" "Name=group-name,Values=saa-lab-web-sg" \
  --query 'SecurityGroups[].IpPermissions' \
  --output json --no-cli-pager
```

L'output mostra una sola regola in ingresso sulla porta 443. Non compaiono regole in uscita esplicite per la risposta: essendo il security group **stateful**, la risposta è consentita in automatico.

## Failure drill · un CIDR fuori dalla VPC

Una subnet deve stare **dentro** il CIDR della VPC. Tentare di crearne una fuori intervallo produce un errore controllato e non lascia nulla:

```bash
aws ec2 create-subnet \
  --vpc-id "${VPC_ID}" \
  --cidr-block 192.168.0.0/24 \
  --region eu-west-1 --no-cli-pager
```

Il comando fallisce con un errore simile a:

```text
An error occurred (InvalidSubnet.Range) when calling the CreateSubnet operation:
The CIDR '192.168.0.0/24' is invalid.
```

`192.168.0.0/24` non appartiene a `10.20.0.0/16`, quindi AWS rifiuta. È il promemoria pratico che l'indirizzamento delle subnet è vincolato a quello della VPC: nessuna risorsa viene creata e non c'è nulla da ripulire.

## Teardown e verifica finale

Un solo comando smonta l'intera rete:

```bash
aws cloudformation delete-stack --stack-name saa-lab-03-vpc --region eu-west-1 --no-cli-pager
aws cloudformation wait stack-delete-complete --stack-name saa-lab-03-vpc --region eu-west-1
```

Verificare che la VPC non esista più:

```bash
aws ec2 describe-vpcs \
  --filters "Name=tag:Name,Values=saa-lab-vpc" \
  --query 'Vpcs[].VpcId' --output text --no-cli-pager
```

L'output deve essere vuoto. Nessuna risorsa fatturabile è mai stata creata; smontando la VPC spariscono anche IGW, subnet, route table e security group creati dallo stack.

## Criteri di completamento

| Controllo | Risultato richiesto |
|---|---|
| Stack | `saa-lab-03-vpc` creato senza capability IAM, poi eliminato |
| Subnet | `saa-lab-public` e `saa-lab-private` presenti in `eu-west-1a` |
| Subnet pubblica | la sua route table ha `0.0.0.0/0 → igw-…` |
| Subnet privata | la main route table ha solo la rotta `local`, nessun IGW |
| Security group | una regola in ingresso sulla 443, nessuna uscita esplicita |
| Failure drill | `create-subnet` fuori CIDR restituisce `InvalidSubnet.Range` |
| Costo | nessun NAT, EC2 o EIP creato; teardown completato |

## Exam lens

- Rendere «pubblica» una subnet significa aggiungere alla sua route table una rotta `0.0.0.0/0 → IGW`, non spuntare un'opzione: una domanda che presenta una subnet «privata» che deve esporre un servizio va letta sul routing.
- Il security group creato ha solo una regola in ingresso: la risposta esce da sé perché è stateful. Se lo scenario usasse una network ACL, la risposta richiederebbe una regola in uscita sulle porte effimere.
- La rete (VPC, subnet, route table, security group) non ha costo: nelle domande di costo la spesa arriva da NAT Gateway, Elastic IP in uso, trasferimento dati ed endpoint, non dalla topologia in sé.

## Fonti

- [`AWS::EC2::VPC` (CloudFormation)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-vpc.html) - verificato 2026-09-04
- [`AWS::EC2::Subnet` (CloudFormation)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-subnet.html) - verificato 2026-09-04
- [`AWS::EC2::Route` (CloudFormation)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-route.html) - verificato 2026-09-04
- [`ec2 describe-route-tables` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-route-tables.html) - verificato 2026-09-04
- [`ec2 create-subnet` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/ec2/create-subnet.html) - verificato 2026-09-04
- [Subnets for your VPC](https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html) - verificato 2026-09-04
