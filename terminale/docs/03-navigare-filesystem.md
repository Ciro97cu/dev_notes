# 03 · Navigare nel filesystem

Muoversi nel terminale significa, prima di tutto, sapere **dove ci si trova** e come spostarsi tra le cartelle. Ogni comando si esegue infatti *stando* in una certa directory, e agisce di default lì: capire come è organizzato il filesystem e come indicarne i percorsi è quindi il primo passo pratico, quello che rende tutto il resto naturale.

## Il filesystem è un albero

Su macOS e Linux tutti i file e le cartelle formano un **unico albero** che parte da una radice chiamata `/` (*root*). Non esistono le «lettere di unità» di Windows (`C:`, `D:`): anche i dischi esterni e le altre risorse compaiono come cartelle *dentro* quell'unico albero. Ogni utente ha poi una propria **home**, la cartella personale dove tiene i suoi file, che su macOS si trova in `/Users/<nome>` e ha un'abbreviazione comodissima: la tilde `~`.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 560 250" role="img" aria-label="Albero del filesystem: la radice / contiene Applications, opt, Users; dentro Users c'è la home ciro (~), che contiene Documenti e progetti, e progetti contiene app" style="width:100%;max-width:520px;height:auto;color:inherit"><g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" fill="currentColor" font-size="14"><text x="24" y="34">/</text><text x="150" y="34" font-family="system-ui,Arial,sans-serif" font-size="9.5" opacity=".6">← la radice (root)</text><text x="40" y="64">├─ Applications/</text><text x="40" y="90">├─ opt/homebrew/</text><text x="40" y="116">└─ Users/</text><text x="70" y="142" font-weight="700" fill="var(--link,#78716c)">└─ ciro/</text><text x="185" y="142" font-family="system-ui,Arial,sans-serif" font-size="9.5" fill="var(--link,#78716c)">← ~ (la tua home · sei qui)</text><text x="100" y="168">├─ Documenti/</text><text x="100" y="194" font-weight="700" fill="var(--link,#78716c)">└─ progetti/</text><text x="130" y="220">└─ app/</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Un solo albero dalla radice <code>/</code>. La <strong>home</strong> dell'utente <code>ciro</code> è <code>/Users/ciro</code>, che si abbrevia con <code>~</code>. Stando in <code>~</code>, la cartella <code>progetti</code> si può nominare come percorso <strong>assoluto</strong> <code>/Users/ciro/progetti</code> oppure <strong>relativo</strong> <code>progetti</code> (o <code>./progetti</code>).</figcaption>
</figure>

## Percorsi assoluti e relativi

Per indicare una cartella o un file ci sono due modi, da non confondere fra loro. Un percorso è **assoluto** quando parte dalla radice `/`: descrive la posizione in modo completo e non ambiguo, valido da qualunque punto ci si trovi (per esempio `/Users/ciro/progetti`). Un percorso è **relativo** quando parte dalla **cartella corrente**: è più corto ma il suo significato dipende da dove ci si trova in quel momento. Per esempio `progetti/app` significa «la cartella `app` dentro `progetti`, a partire da qui».

In questo gioco tornano utili quattro simboli speciali, che sono scorciatoie per posizioni precise:

| Simbolo | Significato |
|---------|-------------|
| `~` | la home dell'utente (`/Users/ciro`) |
| `.` | la cartella corrente («qui») |
| `..` | la cartella superiore (il livello sopra) |
| `/` | la radice del filesystem |

Così `cd ..` sale di un livello, `cd ~` (o `cd` da solo) porta alla home, e `cd -` torna alla cartella precedente, come il tasto «indietro».

## I comandi per orientarsi e spostarsi

Tre comandi coprono quasi tutto: `pwd` per sapere dove si è, `ls` per vedere cosa c'è, `cd` per spostarsi.

| Comando | Cosa fa |
|---------|---------|
| `pwd` | stampa il percorso assoluto della cartella corrente (*print working directory*) |
| `ls` | elenca file e cartelle della directory corrente |
| `ls -a` | mostra anche i file **nascosti** (quelli il cui nome inizia con `.`) |
| `ls -l` | formato lungo: permessi, proprietario, dimensione, data |
| `ls -la` | le due opzioni insieme: elenco dettagliato, nascosti inclusi |
| `cd <cartella>` | entra nella cartella indicata |
| `cd ..` | sale alla cartella superiore |
| `cd ~` · `cd` | va alla home |
| `cd -` | torna alla cartella precedente |

