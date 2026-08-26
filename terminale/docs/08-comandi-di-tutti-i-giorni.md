# 08 · Comandi di tutti i giorni

Con le basi in mano (muoversi, gestire i file, capire ambiente e PATH) restano da conoscere alcuni strumenti e trucchi che nel lavoro quotidiano fanno la differenza: comporre più comandi in sequenza, cercare dentro l'output e tra i file, e una manciata di scorciatoie da tastiera che velocizzano tutto. Non è una lista da imparare a memoria, ma un repertorio a cui tornare.

## Comporre i comandi: la pipe

La forza del terminale sta nella capacità di **combinare** programmi semplici. Ogni comando, mentre gira, ha tre «canali»: legge da uno **stdin** (l'ingresso), scrive il risultato normale su **stdout** (l'uscita) e gli eventuali errori su un canale separato, **stderr**. La **pipe** (il carattere `|`) prende lo **stdout** di un comando e lo passa direttamente come **stdin** al comando successivo, così l'uscita del primo diventa il materiale su cui lavora il secondo. È il mattone della filosofia Unix: tanti strumenti piccoli che fanno una cosa sola, messi in fila.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 540 190" role="img" aria-label="La pipe collega lo stdout del primo comando allo stdin del secondo: ls produce un elenco, grep lo filtra; gli errori (stderr) non passano nella pipe e vanno a schermo" style="width:100%;max-width:520px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="34" y="52" width="96" height="42" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="82" y="78" font-size="14" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-weight="700">ls</text><path d="M130 73 L214 73" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M220 73 L210 68 L210 78 Z" fill="currentColor"/><text x="172" y="64" font-size="10" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-weight="700">|</text><text x="172" y="90" font-size="8.5" text-anchor="middle" opacity=".65">stdout → stdin</text><rect x="222" y="52" width="150" height="42" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="297" y="78" font-size="13" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-weight="700">grep .js</text><path d="M372 73 L452 73" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M458 73 L448 68 L448 78 Z" fill="currentColor"/><text x="500" y="70" font-size="9.5" text-anchor="middle" opacity=".8">a</text><text x="500" y="82" font-size="9.5" text-anchor="middle" opacity=".8">schermo</text><path d="M82 94 L82 140" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" opacity=".6"/><path d="M82 146 L77 136 L87 136 Z" fill="currentColor" opacity=".6"/><text x="150" y="132" font-size="9.5" opacity=".7">stderr (errori): salta la pipe,</text><text x="150" y="145" font-size="9.5" opacity=".7">va comunque a schermo</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem"><code>ls | grep .js</code>: lo <strong>stdout</strong> di <code>ls</code> (l'elenco dei file) diventa lo <strong>stdin</strong> di <code>grep</code>, che tiene solo le righe con <code>.js</code>. Gli errori viaggiano su un canale a parte (<strong>stderr</strong>) e non entrano nella pipe.</figcaption>
</figure>

## Salvare l'output su file: la redirezione

Se la pipe manda l'output a un altro *comando*, la **redirezione** lo manda a un *file* (o lo legge da un file). L'operatore `>` scrive lo stdout in un file, ma **sovrascrivendolo** da zero; `>>` invece **aggiunge** in coda senza cancellare. Con `<` si dà a un comando un file come stdin, e con `2>` si dirotta lo stderr (per esempio per salvare gli errori a parte).

| Operatore | Cosa fa |
|-----------|---------|
| `comando > file` | ⚠️ scrive lo stdout nel file, **troncandolo** (contenuto precedente perso) |
| `comando >> file` | aggiunge lo stdout in coda al file |
| `comando < file` | usa il file come stdin del comando |
| `comando 2> file` | dirotta lo **stderr** (gli errori) nel file |
| `comando > out.txt 2>&1` | manda stdout **e** stderr nello stesso file |

```bash
ls -la > elenco.txt        # scrive l'elenco nel file (lo azzera prima) ⚠️
echo "riga nuova" >> log.txt   # aggiunge una riga in coda, senza cancellare
node app.js 2> errori.txt  # salva solo gli errori in un file
```

> [!warning]
> `>` **tronca** il file di destinazione prima di scrivere: se il file esisteva, il suo contenuto è perso. Quando si vuole *aggiungere* e non *rimpiazzare*, l'operatore giusto è `>>`. È un errore facile e dalle conseguenze silenziose.

## Cercare: `grep` e `find`

Due strumenti rispondono a due domande diverse. `grep` cerca **testo dentro l'output o i file** (le righe che contengono un certo motivo); `find` cerca **file nel filesystem** per nome o altre caratteristiche. Il primo si usa spessissimo in fondo a una pipe per filtrare; il secondo per ritrovare file sparsi in un albero di cartelle.

