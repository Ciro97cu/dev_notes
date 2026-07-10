# Glossario

Termini Git (in inglese) spiegati in italiano semplice. Fonte unica della
terminologia: se un termine è qui, si usa sempre questa parola negli appunti.

## Formato

`**termine**` — spiegazione breve in linguaggio comune.

## Termini

- **repository (repo)** — la cartella di progetto tracciata da Git, con tutta la sua storia.
- **working directory** — i file così come si vedono e si modificano sul disco.
- **staging area (index)** — zona intermedia dove si preparano le modifiche prima del commit.
- **commit** — una fotografia salvata dei file tracciati in un dato momento, con un id (hash).
- **hash (SHA-1)** — stringa di 40 caratteri esadecimali che identifica in modo univoco un oggetto Git.
- **HEAD** — puntatore al branch (o commit) su cui si sta lavorando ora.
- **branch** — una linea di sviluppo separata.
- **main / master** — il branch principale (`main` è lo standard attuale, `master` il vecchio nome).
- **detached HEAD** — stato in cui HEAD punta direttamente a un commit invece che a un branch.
- **merge** — unione delle modifiche di due branch in uno solo.
- **fast-forward** — merge senza nuovo commit: il puntatore del branch avanza e basta.
- **merge conflict** — stesse righe cambiate in modo diverso su due branch; vanno risolte a mano.
- **rebase** — riapplicare i commit di un branch su un'altra base, riscrivendo la storia.
- **stash** — deposito temporaneo di modifiche non ancora committate.
- **tag** — nome fisso assegnato a un commit, di solito per le release (es. `v1.0.0`).
- **SemVer (Semantic Versioning)** — schema di versionamento `MAJOR.MINOR.PATCH` con regole precise su quando incrementare ogni numero.
- **remote** — una copia del repo su un altro server (es. GitHub).
- **origin** — nome di default del remoto principale.
- **upstream** — il branch remoto a cui un branch locale è collegato.
- **remote tracking branch** — branch locale (es. `origin/main`) che riflette lo stato di un branch remoto.
- **clone** — copia locale di un repo remoto.
- **fetch** — scarica gli aggiornamenti dal remoto senza unirli.
- **pull** — `fetch` + `merge`: scarica e unisce.
- **push** — invia i commit locali al remoto.
- **fork** — copia indipendente di un repo remoto sul proprio account.
- **pull request (PR)** — richiesta di unire un branch in un altro, con review del codice.
- **blob** — oggetto Git che contiene il contenuto di un file.
- **tree** — oggetto Git che rappresenta una directory.
- **reflog** — registro locale delle posizioni passate di HEAD; serve a recuperare lavoro perso.
- **blame** — comando che mostra, riga per riga, l'ultimo commit che ha toccato un file.
- **ORIG_HEAD** — riferimento al punto in cui era HEAD prima di un'operazione rischiosa (merge, reset); utile per tornare indietro.
