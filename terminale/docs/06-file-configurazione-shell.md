# 06 · File di configurazione della shell

Le personalizzazioni fatte a mano (una cartella aggiunta al PATH, una variabile esportata, un alias comodo) valgono solo per la shell in cui le si digita e svaniscono chiudendo la finestra, come si è visto nel [capitolo 5](05-variabili-ambiente-path.md). Perché diventino **permanenti** vanno scritte in un **file di configurazione** che la shell legge automaticamente a ogni avvio. Capire *quali* file legge, e *quando*, evita il classico «l'ho messo lì ma non funziona».

## Shell di login e shell interattive

La shell distingue alcuni «tipi» di sessione e, in base al tipo, legge file d'avvio diversi. Le due categorie che contano si definiscono così:

- una shell è **interattiva** quando dialoga con una persona: mostra il prompt, si digita e si legge l'output. È il caso normale del terminale. Non lo è quando esegue uno **script**, cioè una serie di comandi in fila senza nessuno che risponda.
- una shell è **di login** quando è la **prima** shell di una sessione, quella che parte nel momento in cui si «entra» in una macchina identificandosi. È il caso di un accesso da zero: un collegamento **SSH** a un server, un login da console testuale e, su macOS, ogni nuova finestra di Terminal.

Il punto che confonde è capire *quando* una shell è «di login», perché dipende da **come** è stata avviata, non da cosa ci si fa dentro. Qualche caso concreto:

| Come è partita la shell | Di login? | Interattiva? |
|---|---|---|
| Nuova finestra o scheda di **Terminal.app** (macOS) | Sì | Sì |
| **`ssh utente@server`** (ci si collega e si ottiene un prompt) | Sì | Sì |
| Digitare **`zsh`** (o `bash`) dentro una shell già aperta | No | Sì |
| Eseguire uno **script** (`./deploy.sh`) | No | No |
| Nuova scheda in un terminale **Linux** (di solito) | No | Sì |

Per togliersi il dubbio su una shell in corso basta `echo $0`: una shell **di login** mostra il nome preceduto da un **trattino** (`-zsh`), una non-login mostra il nome nudo (`zsh`). È una convenzione storica con cui il sistema segnala «questa è la shell iniziale del login».

```bash
echo $0        # -zsh   → shell di login (es. nuova finestra su macOS, oppure via ssh)
echo $0        # zsh    → non di login (es. avviata a mano dentro un'altra shell)
```

Login e interattività sono **indipendenti** e si combinano. La particolarità di macOS è che **ogni nuova finestra o scheda di Terminal.app è insieme di login *e* interattiva**, quindi vengono letti tutti i file d'avvio e la distinzione, in locale, non si nota quasi mai. Si fa sentire **altrove**: collegandosi via SSH a un server, la shell è di login e legge `~/.zprofile` (o `~/.bash_profile`), **non** ciò che si è messo solo in `~/.zshrc`. Da qui la regola pratica per gestirla: le comodità interattive (prompt, alias, completamento) vanno in **`~/.zshrc`**; ciò che deve valere anche per una shell di login (una variabile d'ambiente che serve pure via SSH) va in **`~/.zprofile`** o `~/.zshenv`.

Due dettagli chiudono il quadro. Avviando una shell a mano dentro un'altra (`zsh`), quella nuova è **non di login** semplicemente perché non è stata lanciata come tale (servirebbe `zsh -l`): lo stato login/non-login dipende da **come** parte, non si eredita. Non deve però rifare il setup di login, perché l'**ambiente** (PATH e variabili esportate) lo eredita già dalla shell da cui è partita; rilegge invece `~/.zshrc`, dato che alias e prompt non sono variabili d'ambiente e non si ereditano.

Resta il caso raro, **login ma non interattiva**, quello che a mano non si crea quasi mai. Di proposito lo si ottiene con `zsh -l -c 'comando'` (`-l` forza il login, `-c` esegue senza prompt); da solo nasce in contesti di sistema: un **cron job** o una pipeline di **CI** impostati con `-l` per ereditare l'ambiente di login, oppure, su Linux, il **login grafico** che prepara l'ambiente della sessione senza aprire un terminale. Nell'uso quotidiano su macOS si incontrano solo gli altri tre casi.

