<div class="cover-wrap">
  <div class="cover-kicker">Architecture study system · SAA-C03</div>
  <figure class="cover-blueprint">
    <svg viewBox="0 0 720 250" role="img" aria-label="Una richiesta attraversa un edge point e raggiunge un workload distribuito in tre Availability Zone della Region eu-west-1">
      <defs>
        <marker id="bp-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 0L8 4L0 8Z" fill="currentColor"/>
        </marker>
      </defs>
      <g fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="55" cy="125" r="25"/>
        <path d="M43 125h24M55 113v24"/>
        <path d="M80 125h48" marker-end="url(#bp-arrow)"/>
        <path d="M143 104l20 12v23l-20 12-20-12v-23z"/>
        <path d="M164 125h51" marker-end="url(#bp-arrow)"/>
        <rect x="225" y="28" width="465" height="194" rx="16" stroke-dasharray="8 7"/>
        <rect x="252" y="76" width="126" height="112" rx="10"/>
        <rect x="395" y="76" width="126" height="112" rx="10"/>
        <rect x="538" y="76" width="126" height="112" rx="10"/>
        <path d="M378 132h17M521 132h17"/>
      </g>
      <g fill="var(--aws-orange,#ff9900)" stroke="none">
        <rect x="286" y="116" width="58" height="34" rx="5"/>
        <rect x="429" y="116" width="58" height="34" rx="5"/>
        <rect x="572" y="116" width="58" height="34" rx="5"/>
      </g>
      <g fill="currentColor" font-family="ui-monospace,SFMono-Regular,Menlo,monospace">
        <text x="55" y="169" font-size="12" text-anchor="middle">client</text>
        <text x="143" y="174" font-size="12" text-anchor="middle">edge</text>
        <text x="246" y="55" font-size="13">Region eu-west-1</text>
        <text x="315" y="99" font-size="12" text-anchor="middle">AZ a</text>
        <text x="458" y="99" font-size="12" text-anchor="middle">AZ b</text>
        <text x="601" y="99" font-size="12" text-anchor="middle">AZ c</text>
        <text x="315" y="138" font-size="11" text-anchor="middle" fill="#182939">workload</text>
        <text x="458" y="138" font-size="11" text-anchor="middle" fill="#182939">workload</text>
        <text x="601" y="138" font-size="11" text-anchor="middle" fill="#182939">workload</text>
      </g>
    </svg>
    <figcaption>Ogni servizio si studia come una decisione dentro un'architettura, non come una scheda da imparare a memoria.</figcaption>
  </figure>
  <h1>AWS Solutions Architect</h1>
  <p class="cover-sub">Dai fondamenti alla certificazione Associate</p>
  <p class="cover-desc">Teoria in italiano, terminologia d'esame in inglese, diagrammi visual-first e laboratori guidati in Console, AWS CLI e CloudFormation.</p>
  <div class="cover-actions">
    <a class="cover-btn is-resume" id="nav-resume" href="#/" style="display:none"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg><span>Riprendi</span></a>
    <a class="cover-btn is-primary" href="#/docs/00-orientamento-saa-c03"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg><span>Inizia il percorso</span></a>
    <a class="cover-btn" href="#/exam/matrice-saa-c03"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-7"/></svg><span>Matrice d'esame</span></a>
    <a class="cover-btn" href="#/labs/01-bootstrap-account"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v7.31"/><path d="M14 9.3V2"/><path d="M8.5 2h7"/><path d="M14 9.3a6 6 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg><span>Primo laboratorio</span></a>
  </div>
  <div class="cover-about">
    <div class="about-col">
      <button class="about-head" type="button" aria-expanded="false">Metodo</button>
      <div class="about-body"><div class="about-inner">
        <ul>
          <li>Si parte dai problemi architetturali, poi si scelgono i servizi.</li>
          <li>Ogni decisione mette a confronto requisiti, trade-off e distrattori.</li>
          <li>La matrice mantiene visibile la copertura dei 14 task SAA-C03.</li>
        </ul>
      </div></div>
    </div>
    <div class="about-col">
      <button class="about-head" type="button" aria-expanded="false">Pratica</button>
      <div class="about-body"><div class="about-inner">
        <ul>
          <li>Micro-lab indipendenti più un'applicazione ordini progressiva.</li>
          <li>Console per osservare, CLI per verificare, CloudFormation per ripetere.</li>
          <li>Costo previsto, failure drill e teardown sono sempre espliciti.</li>
        </ul>
      </div></div>
    </div>
    <div class="about-col">
      <button class="about-head" type="button" aria-expanded="false">Fonti</button>
      <div class="about-body"><div class="about-inner">
        <ul>
          <li>Exam Guide e documentazione AWS come fonti primarie.</li>
          <li>Dati variabili accompagnati dalla data di verifica.</li>
          <li>Nessun exam dump: le domande sono originali e motivate.</li>
        </ul>
      </div></div>
    </div>
  </div>
  <p class="cover-disclaimer">Percorso vivo verificato sulle fonti AWS ufficiali · ultimo controllo blueprint: 4 settembre 2026</p>
</div>
