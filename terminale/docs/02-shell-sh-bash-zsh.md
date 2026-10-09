# 02 · Le shell: sh, bash, zsh

La shell è il programma che interpreta i comandi digitati nel terminale: legge la riga, la scompone, avvia il programma giusto e ne mostra il risultato. Non è però una sola: nel mondo Unix ne esistono diverse, imparentate tra loro, e le tre che si incontrano sempre sono **sh**, **bash** e **zsh**. Capire come sono legate spiega perché i comandi di base funzionano ovunque uguali, e perché in certi dettagli invece cambiano.

Una shell ha due vite. Da **interattiva** è quella con cui si dialoga a turni, un comando alla volta, come nel [capitolo 1](01-cos-e-il-terminale.md). Da **script** è la stessa shell che esegue in fila i comandi scritti in un file (un `.sh`), per automatizzare un'operazione ripetitiva. Le regole del linguaggio sono le stesse nei due casi.

## Una famiglia con un antenato comune

Tutte discendono dalla **Bourne shell** (`sh`), scritta da Stephen Bourne nel 1979: è la capostipite. Da lì è nato lo standard **POSIX**, che fissa un *insieme comune* di comportamenti (`cd`, le pipe, le variabili, i cicli) che ogni shell della famiglia rispetta. È questa base condivisa il motivo per cui `cd`, `ls` o `command | altro` funzionano identici ovunque: sono terreno comune.

Le shell moderne aggiungono comodità *sopra* quella base. **bash** (*Bourne Again SHell*, progetto GNU, 1989) ha esteso `sh` restando compatibile, ed è per decenni stata la shell di riferimento di Linux. **zsh** (1990) è andata oltre, con completamento più intelligente, correzione degli errori di battitura e un glob più potente. Il *glob* è il meccanismo dei **caratteri jolly**: si scrive un modello come `*.txt` («tutti i nomi che finiscono in `.txt`») e la shell lo sostituisce con l'elenco dei file che vi corrispondono, prima ancora di lanciare il comando (i jolly sono spiegati per esteso nel [capitolo 4](04-file-e-cartelle.md?id=i-caratteri-jolly-glob)). Quello di zsh è più potente perché riconosce di serie modelli che bash non ha, o che tiene spenti finché non li si attiva: il caso tipico è `**/`, il [glob ricorsivo](https://zsh.sourceforge.io/Doc/Release/Expansion.html#Recursive-Globbing) che cerca anche in tutte le sottocartelle, mostrato più avanti in questo capitolo. Per l'uso quotidiano bash e zsh si assomigliano molto; le differenze emergono nei dettagli e negli script.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 560 210" role="img" aria-label="Genealogia delle shell: sh (Bourne, 1979) è la radice; bash (GNU, 1989) e zsh (1990) la estendono restando compatibili con la base POSIX" style="width:100%;max-width:560px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="30" y="72" width="126" height="58" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><text x="93" y="98" font-size="17" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">sh</text><text x="93" y="116" font-size="9.5" text-anchor="middle" opacity=".7">Bourne · 1979</text><text x="93" y="150" font-size="9.5" text-anchor="middle" opacity=".7">la radice · base POSIX</text><rect x="330" y="34" width="150" height="54" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="405" y="58" font-size="16" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">bash</text><text x="405" y="75" font-size="9.5" text-anchor="middle" opacity=".7">GNU · 1989 · Linux</text><rect x="330" y="112" width="150" height="54" rx="9" fill="var(--link,#78716c)" fill-opacity=".12" stroke="currentColor" stroke-width="1.8"/><text x="405" y="136" font-size="16" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">zsh</text><text x="405" y="153" font-size="9.5" text-anchor="middle" opacity=".7">1990 · default macOS</text><path d="M156 92 C 240 72, 250 62, 328 61" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M330 61 L320 56 L321 66 Z" fill="currentColor"/><path d="M156 112 C 240 132, 250 138, 328 139" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M330 139 L320 134 L321 144 Z" fill="currentColor"/><text x="243" y="54" font-size="9.5" text-anchor="middle" opacity=".75">estende</text><text x="243" y="150" font-size="9.5" text-anchor="middle" opacity=".75">estende</text><text x="280" y="196" font-size="10" text-anchor="middle" opacity=".8">macOS: default <tspan font-family="ui-monospace,Menlo,monospace">bash</tspan> fino al 2018, <tspan font-family="ui-monospace,Menlo,monospace">zsh</tspan> dal 2019 (Catalina)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Un solo antenato, <code>sh</code>, e una <strong>base comune POSIX</strong> che spiega perché i comandi di tutti i giorni sono identici ovunque. <code>bash</code> e <code>zsh</code> aggiungono comodità sopra quella base; le differenze pratiche restano nei dettagli.</figcaption>
</figure>