```bash
pwd                      # /Users/ciro           → sono nella home
ls                       # Documenti  progetti    → cosa c'è qui
cd progetti/app          # entro in app (percorso relativo)
pwd                      # /Users/ciro/progetti/app
cd ..                    # risalgo a progetti
cd /opt/homebrew         # salto altrove con un percorso assoluto
cd                       # torno dritto alla home
```

I **file nascosti** sono quelli il cui nome inizia con un punto (`.zshrc`, `.git`, `.gitignore`): per convenzione contengono configurazioni e non compaiono in un `ls` normale, ma si vedono con `ls -a`. È il motivo per cui la cartella `.git` di un repository (si veda il <a href="../git/#/12-interni-git" target="_blank" rel="noopener">vault Git</a>) sembra «invisibile».

> [!tip]
> Non serve digitare i nomi per intero: scrivendo le prime lettere e premendo **Tab** la shell completa il percorso da sola (e con zsh mostra un menu se le possibilità sono più d'una). È il singolo trucco che fa risparmiare più tempo e più errori di battitura.

## Le cartelle di sistema

Uscendo dalla home si incontrano cartelle dai nomi brevissimi, `bin`, `usr`, `etc`, `opt`, che ricompaiono di continuo nel PATH, nei messaggi d'errore e nelle istruzioni d'installazione. Sono abbreviazioni nate nei primi anni di Unix e seguono convenzioni che macOS e Linux condividono in gran parte: su Linux le fissa il [Filesystem Hierarchy Standard](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html) (FHS), su macOS le riassume la pagina di manuale `man hier`. Conoscerle trasforma un percorso come `/usr/local/bin` da sigla misteriosa a indirizzo leggibile: «i programmi installati su questa macchina, fuori dal sistema operativo».

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 760 312" role="img" aria-label="La radice / si divide in due gruppi di cartelle. A sinistra quelle ereditate da Unix, con il nome minuscolo: bin, sbin, usr con dentro bin, lib, share e local, opt con homebrew, etc, var e tmp che sono collegamenti a /private, dev. A destra quelle proprie di macOS, con l'iniziale maiuscola: Applications, Library, System, Users con dentro la home, Volumes." style="width:100%;max-width:720px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="380" y="30" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="16" font-weight="700" text-anchor="middle">/</text><path d="M372 38 L206 66" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".6"/><path d="M388 38 L554 66" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".6"/><text x="190" y="84" font-size="12" font-weight="700" text-anchor="middle">da Unix · nomi minuscoli</text><text x="570" y="84" font-size="12" font-weight="700" text-anchor="middle">da macOS · iniziale maiuscola</text><g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="12.5"><text x="30" y="116">├─ bin/</text><text x="30" y="138">├─ sbin/</text><text x="30" y="160">├─ usr/</text><text x="30" y="182">│  ├─ bin/</text><text x="30" y="204">│  ├─ lib/  share/</text><text x="30" y="226" font-weight="700" fill="var(--link,#78716c)">│  └─ local/</text><text x="30" y="248" font-weight="700" fill="var(--link,#78716c)">├─ opt/homebrew/</text><text x="30" y="270">├─ etc/ var/ tmp/</text><text x="30" y="292">└─ dev/</text><text x="420" y="116">├─ Applications/</text><text x="420" y="138">├─ Library/</text><text x="420" y="160">├─ System/</text><text x="420" y="182">├─ Users/</text><text x="420" y="204" font-weight="700" fill="var(--link,#78716c)">│  └─ ciro/</text><text x="420" y="226">└─ Volumes/</text></g><g font-size="10.5" opacity=".7"><text x="200" y="116">comandi essenziali</text><text x="200" y="138">amministrazione</text><text x="200" y="160">quasi tutto il resto</text><text x="200" y="182">git, ssh, python3…</text><text x="200" y="204">librerie, manuali</text><text x="200" y="226">installati in locale</text><text x="200" y="248">Homebrew (chip Apple)</text><text x="200" y="270">→ link a /private/…</text><text x="200" y="292">i dispositivi come file</text><text x="580" y="116">le app</text><text x="580" y="138">risorse condivise</text><text x="580" y="160">il sistema, sola lettura</text><text x="580" y="182">le home degli utenti</text><text x="580" y="204">~ (la tua home)</text><text x="580" y="226">dischi collegati</text></g></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">La radice di un Mac mescola due eredità: le cartelle <strong>minuscole</strong> vengono da Unix e si ritrovano identiche su Linux; quelle con l'<strong>iniziale maiuscola</strong> sono di macOS e sono le stesse che mostra il Finder. In evidenza i tre posti in cui finiscono i programmi installati a mano: <code>/usr/local</code>, <code>/opt/homebrew</code> e la home.</figcaption>
</figure>

### Alla radice: le cartelle di Unix

Le cartelle con il nome minuscolo sono l'eredità di Unix e hanno lo stesso significato anche su Linux. Il loro nome è quasi sempre l'abbreviazione di una parola inglese.

| Cartella | Da | Che cosa contiene |
|---|---|---|
| `/bin` | *binaries* | i comandi **essenziali**, quelli che servono anche a un sistema appena avviato: `ls`, `cp`, `mv`, `rm`, `mkdir`, `cat` e le shell (`zsh`, `bash`, `sh`). Un *binario* è un programma già compilato, pronto da eseguire |
| `/sbin` | *system binaries* | i comandi di **amministrazione** del sistema: `mount` (collegare un disco), `ifconfig` (configurare la rete), `ping`, `shutdown` |
| `/usr` | *user* (in origine) | la parte più grande del sistema: quasi tutti gli altri programmi (in `/usr/bin` stanno `git`, `ssh`, `python3`), le librerie, i manuali. Si articola nelle stesse sottocartelle viste [più sotto](03-navigare-filesystem.md?id=lo-schema-che-si-ripete-bin-lib-share) |
| `/usr/local` | *local*, «di questa macchina» | i programmi installati **dall'utente o dall'amministratore**, non dal sistema operativo, che durante gli aggiornamenti non li tocca. Ci finiscono per esempio molti installer `.pkg` |
| `/opt` | — | i pacchetti **aggiuntivi** di terze parti (il FHS li chiama [*add-on*](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/ch03s13.html)), ciascuno nella sua sottocartella: sui Mac con chip Apple ci sta **Homebrew**, in `/opt/homebrew` |
| `/etc` | — | i **file di configurazione** del sistema, testi leggibili: `/etc/paths` (la base del PATH, si veda il [capitolo 5](05-variabili-ambiente-path.md?id=come-si-costruisce-il-path)), `/etc/hosts`, `/etc/shells` (le shell ammesse), `/etc/zprofile` |
| `/var` | *variable* | i dati che cambiano mentre il sistema lavora: i log (`/var/log`) e i file temporanei di ogni utente (`/var/folders`, la cartella a cui punta la variabile `$TMPDIR`) |
| `/tmp` | *temporary* | file temporanei, che il sistema può cancellare in qualunque momento |
| `/dev` | *devices* | i **dispositivi** visti come file: i dischi (`/dev/disk0`), il terminale stesso e `/dev/null`, il «buco nero» che inghiotte qualunque cosa vi si scriva |
| `/private` | — | solo macOS: è il posto dove stanno davvero `etc`, `var` e `tmp`. Le cartelle con quei nomi alla radice sono collegamenti (*link simbolici*) che puntano qui, come mostra `ls -l /` |

Il nome più ingannevole è `/usr`, che oggi contiene programmi e non utenti. Nei primi Unix, all'inizio degli anni Settanta, era davvero la cartella degli utenti (*user*): il sistema stava su un primo disco da 1,5 MB e le home su un secondo, collegato come `/usr`. Quando il sistema crebbe oltre il primo disco, una parte dei programmi traslocò sul secondo, in copie delle stesse cartelle (`/usr/bin`, `/usr/lib`…); con l'arrivo di un terzo disco le home si spostarono in `/home`, ma il nome `/usr` restò ai programmi ([il racconto di Rob Landley](http://lists.busybox.net/pipermail/busybox/2010-December/074114.html)). È anche il motivo per cui esistono sia `/bin` sia `/usr/bin`: in origine la divisione era una questione di spazio su disco, poi è stata razionalizzata in «comandi essenziali» contro «tutto il resto».

Quanto a Homebrew, la sua cartella dipende dal processore: sui Mac con chip Apple è `/opt/homebrew`, sui vecchi Mac Intel era `/usr/local`. La scelta di una cartella diversa permette di tenere entrambe le installazioni sulla stessa macchina, quella Intel eseguita tramite l'emulatore Rosetta 2 ([FAQ di Homebrew](https://docs.brew.sh/FAQ#why-is-the-default-installation-prefix-opthomebrew-on-apple-silicon)).

### Le cartelle proprie di macOS

Accanto a quelle di Unix, la radice di un Mac ha cartelle con l'iniziale maiuscola, che sono le stesse che si vedono nel Finder.

| Cartella | Che cosa contiene |
|---|---|
| `/Applications` | le app installate, quelle che compaiono nel Launchpad |
| `/Library` | risorse condivise da tutti gli utenti: font, preferenze di sistema delle app, estensioni. Ogni utente ha poi la sua `~/Library`, nascosta nel Finder, dove le app salvano dati e impostazioni personali |
| `/System` | il sistema operativo vero e proprio, in sola lettura |
| `/Users` | le home degli utenti (`/Users/ciro`); su Linux l'equivalente è `/home` |
| `/Volumes` | i dischi collegati: una chiavetta, un disco esterno o un'immagine `.dmg` aperta compaiono qui come cartelle |

> [!warning]
> `/System`, `/usr`, `/bin`, `/sbin` e parte di `/var` sono protette dalla **System Integrity Protection** (SIP) di macOS: nemmeno `sudo` permette di modificarle, solo gli aggiornamenti firmati da Apple possono farlo ([Apple](https://support.apple.com/en-us/102149)). Per questo i programmi di terze parti si installano altrove: in `/Applications`, in `/Library`, in `/usr/local` (che fa eccezione dentro `/usr`), in `/opt` o nella home.

### Lo schema che si ripete: bin, lib, share

Guardando dentro `/usr`, `/usr/local`, `/opt/homebrew` o nella cartella di una versione di Node installata con nvm, si ritrovano sempre le stesse sottocartelle. Una cartella organizzata così si chiama **prefisso** (*prefix*): un punto di partenza sotto cui chi installa programmi mette ogni file nella sottocartella del suo tipo, gli eseguibili in `bin`, le librerie in `lib`, i dati in `share`. Per questo tutte le voci del PATH finiscono in `/bin`: il PATH elenca proprio le cartelle `bin` dei vari prefissi.

| Sottocartella | Da | Che cosa contiene | Esempio |
|---|---|---|---|
| `bin` | *binaries* | i programmi da lanciare | `/opt/homebrew/bin/gh` |
| `sbin` | *system binaries* | i programmi di amministrazione | `/usr/sbin/softwareupdate` |
| `lib` | *libraries* | le librerie, cioè codice condiviso fra più programmi che da solo non si lancia | `~/.nvm/versions/node/v24.21.0/lib/node_modules`, dove stanno i pacchetti npm globali |
| `libexec` | — | programmi lanciati da altri programmi, non da chi usa il terminale | `/usr/libexec/path_helper` |
| `include` | da `#include` | i file di intestazione (*header*) del linguaggio C, che un programma carica con la direttiva `#include`; servono a compilare programmi che usano quelle librerie | `…/v24.21.0/include/node`, con `node.h` e `node_api.h` per compilare gli addon nativi di Node |
| `share` | *share*, condividere | dati che non dipendono dal processore, e che quindi si possono condividere fra macchine diverse ([FHS](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/ch04s11.html)): i manuali (`share/man`), la documentazione, i suggerimenti per il Tab | `/opt/homebrew/share/zsh/site-functions` |
| `etc` | — | la configurazione dei programmi di quel prefisso | `/opt/homebrew/etc` |

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 760 262" role="img" aria-label="Quattro prefissi affiancati, /usr, /usr/local, /opt/homebrew e la cartella di Node in nvm, contengono tutti le stesse sottocartelle share, lib e bin. Dalla cartella bin di ciascuno parte una freccia verso una barra in basso: il PATH è l'elenco delle cartelle bin dei prefissi." style="width:100%;max-width:720px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><g font-family="ui-monospace,SFMono-Regular,Menlo,monospace"><rect x="30" y="20" width="160" height="150" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="110" y="44" font-size="12.5" font-weight="700" text-anchor="middle">/usr</text><rect x="210" y="20" width="160" height="150" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="290" y="44" font-size="12.5" font-weight="700" text-anchor="middle">/usr/local</text><rect x="390" y="20" width="160" height="150" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="470" y="44" font-size="12.5" font-weight="700" text-anchor="middle">/opt/homebrew</text><rect x="570" y="20" width="160" height="150" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="650" y="44" font-size="12" font-weight="700" text-anchor="middle">~/.nvm/…/v24.21.0</text><g font-size="11.5"><rect x="45" y="58" width="130" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1" opacity=".55"/><text x="110" y="75" text-anchor="middle">share/</text><rect x="45" y="92" width="130" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1" opacity=".55"/><text x="110" y="109" text-anchor="middle">lib/</text><rect x="45" y="126" width="130" height="30" rx="6" fill="var(--link,#78716c)" fill-opacity=".18" stroke="currentColor" stroke-width="1.6"/><text x="110" y="146" text-anchor="middle" font-weight="700">bin/</text><rect x="225" y="58" width="130" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1" opacity=".55"/><text x="290" y="75" text-anchor="middle">share/</text><rect x="225" y="92" width="130" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1" opacity=".55"/><text x="290" y="109" text-anchor="middle">lib/</text><rect x="225" y="126" width="130" height="30" rx="6" fill="var(--link,#78716c)" fill-opacity=".18" stroke="currentColor" stroke-width="1.6"/><text x="290" y="146" text-anchor="middle" font-weight="700">bin/</text><rect x="405" y="58" width="130" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1" opacity=".55"/><text x="470" y="75" text-anchor="middle">share/</text><rect x="405" y="92" width="130" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1" opacity=".55"/><text x="470" y="109" text-anchor="middle">lib/</text><rect x="405" y="126" width="130" height="30" rx="6" fill="var(--link,#78716c)" fill-opacity=".18" stroke="currentColor" stroke-width="1.6"/><text x="470" y="146" text-anchor="middle" font-weight="700">bin/</text><rect x="585" y="58" width="130" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1" opacity=".55"/><text x="650" y="75" text-anchor="middle">share/</text><rect x="585" y="92" width="130" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1" opacity=".55"/><text x="650" y="109" text-anchor="middle">lib/</text><rect x="585" y="126" width="130" height="30" rx="6" fill="var(--link,#78716c)" fill-opacity=".18" stroke="currentColor" stroke-width="1.6"/><text x="650" y="146" text-anchor="middle" font-weight="700">bin/</text></g></g><path d="M110 170 L110 204" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M110 210 L105 201 L115 201 Z" fill="currentColor"/><path d="M290 170 L290 204" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M290 210 L285 201 L295 201 Z" fill="currentColor"/><path d="M470 170 L470 204" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M470 210 L465 201 L475 201 Z" fill="currentColor"/><path d="M650 170 L650 204" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M650 210 L645 201 L655 201 Z" fill="currentColor"/><rect x="30" y="210" width="700" height="34" rx="9" fill="var(--link,#78716c)" fill-opacity=".1" stroke="currentColor" stroke-width="1.6"/><text x="380" y="232" font-size="12.5" text-anchor="middle"><tspan font-weight="700">PATH</tspan> = l'elenco delle cartelle <tspan font-family="ui-monospace,Menlo,monospace">bin/</tspan> dei prefissi</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Quattro <strong>prefissi</strong> con la stessa struttura interna: chi installa programmi mette gli eseguibili in <code>bin/</code>, le librerie in <code>lib/</code>, manuali e dati in <code>share/</code> (non tutti i prefissi hanno ogni sottocartella). Il PATH non fa che elencare le loro cartelle <code>bin/</code>, ed è per questo che ogni sua voce finisce allo stesso modo.</figcaption>
</figure>

Lo stesso schema spiega altre variabili d'ambiente che si incontrano stampando `env`: nvm imposta `MANPATH` sulla cartella `share/man` della versione di Node attiva, perché `man` trovi i manuali di `node` e `npm`, e `NVM_INC` sulla sua cartella `include/node`.

### Nella home: le cartelle nascoste

Anche la home ospita, accanto alle cartelle visibili (Documenti, Scrivania…), cartelle nascoste che seguono convenzioni simili. Molte vengono dalla specifica [XDG Base Directory](https://specifications.freedesktop.org/basedir-spec/latest/), nata nel mondo Linux e seguita da diversi strumenti anche su macOS.

| Cartella | Che cosa contiene |
|---|---|
| `~/.local/bin` | eseguibili personali, installati senza privilegi di amministratore: la specifica XDG la indica proprio per questo. Per esempio `claude` o gli strumenti installati con `uv tool`; perché la shell li trovi, la cartella va aggiunta al PATH ([capitolo 5](05-variabili-ambiente-path.md?id=aggiungere-una-cartella-al-path)) |
| `~/.local/share` | i dati dei programmi personali, per esempio le versioni a cui puntano i collegamenti di `~/.local/bin` |
| `~/.config` | i file di configurazione dei programmi (`~/.config/gh`, `~/.config/git`) |
| `~/.cache` | dati ricreabili, che si possono cancellare senza perdere nulla |
| `~/.ssh` | chiavi e configurazione di SSH (si veda il <a href="../glossario/#/docs/ssh" target="_blank" rel="noopener">glossario</a>) |
| `~/.nvm` | le versioni di Node installate da nvm, ciascuna un prefisso completo |

> [!info|label:Su Linux]
> Le cartelle di Unix sono le stesse, con qualche differenza: le home stanno in `/home`, mancano `/Applications`, `/Library`, `/System` e `/Volumes`, e i dischi esterni compaiono di solito sotto [`/media`](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/ch03s11.html) o [`/mnt`](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/ch03s12.html). Inoltre molte distribuzioni recenti, a partire da [Fedora](https://fedoraproject.org/wiki/Features/UsrMove), hanno spostato tutto il contenuto di `/bin`, `/sbin` e `/lib` nelle corrispondenti cartelle dentro `/usr`, lasciando alla radice solo dei collegamenti: la vecchia divisione nata dai dischi piccoli non serve più.

## Ripasso lampo

<details>
<summary>Che differenza c'è tra un percorso assoluto e uno relativo?</summary>

Un percorso **assoluto** parte dalla radice `/` e individua la posizione in modo completo, valido da qualunque cartella ci si trovi (`/Users/ciro/progetti`). Un percorso **relativo** parte dalla **cartella corrente**, quindi è più corto ma il suo significato dipende da dove si è in quel momento (`progetti/app`). Nel dubbio, `pwd` dice sempre dove ci si trova.

</details>

<details>
<summary>Cosa fanno <code>.</code>, <code>..</code> e <code>~</code>?</summary>

`.` indica la **cartella corrente** («qui»), `..` la **cartella superiore** (il livello sopra, usato in `cd ..`) e `~` la **home** dell'utente (`/Users/ciro`). Sono scorciatoie che valgono in qualsiasi percorso: per esempio `../Documenti` è «la cartella Documenti che sta un livello sopra».

</details>

<details>
<summary>Perché <code>ls</code> non mostra il file <code>.zshrc</code>, e come si fa a vederlo?</summary>

Perché i file il cui nome inizia con un punto sono **nascosti** per convenzione (di solito sono file di configurazione) e `ls` normale li salta. Si vedono aggiungendo l'opzione `-a`: `ls -a` (o `ls -la` per averli anche in formato dettagliato).

</details>

<details>
<summary>Che differenza c'è fra <code>/bin</code>, <code>/usr/bin</code> e <code>/usr/local/bin</code>?</summary>

Tutte e tre contengono programmi (*binaries*). `/bin` ha i comandi **essenziali** (`ls`, `cp`, le shell), `/usr/bin` quasi tutti gli altri programmi del sistema (`git`, `ssh`), e la divisione fra le due nasce dallo spazio su disco dei primi Unix. `/usr/local/bin` invece contiene i programmi installati **in locale** dall'utente o dall'amministratore, che il sistema operativo non tocca durante gli aggiornamenti.

</details>

<details>
<summary>Perché tutte le cartelle del PATH finiscono in <code>/bin</code>?</summary>

Perché `/usr`, `/usr/local`, `/opt/homebrew` o la cartella di una versione di Node sono **prefissi**: cartelle con la stessa struttura interna, in cui gli eseguibili stanno sempre nella sottocartella `bin`, le librerie in `lib` e i dati in `share`. Il PATH elenca proprio le cartelle `bin` dei prefissi, cioè i posti dove ciascuno tiene i suoi programmi.

</details>
