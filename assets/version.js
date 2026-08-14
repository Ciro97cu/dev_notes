/*
 * Versione dell'hub Dev Notes — SemVer (MAJOR.MINOR.PATCH).
 *
 * A cosa serve: dopo un push, un hard-refresh dell'hub deve mostrare il numero
 * aggiornato in fondo alla pagina → conferma che il deploy è davvero salito
 * (toglie il dubbio "è cache o è la nuova versione?").
 *
 * Quando si bumpa (a ogni rilascio che cambia il sito):
 *   PATCH  correzioni e ritocchi              (1.0.0 → 1.0.1)
 *   MINOR  nuove note o funzionalità          (1.0.1 → 1.1.0)
 *   MAJOR  cambi strutturali di hub/vault      (1.1.0 → 2.0.0)
 *
 * Unica cosa da toccare: le due costanti qui sotto.
 */
window.DN_VERSION = "1.0.0";
window.DN_VERSION_DATE = "2026-08-14";

(function () {
  function stamp() {
    var f = document.querySelector("footer");
    if (!f || f.querySelector(".dn-ver")) return;
    var s = document.createElement("span");
    s.className = "dn-ver";
    s.textContent = " · v" + window.DN_VERSION + " (" + window.DN_VERSION_DATE + ")";
    f.appendChild(s);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", stamp);
  else stamp();
})();
