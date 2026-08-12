# 01 · Migliori amici
> cap. 1 di «Code» (Petzold, 2ª ed.) — orig. *Best Friends*

Immaginiamo di avere dieci anni e un migliore amico che abita nella casa di fronte, con le finestre delle camere che si guardano. Dopo il "tutti a letto!" imposto dai genitori a un'ora indecentemente presto, resta la voglia di scambiarsi ancora pensieri, segreti e battute. Di giorno bastano gesti ampi dalla finestra; ma a luci spente, e magari senza telefono (confiscato all'ora di andare a dormire), serve qualcosa di più furbo. Per fortuna, torce ne abbiamo. Una torcia è silenziosa, il suo fascio è direzionale e non filtra sotto la porta a tradire i piani: sembra perfetta per parlarsi al buio. Il libro parte proprio da qui, da un problema quotidiano, perché è il modo più naturale per arrivare all'idea di **codice** — l'idea che sta sotto a tutto il resto dell'informatica.

## Dalla torcia ai lampi

Il primo tentativo è quello ovvio: *disegnare* le lettere in aria con il fascio di luce, un cerchio per la O, un tratto verticale per la I. È un disastro: gli svolazzi luminosi sono troppo imprecisi, e la mente non riesce a rimetterli insieme in lettere.

Il secondo tentativo è più promettente. Invece di disegnare, si *conta*: ogni lettera corrisponde a un certo numero di lampi. Una A è 1 lampo, una B è 2, una C è 3, e così via fino a 26 lampi per la Z, con una pausa breve tra lettera e lettera e una più lunga tra parola e parola. Il vantaggio è che non serve più muovere la torcia: basta accenderla e spegnerla. Il problema si scopre al primo messaggio: "How are you?" richiede in tutto **131 lampi**, e per giunta ci si è dimenticati della punteggiatura — quanti lampi vale un punto interrogativo?

La direzione però è giusta, e qualcun altro ha già risolto il problema molto tempo prima. Cercando in biblioteca (o in rete) si scopre una meravigliosa invenzione: il **codice Morse**.

## Il codice Morse

La differenza rispetto al sistema "conta i lampi" è cruciale. Lì ogni lettera era un certo numero di lampi *tutti uguali*. Nel Morse i lampi sono di **due tipi**: brevi e lunghi. La cosa sembra complicare le cose, e invece le rende molto più efficienti: quello stesso "How are you?" passa da 131 a soli **32 lampi**, punto interrogativo incluso.

Quando si parla di Morse non si dice "lampo breve" e "lampo lungo", ma **punto** (*dot*) e **linea** (*dash*): è il modo comodo di scriverli sulla carta. Ogni lettera dell'alfabeto corrisponde a una breve sequenza di punti e linee.

| Lettera | Morse | Lettera | Morse | Lettera | Morse |
|:--:|:--|:--:|:--|:--:|:--|
| A | `•—`   | J | `•———` | S | `•••`  |
| B | `—•••` | K | `—•—`  | T | `—`    |
| C | `—•—•` | L | `•—••` | U | `••—`  |
| D | `—••`  | M | `——`   | V | `•••—` |
| E | `•`    | N | `—•`   | W | `•——`  |
| F | `••—•` | O | `———`  | X | `—••—` |
| G | `——•`  | P | `•——•` | Y | `—•——` |
| H | `••••` | Q | `——•—` | Z | `——••` |
| I | `••`   | R | `•—•`  |   |        |

Il termine *code* nel libro non ha nulla di segreto o di misterioso. Un **codice** è semplicemente *un sistema per trasferire informazioni* — tra persone, tra persone e computer, o all'interno del computer stesso. In questo senso ne usiamo in continuazione: la **parola parlata** è un codice (suoni che chi conosce la lingua sa interpretare); le **lingue dei segni** lo sono (in Nord America l'ASL, nata all'inizio dell'Ottocento all'American School for the Deaf, e la LSQ, variante della lingua dei segni francese); la **parola scritta** lo è; il **Braille** lo è (lo vedremo nel capitolo 3); la **stenografia** lo è. Usiamo tanti codici diversi perché ognuno è comodo in una situazione in cui gli altri non lo sono: la voce non si conserva su carta, la carta non attraversa il buio a distanza. Come dice Petzold, *un codice è utile se serve a uno scopo che nessun altro codice può servire*. E i computer, a loro volta, usano codici per immagazzinare e trasmettere testo, numeri, suoni, immagini, filmati e persino le istruzioni che eseguono.

## Come si manda il Morse

C'è una differenza tra la *tabella* del Morse e ciò che si trasmette davvero: la tabella mostra punti e linee, ma con la torcia non si mandano punti e linee — si mandano **lampi**. Un punto è un'accensione breve; una linea un'accensione più lunga. Per convenzione, **la linea dura circa tre volte il punto**.

Ancora più importanti sono le **pause**, perché senza di esse i lampi si confonderebbero. La durata di riferimento è quella del punto, e tutto è relativo ad essa:

