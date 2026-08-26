# 16 · E la sottrazione?
> cap. 16 di «Code» (Petzold, 2ª ed.) — orig. *But What About Subtraction?*

Dopo aver convinto sé stessi che relè, valvole o transistor possono essere cablati per **sommare** numeri binari, la domanda arriva spontanea: *«E la sottrazione?»*. È una domanda acuta, perché somma e sottrazione, pur complementari, hanno meccaniche diverse. La somma procede ordinata da destra a sinistra e ogni riporto passa alla colonna successiva. La sottrazione invece non porta: **presta** (*borrow*), e il prestito è un meccanismo scomodo, un avanti-e-indietro che i gate logici mal digeriscono. La bella notizia è che si può sottrarre **senza prestito** — e capire come apre la porta a come i computer rappresentano i **numeri negativi**.

## Il problema: il prestito

Una sottrazione tipica come `253 − 176 = 77` richiede di *prendere in prestito* dalla colonna a sinistra, e da quella ancora a sinistra: un pasticcio. Persuadere una manciata di gate a fare questa logica perversa è arduo. Quindi non ci proviamo. Sfruttiamo invece un fatto che ci hanno insegnato da piccoli: **sottrarre equivale a sommare un negativo**. Riscriviamo `253 − 176` come `−176 + 253`, e cerchiamo un modo di farlo con la sola addizione.

## Sottrarre senza prestito: il complemento a nove

Il trucco è aggiungere e togliere lo stesso numero. Partiamo da `1000 − 176 + 253 − 1000` (aggiungere e togliere 1000 non cambia nulla). Poiché `1000 = 999 + 1`, diventa:

`999 − 176 + 253 + 1 − 1000`

Ora la prima operazione, `999 − 176`, **non richiede prestiti**: sottrarre da una fila di nove non presta mai. Il risultato, `823`, è il **complemento a nove** di 176 (e viceversa: il complemento a nove di 823 è 176). Il resto è tutta addizione: `823 + 253 = 1076`, `+ 1 = 1077`, `− 1000 = 77`. Stesso risultato, nessun prestito.

E se sottraiamo un numero più grande da uno più piccolo, come `176 − 253`? Con lo stesso metodo si arriva a un risultato che, riconosciuto il gioco di segni, vale **−77**. Anche qui, nessun prestito — ma quel «meno» davanti è un primo indizio che i negativi vanno ancora sistemati per bene.

## In binario: il complemento a uno

