# SSH e chiavi pubblica/privata

**SSH** (*Secure Shell*) è un protocollo per collegarsi in modo **sicuro** alla riga di comando di una macchina remota attraverso la rete: si apre un canale **cifrato** verso un server e lo si comanda come se si fosse seduti davanti. Nato per sostituire i vecchi protocolli in chiaro (come *telnet*, dove password e comandi viaggiavano leggibili), oggi è lo standard per amministrare server, e il suo canale sicuro viene riusato da altri strumenti: Git lo usa per `push` e `pull`, `scp`/`sftp` per copiare file, e si possono creare *tunnel* per far passare altre connessioni al sicuro.

Il punto che conta davvero, e che spesso confonde, è **come SSH verifica chi sei**. Ci sono due modi.

## Due modi per autenticarsi: password o chiavi

Il primo modo è la **password**: ci si collega e si digita la password dell'account remoto. Funziona, ma è il modo debole. La password viaggia (seppur cifrata) a ogni accesso, si può indovinare o rubare con il phishing, e spesso è la stessa riusata altrove.

Il secondo modo, quello che GitHub raccomanda, è la **coppia di chiavi**. È più sicuro per una ragione elegante: il segreto **non viene mai trasmesso**. Invece di mandare una password, si **dimostra** di possedere una chiave segreta senza mostrarla. Capire come è possibile è tutto il concetto.

## La chiave pubblica e la chiave privata

L'autenticazione a chiavi si basa sulla **crittografia asimmetrica**: non una chiave sola, ma una **coppia** di chiavi matematicamente legate, con ruoli opposti.

- La **chiave privata** è il **segreto**. Resta sul tuo computer (in `~/.ssh`), non si condivide con nessuno, non si incolla da nessuna parte. È l'equivalente della chiave di casa che tieni in tasca.
- La **chiave pubblica** è, all'opposto, fatta **per essere distribuita**. La si carica sul server (o su GitHub) senza problemi. È come un lucchetto aperto che consegni a chi vuoi: chiunque può usarlo per chiudere qualcosa a tuo nome, ma **solo** la tua chiave privata può riaprirlo.