- tra un punto e una linea *della stessa lettera* si sta spenti per il tempo di **un punto**;
- tra una **lettera** e l'altra si sta spenti per circa il tempo di **una linea** (tre punti);
- tra una **parola** e l'altra per circa **due linee**.

Il diagramma qui sotto mostra la lettera **A** (`•—`): un impulso corto, una pausa breve, un impulso lungo tre volte tanto.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 300 90" role="img" aria-label="Diagramma di timing della lettera A in Morse: punto, pausa, linea" style="width:100%;max-width:360px;height:auto;color:inherit">
  <polyline points="10,60 40,60 40,30 80,30 80,60 120,60 120,30 240,30 240,60 290,60"
            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="12" opacity=".75" text-anchor="middle">
    <text x="60" y="78">punto</text>
    <text x="100" y="78">pausa</text>
    <text x="180" y="78">linea (3×)</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">La A in Morse: acceso-breve, spento-breve, acceso-lungo. Le durate sono <em>relative</em> al punto, non assolute.</figcaption>
</figure>

Con le stesse regole si compongono parole intere. Qui sotto **hello**: si riconoscono i quattro punti della *h*, il punto singolo della *e*, il `·—··` di ciascuna *l* e le tre linee della *o*, con le pause tra lettere che tengono tutto leggibile.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 453 46" role="img" aria-label="Codice Morse di « hello » come sequenza di lampi" style="width:100%;max-width:453px;height:auto;color:inherit">
  <g fill="currentColor"><rect x="6" y="14" width="9" height="20" rx="3"/><rect x="24" y="14" width="9" height="20" rx="3"/><rect x="42" y="14" width="9" height="20" rx="3"/><rect x="60" y="14" width="9" height="20" rx="3"/><rect x="96" y="14" width="9" height="20" rx="3"/><rect x="132" y="14" width="9" height="20" rx="3"/><rect x="150" y="14" width="27" height="20" rx="3"/><rect x="186" y="14" width="9" height="20" rx="3"/><rect x="204" y="14" width="9" height="20" rx="3"/><rect x="240" y="14" width="9" height="20" rx="3"/><rect x="258" y="14" width="27" height="20" rx="3"/><rect x="294" y="14" width="9" height="20" rx="3"/><rect x="312" y="14" width="9" height="20" rx="3"/><rect x="348" y="14" width="27" height="20" rx="3"/><rect x="384" y="14" width="27" height="20" rx="3"/><rect x="420" y="14" width="27" height="20" rx="3"/></g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">«hello» in lampi: <code>····</code> (h) · <code>·</code> (e) · <code>·—··</code> (l) · <code>·—··</code> (l) · <code>———</code> (o). Le barre corte sono punti, quelle lunghe linee.</figcaption>
</figure>

E **hi there**: qui lo **spazio più ampio** al centro separa le due parole (un vuoto lungo circa due linee).

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 462 46" role="img" aria-label="Codice Morse di « hi there » come sequenza di lampi" style="width:100%;max-width:462px;height:auto;color:inherit">
  <g fill="currentColor"><rect x="6" y="14" width="9" height="20" rx="3"/><rect x="24" y="14" width="9" height="20" rx="3"/><rect x="42" y="14" width="9" height="20" rx="3"/><rect x="60" y="14" width="9" height="20" rx="3"/><rect x="96" y="14" width="9" height="20" rx="3"/><rect x="114" y="14" width="9" height="20" rx="3"/><rect x="177" y="14" width="27" height="20" rx="3"/><rect x="231" y="14" width="9" height="20" rx="3"/><rect x="249" y="14" width="9" height="20" rx="3"/><rect x="267" y="14" width="9" height="20" rx="3"/><rect x="285" y="14" width="9" height="20" rx="3"/><rect x="321" y="14" width="9" height="20" rx="3"/><rect x="357" y="14" width="9" height="20" rx="3"/><rect x="375" y="14" width="27" height="20" rx="3"/><rect x="411" y="14" width="9" height="20" rx="3"/><rect x="447" y="14" width="9" height="20" rx="3"/></g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">«hi there»: <code>····</code> <code>··</code> (hi) — stacco largo — <code>—</code> <code>····</code> <code>·</code> <code>·—·</code> <code>·</code> (there).</figcaption>
</figure>

Poiché tutto è relativo al punto, non conta la velocità *assoluta*: la linea di chi trasmette veloce può durare quanto il punto di chi va piano. Dopo una lettera o due, però, chi riceve capisce da sé cos'è punto e cos'è linea. La lunghezza in tempo dei lampi non è insomma fissata: dipende da quanto in fretta si preme il pulsante della torcia.

## La struttura del codice

A prima vista l'assegnazione delle sequenze alle lettere sembra casuale come la disposizione dei tasti di una tastiera. A guardarla meglio, non lo è: **i codici più corti sono dati alle lettere più frequenti**, come la E (`•`) e la T (`—`); quelle rare, come Q e Z, hanno codici più lunghi. È una scelta di efficienza — chi gioca a Scarabeo lo nota subito.