In binario il trucco è persino più semplice. Sottrarre da una fila di **uni** (`11111111`, cioè 255) è la stessa cosa: si chiama **complemento a uno**. E qui c'è la magia: non serve davvero sottrarre, perché sottrarre da tutti 1 equivale a **invertire ogni bit** — ogni `0` diventa `1` e ogni `1` diventa `0`. È l'**inverse**, la stessa operazione dell'inverter costruito nel capitolo 8.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 478 202" role="img" aria-label="Complemento a uno come inverter controllato: con Invert=1 ogni bit di 10110000 diventa 01001111" style="width:100%;max-width:560px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="70" y="26" width="30" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="85" y="46" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">1</text><rect x="114" y="26" width="30" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="129" y="46" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">0</text><rect x="158" y="26" width="30" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="173" y="46" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">1</text><rect x="202" y="26" width="30" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="217" y="46" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">1</text><rect x="246" y="26" width="30" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="261" y="46" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">0</text><rect x="290" y="26" width="30" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="305" y="46" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">0</text><rect x="334" y="26" width="30" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="349" y="46" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">0</text><rect x="378" y="26" width="30" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="393" y="46" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">0</text><rect x="46" y="86" width="366" height="30" rx="8" fill="var(--link,#059669)" fill-opacity=".14" stroke="currentColor" stroke-width="1.4"/><text x="229.0" y="105" font-size="13" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">⊕  inverti  (Invert = 1)</text><line x1="85" y1="54" x2="85" y2="86" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="85" y1="116" x2="85" y2="138" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M81 138 L85 144 L89 138 Z" fill="currentColor"/><rect x="70" y="144" width="30" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="85" y="164" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">0</text><line x1="129" y1="54" x2="129" y2="86" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="129" y1="116" x2="129" y2="138" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M125 138 L129 144 L133 138 Z" fill="currentColor"/><rect x="114" y="144" width="30" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="129" y="164" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">1</text><line x1="173" y1="54" x2="173" y2="86" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="173" y1="116" x2="173" y2="138" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M169 138 L173 144 L177 138 Z" fill="currentColor"/><rect x="158" y="144" width="30" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="173" y="164" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">0</text><line x1="217" y1="54" x2="217" y2="86" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="217" y1="116" x2="217" y2="138" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M213 138 L217 144 L221 138 Z" fill="currentColor"/><rect x="202" y="144" width="30" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="217" y="164" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">0</text><line x1="261" y1="54" x2="261" y2="86" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="261" y1="116" x2="261" y2="138" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M257 138 L261 144 L265 138 Z" fill="currentColor"/><rect x="246" y="144" width="30" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="261" y="164" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">1</text><line x1="305" y1="54" x2="305" y2="86" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="305" y1="116" x2="305" y2="138" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M301 138 L305 144 L309 138 Z" fill="currentColor"/><rect x="290" y="144" width="30" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="305" y="164" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">1</text><line x1="349" y1="54" x2="349" y2="86" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="349" y1="116" x2="349" y2="138" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M345 138 L349 144 L353 138 Z" fill="currentColor"/><rect x="334" y="144" width="30" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="349" y="164" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">1</text><line x1="393" y1="54" x2="393" y2="86" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="393" y1="116" x2="393" y2="138" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M389 138 L393 144 L397 138 Z" fill="currentColor"/><rect x="378" y="144" width="30" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="393" y="164" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">1</text><text x="229.0" y="16" font-size="12" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">176 = 10110000</text><text x="229.0" y="190" font-size="11" text-anchor="middle" font-weight="400" opacity=".75" fill="currentColor">→ 01001111 (complemento a uno: ogni bit ribaltato)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il complemento a uno non è una sottrazione: è un ribaltamento di bit. Un unico segnale <em>Invert</em> decide se ogni bit passa invariato (Invert = 0) o rovesciato (Invert = 1).</figcaption>
</figure>

Con questo, `253 − 176` in binario (`11111101 − 10110000`) diventa: si inverte `10110000` ottenendo `01001111`, si somma `11111101`, si aggiunge `1` e infine si **sottrae `100000000`** (256) — operazione che si riduce a *buttare via il nono bit* (quello più a sinistra). Il risultato è `01001101`, cioè **77**: identico al calcolo decimale, senza un solo prestito.

## Una macchina che somma e sottrae

A questo punto basta poco per trasformare il sommatore a 8 bit del [capitolo 14](14-adding-with-logic-gates.md) in una macchina che **somma e sottrae**. Serve un blocco che calcoli il complemento a uno *solo quando* si sottrae: si ottiene con otto porte **XOR** comandate da un unico segnale. La XOR ha esattamente il comportamento giusto (con il segnale a 0 lascia passare il bit, con il segnale a 1 lo inverte), quindi otto XOR formano la scatola **Complemento a uno**.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 500 248" role="img" aria-label="Macchina somma/sottrai: A entra nel sommatore; B passa per il Complemento a uno; il segnale Sottrai comanda l'inversione di B e il Carry In a 1; l'uscita è la Somma" style="width:100%;max-width:520px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="270" y="52" width="150" height="40" rx="7" fill="var(--link,#059669)" fill-opacity=".14" stroke="currentColor" stroke-width="1.6"/><text x="345.0" y="76.0" font-size="11.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Complemento a uno</text><rect x="60" y="135" width="360" height="52" rx="7" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="240.0" y="165.0" font-size="13" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Sommatore a 8 bit</text><line x1="150" y1="30" x2="150.0" y2="130.0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M150.0 135.0 L146.0 128.0 L154.0 128.0 Z" fill="currentColor"/><text x="150" y="22" font-size="12.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">A</text><line x1="345" y1="18" x2="345.0" y2="47.0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M345.0 52.0 L341.0 45.0 L349.0 45.0 Z" fill="currentColor"/><text x="345" y="12" font-size="12.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">B</text><line x1="345" y1="92" x2="345.0" y2="130.0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M345.0 135.0 L341.0 128.0 L349.0 128.0 Z" fill="currentColor"/><text x="448" y="44" font-size="11.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Sottrai</text><line x1="448" y1="52" x2="448" y2="161" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="448" y1="74" x2="425.0" y2="74.0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M420.0 74.0 L427.0 70.0 L427.0 78.0 Z" fill="currentColor"/><line x1="448" y1="161" x2="425.0" y2="161.0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M420.0 161.0 L427.0 157.0 L427.0 165.0 Z" fill="currentColor"/><line x1="240" y1="187" x2="240.0" y2="215.0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M240.0 220.0 L236.0 213.0 L244.0 213.0 Z" fill="currentColor"/><text x="240" y="234" font-size="11" text-anchor="middle" font-weight="400" opacity=".85" fill="currentColor">Somma (8 bit)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">L'ingresso <strong>B</strong> passa per il <strong>Complemento a uno</strong>; il segnale <strong>Sottrai</strong> ne comanda l'inversione <em>e</em> imposta il <strong>Carry In</strong> del sommatore a 1 (il «+1» del complemento a due). Con Sottrai = 0 la macchina è un semplice sommatore; con Sottrai = 1 sottrae.</figcaption>
</figure>

