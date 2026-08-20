/*
 * Versione dell'hub Dev Notes — SemVer (MAJOR.MINOR.PATCH).
 *
 * A cosa serve: dopo un push, un hard-refresh dell'hub deve mostrare il numero
 * aggiornato in fondo alla pagina → conferma che il deploy è davvero salito
 * (toglie il dubbio "è cache o è la nuova versione?"). Il numero è un link ai
 * tag/release del repo su GitHub.
 *
 * Quando si bumpa (a ogni rilascio che cambia il sito):
 *   PATCH  correzioni e ritocchi              (1.0.0 → 1.0.1)
 *   MINOR  nuove note o funzionalità          (1.0.1 → 1.1.0)
 *   MAJOR  cambi strutturali di hub/vault      (1.1.0 → 2.0.0)
 *
 * Unica cosa da toccare: la costante DN_VERSION qui sotto (e, a ogni bump, il
 * tag git corrispondente: `git tag -a vX.Y.Z -m "…"`).
 */
window.DN_VERSION = "1.34.4";
window.DN_REPO = "https://github.com/Ciro97cu/dev_notes";

(function () {
  function stamp() {
    var f = document.querySelector("footer");
    if (!f || f.querySelector(".dn-ver")) return;
    f.appendChild(document.createTextNode(" · "));
    var a = document.createElement("a");
    a.className = "dn-ver";
    a.textContent = "v" + window.DN_VERSION;
    a.href = window.DN_REPO + "/tags";
    a.target = "_blank";
    a.rel = "noopener";
    a.title = "Versioni e tag su GitHub";
    a.style.color = "inherit";
    a.style.textDecoration = "underline dotted";
    a.style.textUnderlineOffset = "2px";
    f.appendChild(a);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", stamp);
  else stamp();
})();
