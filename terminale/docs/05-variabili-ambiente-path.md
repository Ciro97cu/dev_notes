# 05 · Variabili d'ambiente e PATH

Una **variabile d'ambiente** è un valore con un nome che la shell tiene da parte e che i programmi possono leggere: una specie di «impostazione condivisa» dell'ambiente in cui si lavora. Servono a dire ai programmi dove trovare le cose e come comportarsi, senza doverglielo ripetere ogni volta. Tra tutte ne esiste una che merita un capitolo a sé (il **PATH**) perché è quella che spiega il piccolo mistero di come faccia la shell a trovare i comandi che si digitano.

## Leggere e impostare una variabile

Il valore di una variabile si legge anteponendo al nome il simbolo `$`: `echo $HOME` stampa il percorso della home. Alcune variabili sono già pronte, impostate dal sistema; altre le si può creare. Qui c'è però una distinzione sottile ma importante, tra due modi di assegnare un valore:

- `NOME=valore` crea una variabile che può usare **solo la shell**: `echo $NOME` funziona, ma un programma lanciato da lì, come `node`, non la vede.
- `export NOME=valore` crea una variabile **d'ambiente**: la shell la passa anche ai programmi che lancia (i suoi processi «figli»), quindi `node` la vede.

È questa la ragione per cui, quando una guida dice di impostare una variabile che serve a un programma (per esempio `EDITOR`), usa sempre `export`: senza, quel programma non la vedrebbe.

In nessuno dei due casi la variabile viene scritta in un file: vive nella memoria della shell di quella finestra del Terminale e sparisce quando la finestra si chiude. Per averla in ogni finestra si scrive la riga nel `~/.zshrc`, come spiega il [capitolo 6](06-file-configurazione-shell.md).

```bash
echo $HOME               # /Users/ciro           → legge una variabile esistente
NOME="Ciro"              # solo la shell la vede (echo $NOME), i programmi no
export EDITOR="code"     # la vedono anche i programmi lanciati da qui
env                      # elenca tutte le variabili d'ambiente attuali
```

Alcune variabili si incontrano di continuo, ed è utile riconoscerle:

| Variabile | Contiene |
|-----------|----------|
| `$HOME` | il percorso della home (`/Users/ciro`) |
| `$USER` | il nome utente |
| `$SHELL` | la shell di login predefinita (`/bin/zsh`) |
| `$PWD` | la cartella corrente |
| `$PATH` | l'elenco delle cartelle in cui cercare i comandi (sotto) |
| `$LANG` | lingua e codifica (es. `it_IT.UTF-8`) |

### Cambiare o togliere una variabile

Una variabile già impostata si cambia semplicemente **assegnandola di nuovo**: il nuovo valore sostituisce il vecchio. Per toglierla c'è invece `unset`. Quello che cambia da un caso all'altro è **quanto dura** la modifica.

| Comando | Effetto | Quanto dura |
|---------|---------|-------------|
| `export EDITOR="vim"` | cambia il valore | solo in questa finestra: chiudendola, la modifica si perde |
| `EDITOR="nano" git commit` | usa quel valore **solo** per il comando scritto sulla stessa riga | solo per quel comando: nella shell la variabile resta com'era |
| `unset EDITOR` | toglie la variabile | solo in questa finestra: se la variabile è scritta nel `~/.zshrc`, nelle finestre nuove ricompare |
| una riga `export …` nel `~/.zshrc` | scrive la variabile in un file, che ogni nuova finestra rilegge | sempre, finché la riga resta nel file ([capitolo 6](06-file-configurazione-shell.md)) |

Un programma, quando parte, riceve una **copia** delle variabili d'ambiente di quel momento, e ogni finestra del Terminale ha le sue. Per questo una modifica non raggiunge un programma già avviato, che va chiuso e riavviato per vederla, né le altre finestre aperte. Dopo aver cambiato il `~/.zshrc`, le finestre nuove lo leggono da sole; per applicarlo a quella già aperta si usa `source ~/.zshrc`.

> [!tip]
> Prima e dopo una modifica conviene controllare il valore con `echo $NOME` (oppure `printenv NOME`): è il modo più rapido per capire quale valore vede davvero la shell.

## Il PATH: come la shell trova un comando

Quando si digita `node` e si preme Invio, la shell non cerca quel programma «ovunque»: consulta la variabile **`PATH`**, che è un **elenco ordinato di cartelle** separate dal carattere `:`. La shell scorre quelle cartelle **una dopo l'altra, da sinistra a destra**, e appena trova una che contiene un eseguibile di nome `node` lo lancia: **la prima che vince**, ignorando le successive. Se nessuna cartella del PATH contiene quel comando, si riceve il classico `command not found`.