Con «Sottrai» a 0, l'inversione non avviene e il carry in ingresso è 0: è la pura somma del capitolo 14. Con «Sottrai» a 1, i bit di B vengono invertiti e si aggiunge 1 impostando il **Carry In** a 1. Un nono LED, un tempo il riporto in uscita, ora si chiama **Overflow** e segnala un problema: per una somma si accende se il risultato supera gli 8 bit; per una sottrazione, se stiamo togliendo un numero più grande da uno più piccolo (un risultato negativo che questa macchina non è ancora attrezzata a mostrare).

## Come si scrive un numero negativo: il complemento a due

Finora abbiamo parlato di negativi senza dire *come* si scrive un numero negativo con soli 0 e 1. Si potrebbe usare un bit come segno (1 = negativo), ma c'è una soluzione migliore, diventata **lo standard** nei computer: il **complemento a due**. Il prezzo da pagare è deciderne in anticipo il numero di cifre; il vantaggio è enorme: si sommano positivi e negativi con le **sole regole dell'addizione**.

L'idea si capisce con un conto corrente il cui saldo sta sempre tra −500 e +499: sono 1000 valori, esprimibili con tre cifre *senza* segno. Dato che il massimo positivo è 499, le cifre da **500 a 999 restano libere** e le usiamo per i negativi (−500 → 500, −1 → 999, 0 → 000, 1 → 001…). I numeri formano così un **cerchio**: dopo il più grande positivo riparte il più piccolo negativo, e `999 + 1` non fa 1000 ma torna a `000`. In binario, l'equivalente è appunto il **complemento a due**.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 480 340" role="img" aria-label="Ruota del complemento a due a 8 bit: 0 in alto, positivi 0..127 a destra (segno 0), negativi -128..-1 a sinistra (segno 1); 127+1 ribalta a -128" style="width:100%;max-width:440px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><circle cx="240" cy="175" r="120" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="240" y1="55" x2="240" y2="295" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="4 4"/><circle cx="240.0" cy="55.0" r="3.5" fill="currentColor"/><text x="240.0" y="33.0" font-size="12.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">0</text><text x="240.0" y="46.0" font-size="8.5" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">00000000</text><circle cx="288.8" cy="65.4" r="3.5" fill="currentColor"/><text x="296.94313003061205" y="45.10363593003588" font-size="12.5" text-anchor="start" font-weight="700" opacity="1" fill="currentColor">1</text><text x="296.94313003061205" y="58.10363593003588" font-size="8.5" text-anchor="start" font-weight="400" opacity=".7" fill="currentColor">00000001</text><circle cx="288.8" cy="284.6" r="3.5" fill="currentColor"/><text x="296.94313003061205" y="300.8963640699641" font-size="12.5" text-anchor="start" font-weight="700" opacity="1" fill="currentColor">127</text><text x="296.94313003061205" y="313.8963640699641" font-size="8.5" text-anchor="start" font-weight="400" opacity=".7" fill="currentColor">01111111</text><circle cx="191.2" cy="284.6" r="3.5" fill="currentColor"/><text x="183.05686996938798" y="300.89636406996414" font-size="12.5" text-anchor="end" font-weight="700" opacity="1" fill="currentColor">−128</text><text x="183.05686996938798" y="313.89636406996414" font-size="8.5" text-anchor="end" font-weight="400" opacity=".7" fill="currentColor">10000000</text><circle cx="191.2" cy="65.4" r="3.5" fill="currentColor"/><text x="183.05686996938798" y="45.10363593003588" font-size="12.5" text-anchor="end" font-weight="700" opacity="1" fill="currentColor">−1</text><text x="183.05686996938798" y="58.10363593003588" font-size="8.5" text-anchor="end" font-weight="400" opacity=".7" fill="currentColor">11111111</text><path d="M 313.9 80.4 A 120 120 0 0 1 337.1 104.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M331.1 101.5 L337.1 104.5 L336.1 97.5 Z" fill="currentColor"/><text x="309.0566208325105" y="108.31279643593626" font-size="12" text-anchor="middle" font-weight="700" opacity=".85" fill="currentColor">+1</text><text x="388" y="169" font-size="11" text-anchor="start" font-weight="700" opacity="1" fill="currentColor">positivi</text><text x="388" y="183" font-size="9" text-anchor="start" font-weight="400" opacity=".7" fill="currentColor">segno 0</text><text x="92" y="169" font-size="11" text-anchor="end" font-weight="700" opacity="1" fill="currentColor">negativi</text><text x="92" y="183" font-size="9" text-anchor="end" font-weight="400" opacity=".7" fill="currentColor">segno 1</text><text x="240" y="333" font-size="9.5" text-anchor="middle" font-weight="400" opacity=".75" fill="currentColor">si conta in senso orario; tra 127 e −128 c'è la "giuntura": 127 + 1 ribalta a −128 (overflow)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il complemento a due a 8 bit come un quadrante: lo <strong>0</strong> in alto, i positivi <code>0…127</code> a destra (bit di segno 0), i negativi <code>−128…−1</code> a sinistra (bit di segno 1). Il bit più a sinistra fa da <strong>segno</strong>.</figcaption>
</figure>