| Comando | Cosa fa |
|---------|---------|
| `grep "testo" file` | stampa le righe del file che contengono «testo» |
| `... \| grep "testo"` | filtra l'output di un comando, tenendo le righe con «testo» |
| `grep -ri "testo" .` | cerca ricorsivamente (`-r`) e senza distinguere maiuscole (`-i`) da qui in giù |
| `find . -name "*.md"` | elenca tutti i file `.md` a partire dalla cartella corrente |
| `head -n 20 file` · `tail -n 20 file` | le prime · le ultime 20 righe di un file |
| `tail -f log.txt` | segue un file che cresce, mostrando le nuove righe in tempo reale |

```bash
ls -la | grep ".js"            # dei file elencati, solo quelli con ".js"
grep -ri "TODO" src/           # tutti i TODO nel codice, senza badare a maiuscole
find . -name "*.log" -type f   # tutti i file .log nell'albero corrente
```

## Il manuale è sempre lì

Non serve ricordare tutte le opzioni: ogni comando porta con sé la propria documentazione. `man <comando>` apre il **manuale** completo (scorribile, `q` per uscire), mentre `<comando> --help` (o `-h`) ne stampa un riassunto rapido. Sono la prima risorsa da consultare, prima di cercare altrove.

## Un cenno ai permessi

In un `ls -l` la prima colonna, tipo `-rwxr-xr-x`, descrive i **permessi** del file: chi può leggerlo (`r`), scriverlo (`w`) ed eseguirlo (`x`), distinti per proprietario, gruppo e tutti gli altri. Il caso che capita più spesso è dover rendere **eseguibile** uno script, cosa che si fa aggiungendo il permesso di esecuzione con `chmod +x`:

```bash
chmod +x deploy.sh    # ora ./deploy.sh si può lanciare direttamente
./deploy.sh           # il ./ dice "esegui lo script che sta qui"
```

## Scorciatoie da tastiera

Buona parte della velocità nel terminale viene da pochi tasti. Vale la pena mandarli in memoria muscolare:

| Tasti | Cosa fanno |
|-------|-----------|
| `Tab` | completa comando o percorso (il singolo trucco più utile) |
| `↑` / `↓` | scorre i comandi già digitati (la *history*) |
| `Ctrl-R` | cerca a ritroso nella history digitando qualche lettera |
| `Ctrl-C` | interrompe il comando in esecuzione |
| `Ctrl-D` | invia «fine input» (chiude la shell, se la riga è vuota) |
| `Ctrl-A` / `Ctrl-E` | va a inizio / fine riga |
| `Ctrl-L` (o `clear`) | pulisce lo schermo |
| `!!` | ripete l'ultimo comando (utile in `sudo !!`) |

> [!tip]
> Quando un comando sembra «bloccato» e non restituisce il prompt, spesso è semplicemente in esecuzione (o in attesa di input). `Ctrl-C` lo interrompe e riporta il controllo; se invece si è entrati in un programma interattivo (come `less` o `man`), l'uscita è quasi sempre il tasto `q`.

## Ripasso lampo

<details>
<summary>Cosa fa esattamente la pipe <code>|</code> in <code>ls | grep .js</code>?</summary>

Prende lo **stdout** del comando a sinistra (l'elenco prodotto da `ls`) e lo passa come **stdin** al comando a destra (`grep`), che filtra tenendo solo le righe con `.js`. Collega cioè l'uscita di un comando all'ingresso del successivo. Gli errori (stderr) viaggiano su un canale separato e non passano nella pipe.

</details>

<details>
<summary>Che differenza c'è tra <code>></code> e <code>>></code>?</summary>

`>` scrive lo stdout in un file **troncandolo** prima (l'eventuale contenuto precedente è perso); `>>` **aggiunge** in coda al file senza cancellare nulla. Quando si vuole accodare (per esempio a un log), l'operatore giusto è `>>`: usare `>` per sbaglio azzera il file.

</details>

<details>
<summary>Quando si usa <code>grep</code> e quando <code>find</code>?</summary>

`grep` cerca **testo**: righe che contengono un certo motivo, dentro un file o in fondo a una pipe (`… | grep "testo"`). `find` cerca **file**: percorsi nel filesystem per nome o caratteristiche (`find . -name "*.md"`). In breve: `grep` guarda *dentro* i contenuti, `find` cerca i file stessi nell'albero.

</details>

<details>
<summary>Un comando sembra bloccato e non torna il prompt: cosa si fa?</summary>

Di solito è ancora in esecuzione o in attesa di input. `Ctrl-C` lo **interrompe** e riporta il prompt. Se invece si è dentro un programma interattivo che occupa lo schermo (come `less`, `man` o un editor da terminale), non è bloccato: si esce con `q` (o con la scorciatoia propria di quel programma).

</details>