```bash
echo $PATH
# /Users/ciro/.nvm/versions/node/v22.22.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin
#  └─ le cartelle sono separate da ":" e cercate in quest'ordine, da sinistra
```

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 520 268" role="img" aria-label="Risoluzione lungo il PATH: digitando node la shell scorre le cartelle del PATH dall'alto in basso e si ferma alla prima che contiene node, la cartella di nvm" style="width:100%;max-width:470px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="235" y="22" font-size="13" text-anchor="middle"><tspan font-family="ui-monospace,Menlo,monospace" font-weight="700">node</tspan> — dove sta?</text><text x="20" y="52" font-size="9.5" opacity=".6">la shell scorre il PATH dall'alto…</text><rect x="60" y="60" width="330" height="30" rx="6" fill="var(--link,#78716c)" fill-opacity=".14" stroke="currentColor" stroke-width="1.8"/><text x="72" y="79" font-size="11.5" font-family="ui-monospace,Menlo,monospace">~/.nvm/.../v22.22.0/bin</text><text x="400" y="79" font-size="12" font-weight="700" fill="var(--link,#78716c)">✓ node</text><rect x="60" y="98" width="330" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3" opacity=".55"/><text x="72" y="117" font-size="11.5" font-family="ui-monospace,Menlo,monospace" opacity=".55">/opt/homebrew/bin</text><rect x="60" y="136" width="330" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3" opacity=".55"/><text x="72" y="155" font-size="11.5" font-family="ui-monospace,Menlo,monospace" opacity=".55">/usr/local/bin</text><rect x="60" y="174" width="330" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3" opacity=".55"/><text x="72" y="193" font-size="11.5" font-family="ui-monospace,Menlo,monospace" opacity=".55">/usr/bin</text><path d="M40 66 L40 96" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M40 100 L35 90 L45 90 Z" fill="currentColor"/><text x="235" y="228" font-size="10" text-anchor="middle" opacity=".8">la prima cartella che contiene <tspan font-family="ui-monospace,Menlo,monospace">node</tspan> vince: le altre non vengono guardate</text><text x="235" y="248" font-size="10" text-anchor="middle" opacity=".8"><tspan font-family="ui-monospace,Menlo,monospace">which node</tspan> stampa proprio quale ha vinto</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">L'ordine del PATH conta: la prima cartella che contiene il comando vince. È così che il <code>node</code> gestito da nvm «copre» un eventuale <code>node</code> di sistema: la sua cartella viene prima nel PATH.</figcaption>
</figure>

### Non solo file: alias, funzioni e comandi integrati

