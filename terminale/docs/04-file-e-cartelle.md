# 04 · File e cartelle

Una volta chiaro come muoversi tra le cartelle, il passo successivo è **agire** sui file: crearli, copiarli, spostarli, rinominarli, cancellarli, guardarne il contenuto. Sono i comandi che si usano di più in assoluto, spesso proprio come preparazione prima di lavorare con Git o con un progetto. Pochi comandi coprono quasi tutto, ma uno di essi va maneggiato con cautela.

## Creare

Per creare un file vuoto si usa `touch`; per creare una cartella `mkdir`. L'opzione `-p` di `mkdir` è particolarmente comoda perché crea in un colpo solo anche le cartelle intermedie che non esistono ancora, senza lamentarsi.

| Comando | Cosa fa |
|---------|---------|
| `touch <file>` | crea un file vuoto (o, se esiste, ne aggiorna la data di modifica) |
| `mkdir <cartella>` | crea una directory |
| `mkdir -p a/b/c` | crea l'intera catena `a/b/c`, comprese le cartelle intermedie mancanti |

## Copiare, spostare, rinominare

`cp` copia, `mv` sposta. La cosa da capire è che **`mv` fa due mestieri con lo stesso gesto**: se la destinazione è un'altra cartella, *sposta* il file; se è un nome nella stessa cartella, lo *rinomina*. Non esiste un comando `rename` separato: rinominare, per Unix, è semplicemente spostare un file su un nuovo nome. Per copiare o spostare una **cartella** con tutto il suo contenuto serve l'opzione `-r` (*recursive*).

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 520 200" role="img" aria-label="cp lascia l'originale e aggiunge una copia; mv fa sparire l'originale spostandolo o rinominandolo" style="width:100%;max-width:520px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="150" y="24" font-size="9.5" text-anchor="middle" opacity=".6">prima</text><text x="380" y="24" font-size="9.5" text-anchor="middle" opacity=".6">dopo</text><text x="24" y="62" font-size="14" font-family="ui-monospace,Menlo,monospace" font-weight="700">cp</text><rect x="104" y="44" width="92" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="150" y="63" font-size="12" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">a.txt</text><path d="M210 59 L286 59" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M294 59 L284 54 L284 64 Z" fill="currentColor"/><rect x="300" y="38" width="92" height="26" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="346" y="55" font-size="11.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">a.txt</text><rect x="300" y="70" width="108" height="26" rx="6" fill="var(--link,#78716c)" fill-opacity=".14" stroke="currentColor" stroke-width="1.5"/><text x="354" y="87" font-size="11.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">copia.txt</text><text x="430" y="66" font-size="9.5" opacity=".7">originale</text><text x="430" y="79" font-size="9.5" opacity=".7">+ copia</text><text x="24" y="150" font-size="14" font-family="ui-monospace,Menlo,monospace" font-weight="700">mv</text><rect x="104" y="132" width="92" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="150" y="151" font-size="12" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">a.txt</text><path d="M210 147 L286 147" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M294 147 L284 142 L284 152 Z" fill="currentColor"/><rect x="300" y="132" width="92" height="30" rx="6" fill="var(--link,#78716c)" fill-opacity=".14" stroke="currentColor" stroke-width="1.5"/><text x="346" y="151" font-size="12" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">b.txt</text><text x="430" y="144" font-size="9.5" opacity=".7">l'originale</text><text x="430" y="157" font-size="9.5" opacity=".7">non c'è più</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem"><code>cp a.txt copia.txt</code> lascia <code>a.txt</code> dov'è e ne crea un duplicato; <code>mv a.txt b.txt</code> non duplica nulla: sposta o rinomina, e il nome di partenza sparisce. Per cartelle intere serve <code>cp -r</code>.</figcaption>
</figure>

| Comando | Cosa fa |
|---------|---------|
| `cp <sorg> <dest>` | copia un file |
| `cp -r <cartella> <dest>` | copia una cartella e tutto il suo contenuto |
| `mv <sorg> <dest>` | sposta un file in un'altra cartella |
| `mv vecchio.txt nuovo.txt` | rinomina (è uno spostamento «sullo stesso posto») |

## Cancellare — con prudenza

Il comando per cancellare è `rm`. Qui serve attenzione, perché nel terminale **non c'è il Cestino**: ciò che si rimuove con `rm` è perso, senza una richiesta di conferma e senza possibilità di recupero facile. Per cancellare una cartella con il suo contenuto serve `-r`; l'aggiunta di `-f` (*force*) elimina anche l'ultima rete di sicurezza, i messaggi di conferma.