## I file di avvio di zsh

zsh legge una sequenza precisa di file, ognuno con un ruolo. Nella pratica quotidiana ne serve **uno solo**, `~/.zshrc`, dove finisce quasi tutta la configurazione personale; gli altri esistono per casi più specifici.

| File | Quando viene letto | A cosa serve |
|------|--------------------|--------------|
| `~/.zshenv` | **sempre**, per ogni shell | variabili che servono anche agli script (usare con parsimonia) |
| `~/.zprofile` | solo shell **di login** | comandi da eseguire una volta a inizio sessione |
| `~/.zshrc` | solo shell **interattive** | **il file principale**: PATH, alias, prompt, init dei tool |
| `~/.zlogin` | solo shell **di login**, dopo `~/.zshrc` | raro; comandi di fine avvio |

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 540 250" role="img" aria-label="All'avvio zsh legge in ordine .zshenv (sempre), .zprofile (login), .zshrc (interattive), .zlogin (login); su macOS Terminal apre shell login+interattive, quindi li legge tutti" style="width:100%;max-width:480px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="30" y="24" font-size="11" opacity=".75">All'avvio, zsh legge in quest'ordine:</text><rect x="70" y="36" width="300" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="84" y="55" font-size="12" font-family="ui-monospace,Menlo,monospace">~/.zshenv</text><text x="384" y="55" font-size="9.5" opacity=".7">sempre</text><rect x="70" y="74" width="300" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="84" y="93" font-size="12" font-family="ui-monospace,Menlo,monospace">~/.zprofile</text><text x="384" y="93" font-size="9.5" opacity=".7">solo login</text><rect x="70" y="112" width="300" height="32" rx="6" fill="var(--link,#78716c)" fill-opacity=".14" stroke="currentColor" stroke-width="1.9"/><text x="84" y="132" font-size="12.5" font-family="ui-monospace,Menlo,monospace" font-weight="700">~/.zshrc</text><text x="384" y="132" font-size="9.5" font-weight="700" fill="var(--link,#78716c)">quasi tutto qui</text><rect x="70" y="152" width="300" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="84" y="171" font-size="12" font-family="ui-monospace,Menlo,monospace">~/.zlogin</text><text x="384" y="171" font-size="9.5" opacity=".7">solo login</text><path d="M50 42 L50 176" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M50 180 L45 170 L55 170 Z" fill="currentColor"/><text x="235" y="214" font-size="10" text-anchor="middle" opacity=".8">Terminal.app apre shell <tspan font-weight="700">login + interattive</tspan>: li legge tutti</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Nella pratica basta ricordare <code>~/.zshrc</code>: è il file delle shell interattive, dove vanno PATH, alias, prompt e l'inizializzazione dei tool. Gli altri servono a casi specifici.</figcaption>
</figure>

Un esempio concreto di cosa finisce, di solito, in ciascuno dei quattro file:

