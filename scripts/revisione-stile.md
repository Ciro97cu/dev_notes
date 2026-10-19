# Revisione di stile dei vault: istruzioni (skill humanizer adattata all'italiano e ai vault)

Obiettivo: togliere dalla **prosa** degli appunti i tic tipici del testo generato da un modello, senza cambiare
ciò che il testo dice. È una revisione di stile, non una riscrittura: dove una frase non ha tic, resta com'è.

## Fonti da leggere prima di iniziare
1. la skill `humanizer` (`~/.claude/skills/humanizer/SKILL.md`): il catalogo dei 26 pattern, con esempi. Si lavora in **file mode**.
2. `CLAUDE.md` alla radice del repo e il `CLAUDE.md` del vault: le loro regole **vincono** sulla skill.
3. Al termine: `python3 scripts/prose-guard.py <vault>` deve dare 0 violazioni.

## Regole che scavalcano la skill
- **Registro impersonale** («si usa», «è possibile»; nelle ricette infinito/imperativo). Non introdurre mai il «tu»
  né la prima persona, anche dove la skill suggerirebbe la forma attiva con «you» (§11).
- **Grassetto**: resta sul termine chiave quando viene introdotto o quando segna il concetto centrale di una frase.
  Si toglie solo il grassetto decorativo (etichette in grassetto con i due punti che non aggiungono nulla, parole
  comuni in grassetto senza motivo). Nel dubbio, si lascia.
- **Profondità tecnica**: la voce è «professore», distesa ma senza fronzoli. Si accorcia la ridondanza, mai le
  spiegazioni, i passaggi del ragionamento o gli esempi.
- **Nessun fatto aggiunto o tolto**: niente nuovi esempi, fonti, numeri, nomi; nessuna affermazione persa.

## Da NON toccare mai (lo controlla `scripts/prose-guard.py`: ogni modifica qui fa fallire la revisione)
- Righe dei **titoli** (`#`, `##`, …): generano le ancore dei link.
- **Codice**: blocchi ``` ``` ```, codice inline in backtick, comandi, percorsi, URL.
- **Link**: destinazioni `(...)`, `href="..."`, ancore `?id=...`; anche il testo dei link wikilink `[[...]]`.
- **HTML**: tag e attributi, `<svg>…</svg>` per intero, `<figure>`; il testo di `<figcaption>` è prosa e si può rivedere.
- **Callout**: la riga d'apertura `> [!tipo]` o `> [!tipo|label:…]` resta identica; il corpo è prosa.
- **Ripasso**: struttura `<details>`/`<summary>` e testo del `<summary>` identici; la risposta è prosa.
- **Tabelle**: stesso numero di righe e di colonne; si può rivedere solo il testo descrittivo nelle celle.
- Marcatori **⚠️** e **➕**, **numeri**, versioni, date.

## Trattini lunghi (—, –)
Si tolgono dalla prosa (non dai titoli, non dal codice), scegliendo la sostituzione in base al ruolo:
| Ruolo | Sostituzione |
|---|---|
| inciso fra due trattini | virgole o parentesi |
| annuncia una spiegazione o un elenco | due punti |
| unisce due frasi | punto, oppure una congiunzione (*quindi*, *perché*, *invece*, *così*) |
| frase che non regge senza | riscrivere la frase |
Un trattino in una cella di tabella usato come «vuoto» (`—`) resta.

## I tic da cercare, nella forma italiana
- **Contrasti di comodo** (§1): «non solo… ma anche», «non è X, è Y», «non X: Y», «più che X, Y», «X, non Y» quando
  la parte negata non corregge un'idea che il lettore ha davvero. Si afferma direttamente la cosa.
- **Chiuse a effetto** (§2): paragrafi di una riga che ripetono il precedente («Ed è proprio questo il punto.»,
  «Tutto qui.», «Semplice.», «Niente di più.»), frasi che commentano l'esempio appena visto.
- **Frasi sentenziose** (§3): «la vera domanda è», «in fondo», «il cuore della questione», «la chiave è».
- **Annunci prima del punto** (§4): «Vediamo…», «Ecco cosa…», «In breve:», «Diciamolo subito», «Attenzione:» come
  apertura teatrale (non dentro un callout di avviso, dove è legittimo).
- **Obiezioni inventate** (§5): «Non si tratta di…», «Si potrebbe pensare che… ma», «Sarebbe facile…» se nessuno
  l'ha sostenuto.
- **Terzetti forzati** (§6) e **aperture ripetute** (§7).
- **Parole gonfiate** (§12–13): cruciale, fondamentale/fondamentalmente (se riempitivo), essenziale (se riempitivo),
  «vero e proprio», «di fatto», «in realtà», «in sostanza», «vale la pena», potente, elegante, magico/magia,
  «gioca un ruolo chiave», «rappresenta» al posto di «è», «svolge il ruolo di».
- **Testo che parla di sé** (§25): «in questa sezione vedremo», «come vedremo», «di seguito». I rimandi a un altro
  capitolo con link restano: sono navigazione, non meta-testo.
- **Grassetto decorativo e titoli in elenco** (§19), **qualificatori a catena** (§9).

## Come lavorare
1. Leggere tutto il file, segnare i tic, poi rivedere paragrafo per paragrafo (non toppa per toppa).
2. Diff minimo: si cambia solo dove c'è un tic. Una pagina senza tic può restare intatta.
3. Rileggere: ogni fatto, numero, comando e link è ancora lì? Il registro è ancora impersonale?

## Output
- Modificare i file in place. Nessun commit, nessun altro file toccato.
- Riportare per ogni file: quante modifiche e di che tipo (trattini, contrasti, chiuse, parole gonfiate, grassetto,
  meta-testo, altro), più eventuali dubbi su passi lasciati com'erano.