## Perché macOS usa zsh (e bash è «vecchia»)

Fino a macOS Mojave (2018) la shell predefinita era **bash**; da **Catalina (10.15, 2019)** è diventata **zsh**. Il motivo è più di <a href="../glossario/#/docs/licenze" target="_blank" rel="noopener">licenze</a> che tecnico. La versione di bash inclusa in macOS è ferma alla **3.2.57**, del 2007: è l'ultima rilasciata con licenza **GPLv2** (un tipo di licenza *copyleft*, che obbliga a mantenere aperto il codice derivato). Dalla 4.0 in poi bash è passata alla **GPLv3**, una versione più stringente che Apple ha scelto di non distribuire con il sistema; così bash è rimasta congelata a una versione di quindici anni fa, mentre **zsh**, con una licenza più permissiva (stile MIT, che invece non impone quell'obbligo), è diventata la nuova predefinita. In pratica: la bash di sistema su macOS è antica, e per usarne una moderna la si installa a parte (con Homebrew, vedi [capitolo 7](07-node-npm-frontend.md)). Farlo è del tutto legittimo, perché la GPLv3, come ogni licenza copyleft, pone condizioni a chi **distribuisce** il software, non a chi lo **usa**: il suo stesso testo afferma il permesso illimitato di eseguire il programma ([sezione 2](https://www.gnu.org/licenses/gpl-3.0.html#section2)). Gli obblighi ricadrebbero su Apple in quanto distributrice, se mettesse bash nel sistema; chi la installa per sé è un semplice utente e non ne ha alcuno (il meccanismo è spiegato nel <a href="../glossario/#/docs/licenze?id=il-copyleft-la-famiglia-gpl" target="_blank" rel="noopener">glossario, alla voce sul copyleft</a>).

## Quale shell è in uso?

Chiedersi quale shell sia in uso ammette in realtà due risposte, perché la shell che parte di default e quella attiva in questo momento non coincidono per forza. La prima è la shell **di login**, configurata per l'utente e avviata a ogni apertura del terminale: la mostra `echo $SHELL`. La seconda è la shell **in esecuzione adesso**, che può essere un'altra se ne è stata avviata una a mano dentro la prima: la mostrano `echo $0` e `ps -p $$`.

A queste due informazioni se ne aggiunge una terza, la *versione* installata, che si ottiene con l'opzione `--version`: `zsh --version` per zsh, `bash --version` per bash. Funzionano entrambe anche mentre si sta usando zsh, perché una shell non è altro che un programma come gli altri, con il proprio eseguibile su disco (`/bin/zsh`, `/bin/bash`). Scrivere `bash --version` non *cambia* shell: avvia per un istante il programma `bash`, che stampa la propria versione e termina, restituendo il controllo a zsh. Su macOS la risposta è la 3.2.57 congelata di cui sopra. Se però si è installata una bash più recente con Homebrew, `bash --version` mostra quella, perché la shell esegue la prima `bash` che trova scorrendo le cartelle del PATH (il meccanismo è spiegato nel [capitolo 5](05-variabili-ambiente-path.md)); `/bin/bash --version`, che indica il percorso esatto, continua invece a riferirsi alla bash di sistema.

| Comando | Cosa mostra |
|---------|-------------|
| `echo $SHELL` | la shell di login predefinita (es. `/bin/zsh`) |
| `echo $0` | il nome della shell attiva ora (es. `-zsh`) |
| `ps -p $$` | il processo della shell corrente |
| `zsh --version` | la versione di zsh installata (es. `zsh 5.9`) |
| `bash --version` | la versione della prima `bash` trovata nel PATH (su macOS, senza installazioni extra, `3.2.57`) |
| `/bin/bash --version` | la versione della bash di sistema, anche se ne è installata un'altra |
| `chsh -s /bin/zsh` | cambia la shell di login (ha effetto dalla prossima sessione) |

```bash
echo $SHELL        # /bin/zsh  → la predefinita dell'utente
zsh --version      # zsh 5.9   → quale versione di zsh
bash --version     # GNU bash, version 3.2.57 → la bash di sistema su macOS
chsh -s /bin/zsh   # imposta zsh come shell di login (chiede la password)
```

## Le differenze che contano davvero

Per l'uso interattivo di tutti i giorni bash e zsh sono intercambiabili; conviene però conoscere alcune differenze, perché ogni tanto spiegano un comportamento inatteso.

- **Il prompt**: zsh usa `%`, bash usa `$` (per un utente normale). È il segnale più immediato di quale shell si sta usando.
- **Il completamento con Tab**: zsh può farlo in modo molto più ricco di bash, completando anche le opzioni dei comandi e i nomi dei branch Git, e mostrare i candidati in un menu da percorrere con la tastiera. Sulla zsh di macOS, però, queste funzioni vanno attivate (vedi [più avanti](#il-menu-di-completamento-di-zsh)).
- **Il glob**: zsh supporta di serie il glob **ricorsivo** `**/` (per esempio `ls **/*.js` trova i `.js` in tutte le sottocartelle), che in bash va abilitato a parte.
- **Gli array partono da indici diversi**: in zsh il primo elemento di un array è `[1]`, in bash è `[0]`. È una trappola classica quando si adatta uno script da una shell all'altra.
- **La personalizzazione**: attorno a zsh esiste un ecosistema di temi e plugin (il più noto è *Oh My Zsh*, [approfondito nel capitolo 6](06-file-configurazione-shell.md)) che rende il prompt informativo con poco sforzo.

Le due differenze che pesano davvero **negli script**, gli array e il glob, si vedono meglio con un esempio: a parità di codice danno un risultato diverso. Gli **array**, prima di tutto:

```bash
frutta=(mela banana pera)
echo ${frutta[1]}
#  zsh  → mela      (il primo elemento ha indice [1])
#  bash → banana    (in bash il primo è [0], quindi [1] è già il secondo)
```

E il **glob ricorsivo** `**/`, che scende in tutte le sottocartelle:

```bash
ls **/*.js          # tutti i file .js, comprese le sottocartelle
#  zsh  → funziona subito
#  bash → prima va abilitato:  shopt -s globstar
```

Sono proprio i casi dietro l'avvertenza qui sotto: lo stesso script può comportarsi diversamente, o rompersi, passando da una shell all'altra.

> [!tip]
> Non serve imparare tutte e tre. Per l'uso interattivo va benissimo la predefinita del sistema (zsh su macOS). Per gli **script** invece conta la portabilità: se un file inizia con `#!/bin/sh` gira ovunque con la sintassi POSIX di base, mentre `#!/bin/bash` richiede bash. La prima riga `#!/...` si chiama *shebang* e indica quale interprete usare per quel file.

> [!warning]
> Uno script scritto per zsh non è detto giri identico in bash (e viceversa), proprio per differenze come l'indice degli array o le opzioni di glob. Per script destinati a girare su macchine diverse conviene attenersi alla base POSIX (`sh`) o dichiarare esplicitamente `bash`.

## Il menu di completamento di zsh

Il completamento avanzato di zsh è un sistema a sé, il *completion system*, che conosce la sintassi di centinaia di comandi: per questo, premendo Tab dopo `git switch `, può proporre i nomi dei branch, e dopo `ls -` le opzioni di `ls`. Sulla zsh di macOS questo sistema **non è attivo di serie**: senza configurazione, Tab completa soltanto nomi di comandi e di file. Lo si attiva con qualche riga in `~/.zshrc`, il file letto da ogni shell interattiva ([capitolo 6](06-file-configurazione-shell.md)). La prima riga carica il completion system; la seconda chiede di mostrare i candidati in un menu in cui ci si sposta con la tastiera, che nel manuale di zsh si chiama [*menu selection*](https://zsh.sourceforge.io/Doc/Release/Zsh-Modules.html#Menu-selection); la terza, facoltativa, fa tornare indietro nel menu con Shift-Tab. Chi usa Oh My Zsh non deve aggiungere nulla, perché queste impostazioni sono già nella sua configurazione.

```bash
autoload -Uz compinit && compinit          # attiva il completion system
zstyle ':completion:*' menu select         # candidati in un menu navigabile
bindkey '^[[Z' reverse-menu-complete       # Shift-Tab: candidato precedente
```

Con la configurazione attiva, quando Tab trova più candidati li elenca sotto il prompt, e un secondo Tab entra nel menu evidenziando il primo. Da lì la tastiera funziona così:

| Tasto | Effetto nel menu |
|-------|------------------|
| `Tab` | evidenzia il candidato successivo |
| `Shift-Tab` | evidenzia il candidato precedente (con la riga `bindkey` qui sopra) |
| `↑` `↓` `←` `→` | spostano l'evidenziazione tra righe e colonne della griglia |
| `Invio` | inserisce il candidato ed esce dal menu, **senza** eseguire il comando |
| `Ctrl-G` | esce dal menu e riporta la riga com'era prima del Tab |
| qualsiasi altro tasto | chiude il menu tenendo il candidato scelto, e il tasto prosegue normalmente |

> [!tip]
> `Invio` nel menu conferma solo la scelta: per lanciare il comando serve un secondo `Invio`. Le modifiche a `~/.zshrc` valgono dalla prossima finestra del terminale, oppure subito con `source ~/.zshrc`.

## Ripasso lampo

<details>
<summary>Cosa hanno in comune sh, bash e zsh, e perché è importante?</summary>

Condividono la **base POSIX** ereditata da `sh`: gli stessi comandi fondamentali (`cd`, `ls`, le pipe, le variabili, i cicli) e la stessa grammatica di base. È questo che rende i comandi di tutti i giorni **identici** su qualsiasi shell della famiglia; le differenze stanno solo nelle comodità aggiuntive e in alcuni dettagli.

</details>

<details>
<summary>Perché la <code>bash</code> di sistema su macOS è ferma alla 3.2 del 2007?</summary>

Perché la 3.2 è l'ultima versione di bash con licenza **GPLv2**. Dalla 4.0 bash è passata alla **GPLv3**, che Apple non distribuisce con il sistema. Per questo dal 2019 (Catalina) macOS usa **zsh** come shell predefinita, che ha una licenza più permissiva; una bash moderna va installata a parte con Homebrew.

</details>

<details>
<summary>Che differenza c'è tra <code>echo $SHELL</code> e <code>echo $0</code>?</summary>

`echo $SHELL` mostra la shell **di login** configurata per l'utente (quella che parte di default), mentre `echo $0` mostra la shell **effettivamente in esecuzione** in quel momento. Di solito coincidono, ma non per forza: se si è avviata a mano un'altra shell, `$SHELL` resta la predefinita mentre `$0` riflette quella attiva.

</details>

<details>
<summary>Perché <code>bash --version</code> funziona anche se la shell in uso è zsh?</summary>

Perché bash è un programma come un altro, con il suo eseguibile (`/bin/bash`). Il comando non cambia shell: avvia `bash` per un istante, che stampa la versione e termina, e il controllo torna a zsh. Se esistono più bash, risponde la prima trovata nel PATH; `/bin/bash --version` interroga sempre quella di sistema.

</details>

<details>
<summary>Cos'è lo <em>shebang</em> e a cosa serve?</summary>

È la prima riga di uno script, nella forma `#!/bin/bash` o `#!/bin/sh`, che indica **quale interprete** deve eseguire il file. Permette di lanciare lo script direttamente (dopo averlo reso eseguibile) senza specificare ogni volta la shell. Usare `#!/bin/sh` punta alla base POSIX portabile; `#!/bin/bash` richiede esplicitamente bash.

</details>