- **`~/.zshenv`**: una variabile che deve valere **ovunque**, anche negli script non interattivi (es. `export LANG="it_IT.UTF-8"`).
- **`~/.zprofile`**: qualcosa da eseguire **una volta** a inizio sessione; per esempio l'init di Homebrew, che la sua guida consiglia proprio qui: `eval "$(/opt/homebrew/bin/brew shellenv)"`.
- **`~/.zshrc`**: il grosso, cioè alias, `export`, aggiunte al PATH, prompt e inizializzazione dei tool (l'esempio completo è qui sotto).
- **`~/.zlogin`**: raro, un comando di fine avvio (es. un saluto: `echo "Pronto, $USER"`).

## E in bash? (la trappola classica)

Con bash i file sono altri e nascondono l'inghippo che fa impazzire di più. Una shell di login legge `~/.bash_profile`; una shell interattiva *non* di login legge invece `~/.bashrc`. Siccome su macOS Terminal apre shell **di login**, viene letto `~/.bash_profile` e **non** `~/.bashrc` — così le personalizzazioni scritte in `~/.bashrc` sembrano ignorate. La soluzione usuale è far leggere l'uno dall'altro, aggiungendo in cima a `~/.bash_profile` una riga che «tira dentro» `~/.bashrc`:

```bash
# in ~/.bash_profile: carica anche ~/.bashrc, se esiste
[ -f ~/.bashrc ] && source ~/.bashrc
```

Non è detto che questi file esistano: sono **facoltativi**, e se bash non è mai stato personalizzato non ci sono affatto, così bash parte coi suoi default. È il caso tipico su macOS, dove la shell predefinita è zsh e bash si usa solo lanciandolo a mano. La trappola si presenta soltanto quando si iniziano a mettere personalizzazioni in `~/.bashrc` aspettandosi che valgano anche in una shell di login: fino a quel momento non c'è nulla da sistemare.

## Cosa si mette in `~/.zshrc`

Il file di configurazione è un normale script di shell: ogni riga è un comando eseguito all'avvio. Ci finiscono le variabili d'ambiente, le aggiunte al PATH, l'inizializzazione dei tool (Homebrew, nvm) e gli **alias**, cioè scorciatoie per comandi lunghi. Ecco un `~/.zshrc` realistico, vicino a una configurazione tipica su macOS con Homebrew e nvm:

```bash
# ~/.zshrc — letto da ogni shell interattiva zsh

# Homebrew: aggiunge /opt/homebrew/bin al PATH e imposta alcune variabili
eval "$(/opt/homebrew/bin/brew shellenv)"

# nvm: gestore di versioni di Node (mette il node attivo nel PATH)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# una cartella personale di eseguibili, in testa al PATH
export PATH="$HOME/.local/bin:$PATH"

export EDITOR="code"          # editor predefinito

alias gs="git status"         # alias: scorciatoie per comandi lunghi
alias ll="ls -la"
```

Dopo aver modificato il file, le nuove righe **non** valgono automaticamente nelle finestre già aperte: la configurazione si legge all'avvio. Per applicarla subito, senza chiudere e riaprire il terminale, si «ri-legge» il file con `source` (o con il suo sinonimo, il punto `.`):

```bash
source ~/.zshrc     # rilegge il file nella shell corrente
. ~/.zshrc          # forma equivalente e più breve
```

> [!tip]
> Nel dubbio su *dove* scrivere una cosa in zsh, la risposta quasi sempre è **`~/.zshrc`**: alias, `export`, aggiunte al PATH e prompt vanno lì. Gli altri file (`~/.zshenv`, `~/.zprofile`) servono a casi particolari e, se usati a sproposito, sono proprio ciò che genera comportamenti difficili da spiegare.

> [!warning]
> Un errore di sintassi in `~/.zshrc` può rompere l'avvio di **ogni nuova** shell (per esempio un PATH riscritto male che «perde» le cartelle di sistema). Dopo una modifica non banale conviene testarla con `source ~/.zshrc` nella finestra corrente prima di fidarsi: se qualcosa va storto, quella finestra è ancora viva per rimediare.

## Hook: far girare codice in automatico

Un **hook** (letteralmente «gancio») è una funzione che la shell chiama **da sola** in un certo momento, senza doverla invocare a mano: la si «aggancia» a un **evento**. zsh ne offre diversi; il più utile nella pratica è **`chpwd`**, che scatta **dopo ogni cambio di cartella** (`cd`). Registrandovi una propria funzione, si fa accadere qualcosa in automatico ogni volta che si entra in una cartella. Il meccanismo è tutto qui: una funzione scritta nel `~/.zshrc` e legata a un evento della shell.

L'esempio classico è cambiare **versione di Node** a seconda del progetto: se una cartella contiene un file `.nvmrc` (che dichiara la versione di Node voluta, vedi <a href="../glossario/#/docs/package-manager?id=nvm" target="_blank" rel="noopener">nvm nel glossario</a>), un hook su `chpwd` può eseguire `nvm use` da sé appena ci si entra, senza digitarlo ogni volta.

```bash
# ~/.zshrc — attiva la versione di Node del progetto entrando nella cartella
autoload -U add-zsh-hook               # abilita il meccanismo degli hook di zsh
load-nvmrc() {
  [ -f .nvmrc ] && nvm use             # se la cartella ha un .nvmrc, attiva quella versione
}
add-zsh-hook chpwd load-nvmrc          # «dopo ogni cd, esegui load-nvmrc»
load-nvmrc                             # eseguilo anche subito, per la cartella di partenza
```

Da quel momento, entrando in un progetto con `.nvmrc` la versione giusta di Node si attiva da sola. È lo stesso principio dietro molte automazioni del terminale: una funzione nel file di configurazione, agganciata a un evento della shell.

> [!tip]
> Gli hook di zsh più comuni: **`chpwd`** (dopo un `cd`), **`precmd`** (prima di stampare ogni prompt), **`preexec`** (subito prima di eseguire un comando). In **bash** non esiste `chpwd`: lo stesso effetto si ottiene con la variabile `PROMPT_COMMAND` o ridefinendo la funzione `cd`.

## Oh My Zsh: personalizzare senza fatica

Scrivere a mano alias e prompt in `~/.zshrc` funziona, ma quasi nessuno parte da zero: attorno a zsh è cresciuto un ecosistema di **framework di configurazione** che portano temi, scorciatoie e comodità già pronte. Il più diffuso è **Oh My Zsh**, un progetto open source che si installa con un comando e poi si governa da poche righe del `~/.zshrc`:

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

L'installazione aggiunge al `~/.zshrc` un blocco in cui due impostazioni fanno quasi tutto: `ZSH_THEME` sceglie il **tema del prompt** (colori, icone, il ramo Git corrente) e `plugins=(...)` attiva i **plugin**, pacchetti di alias e funzioni pronti all'uso.

```bash
# ~/.zshrc — blocco di Oh My Zsh
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="robbyrussell"                    # tema del prompt (quello di default)
plugins=(git zsh-autosuggestions zsh-syntax-highlighting)
source "$ZSH/oh-my-zsh.sh"
```

Tra i **temi** più popolari: `robbyrussell` (il default, minimale), `agnoster` (lo stile «powerline» a frecce, che richiede un *Nerd Font* per mostrare le icone) e soprattutto **Powerlevel10k** (`powerlevel10k`, un tema a parte, velocissimo, con una procedura guidata `p10k configure` che compone il prompt rispondendo a qualche domanda).

Tra i **plugin**, i tre che si incontrano ovunque:

- **`git`** (già incluso) aggiunge decine di alias brevi: `gst` per `git status`, `gco` per `git checkout`, `gp` per `git push`.
- **`zsh-autosuggestions`** propone in grigio, mentre si digita, il comando più probabile pescato dalla cronologia; si accetta con la freccia destra. Va installato a parte, clonandolo tra i plugin *custom*.
- **`zsh-syntax-highlighting`** colora il comando durante la digitazione: verde se esiste, rosso se è scritto male, così gli errori si vedono prima ancora di premere Invio. Anch'esso da clonare a parte.

> [!tip]
> Comodità e leggerezza sono in tensione: più temi e plugin si caricano, più lento diventa l'avvio di **ogni** shell. Se il prompt inizia a «pesare», conviene un tema veloce come Powerlevel10k, meno plugin, oppure un prompt minimale e cross-shell come **Starship**. Oh My Zsh è ottimo per iniziare, ma non è l'unica strada. Riferimento: <a href="https://ohmyz.sh/" target="_blank" rel="noopener">ohmyz.sh</a>.

## Ripasso lampo

<details>
<summary>Perché una modifica al PATH digitata nel terminale «si dimentica», e come si rende permanente?</summary>

Perché vale solo per la **shell corrente** e sparisce chiudendo la finestra. Per renderla permanente va scritta in un **file di avvio** che la shell legge a ogni sessione: su zsh, tipicamente `~/.zshrc`. Da quel momento la riga viene eseguita all'apertura di ogni nuova shell.

</details>

<details>
<summary>Come capisco se la shell che sto usando è «di login», e quando lo è?</summary>

Con `echo $0`: se il nome ha un **trattino** davanti (`-zsh`) è una shell di login, altrimenti no (`zsh`). Lo è quando è la **prima** shell di una sessione: una nuova finestra di Terminal.app su macOS, un collegamento `ssh` a un server, un login da console. Non lo è quando si avvia una shell dentro un'altra (digitando `zsh`) o si esegue uno script. Conta perché le shell di login leggono `~/.zprofile`, quelle interattive `~/.zshrc`; su macOS ogni finestra è entrambe, così la differenza si nota solo altrove (tipicamente via SSH).

</details>

<details>
<summary>Perché <code>zsh</code> dentro una shell non è di login? E quando parte una shell di <strong>login ma non interattiva</strong>?</summary>

Login e interattiva sono assi **indipendenti**. Digitando `zsh` la nuova shell è **non di login** perché non è stata avviata come tale (servirebbe `zsh -l`): lo stato dipende da come parte, non si eredita. L'**ambiente** (PATH, variabili) invece lo eredita dalla shell padre, quindi non rifà il setup di login; rilegge però `~/.zshrc` (alias e prompt non si ereditano). Il caso **login + non interattiva** è raro: di proposito lo si crea con `zsh -l -c 'comando'`, da solo capita coi task automatici (cron/CI lanciati con `-l`) o col login grafico su Linux. Nell'uso quotidiano su macOS non lo si incontra.

</details>

<details>
<summary>Qual è, su zsh, il file dove va quasi tutta la configurazione personale?</summary>

`~/.zshrc`: è il file letto dalle shell **interattive**, dove si mettono alias, `export`, aggiunte al PATH, prompt e inizializzazione dei tool. Gli altri (`~/.zshenv`, `~/.zprofile`, `~/.zlogin`) esistono per casi più specifici.

</details>

<details>
<summary>In bash su macOS, perché ciò che si mette in <code>~/.bashrc</code> a volte sembra ignorato?</summary>

Perché Terminal.app apre shell **di login**, che in bash leggono `~/.bash_profile` e **non** `~/.bashrc`. La soluzione tipica è aggiungere in `~/.bash_profile` una riga che carica l'altro: `[ -f ~/.bashrc ] && source ~/.bashrc`, così le due configurazioni restano allineate.

</details>

<details>
<summary>Ho modificato <code>~/.zshrc</code>: come applico le modifiche senza riaprire il terminale?</summary>

Rileggendo il file nella shell corrente con `source ~/.zshrc` (o la forma breve `. ~/.zshrc`). Le finestre già aperte non recepiscono da sole le modifiche, perché la configurazione si legge solo all'avvio.

</details>

<details>
<summary>Cos'è <code>Oh My Zsh</code> e quali sono le due manopole principali?</summary>

È il framework di configurazione più diffuso per zsh: porta temi e plugin già pronti e si governa dal `~/.zshrc`. Le due impostazioni che fanno quasi tutto sono `ZSH_THEME` (il tema del prompt, es. `robbyrussell` o `powerlevel10k`) e `plugins=(...)` (i plugin attivi, es. `git`, `zsh-autosuggestions`, `zsh-syntax-highlighting`). Attenzione al rovescio: più roba si carica, più l'avvio della shell rallenta.

</details>

<details>
<summary>Cos'è un <code>hook</code> della shell e a cosa serve <code>chpwd</code>?</summary>

Un hook è una funzione che la shell esegue **da sola** al verificarsi di un evento, senza invocarla a mano. In zsh **`chpwd`** scatta **dopo ogni cambio di cartella** (`cd`): agganciandovi una funzione (con `add-zsh-hook chpwd <funzione>` nel `~/.zshrc`) si fa accadere qualcosa in automatico entrando in una cartella. L'uso tipico è attivare la versione di Node dichiarata in un `.nvmrc` appena si entra nel progetto, senza digitare `nvm use` ogni volta.

</details>