Quasi tutti conoscono un pezzo di Morse: tre punti, tre linee, tre punti sono l'**SOS**, il segnale internazionale di soccorso. Non è l'abbreviazione di nulla: è semplicemente una sequenza facile da ricordare. E durante la Seconda guerra mondiale la BBC apriva alcune trasmissioni con l'inizio della Quinta di Beethoven — *bah-bah-bah-baaah* — che è il Morse della lettera **V**, per *Victory*.

Il Morse codifica anche i **numeri**, ciascuno con cinque tra punti e linee, in modo più ordinato delle lettere:

| Cifra | Morse | Cifra | Morse |
|:--:|:--|:--:|:--|
| 1 | `•————` | 6 | `—••••` |
| 2 | `••———` | 7 | `——•••` |
| 3 | `•••——` | 8 | `———••` |
| 4 | `••••—` | 9 | `————•` |
| 5 | `•••••` | 0 | `—————` |

Ci sono poi codici per la punteggiatura (cinque, sei o sette simboli) e per le lettere accentate di alcune lingue europee. Con un po' di pratica si arriva a 5-10 parole al minuto: molto meno delle circa 100 parole al minuto del parlato, ma sufficiente. Chi impara il Morse può anche "pronunciarlo": un punto si dice *dih* (o *dit* se è l'ultimo di una lettera) e una linea *dah*, così la V diventa *dih-dih-dih-dah*. Come il Morse riduce la scrittura a punti e linee, la sua versione parlata riduce il parlato a due soli suoni.

## La chiave è "due"

E qui sta il punto che regge tutto il libro. Due tipi di lampo, due suoni vocali, **due qualunque cose diverse** possono, combinate nel modo giusto, trasmettere ogni tipo di informazione. Il Morse non ha nulla a che vedere con i computer, eppure ci ha già consegnato l'intuizione fondamentale: bastano *due* stati distinti. È l'idea di **binario**, e il prossimo capitolo la trasforma da curiosità in un principio con una formula precisa.

> [!tip]
> Il messaggio da portare via non è il Morse in sé, ma la sua morale: con **due soli simboli** e delle **pause**, combinati, si rappresenta qualsiasi informazione. Tutto il resto del libro è la costruzione, pezzo su pezzo, di questa idea.

> [!warning]
> Non confondere il codice con la sua trasmissione: la tabella mostra *punti e linee*, ma sul canale (la torcia) viaggiano *lampi di durata diversa e pause*. Sono le **pause** — spesso dimenticate — a rendere il messaggio decifrabile.

## Ripasso lampo

<details>
<summary>Perché il sistema "conta i lampi" (A = 1, B = 2, …, Z = 26) è tanto meno efficiente del Morse?</summary>

Perché ignora la frequenza delle lettere e usa tanti lampi tutti uguali: "How are you?" richiede 131 lampi contro i 32 del Morse, e per di più non prevede la punteggiatura. Il Morse usa due tipi di segnale e dà i codici corti alle lettere più comuni.

</details>

<details>
<summary>Qual è la differenza tra punto e linea, e quali sono le regole di pausa?</summary>

La linea dura circa **tre volte** il punto. Le pause sono relative al punto: **un punto** tra i segnali della stessa lettera, circa **una linea** (tre punti) tra lettere diverse, circa **due linee** tra parole.

</details>

<details>
<summary>Che cos'è un "codice" nella definizione del libro?</summary>

Un sistema per **trasferire informazioni**: tra persone, tra persone e computer, o all'interno del computer stesso. Parlato, lingue dei segni, scrittura, Braille, stenografia e Morse sono tutti codici; se ne usano tanti perché ognuno è comodo dove gli altri non lo sono.

</details>

<details>
<summary>Perché E e T hanno i codici Morse più corti?</summary>

Perché sono le lettere più **frequenti** in inglese. Assegnare le sequenze più brevi ai simboli più comuni rende il codice più efficiente da trasmettere.

</details>

<details>
<summary>Qual è "la parola chiave" del capitolo, e perché conta?</summary>

**Due.** Due tipi di lampo (o due suoni, o due stati qualunque), combinati opportunamente, bastano a rappresentare ogni informazione. È l'anticipazione diretta del **binario**, il tema del capitolo 2.

</details>

**In sintesi:**

- Un **codice** è un sistema condiviso per trasferire informazioni; ne esistono molti perché ognuno è comodo in un contesto diverso.
- Il **Morse** usa due soli simboli (punto e linea) più le pause, e assegna i codici più corti alle lettere più frequenti: efficiente e robusto.
- Le durate sono **relative** al punto (linea = 3× punto; pause di 1, 3, … punti), non assolute.
- Con **due soli stati**, combinati, si può rappresentare tutto: è il seme dell'idea di binario che il libro coltiverà fino alla CPU.
