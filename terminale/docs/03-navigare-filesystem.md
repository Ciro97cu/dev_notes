# 03 · Navigare nel filesystem

Muoversi nel terminale significa, prima di tutto, sapere **dove ci si trova** e come spostarsi tra le cartelle. Ogni comando si esegue infatti *stando* in una certa directory, e agisce di default lì: capire come è organizzato il filesystem e come indicarne i percorsi è quindi il primo passo pratico, quello che rende tutto il resto naturale.

## Il filesystem è un albero

Su macOS e Linux tutti i file e le cartelle formano un **unico albero** che parte da una radice chiamata `/` (*root*). Non esistono le «lettere di unità» di Windows (`C:`, `D:`): anche i dischi esterni e le altre risorse compaiono come cartelle *dentro* quell'unico albero. Ogni utente ha poi una propria **home**, la cartella personale dove tiene i suoi file, che su macOS si trova in `/Users/<nome>` e ha un'abbreviazione comodissima: la tilde `~`.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 560 250" role="img" aria-label="Albero del filesystem: la radice / contiene Applications, opt, Users; dentro Users c'è la home ciro (~), che contiene Documenti e progetti, e progetti contiene app" style="width:100%;max-width:520px;height:auto;color:inherit"><g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" fill="currentColor" font-size="14"><text x="24" y="34">/</text><text x="150" y="34" font-family="system-ui,Arial,sans-serif" font-size="9.5" opacity=".6">← la radice (root)</text><text x="40" y="64">├─ Applications/</text><text x="40" y="90">├─ opt/homebrew/</text><text x="40" y="116">└─ Users/</text><text x="70" y="142" font-weight="700" fill="var(--link,#78716c)">└─ ciro/</text><text x="185" y="142" font-family="system-ui,Arial,sans-serif" font-size="9.5" fill="var(--link,#78716c)">← ~ (la tua home · sei qui)</text><text x="100" y="168">├─ Documenti/</text><text x="100" y="194" font-weight="700" fill="var(--link,#78716c)">└─ progetti/</text><text x="130" y="220">└─ app/</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Un solo albero dalla radice <code>/</code>. La <strong>home</strong> dell'utente <code>ciro</code> è <code>/Users/ciro</code>, che si abbrevia con <code>~</code>. Stando in <code>~</code>, la cartella <code>progetti</code> si può nominare come percorso <strong>assoluto</strong> <code>/Users/ciro/progetti</code> oppure <strong>relativo</strong> <code>progetti</code> (o <code>./progetti</code>).</figcaption>
</figure>

## Percorsi assoluti e relativi

Per indicare una cartella o un file ci sono due modi, ed è cruciale non confonderli. Un percorso è **assoluto** quando parte dalla radice `/`: descrive la posizione in modo completo e non ambiguo, valido da qualunque punto ci si trovi — per esempio `/Users/ciro/progetti`. Un percorso è **relativo** quando parte dalla **cartella corrente**: è più corto ma il suo significato dipende da dove ci si trova in quel momento — per esempio `progetti/app` significa «la cartella `app` dentro `progetti`, a partire da qui».

In questo gioco tornano utili tre simboli speciali, che sono scorciatoie per posizioni precise:

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

I **file nascosti** sono quelli il cui nome inizia con un punto (`.zshrc`, `.git`, `.gitignore`): per convenzione contengono configurazioni e non compaiono in un `ls` normale, ma si vedono con `ls -a`. È il motivo per cui la cartella `.git` di un repository (vedi il vault [Git](../git/#/12-interni-git)) sembra «invisibile».

> [!tip]
> Non serve digitare i nomi per intero: scrivendo le prime lettere e premendo **Tab** la shell completa il percorso da sola (e con zsh mostra un menu se le possibilità sono più d'una). È il singolo trucco che fa risparmiare più tempo e più errori di battitura.

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
