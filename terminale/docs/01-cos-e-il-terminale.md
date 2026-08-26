# 01 · Cos'è il terminale

Il terminale è lo strumento con cui si comanda il computer **scrivendo** invece che cliccando: si digita un comando, si preme Invio e il sistema lo esegue, rispondendo con del testo. È il modo più diretto e potente di dare istruzioni alla macchina, ed è il terreno naturale di strumenti come Git, npm e i server di sviluppo, che nascono proprio lì. Prima di usarli conviene sapersi muovere in questo ambiente.

Dietro la parola «terminale», usata di solito come sinonimo di tutto, si nascondono in realtà **tre cose diverse** che vale la pena distinguere subito, perché confonderle è la prima fonte di equivoci.

## Emulatore di terminale, shell e prompt

L'**emulatore di terminale** è l'**applicazione con la finestra**: quella che mostra il testo su schermo e raccoglie ciò che si digita sulla tastiera. Su macOS è *Terminal.app* (preinstallata) o *iTerm2*; dentro l'editor c'è il terminale integrato di *VS Code*. Il nome «emulatore» ha una ragione storica: queste app *imitano* i vecchi terminali hardware degli anni '70 (schermo più tastiera collegati a un computer centrale) di cui oggi restano solo il comportamento e alcune sigle (come `TERM=xterm`).

La **shell** è il **programma che gira dentro** quella finestra: legge il comando digitato, lo interpreta, avvia il programma giusto e ne restituisce l'output. È l'interprete della riga di comando, il vero interlocutore. Su macOS la shell predefinita è **zsh**; su molte distribuzioni Linux è **bash**. Emulatore e shell sono indipendenti: lo stesso emulatore può ospitare shell diverse, e la stessa shell può girare in emulatori diversi. Le shell sono il tema del [capitolo 2](02-shell-sh-bash-zsh.md).

Il **prompt** è la **scritta che la shell stampa quando è pronta** a ricevere un comando: segnala «tocca a te». Tipicamente riporta qualche informazione utile (utente, nome della macchina, cartella corrente) e termina con un simbolo che, per convenzione, dice anche *chi* sei:

| Simbolo | Significato |
|---------|-------------|
| `%` | prompt di **zsh** per un utente normale |
| `$` | prompt di **bash**/sh per un utente normale |
| `#` | prompt di **root** (l'amministratore): attenzione, si può fare di tutto |

Così una riga come `ciro@mbp ~ %` dice: utente `ciro`, macchina `mbp`, cartella corrente `~` (la home), shell zsh pronta.

## L'anatomia di una riga di comando

Una riga di comando ha quasi sempre la stessa grammatica: un **comando**, seguito eventualmente da **opzioni** e da **argomenti**. Distinguere questi pezzi permette di leggere qualsiasi comando senza andare a memoria.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 560 158" role="img" aria-label="Anatomia di una riga di comando: dopo il prompt (~ %) vengono il comando ls, le opzioni -la e l'argomento /Users" style="width:100%;max-width:560px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="20" y="40" width="520" height="60" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><path d="M20 62 H540" stroke="currentColor" stroke-width="1" opacity=".3"/><circle cx="40" cy="51" r="4" fill="currentColor" opacity=".5"/><circle cx="55" cy="51" r="4" fill="currentColor" opacity=".5"/><circle cx="70" cy="51" r="4" fill="currentColor" opacity=".5"/><text x="200" y="55" font-size="9.5" text-anchor="middle" opacity=".55">emulatore di terminale</text><g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="18"><text x="44" y="87">~ %</text><text x="128" y="87" font-weight="700">ls</text><text x="180" y="87" font-weight="700">-la</text><text x="248" y="87" font-weight="700">/Users</text></g><g stroke="currentColor" stroke-width="1.4" fill="none"><path d="M40 108 V113 H86 V108"/><path d="M124 108 V113 H150 V108"/><path d="M176 108 V113 H214 V108"/><path d="M244 108 V113 H312 V108"/></g><g font-size="11" text-anchor="middle"><text x="63" y="132" opacity=".8">prompt</text><text x="137" y="132" font-weight="700" fill="var(--link,#78716c)">comando</text><text x="195" y="132" font-weight="700" fill="var(--link,#78716c)">opzioni</text><text x="278" y="132" font-weight="700" fill="var(--link,#78716c)">argomento</text></g></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">La stessa grammatica vale per quasi tutti i comandi: il <strong>comando</strong> dice <em>quale</em> programma eseguire, le <strong>opzioni</strong> (o flag) ne regolano il comportamento, gli <strong>argomenti</strong> dicono su <em>cosa</em> operare. Il <strong>prompt</strong> (qui <code>~ %</code>) non fa parte del comando: lo stampa la shell.</figcaption>
</figure>

Il **comando** è il nome del programma da eseguire (`ls`, `git`, `npm`). Le **opzioni** (dette anche **flag**) ne modificano il comportamento e per convenzione iniziano con un trattino. Ne esistono due forme: quella **breve**, una sola lettera preceduta da un trattino (`-l`, `-a`), e quella **lunga**, una parola preceduta da due trattini (`--all`, `--help`), più leggibile. Le opzioni brevi si possono spesso **accorpare**: `-la` è la scorciatoia di `-l -a`. Gli **argomenti**, infine, sono i dati su cui il comando lavora, tipicamente un file o una cartella (`/Users`).

```bash
ls -la /Users     # comando: ls · opzioni: -l e -a accorpate · argomento: /Users
ls --all          # stessa opzione "-a" nella forma lunga, più leggibile
git commit -m "primo commit"   # git = comando, commit = sotto-comando, -m = opzione con valore
```

Alcuni programmi complessi (Git, npm, Docker) aggiungono un **sotto-comando** subito dopo il nome: in `git commit`, `git` è il programma e `commit` l'operazione richiesta. Il resto della riga segue comunque la stessa logica di opzioni e argomenti.

## Il ciclo: prompt, comando, output

Lavorare nel terminale è un dialogo a turni sempre uguale: la shell stampa il **prompt**, si digita un comando e si preme **Invio**, la shell lo **esegue** mostrando l'eventuale output, e infine ristampa il prompt pronta per il turno successivo. Quando un comando non stampa nulla e torna subito il prompt, di norma è andato tutto bene: molti comandi Unix, per tradizione, «tacciono» in caso di successo e parlano solo quando c'è qualcosa da segnalare.

> [!tip]
> Per chiudere la sessione si usa il comando `exit` (oppure la scorciatoia `Ctrl-D`, che invia il segnale di «fine input»). Chiudere la finestra dell'emulatore ha lo stesso effetto, ma `exit` è il modo pulito.

## Ripasso lampo

<details>
<summary>Che differenza c'è tra l'emulatore di terminale e la shell?</summary>

L'**emulatore** è l'applicazione con la finestra (Terminal.app, iTerm2, il terminale di VS Code): mostra il testo e raccoglie la tastiera. La **shell** è il programma che gira *dentro* quella finestra (zsh, bash) e che effettivamente legge, interpreta ed esegue i comandi. Sono indipendenti: lo stesso emulatore può far girare shell diverse.

</details>

<details>
<summary>In <code>ls -la /Users</code>, come si chiamano le tre parti dopo il prompt?</summary>

`ls` è il **comando** (quale programma), `-la` sono le **opzioni** (o flag; qui `-l` e `-a` accorpate, che ne regolano il comportamento) e `/Users` è l'**argomento** (su cosa opera). Il prompt non fa parte del comando: lo stampa la shell.

</details>

<details>
<summary>Cosa distingue un'opzione breve da una lunga?</summary>

L'opzione **breve** è una singola lettera preceduta da un trattino (`-a`) e più brevi si possono accorpare (`-la` = `-l -a`); l'opzione **lunga** è una parola preceduta da due trattini (`--all`), più leggibile e autoesplicativa. Spesso esistono entrambe le forme per la stessa opzione.

</details>

<details>
<summary>Cosa indica il simbolo finale del prompt (<code>%</code> contro <code>#</code>)?</summary>

Segnala *chi* sei: `%` è il prompt di zsh per un utente normale (`$` per bash/sh), mentre `#` indica che stai operando come **root**, l'amministratore. Vedere `#` è un invito alla prudenza: come root si può modificare o cancellare qualsiasi cosa nel sistema.

</details>