Il PATH entra in gioco solo alla fine. Un nome digitato nel terminale può infatti corrispondere a quattro cose diverse, e la shell le prova in un ordine preciso: prima gli **alias**, poi le **funzioni**, poi i **comandi integrati**, e solo se nessuno di questi corrisponde cerca un file nelle cartelle del PATH ([manuale di zsh](https://zsh.sourceforge.io/Doc/Release/Command-Execution.html)). Anche qui vince il primo che trova.

| Tipo | Che cos'è | Esempio |
|------|-----------|---------|
| **alias** | un soprannome: la shell sostituisce il nome con un testo più lungo, prima di eseguirlo | `alias ll="ls -la"`: scrivendo `ll` parte `ls -la` |
| **funzione** | un piccolo programma scritto nel linguaggio della shell, con un nome; di solito si definisce nel `~/.zshrc` | `saluta() { echo "ciao $1"; }` |
| **comando integrato** (*builtin*) | un comando che fa parte della shell stessa e non è un file su disco | `cd`, `echo`, `export` |
| **eseguibile** | un file vero, che sta in una delle cartelle del PATH | `/usr/bin/git`, il `node` di nvm |

L'ordine spiega alcune sorprese. Un alias con lo stesso nome di un programma lo copre: con `alias ls="ls -G"` (l'opzione che su macOS colora l'elenco), scrivere `ls` esegue sempre la versione con l'opzione, senza toccare il programma. E `cd` è un comando integrato per una ragione precisa: deve cambiare la cartella della shell stessa, cosa che un programma separato non potrebbe fare, perché cambierebbe solo la propria cartella e poi terminerebbe.

Per sapere chi vince, senza tirare a indovinare, ci sono quattro comandi:

| Comando | Cosa mostra |
|---------|-------------|
| `type ll` | chi vince e di che tipo è: `ll is an alias for ls -la` |
| `which ll` | chi vince; in zsh è un comando integrato e riconosce anche alias e funzioni |
| `where ll` | **tutti** i candidati, nell'ordine in cui la shell li prova (solo zsh) |
| `command -v ll` | chi vince, nella forma più portabile: è quella da usare negli script |

`where` è il più istruttivo, perché mostra anche chi perde:

```bash
which node
# /Users/ciro/.nvm/versions/node/v22.22.0/bin/node   → vince quello di nvm
where cd
# cd: shell built-in command    → vince il comando integrato
# /usr/bin/cd                   → esiste anche un file con quel nome, ma arriva dopo
```

> [!info|label:In bash]
> `where` non esiste: per vedere tutti i candidati si usa `type -a`. Anche `which` si comporta diversamente, perché in bash è un programma esterno (`/usr/bin/which`) che guarda solo il PATH, quindi non vede alias e funzioni.

## Aggiungere una cartella al PATH

Per rendere eseguibile un proprio programma da qualunque cartella basta che la sua directory sia nel PATH. La si aggiunge riassegnando la variabile, riscrivendo il vecchio valore (`$PATH`) più la nuova cartella. La posizione conta: mettere la propria cartella **in testa** (prima di `$PATH`) le dà la precedenza; metterla in coda la rende un ripiego.

```bash
export PATH="$HOME/.local/bin:$PATH"   # la mia cartella vince sulle altre (in testa)
export PATH="$PATH:$HOME/.local/bin"   # oppure come ultima spiaggia (in coda)
```

Quando le righe che aggiungono una cartella in testa sono **più d'una**, com'è tipico in un `~/.zshrc`, entrano in gioco due ordini diversi, facili da confondere: l'ordine delle **righe nel file**, che la shell legge dall'alto in basso, e l'ordine delle **cartelle nel PATH**, che la shell scorre da sinistra quando cerca un comando. La regola di ricerca resta una sola: vince la cartella che sta **prima nel PATH**. Ogni riga, però, mette la sua cartella davanti a tutto ciò che c'è già, comprese le cartelle aggiunte dalle righe precedenti, e così la riga letta **per ultima** produce la cartella che sta **prima**. Per far vincere una cartella specifica, quindi, la si scrive **in fondo** al file.

```bash
# PATH di partenza:                  /usr/bin:/bin
export PATH="/opt/A/bin:$PATH"     # ora vale /opt/A/bin:/usr/bin:/bin
export PATH="/opt/B/bin:$PATH"     # ora vale /opt/B/bin:/opt/A/bin:/usr/bin:/bin
# B è scritta dopo nel file, ma sta prima nel PATH: vince B
```

Queste righe, però, valgono **solo per la shell corrente** e si perdono chiudendo la finestra. Perché una modifica al PATH (o un `export`, o un alias) sia **permanente**, va scritta in un file di configurazione che la shell legge a ogni avvio, argomento del [capitolo 6](06-file-configurazione-shell.md).

> [!tip]
> Se dopo aver installato un programma il terminale risponde `command not found`, il problema quasi sempre non è l'installazione ma il **PATH**: la cartella dove sta l'eseguibile non è (ancora) elencata nel PATH. Verificarlo con `echo $PATH` e cercare l'eseguibile con `which`/`type` è il primo passo di diagnosi.

## Come si costruisce il PATH

Il PATH non è scritto per intero in nessun file: si **costruisce a pezzi** ogni volta che si apre una finestra del Terminale. Alcuni file vengono letti uno dopo l'altro, e ciascuno aggiunge le sue cartelle all'elenco lasciato dai precedenti, senza riscriverlo. Lo mostra la riga `export PATH="$HOME/.local/bin:$PATH"` vista sopra: `$PATH` vale «l'elenco costruito fin qui», e la riga ci mette davanti una cartella. Su macOS i passi sono tre; l'ordine completo dei file di avvio è nel [capitolo 6](06-file-configurazione-shell.md?id=i-file-di-avvio-di-zsh).

1. **macOS prepara la base.** Il primo file letto è `/etc/zprofile`, un file di sistema uguale per tutti gli utenti. Al suo interno lancia un piccolo programma di macOS, `path_helper`, che fa due cose (lo descrive `man path_helper`): prende le cartelle elencate nel file `/etc/paths`, una per riga, e poi aggiunge **in coda** quelle scritte nei file della cartella `/etc/paths.d`. In quella cartella ogni programma installato può lasciare un proprio file con le cartelle che gli servono: sul Mac di riferimento, per esempio, c'è il file `homebrew`, che contiene `/opt/homebrew/bin`.
2. **I file personali aggiungono davanti.** Poi zsh legge `~/.zprofile`, se esiste, e `~/.zshrc`. Ogni riga come `export PATH="…:$PATH"` mette la sua cartella **davanti** all'elenco del passo 1.
3. **Gli strumenti aggiungono davanti a tutti.** Alcuni strumenti caricati dal `~/.zshrc` modificano il PATH a loro volta. nvm, per esempio, mette in testa la cartella della versione di Node attiva: è l'ultimo ad agire, quindi finisce primo.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 540 232" role="img" aria-label="Il PATH si costruisce in tre passi. Passo 1, macOS con path_helper: /usr/local/bin, /usr/bin, /bin, /usr/sbin, /sbin presi da /etc/paths, più /opt/homebrew/bin in coda, preso da /etc/paths.d. Passo 2, il file .zshrc mette ~/.local/bin davanti a tutto il passo 1. Passo 3, nvm mette davanti la cartella di Node, prima di ~/.local/bin e del passo 1." style="width:100%;max-width:540px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="20" y="22" font-size="11.5" font-weight="700">1 · macOS: /etc/zprofile esegue path_helper</text><g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="10.5"><rect x="20" y="32" width="104" height="26" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="72" y="49" text-anchor="middle">/usr/local/bin</text><rect x="130" y="32" width="66" height="26" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="163" y="49" text-anchor="middle">/usr/bin</text><rect x="202" y="32" width="44" height="26" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="224" y="49" text-anchor="middle">/bin</text><rect x="252" y="32" width="74" height="26" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="289" y="49" text-anchor="middle">/usr/sbin</text><rect x="332" y="32" width="50" height="26" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="357" y="49" text-anchor="middle">/sbin</text><rect x="388" y="32" width="132" height="26" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3" stroke-dasharray="5 3"/><text x="454" y="49" text-anchor="middle">/opt/homebrew/bin</text></g><g font-size="9.5" opacity=".65" text-anchor="middle"><text x="201" y="74">da /etc/paths</text><text x="454" y="74">in coda, da /etc/paths.d</text></g><text x="20" y="104" font-size="11.5" font-weight="700">2 · ~/.zshrc: export PATH="$HOME/.local/bin:$PATH"</text><rect x="20" y="114" width="96" height="26" rx="6" fill="var(--link,#78716c)" fill-opacity=".18" stroke="currentColor" stroke-width="1.6"/><text x="68" y="131" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="10.5" text-anchor="middle" font-weight="700">~/.local/bin</text><rect x="122" y="114" width="398" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3" opacity=".55"/><text x="321" y="131" font-size="10.5" text-anchor="middle" opacity=".7">tutto il passo 1</text><text x="20" y="176" font-size="11.5" font-weight="700">3 · nvm, caricato dal ~/.zshrc</text><rect x="20" y="186" width="156" height="26" rx="6" fill="var(--link,#78716c)" fill-opacity=".18" stroke="currentColor" stroke-width="1.6"/><text x="98" y="203" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="10.5" text-anchor="middle" font-weight="700">~/.nvm/…/v24.21.0/bin</text><rect x="182" y="186" width="96" height="26" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="230" y="203" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="10.5" text-anchor="middle">~/.local/bin</text><rect x="284" y="186" width="236" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3" opacity=".55"/><text x="402" y="203" font-size="10.5" text-anchor="middle" opacity=".7">tutto il passo 1</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il PATH cresce a ogni passo: ciascuno parte dall'elenco lasciato dal precedente e mette le sue cartelle <strong>davanti</strong> (in evidenza), tranne <code>/etc/paths.d</code>, che aggiunge <strong>in coda</strong>. L'ultimo ad agire finisce primo, ed è per questo che il <code>node</code> di nvm vince su tutti. Un PATH reale ha anche altre voci di sistema, come <code>/System/Cryptexes/App/usr/bin</code>, che arrivano dagli stessi file del passo 1.</figcaption>
</figure>

I file del passo 1 si possono leggere direttamente, e il PATH finale si può stampare una cartella per riga, invece che tutto attaccato con i `:`.

| Comando | Cosa fa |
|---------|---------|
| `cat /etc/paths` | mostra le cartelle di base, una per riga |
| `ls /etc/paths.d` | elenca i file lasciati dai programmi installati |
| `cat /etc/paths.d/*` | mostra le cartelle che quei file aggiungono in coda |

```bash
echo $PATH | tr ':' '\n'   # tr sostituisce ogni ":" con un a capo: una cartella per riga, nell'ordine di ricerca
```

Ne segue una conseguenza pratica: le cartelle che arrivano da `/etc/paths.d` finiscono **in fondo**, dopo quelle di sistema, quindi un programma installato lì perde il confronto con un eventuale omonimo di macOS. Succede a Homebrew quando manca la riga che la sua guida consiglia di mettere in `~/.zprofile`, `eval "$(/opt/homebrew/bin/brew shellenv)"` ([capitolo 6](06-file-configurazione-shell.md?id=i-file-di-avvio-di-zsh)): i suoi programmi funzionano lo stesso, ma restano in coda.

> [!info|label:Su Linux]
> `path_helper` esiste solo su macOS. Su Linux il PATH di base viene da file di sistema che cambiano da una distribuzione all'altra; i passi 2 e 3, cioè i file personali e gli strumenti come nvm, funzionano invece allo stesso modo.

## Ripasso lampo

<details>
<summary>Che differenza c'è tra <code>NOME=valore</code> e <code>export NOME=valore</code>?</summary>

`NOME=valore` crea una variabile visibile **solo alla shell corrente**; `export NOME=valore` la rende una variabile **d'ambiente**, ereditata anche dai programmi (processi figli) che la shell avvia. Se un valore serve a un programma esterno, va esportato, altrimenti quel programma non lo vedrà.

</details>

<details>
<summary>Cos'è il PATH e come lo usa la shell?</summary>

È una variabile che contiene un **elenco ordinato di cartelle**, separate da `:`. Quando si digita il nome di un comando, la shell scorre quelle cartelle **da sinistra a destra** e lancia il primo eseguibile con quel nome che trova: vince la prima cartella che lo contiene. Se nessuna lo contiene, risponde `command not found`.

</details>

<details>
<summary>Perché l'ordine delle cartelle nel PATH è importante?</summary>

Perché vince la **prima** cartella che contiene il comando: le successive non vengono nemmeno guardate. È così che, avendo più versioni dello stesso programma, quella la cui cartella compare *prima* nel PATH «copre» le altre. Per esempio il `node` di nvm precede l'eventuale `node` di sistema perché la sua cartella è più a sinistra. `which node` rivela quale sta effettivamente vincendo.

</details>

<details>
<summary>Nel <code>~/.zshrc</code> ho più righe che aggiungono al PATH: quale cartella vince?</summary>

Vince sempre la cartella che sta **prima nel PATH**. Con più righe del tipo `export PATH="X:$PATH"`, quella cartella è la X dell'**ultima** riga del file, perché ogni riga mette la sua cartella davanti a quelle già presenti: ultima nel file, prima nel PATH. Per far vincere di proposito una cartella specifica, la si mette **in fondo** al file.

</details>

<details>
<summary>Ho installato un tool ma la shell dice <code>command not found</code>: da dove parto?</summary>

Quasi sempre è un problema di **PATH**, non di installazione: la cartella con l'eseguibile non è nel PATH. Si controlla con `echo $PATH` e si cerca l'eseguibile con `which`/`type`. La si aggiunge con `export PATH="…:$PATH"`, e per renderlo permanente si mette quella riga in un file di avvio (capitolo 6).

</details>

<details>
<summary>Da dove arrivano le cartelle del PATH che non ho aggiunto io?</summary>

Da macOS. All'apertura del terminale `/etc/zprofile` esegue `path_helper`, che costruisce la base con le cartelle di `/etc/paths` e aggiunge in coda quelle dei file in `/etc/paths.d`. Solo dopo i file personali (`~/.zprofile`, `~/.zshrc`) e strumenti come nvm mettono le loro cartelle **davanti** a quell'elenco.

</details>

<details>
<summary>Che differenza c'è fra un alias, una funzione, un comando integrato e un eseguibile?</summary>

L'**alias** è un soprannome che la shell sostituisce con un testo più lungo; la **funzione** è un piccolo programma scritto nel linguaggio della shell; il **comando integrato** (`cd`, `echo`) fa parte della shell stessa; l'**eseguibile** è un file in una cartella del PATH. La shell li prova in quest'ordine e vince il primo: `type` dice chi vince, `where` (in zsh) mostra tutti i candidati.

</details>

<details>
<summary>Ho cambiato una variabile con <code>export</code>, ma un programma aperto continua a usare il valore vecchio: perché?</summary>

Perché un programma riceve una **copia** delle variabili d'ambiente nel momento in cui parte, e le modifiche successive non lo raggiungono. Va chiuso e riavviato dalla finestra in cui si è fatto l'`export`. Per lo stesso motivo un `export` vale solo nella sua finestra, non nelle altre.

</details>
