# 05 · Variabili d'ambiente e PATH

Una **variabile d'ambiente** è un valore con un nome che la shell tiene da parte e che i programmi possono leggere: una specie di «impostazione condivisa» dell'ambiente in cui si lavora. Servono a dire ai programmi dove trovare le cose e come comportarsi, senza doverglielo ripetere ogni volta. Tra tutte ne esiste una che merita un capitolo a sé (il **PATH**) perché è quella che spiega il piccolo mistero di come faccia la shell a trovare i comandi che si digitano.

## Leggere e impostare una variabile

Il valore di una variabile si legge anteponendo al nome il simbolo `$`: `echo $HOME` stampa il percorso della home. Alcune variabili sono già pronte, impostate dal sistema; altre le si può creare. Qui c'è però una distinzione sottile ma importante, tra due modi di assegnare un valore:

- `NOME=valore` crea una variabile **solo per la shell corrente**: la vede la shell, ma **non** i programmi che essa avvia.
- `export NOME=valore` crea una variabile **d'ambiente**: viene **ereditata** anche dai programmi lanciati dalla shell (i suoi processi «figli»).

È questa la ragione per cui, quando una guida dice di impostare una variabile che serve a un programma (per esempio `EDITOR`), usa sempre `export`: senza, quel programma non la vedrebbe.