Con un byte, ogni numero che comincia per `1` è negativo. Il bit più a sinistra è il **bit di segno** (1 = negativo, 0 = positivo), e l'intervallo diventa **da −128 a +127** (sempre 256 valori, ma spostati). Per ottenere il complemento a due di un numero basta **invertirlo e aggiungere 1** (nei due sensi):

| Binario | Decimale (con segno) |
|:--:|:--:|
| `10000000` | −128 |
| `10000001` | −127 |
| … | … |
| `11111111` | −1 |
| `00000000` | 0 |
| `00000001` | 1 |
| … | … |
| `01111111` | 127 |

Il bello è che ora `−127 + 124` è una semplice addizione binaria (`10000001 + 01111100 = 11111101`, cioè −3): niente segni, niente sottrazioni.

## Overflow, con segno e senza segno

C'è un'insidia: l'**overflow**, quando il risultato esce dall'intervallo −128…127. Sommando `125 + 125` si ottiene `11111010`, che con il bit di segno a 1 va letto come **−6**: due positivi hanno prodotto un «negativo». La regola è netta: sommando due numeri in complemento a due, il risultato è **invalido se i due operandi hanno lo stesso segno ma il risultato ha segno diverso** (sommare un positivo e un negativo è invece sempre valido). Una manciata di gate in più (sui bit di segno di A, B e della somma) accende la spia di overflow.

Tutto questo introduce una distinzione fondamentale. Un byte interpretato come **senza segno** (*unsigned*) copre `0…255`; interpretato **con segno** (*signed*, cioè in complemento a due) copre `−128…127`. Il termine formale è **integer** (un intero, positivo o negativo, senza parte frazionaria). Otto bit spesso non bastano, così si usano interi più larghi:

