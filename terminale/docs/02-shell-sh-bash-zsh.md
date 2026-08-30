# 02 · Le shell: sh, bash, zsh

La shell è il programma che interpreta i comandi digitati nel terminale: legge la riga, la scompone, avvia il programma giusto e ne mostra il risultato. Non è però una sola: nel mondo Unix ne esistono diverse, imparentate tra loro, e le tre che si incontrano sempre sono **sh**, **bash** e **zsh**. Capire come sono legate spiega perché i comandi di base funzionano ovunque uguali, e perché in certi dettagli invece cambiano.

Una shell ha due vite. Da **interattiva** è quella con cui si dialoga a turni, un comando alla volta, come nel [capitolo 1](01-cos-e-il-terminale.md). Da **script** è la stessa shell che esegue in fila i comandi scritti in un file (un `.sh`), per automatizzare un'operazione ripetitiva. Le regole del linguaggio sono le stesse nei due casi.

## Una famiglia con un antenato comune

Tutte discendono dalla **Bourne shell** (`sh`), scritta da Stephen Bourne nel 1979: è la capostipite. Da lì è nato lo standard **POSIX**, che fissa un *insieme comune* di comportamenti (`cd`, le pipe, le variabili, i cicli) che ogni shell della famiglia rispetta. È questa base condivisa il motivo per cui `cd`, `ls` o `command | altro` funzionano identici ovunque: sono terreno comune.

Le shell moderne aggiungono comodità *sopra* quella base. **bash** (*Bourne Again SHell*, progetto GNU, 1989) ha esteso `sh` restando compatibile, ed è per decenni stata la shell di riferimento di Linux. **zsh** (1990) è andata oltre, con completamento più intelligente, correzione degli errori di battitura e un glob più potente. Per l'uso quotidiano bash e zsh si assomigliano molto; le differenze emergono nei dettagli e negli script.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 560 210" role="img" aria-label="Genealogia delle shell: sh (Bourne, 1979) è la radice; bash (GNU, 1989) e zsh (1990) la estendono restando compatibili con la base POSIX" style="width:100%;max-width:560px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="30" y="72" width="126" height="58" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><text x="93" y="98" font-size="17" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">sh</text><text x="93" y="116" font-size="9.5" text-anchor="middle" opacity=".7">Bourne · 1979</text><text x="93" y="150" font-size="9.5" text-anchor="middle" opacity=".7">la radice · base POSIX</text><rect x="330" y="34" width="150" height="54" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="405" y="58" font-size="16" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">bash</text><text x="405" y="75" font-size="9.5" text-anchor="middle" opacity=".7">GNU · 1989 · Linux</text><rect x="330" y="112" width="150" height="54" rx="9" fill="var(--link,#78716c)" fill-opacity=".12" stroke="currentColor" stroke-width="1.8"/><text x="405" y="136" font-size="16" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">zsh</text><text x="405" y="153" font-size="9.5" text-anchor="middle" opacity=".7">1990 · default macOS</text><path d="M156 92 C 240 72, 250 62, 328 61" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M330 61 L320 56 L321 66 Z" fill="currentColor"/><path d="M156 112 C 240 132, 250 138, 328 139" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M330 139 L320 134 L321 144 Z" fill="currentColor"/><text x="243" y="54" font-size="9.5" text-anchor="middle" opacity=".75">estende</text><text x="243" y="150" font-size="9.5" text-anchor="middle" opacity=".75">estende</text><text x="280" y="196" font-size="10" text-anchor="middle" opacity=".8">macOS: default <tspan font-family="ui-monospace,Menlo,monospace">bash</tspan> fino al 2018, <tspan font-family="ui-monospace,Menlo,monospace">zsh</tspan> dal 2019 (Catalina)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Un solo antenato, <code>sh</code>, e una <strong>base comune POSIX</strong> che spiega perché i comandi di tutti i giorni sono identici ovunque. <code>bash</code> e <code>zsh</code> aggiungono comodità sopra quella base; le differenze pratiche restano nei dettagli.</figcaption>
</figure>

