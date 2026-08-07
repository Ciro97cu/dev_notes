// Stile (condiviso) delle 3 sezioni "Come funziona" sulla cover: layout a colonne e
// animazione. I colori sono fissi (testo bianco sul fondo brand), quindi vale per tutti.
(function () {
  var css = [
    '.cover-about{display:grid;grid-template-columns:repeat(3,1fr);align-items:start;gap:.8rem;width:100%;max-width:860px;margin:1.6rem auto .2rem;text-align:left}',
    '.cover-about .about-col{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);border-radius:12px;padding:0 .95rem}',
    '.cover-about .about-head{width:100%;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.7rem 0;border:0;background:transparent;font:inherit;font-weight:700;font-size:.92rem;color:#fff;text-align:left}',
    '.cover-about .about-head::after{content:"+";font-weight:400;opacity:.65}',
    '.cover-about .about-col.open .about-head::after{content:"\\2212"}',
    '.cover-about .about-body{overflow:hidden;max-height:0;transition:max-height .32s ease}',
    '.cover-about .about-col.open .about-body{max-height:30rem}',
    '.cover-about .about-inner{font-size:.8rem;line-height:1.5;color:rgba(255,255,255,.85)}',
    '.cover-about .about-inner ul{margin:.35rem 0 .85rem;padding-left:1.1rem}',
    '.cover-about .about-inner li{margin:.28rem 0}',
    '.cover-about .about-inner code{background:rgba(255,255,255,.14);padding:0 .3em;border-radius:4px}',
    '@media (max-width:720px){.cover-about{grid-template-columns:1fr;max-width:460px}}'
  ].join('');
  var el = document.createElement('style');
  el.id = 'cover-about-styles';
  el.textContent = css;
  (document.head || document.documentElement).appendChild(el);
})();

// Espansione fluida delle sezioni "Come funziona" sulla cover: ogni sezione si apre e
// chiude in modo indipendente (più di una può restare aperta). L'animazione è CSS.
document.addEventListener('click', function (e) {
  var h = e.target && e.target.closest && e.target.closest('.about-head');
  if (!h) return;
  var open = h.parentNode.classList.toggle('open');
  h.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// Toggle tema chiaro/scuro, persistito in localStorage (key: dev-notes-theme).
// Il ramo mermaid è no-op nei vault che non caricano mermaid.
function themeTogglePlugin(hook) {
  // Icone SVG (Lucide) coerenti con gli altri pulsanti: sole quando è scuro (→ passa a chiaro), luna quando è chiaro.
  var SUN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
  var MOON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
  hook.mounted(function () {
    var KEY = 'dev-notes-theme';
    var btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Cambia tema chiaro/scuro');
    var saved = localStorage.getItem(KEY);
    var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    function apply() {
      document.documentElement.classList.toggle('dark', dark);
      btn.innerHTML = dark ? SUN : MOON;
      btn.title = dark ? 'Passa al tema chiaro' : 'Passa al tema scuro';
      if (window.mermaid && window.__mermaidInit) {
        mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'neutral' });
      }
    }
    apply();
    var themeAnimT;
    btn.addEventListener('click', function () {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduce) {                                   // colori in dissolvenza + icona che entra ruotando
        document.documentElement.classList.add('dn-theme-anim');
        clearTimeout(themeAnimT); themeAnimT = setTimeout(function () { document.documentElement.classList.remove('dn-theme-anim'); }, 380);
        btn.classList.remove('dn-spin'); void btn.offsetWidth; btn.classList.add('dn-spin');
      }
      dark = !dark;
      localStorage.setItem(KEY, dark ? 'dark' : 'light');
      apply();
    });
    document.body.appendChild(btn);
  });
}

// Renderizza i diagrammi mermaid dopo ogni cambio pagina (attivo solo se mermaid è caricato).
function mermaidPlugin(hook) {
  hook.doneEach(function () {
    if (!window.mermaid) return;
    if (!window.__mermaidInit) {
      var darkNow = document.documentElement.classList.contains('dark');
      mermaid.initialize({ startOnLoad: false, theme: darkNow ? 'dark' : 'neutral' });
      window.__mermaidInit = true;
    }
    try { mermaid.run({ querySelector: '.markdown-section .mermaid' }); } catch (e) { /* già renderizzati */ }
  });
}

// Rende collassabili i callout "Risposta" (Obsidian [!success]- / [!success]+) sul sito.
function collapsibleAnswersPlugin(hook) {
  hook.doneEach(function () {
    var callouts = document.querySelectorAll('.markdown-section .alert.callout-answer');
    callouts.forEach(function (el) {
      if (el.dataset.collapsibleReady) return;
      var heading = el.querySelector('p:first-child, .alert-heading, strong');
      if (!heading) return;
      var raw = (heading.textContent || '').trim();
      var startsCollapsed = true;
      if (/^[-+]/.test(raw)) {
        startsCollapsed = raw.charAt(0) === '-';
        heading.textContent = raw.replace(/^[-+]\s*/, '');
      }
      el.classList.add('is-collapsible');
      el.dataset.collapsibleReady = '1';
      var body = [];
      var n = heading.nextSibling;
      while (n) { body.push(n); n = n.nextSibling; }
      var wrap = document.createElement('div');
      wrap.className = 'answer-body';
      body.forEach(function (node) { wrap.appendChild(node); });
      el.appendChild(wrap);
      heading.classList.add('answer-toggle');
      heading.setAttribute('role', 'button');
      heading.setAttribute('tabindex', '0');
      function setState(open) {
        el.classList.toggle('open', open);
        heading.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      setState(!startsCollapsed);
      heading.addEventListener('click', function () { setState(!el.classList.contains('open')); });
      heading.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setState(!el.classList.contains('open')); }
      });
    });
  });
}

