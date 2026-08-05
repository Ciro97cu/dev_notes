// Anti-flash del tema per l'hub (stessa chiave localStorage dei vault).
// Tema condiviso con le sezioni (stessa chiave localStorage 'dev-notes-theme'), anti-flash.
(function () {
  try {
    var saved = localStorage.getItem('dev-notes-theme');
    var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