## Perché macOS usa zsh (e bash è «vecchia»)

Fino a macOS Mojave (2018) la shell predefinita era **bash**; da **Catalina (10.15, 2019)** è diventata **zsh**. Il motivo è più di <a href="../glossario/#/docs/licenze" target="_blank" rel="noopener">licenze</a> che tecnico. La versione di bash inclusa in macOS è ferma alla **3.2.57**, del 2007: è l'ultima rilasciata con licenza **GPLv2** (un tipo di licenza *copyleft*, che obbliga a mantenere aperto il codice derivato). Dalla 4.0 in poi bash è passata alla **GPLv3**, una versione più stringente che Apple ha scelto di non distribuire con il sistema; così bash è rimasta congelata a una versione di quindici anni fa, mentre **zsh**, con una licenza più permissiva (stile MIT, che invece non impone quell'obbligo), è diventata la nuova predefinita. In pratica: la bash di sistema su macOS è antica, e per usarne una moderna la si installa a parte (con Homebrew, vedi [capitolo 7](07-node-npm-frontend.md)).

## Quale shell sto usando?

Due domande diverse, due comandi. `echo $SHELL` mostra la shell **di login** configurata per l'utente, cioè quella che parte di default; `echo $0` (o `ps -p $$`) mostra invece la shell **in esecuzione in questo momento**, che potrebbe essere un'altra se ne è stata avviata una a mano.

| Comando | Cosa mostra |
|---------|-------------|
| `echo $SHELL` | la shell di login predefinita (es. `/bin/zsh`) |
| `echo $0` | il nome della shell attiva ora (es. `-zsh`) |
| `ps -p $$` | il processo della shell corrente |
| `chsh -s /bin/zsh` | cambia la shell di login (ha effetto dalla prossima sessione) |

```bash
echo $SHELL        # /bin/zsh  → la predefinita dell'utente
zsh --version      # zsh 5.9   → quale versione
chsh -s /bin/zsh   # imposta zsh come shell di login (chiede la password)
```

## Le differenze che contano davvero

Per l'uso interattivo di tutti i giorni bash e zsh sono intercambiabili; conviene però conoscere alcune differenze, perché ogni tanto spiegano un comportamento inatteso.

- **Il prompt**: zsh usa `%`, bash usa `$` (per un utente normale). È il segnale più immediato di quale shell si sta usando.
- **Il completamento con Tab**: zsh lo fa in modo più ricco (completa opzioni, percorsi, nomi di branch Git) e con un menu navigabile; bash è più essenziale.
- **Il glob**: zsh supporta di serie il glob **ricorsivo** `**/` (per esempio `ls **/*.js` trova i `.js` in tutte le sottocartelle), che in bash va abilitato a parte.
- **Gli array partono da indici diversi**: in zsh il primo elemento di un array è `[1]`, in bash è `[0]`. È una trappola classica quando si adatta uno script da una shell all'altra.
- **La personalizzazione**: attorno a zsh esiste un ecosistema di temi e plugin (il più noto è *Oh My Zsh*, [approfondito nel capitolo 6](06-file-configurazione-shell.md)) che rende il prompt informativo con poco sforzo.

Le prime due, quelle che pesano davvero **negli script**, si vedono meglio con un esempio: a parità di codice danno un risultato diverso. Gli **array**, prima di tutto:

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
<summary>Cos'è lo <em>shebang</em> e a cosa serve?</summary>

È la prima riga di uno script, nella forma `#!/bin/bash` o `#!/bin/sh`, che indica **quale interprete** deve eseguire il file. Permette di lanciare lo script direttamente (dopo averlo reso eseguibile) senza specificare ogni volta la shell. Usare `#!/bin/sh` punta alla base POSIX portabile; `#!/bin/bash` richiede esplicitamente bash.

</details>