| Comando | Cosa fa |
|---------|---------|
| `rm <file>` | rimuove un file |
| `rm -r <cartella>` | rimuove una cartella e tutto ciò che contiene |
| `rm -rf <cartella>` | ⚠️ rimuove tutto, ricorsivamente, **senza chiedere nulla** |

> [!warning]
> `rm -rf` è irreversibile: niente Cestino, nessuna conferma. Un percorso sbagliato (in particolare uno **assoluto** che parte da `/`, o un glob troppo largo) può cancellare molto più del previsto. Prima di premere Invio conviene rileggere il percorso, e nel dubbio eseguire prima un `ls` sullo stesso bersaglio per vedere *cosa* si sta per colpire.

## Guardare e aprire

Per sbirciare il contenuto di un file senza aprirlo in un editor ci sono comandi rapidi. `cat` stampa tutto il file di fila (ottimo per file corti); `less` lo apre in una vista scorribile pagina per pagina (`q` per uscire), utile per file lunghi. Su macOS `open` consegna il file all'**applicazione predefinita**, come un doppio clic nel Finder — e `open .` apre la cartella corrente nel Finder.

| Comando | Cosa fa |
|---------|---------|
| `cat <file>` | stampa l'intero contenuto del file nel terminale |
| `less <file>` | apre il file in una vista scorribile (`q` per uscire) |
| `open <file>` | apre con l'app predefinita (macOS; su Linux `xdg-open`) |
| `open .` | apre la cartella corrente nel Finder (macOS) |

## I caratteri jolly (glob)

Spesso non si vuole agire su un solo file ma su un **gruppo** di file che hanno qualcosa in comune. È qui che entrano i *glob*, i caratteri jolly che la shell espande in una lista di nomi *prima* di passare il comando. L'asterisco `*` sta per «qualsiasi sequenza di caratteri», il punto di domanda `?` per «un carattere qualsiasi», e le parentesi graffe `{…}` generano più varianti in un colpo solo (*brace expansion*).

| Pattern | Corrisponde a |
|---------|---------------|
| `*.txt` | tutti i file che finiscono in `.txt` |
| `foto?.png` | `foto1.png`, `fotoA.png`… (un solo carattere al posto di `?`) |
| `*.{js,ts}` | tutti i `.js` **e** i `.ts` |
| `progetto/*` | tutto ciò che sta dentro `progetto/` |

```bash
rm *.log                 # cancella tutti i file .log della cartella corrente
cp *.{js,ts} backup/     # copia in backup/ tutti i file .js e .ts
mkdir -p src/{css,js}    # crea src/css e src/js in un colpo solo
```

> [!tip]
> A espandere i glob è la **shell**, non il comando: quando si scrive `rm *.log`, è zsh (o bash) a sostituire `*.log` con l'elenco reale dei file *prima* di lanciare `rm`. Per questo, prima di un `rm` con un jolly, è saggio provare lo stesso pattern con `ls` (`ls *.log`): mostra esattamente la lista che verrà cancellata.

## Ripasso lampo

<details>
<summary>Perché non esiste un comando <code>rename</code>, e come si rinomina un file?</summary>

Perché per Unix rinominare è solo un caso particolare di **spostamento**: si usa `mv vecchio.txt nuovo.txt`. Se la destinazione è un nome nella stessa cartella, `mv` rinomina; se è un'altra cartella, sposta. Lo stesso comando copre entrambi i casi.

</details>

<details>
<summary>Cosa rende <code>rm -rf</code> pericoloso?</summary>

Cancella in modo **ricorsivo** (`-r`, cartelle e contenuto) e **forzato** (`-f`, senza chiedere conferma), e nel terminale non c'è il Cestino: ciò che elimina è perso. Un percorso sbagliato (specie assoluto da `/` o un glob troppo ampio) può distruggere molto più del previsto. Conviene rileggere il percorso e, nel dubbio, fare prima `ls` sullo stesso bersaglio.

</details>

<details>
<summary>In <code>rm *.log</code>, chi trasforma <code>*.log</code> nella lista dei file?</summary>

La **shell**, non `rm`. Prima di eseguire il comando, zsh (o bash) espande il glob `*.log` nell'elenco reale dei file che vi corrispondono e lo passa a `rm`. È il motivo per cui `ls *.log` è un ottimo modo per *vedere in anteprima* cosa un `rm *.log` colpirebbe.

</details>

<details>
<summary>Come si crea in un colpo solo la struttura <code>src/css</code> e <code>src/js</code>?</summary>

Con `mkdir -p src/{css,js}`: l'opzione `-p` crea anche le cartelle intermedie mancanti (qui `src`), e la *brace expansion* `{css,js}` genera i due percorsi `src/css` e `src/js` in una sola riga.

</details>
