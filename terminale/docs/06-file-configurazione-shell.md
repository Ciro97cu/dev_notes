# 06 · File di configurazione della shell

Le personalizzazioni fatte a mano (una cartella aggiunta al PATH, una variabile esportata, un alias comodo) valgono solo per la shell in cui le si digita e svaniscono chiudendo la finestra, come si è visto nel [capitolo 5](05-variabili-ambiente-path.md). Perché diventino **permanenti** vanno scritte in un **file di configurazione** che la shell legge automaticamente a ogni avvio. Capire *quali* file legge, e *quando*, evita il classico «l'ho messo lì ma non funziona».

## Shell di login e shell interattive

La shell distingue alcuni «tipi» di sessione, e in base al tipo legge file diversi. Le due categorie che contano sono:

- una shell è **interattiva** quando dialoga con una persona (si digita e si legge l'output) — il caso normale del terminale;
- una shell è **di login** quando avvia una nuova sessione «da capo», come al primo accesso alla macchina.

Le due cose sono indipendenti e si combinano. Il punto pratico per macOS è questo: **ogni nuova finestra o scheda di Terminal.app apre una shell che è insieme di login *e* interattiva**, quindi vengono letti tutti i file d'avvio. È una particolarità di macOS (su Linux, di solito, la prima shell grafica è di login e quelle nei terminali successivi sono solo interattive).

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

## E in bash? (la trappola classica)

Con bash i file sono altri e nascondono l'inghippo che fa impazzire di più. Una shell di login legge `~/.bash_profile`; una shell interattiva *non* di login legge invece `~/.bashrc`. Siccome su macOS Terminal apre shell **di login**, viene letto `~/.bash_profile` e **non** `~/.bashrc` — così le personalizzazioni scritte in `~/.bashrc` sembrano ignorate. La soluzione usuale è far leggere l'uno dall'altro, aggiungendo in cima a `~/.bash_profile` una riga che «tira dentro» `~/.bashrc`:

```bash
# in ~/.bash_profile: carica anche ~/.bashrc, se esiste
[ -f ~/.bashrc ] && source ~/.bashrc
```

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

## Ripasso lampo

<details>
<summary>Perché una modifica al PATH digitata nel terminale «si dimentica», e come si rende permanente?</summary>

Perché vale solo per la **shell corrente** e sparisce chiudendo la finestra. Per renderla permanente va scritta in un **file di avvio** che la shell legge a ogni sessione: su zsh, tipicamente `~/.zshrc`. Da quel momento la riga viene eseguita all'apertura di ogni nuova shell.

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