```bash
echo $HOME               # /Users/ciro           → legge una variabile esistente
NOME="Ciro"              # variabile solo per questa shell
export EDITOR="code"     # variabile d'ambiente: la ereditano i programmi figli
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

## Il PATH: come la shell trova un comando

Quando si digita `node` e si preme Invio, la shell non cerca quel programma «ovunque»: consulta la variabile **`PATH`**, che è un **elenco ordinato di cartelle** separate dal carattere `:`. La shell scorre quelle cartelle **una dopo l'altra, da sinistra a destra**, e appena trova una che contiene un eseguibile di nome `node` lo lancia — **la prima che vince**, ignorando le successive. Se nessuna cartella del PATH contiene quel comando, si riceve il classico `command not found`.

```bash
echo $PATH
# /Users/ciro/.nvm/versions/node/v22.22.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin
#  └─ le cartelle sono separate da ":" e cercate in quest'ordine, da sinistra
```

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 520 268" role="img" aria-label="Risoluzione lungo il PATH: digitando node la shell scorre le cartelle del PATH dall'alto in basso e si ferma alla prima che contiene node, la cartella di nvm" style="width:100%;max-width:470px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="235" y="22" font-size="13" text-anchor="middle"><tspan font-family="ui-monospace,Menlo,monospace" font-weight="700">node</tspan> — dove sta?</text><text x="20" y="52" font-size="9.5" opacity=".6">la shell scorre il PATH dall'alto…</text><rect x="60" y="60" width="330" height="30" rx="6" fill="var(--link,#78716c)" fill-opacity=".14" stroke="currentColor" stroke-width="1.8"/><text x="72" y="79" font-size="11.5" font-family="ui-monospace,Menlo,monospace">~/.nvm/.../v22.22.0/bin</text><text x="400" y="79" font-size="12" font-weight="700" fill="var(--link,#78716c)">✓ node</text><rect x="60" y="98" width="330" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3" opacity=".55"/><text x="72" y="117" font-size="11.5" font-family="ui-monospace,Menlo,monospace" opacity=".55">/opt/homebrew/bin</text><rect x="60" y="136" width="330" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3" opacity=".55"/><text x="72" y="155" font-size="11.5" font-family="ui-monospace,Menlo,monospace" opacity=".55">/usr/local/bin</text><rect x="60" y="174" width="330" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3" opacity=".55"/><text x="72" y="193" font-size="11.5" font-family="ui-monospace,Menlo,monospace" opacity=".55">/usr/bin</text><path d="M40 66 L40 96" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M40 100 L35 90 L45 90 Z" fill="currentColor"/><text x="235" y="228" font-size="10" text-anchor="middle" opacity=".8">la prima cartella che contiene <tspan font-family="ui-monospace,Menlo,monospace">node</tspan> vince: le altre non vengono guardate</text><text x="235" y="248" font-size="10" text-anchor="middle" opacity=".8"><tspan font-family="ui-monospace,Menlo,monospace">which node</tspan> stampa proprio quale ha vinto</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">L'ordine del PATH conta: la prima cartella che contiene il comando vince. È così che il <code>node</code> gestito da nvm «copre» un eventuale <code>node</code> di sistema — la sua cartella viene prima nel PATH.</figcaption>
</figure>

Per sapere *quale* eseguibile vince, senza tirare a indovinare, ci sono tre comandi equivalenti nella sostanza:

| Comando | Cosa fa |
|---------|---------|
| `which node` | stampa il percorso completo dell'eseguibile che verrebbe eseguito |
| `type node` | come sopra, ma dice anche se è un comando, un alias o una funzione |
| `command -v node` | la forma più portabile (utile negli script) |

```bash
which node
# /Users/ciro/.nvm/versions/node/v22.22.0/bin/node   → vince quello di nvm
```

## Aggiungere una cartella al PATH

Per rendere eseguibile un proprio programma da qualunque cartella basta che la sua directory sia nel PATH. La si aggiunge riassegnando la variabile, riscrivendo il vecchio valore (`$PATH`) più la nuova cartella. La posizione conta: mettere la propria cartella **in testa** (prima di `$PATH`) le dà la precedenza; metterla in coda la rende un ripiego.

```bash
export PATH="$HOME/.local/bin:$PATH"   # la mia cartella vince sulle altre (in testa)
export PATH="$PATH:$HOME/.local/bin"   # oppure come ultima spiaggia (in coda)
```

Quando le righe che antepongono sono **più d'una** (com'è tipico in un `~/.zshrc`), l'effetto si ribalta: ognuna mette la sua cartella *davanti* a quelle già presenti, quindi **l'ultima riga scritta finisce prima nel PATH** ed è quella con la precedenza più alta. Per far vincere una cartella specifica, dunque, la si scrive **in fondo** al file, non in cima.

```bash
export PATH="/opt/A/bin:$PATH"   # A va davanti
export PATH="/opt/B/bin:$PATH"   # B va davanti ad A → ordine finale: B, poi A, poi il resto
```

C'è però un dettaglio cruciale: questa riga vale **solo per la shell corrente** e si perde chiudendo la finestra. Perché una modifica al PATH (o un `export`, o un alias) sia **permanente**, va scritta in un file di configurazione che la shell legge a ogni avvio — l'argomento del [capitolo 6](06-file-configurazione-shell.md).

> [!tip]
> Se dopo aver installato un programma il terminale risponde `command not found`, il problema quasi sempre non è l'installazione ma il **PATH**: la cartella dove sta l'eseguibile non è (ancora) elencata nel PATH. Verificarlo con `echo $PATH` e cercare l'eseguibile con `which`/`type` è il primo passo di diagnosi.

## Come si costruisce il PATH

Il PATH non è scritto per intero in nessun file. Si **costruisce a pezzi** ogni volta che si apre una shell: alcuni file di avvio vengono letti uno dopo l'altro, e ciascuno aggiunge le sue cartelle all'elenco lasciato dai precedenti. La riga `export PATH="$HOME/.local/bin:$PATH"` vista sopra lo mostra bene, perché non riscrive l'elenco: prende quello costruito fino a quel momento (`$PATH`) e ci mette davanti una cartella. Aprendo una finestra del Terminale su macOS i passi sono tre; l'ordine completo in cui zsh legge i file di avvio è nel [capitolo 6](06-file-configurazione-shell.md?id=i-file-di-avvio-di-zsh).

1. **La base di macOS.** Il primo file che tocca il PATH è `/etc/zprofile`, un file di sistema uguale per tutti gli utenti. Al suo interno esegue un piccolo programma, `/usr/libexec/path_helper`, che parte dalle cartelle elencate in `/etc/paths`, una per riga, e poi aggiunge **in coda** quelle che trova nei file della cartella `/etc/paths.d` (lo descrive `man path_helper`). In `/etc/paths.d` un programma installato può lasciare un proprio file con le sue cartelle, senza toccare quelli degli altri: sul Mac di riferimento, per esempio, c'è un file `homebrew` che contiene `/opt/homebrew/bin`.
2. **I file personali.** Subito dopo zsh legge `~/.zprofile`, se esiste, e poi `~/.zshrc`. Ogni riga del tipo `export PATH="…:$PATH"` mette la sua cartella **davanti** all'elenco del passo 1.
3. **Gli strumenti caricati dal `~/.zshrc`.** Alcuni strumenti, caricati da una riga del `~/.zshrc`, modificano il PATH a loro volta. nvm, per esempio, mette in testa la cartella della versione di Node attiva: essendo l'ultimo ad agire, finisce primo.

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

Ne discende una conseguenza pratica. Le cartelle che arrivano da `/etc/paths.d` finiscono **in fondo**, dopo quelle di sistema, quindi un programma installato lì perde il confronto con un eventuale omonimo di macOS. È il caso di Homebrew quando manca la riga che la sua guida consiglia di aggiungere a `~/.zprofile`, `eval "$(/opt/homebrew/bin/brew shellenv)"` ([capitolo 6](06-file-configurazione-shell.md?id=i-file-di-avvio-di-zsh)): senza, i programmi di Homebrew funzionano lo stesso, ma restano in coda.

> [!info|label:Su Linux]
> `path_helper` esiste solo su macOS. Su Linux il PATH di base viene da file di sistema che cambiano da una distribuzione all'altra; i passi 2 e 3, cioè i file personali e gli strumenti come nvm, funzionano invece allo stesso modo.

## Ripasso lampo

<details>
<summary>Che differenza c'è tra <code>NOME=valore</code> e <code>export NOME=valore</code>?</summary>

`NOME=valore` crea una variabile visibile **solo alla shell corrente**; `export NOME=valore` la rende una variabile **d'ambiente**, ereditata anche dai programmi (processi figli) che la shell avvia. Se un valore serve a un programma esterno, va esportato — altrimenti quel programma non lo vedrà.

</details>

<details>
<summary>Cos'è il PATH e come lo usa la shell?</summary>

È una variabile che contiene un **elenco ordinato di cartelle**, separate da `:`. Quando si digita il nome di un comando, la shell scorre quelle cartelle **da sinistra a destra** e lancia il primo eseguibile con quel nome che trova — la prima che vince. Se nessuna lo contiene, risponde `command not found`.

</details>

<details>
<summary>Perché l'ordine delle cartelle nel PATH è importante?</summary>

Perché vince la **prima** cartella che contiene il comando: le successive non vengono nemmeno guardate. È così che, avendo più versioni dello stesso programma, quella la cui cartella compare *prima* nel PATH «copre» le altre. Per esempio il `node` di nvm precede l'eventuale `node` di sistema perché la sua cartella è più a sinistra. `which node` rivela quale sta effettivamente vincendo.

</details>

<details>
<summary>Nel <code>~/.zshrc</code> ho più righe che aggiungono al PATH: quale cartella vince?</summary>

Quella dell'**ultima** riga che antepone (`export PATH="X:$PATH"`): ogni riga mette la sua cartella *davanti* alle precedenti, quindi l'ultima scritta finisce prima nel PATH e ha la precedenza più alta. Per far vincere di proposito una cartella specifica, la si mette **in fondo** al file.

</details>

<details>
<summary>Ho installato un tool ma la shell dice <code>command not found</code>: da dove parto?</summary>

Quasi sempre è un problema di **PATH**, non di installazione: la cartella con l'eseguibile non è nel PATH. Si controlla con `echo $PATH` e si cerca l'eseguibile con `which`/`type`. La si aggiunge con `export PATH="…:$PATH"`, e per renderlo permanente si mette quella riga in un file di avvio (capitolo 6).

</details>

<details>
<summary>Da dove arrivano le cartelle del PATH che non ho aggiunto io?</summary>

Da macOS. All'apertura del terminale `/etc/zprofile` esegue `path_helper`, che costruisce la base con le cartelle di `/etc/paths` e aggiunge in coda quelle dei file in `/etc/paths.d`. Solo dopo i file personali (`~/.zprofile`, `~/.zshrc`) e strumenti come nvm mettono le loro cartelle **davanti** a quell'elenco.

</details>