Il legame tra le due è tale che ciò che una «chiude», solo l'altra può «aprire». Su questo si regge il trucco dell'autenticazione: non serve inviare il segreto, basta **provare di possederlo**. Concretamente, quando ti colleghi il server ti manda una **sfida** (un dato casuale); il tuo computer la **firma** con la chiave privata e rimanda indietro la firma; il server la **verifica** con la tua chiave pubblica, che ha già in archivio. Se torna, sei tu. La chiave privata non ha mai lasciato il tuo computer.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 660 192" role="img" aria-label="Autenticazione SSH a sfida e risposta: GitHub manda una sfida casuale, il Mac la firma con la chiave privata, GitHub la verifica con la chiave pubblica; la chiave privata non attraversa mai la rete" style="width:100%;max-width:660px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="36" y="60" width="168" height="82" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.7"/><text x="120" y="86" font-size="12.5" text-anchor="middle" font-weight="700">Il tuo Mac</text><text x="120" y="106" font-size="10.5" text-anchor="middle">chiave privata</text><text x="120" y="122" font-size="8.5" text-anchor="middle" opacity=".65">segreta · resta qui</text><rect x="456" y="60" width="168" height="82" rx="10" fill="var(--link,#78716c)" fill-opacity=".12" stroke="currentColor" stroke-width="1.7"/><text x="540" y="86" font-size="12.5" text-anchor="middle" font-weight="700">GitHub</text><text x="540" y="106" font-size="10.5" text-anchor="middle">chiave pubblica</text><text x="540" y="122" font-size="8.5" text-anchor="middle" opacity=".65">l'hai caricata tu</text><path d="M452 88 L212 88" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M204 88 L214 83 L214 93 Z" fill="currentColor"/><text x="330" y="80" font-size="9.5" text-anchor="middle" font-weight="600">1 · sfida casuale</text><path d="M208 116 L448 116" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M456 116 L446 111 L446 121 Z" fill="currentColor"/><text x="330" y="132" font-size="9.5" text-anchor="middle" font-weight="600">2 · firmata con la privata</text><text x="120" y="166" font-size="9" text-anchor="middle" opacity=".7">la privata non viaggia mai</text><text x="540" y="166" font-size="9" text-anchor="middle" opacity=".7">3 · verifica con la pubblica</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">L'autenticazione a <strong>sfida e risposta</strong>: GitHub manda un dato casuale, il Mac lo <strong>firma</strong> con la chiave <strong>privata</strong> e rimanda la firma, GitHub la <strong>verifica</strong> con la chiave <strong>pubblica</strong> che gli hai dato. La chiave privata resta sul Mac: si dimostra di possederla senza mai spedirla.</figcaption>
</figure>

## In pratica: SSH per Git e GitHub

La coppia di chiavi si crea con **`ssh-keygen`**, che produce due file: quello **senza** estensione (la privata, es. `id_ed25519`) e quello con estensione **`.pub`** (la pubblica, `id_ed25519.pub`).

```bash
ssh-keygen -t ed25519 -C "una-etichetta"    # crea la coppia in ~/.ssh
cat ~/.ssh/id_ed25519.pub                    # stampa la PUBBLICA, quella da caricare
```

> [!tip|label:La «randomart image» di ssh-keygen]
> Creando la chiave, `ssh-keygen` stampa un quadretto di caratteri («*the key's randomart image is:*»). È la versione **visiva** dell'**impronta** (*fingerprint*) della chiave, cioè del codice breve che la identifica in modo univoco (lo stesso che GitHub mostra accanto alla chiave). Serve a confrontare le impronte **a colpo d'occhio** (l'occhio nota una figura diversa più in fretta di una stringa diversa), utile soprattutto per le chiavi dei **server**, per accorgersi se cambiano. Per la propria chiave su GitHub si può tranquillamente ignorare. L'algoritmo che la disegna si chiama, scherzosamente, *drunken bishop*.

Ecco che aspetto ha davvero, con due chiavi diverse a confronto: bastano due impronte differenti perché le due «figure» siano diverse, ed è tutto il suo scopo.

```text
chiave A                    chiave B
+--[ED25519 256]--+     +--[ED25519 256]--+
|           .o==. |     |      o. .===.o. |
|          +E ..o |     |   . = O.+O= O ..|
|         o oo=  .|     |    = = %o.*= + .|
|          o O.. .|     |   . + B.o+ .  ..|
|      o S. o X.o.|     |    . EoSo   . . |
|     . o .+.+ Ooo|     |      ..o .   .  |
|        oo++.+..=|     |         .       |
|         o.oo  *=|     |                 |
|         .o.   o=|     |                 |
+----[SHA256]-----+     +----[SHA256]-----+
```

Da lì il flusso è semplice: si **incolla la chiave pubblica** su GitHub (nelle impostazioni, sezione *SSH keys*), la privata resta sul Mac, e si verifica che il collegamento funzioni.

```bash
ssh -T git@github.com     # se tutto è a posto: "Hi <username>!"
```

Perché conviene rispetto alla password: una volta caricata la chiave, non c'è più nulla da digitare a ogni `push`. La chiave privata di solito è protetta da una *passphrase*, che però la ricorda un aiutante di sistema (l'**ssh-agent**, su macOS integrato col Portachiavi), così la si inserisce una volta sola.

Un file di configurazione, **`~/.ssh/config`**, permette di dare dei «soprannomi» agli host e di scegliere **quale chiave** usare per ciascuno. È esattamente ciò che serve per gestire **due account** (uno personale, uno di lavoro) senza che si pestino: una chiave per account, e ogni repository usa la sua. La ricetta completa è nel vault Git.

## HTTPS o SSH? (per Git)

Un repository Git si può raggiungere in due modi, e la differenza è proprio nel modo di autenticarsi. È utile conoscerli perché spiegano parecchi intoppi.

| | HTTPS | SSH |
|---|---|---|
| URL del remote | `https://github.com/utente/repo.git` | `git@github.com:utente/repo.git` |
| Come autentica | un **token** salvato nel *credential helper* | la **chiave privata** sul tuo computer |
| Con due account | **collidono**: un solo token per host (`github.com`), vince quello sbagliato | **puliti**: una chiave per account, scelta via `~/.ssh/config` |
| Da configurare | nulla (chiede le credenziali al primo uso) | generare la coppia e caricare la pubblica una volta |

Per un account solo, HTTPS va benissimo. Quando gli account sono due sulla stessa macchina, SSH con i soprannomi degli host è la strada che evita le collisioni.

> [!warning]
> La chiave **privata** è un segreto come una password: non si incolla in chat, non si mette in un blocco note condiviso, non si carica da nessuna parte. Ciò che si condivide è **sempre e solo** il file `.pub` (la pubblica). Se una chiave privata viene esposta, la si rimuove dagli account dove la pubblica era caricata e se ne genera una nuova.

> [!tip]
> Come distinguere i due file a colpo d'occhio: la **pubblica** è una riga sola che inizia con `ssh-ed25519 …` (o `ssh-rsa …`); la **privata** è un blocco di più righe che inizia con `-----BEGIN OPENSSH PRIVATE KEY-----`. Se una cosa non somiglia a nessuna delle due, non è una chiave SSH.