| Dimensione | Senza segno | Con segno |
|:--|:--|:--|
| **8 bit** | 0 … 255 | −128 … 127 |
| **16 bit** | 0 … 65.535 | −32.768 … 32.767 |
| **32 bit** | 0 … 4.294.967.295 | −2.147.483.648 … 2.147.483.647 |
| **64 bit** | 0 … 18.446.744.073.709.551.615 | −9.223.372.036.854.775.808 … 9.223.372.036.854.775.807 |

Gli intervalli sono potenze di 2: 16 bit rappresentano `2^16` = 65.536 valori diversi.

## La lezione: i bit da soli non dicono nulla

Ecco il punto che conta più di ogni tabella. Se qualcuno dice *«ho un byte, vale `10110110`, quanto fa in decimale?»*, la risposta corretta è un'altra domanda: *«con segno o senza?»*. Perché quello stesso byte vale **182** se unsigned e **−74** se signed. I bit sono soltanto 0 e 1: non dicono niente di sé stessi. Il loro significato (numero con o senza segno, ma anche carattere, colore, istruzione) viene sempre dal **contesto** in cui vengono usati. È una delle idee più importanti di tutto il libro.

## Ripasso lampo

<details>
<summary>Perché sottrarre è più scomodo che sommare, per un circuito?</summary>

Perché la sottrazione richiede il **prestito** (*borrow*), un meccanismo «avanti-e-indietro» tra colonne più intricato del riporto della somma. La soluzione è non sottrarre affatto: si trasforma `a − b` in `a + (−b)` usando il **complemento**, così restano solo addizioni.

</details>

<details>
<summary>Cos'è il <strong>complemento a uno</strong> di un numero binario, e come si calcola?</summary>

È il risultato del sottrarlo da una fila di 1 (`11111111`), ma in pratica si ottiene **invertendo ogni bit** (0↔1) — la stessa operazione dell'inverter. Per esempio, il complemento a uno di `10110000` è `01001111`. Non serve alcun prestito.

</details>

<details>
<summary>Come fa una macchina a sottrarre riusando il sommatore?</summary>

Si mette l'ingresso B in una scatola **Complemento a uno** (otto XOR): un segnale <em>Sottrai</em> ne comanda l'inversione dei bit e imposta il **Carry In** del sommatore a 1 (l'«+1» che, insieme all'inversione, dà il complemento a due). Con Sottrai = 0 nulla cambia ed è una semplice somma.

</details>

<details>
<summary>Cos'è il <strong>bit di segno</strong> e qual è il range di un byte con segno?</summary>

Nel **complemento a due**, il bit più a sinistra indica il segno: `0` = positivo, `1` = negativo. Con 8 bit i valori vanno da **−128 a +127**. Il complemento a due di un numero si ottiene invertendo i bit e aggiungendo 1.

</details>

<details>
<summary>Il byte <code>10110110</code>: quanto vale?</summary>

Dipende dal contesto: **182** se interpretato come *unsigned*, **−74** se come *signed* (complemento a due). I bit da soli non lo dicono — il significato lo stabilisce chi li usa.

</details>

**In sintesi:**

- La sottrazione richiede il **prestito**, scomodo per i gate; la si evita trasformandola in **somma di un negativo** tramite il **complemento**.
- **Complemento a nove** (decimale) e **complemento a uno** (binario) si calcolano senza prestiti; in binario il complemento a uno è semplicemente **invertire i bit**.
- Una macchina **somma/sottrai** riusa il sommatore: inverte B (otto XOR) e mette il **Carry In a 1** quando sottrae — cioè fa il **complemento a due**.
- I negativi si scrivono in **complemento a due**: bit più a sinistra = **segno**, range **−128…127** per un byte; si somma tutto con le sole regole dell'addizione, badando all'**overflow**.
- I bit **non dicono nulla di sé**: `10110110` è 182 o −74 a seconda che sia *unsigned* o *signed*. Il significato viene dal **contesto**.