// "Riprendi": memorizza l'ultima posizione di lettura (pagina + sotto-sezione) e popola
// la card #nav-resume sulla cover (nascosta finché non c'è cronologia). La sotto-sezione
// è l'ultima heading superata durante lo scroll → si riapre esattamente lì (?id=…).
// Chiave per-vault via window.__VAULT.
function resumePlugin(hook, vm) {
  var KEY = (window.__VAULT || 'dev-notes') + '-last-page';
  var SKIP = { '/': 1, '/00-index': 1, '/README': 1, '/_coverpage': 1 };
  var current = null, timer = null;

  // id dell'ultima heading (h1..h4) il cui bordo superiore è sopra la soglia = sezione corrente
  function currentId() {
    var hs = document.querySelectorAll('.markdown-section h1[id], .markdown-section h2[id], .markdown-section h3[id], .markdown-section h4[id]');
    var id = '';
    for (var i = 0; i < hs.length; i++) {
      if (hs[i].getBoundingClientRect().top <= 120) id = hs[i].id; else break;
    }
    return id;
  }
  function persist() {
    if (!current) return;
    try { localStorage.setItem(KEY, JSON.stringify({ p: current, id: currentId(), t: Date.now() })); } catch (e) {}  // t: per il «Continua» globale sull'hub
  }
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      if (raw.charAt(0) === '{') return JSON.parse(raw);
      return { p: raw, id: '' };   // retro-compatibilità con la vecchia chiave (solo path)
    } catch (e) { return null; }
  }

  hook.doneEach(function () {
    var path = (vm.route && vm.route.path) || '';
    current = (path && !SKIP[path]) ? path : null;
    if (current) persist();   // salva almeno la pagina appena arrivati

    var card = document.getElementById('nav-resume');
    if (!card) return;
    var rec = read();
    if (rec && rec.p && !SKIP[rec.p]) {
      card.setAttribute('href', '#' + rec.p + (rec.id ? '?id=' + rec.id : ''));
      card.style.display = '';
      card.classList.remove('dn-resume-in'); void card.offsetWidth; card.classList.add('dn-resume-in');   // entra in dissolvenza + slide
    } else {
      card.style.display = 'none';
    }
  });

  // mentre si scorre, aggiorna la sotto-sezione salvata (debounced); capture per intercettare
  // lo scroll su qualsiasi contenitore.
  document.addEventListener('scroll', function () {
    if (!current) return;
    clearTimeout(timer);
    timer = setTimeout(persist, 200);
  }, true);
}

// ── Animazioni condivise (CSS + un solo observer) ────────────────────────────
// Raccoglie i micro-tocchi trasversali: cross-fade del contenuto a ogni cambio
// pagina, transizione morbida dei colori allo switch tema, spin dell'icona tema,
// entrata del banner "Riprendi". Zero dipendenze; tutto rispetta prefers-reduced-motion.
(function () {
  var css = [
    '@keyframes dn-page-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    '.markdown-section.dn-page-in{animation:dn-page-in .28s ease both}',
    '@keyframes dn-spin-pop{0%{transform:rotate(-90deg) scale(.6);opacity:.4}100%{transform:none;opacity:1}}',
    '#theme-toggle.dn-spin svg{animation:dn-spin-pop .4s ease}',
    // transizione dei colori attiva SOLO durante lo switch (classe rimossa dopo ~380ms)
    'html.dn-theme-anim body,html.dn-theme-anim .sidebar,html.dn-theme-anim .sidebar *,html.dn-theme-anim .content,html.dn-theme-anim .markdown-section,html.dn-theme-anim .markdown-section *{transition:background-color .32s ease,border-color .32s ease,color .32s ease !important}',
    '@keyframes dn-resume-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
    '#nav-resume.dn-resume-in{animation:dn-resume-in .34s cubic-bezier(.22,1,.36,1) both}',
    '@media (prefers-reduced-motion: reduce){.markdown-section.dn-page-in,#theme-toggle.dn-spin svg,#nav-resume.dn-resume-in{animation:none}html.dn-theme-anim body,html.dn-theme-anim .sidebar,html.dn-theme-anim .sidebar *,html.dn-theme-anim .content,html.dn-theme-anim .markdown-section,html.dn-theme-anim .markdown-section *{transition:none !important}}'
  ].join('');
  var st = document.createElement('style'); st.id = 'dn-anim-styles'; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;   // niente cross-fade di pagina se l'utente preferisce ridurre il moto

  // Cross-fade del contenuto a ogni render. docsify a volte RICREA .markdown-section,
  // a volte ne sostituisce solo i figli: copriamo entrambi osservando il contenitore e
  // filtrando (le stelle/checkbox hanno per target un heading o la sidebar, non la
  // sezione → nessun falso positivo, quindi nessun ri-fade spurio).
  var scheduled = false;
  function schedule() {
    if (scheduled) return; scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      var sec = document.querySelector('.markdown-section'); if (!sec) return;
      sec.classList.remove('dn-page-in'); void sec.offsetWidth; sec.classList.add('dn-page-in');
    });
  }
  function start() {
    var box = document.querySelector('.content') || document.querySelector('main') || document.getElementById('app');
    if (!box) { setTimeout(start, 60); return; }
    schedule();   // fade della prima pagina
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.target && m.target.classList && m.target.classList.contains('markdown-section')) { schedule(); return; }   // contenuto sostituito (riuso della sezione)
        for (var j = 0; j < m.addedNodes.length; j++) {
          var n = m.addedNodes[j];
          if (n.nodeType === 1 && n.classList && n.classList.contains('markdown-section')) { schedule(); return; }        // sezione ricreata
        }
      }
    }).observe(box, { childList: true, subtree: true });
  }
  start();
})();

