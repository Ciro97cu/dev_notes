# Indice completo

Appunti di **HTML moderno**, orientati alle **decisioni** che contano (quale elemento usare, come costruire form accessibili, come funziona l'accessibilità) e non al catalogo dei tag. Ogni modulo chiude con un Ripasso lampo e una sintesi.

> Appunti personali di studio, verificati su [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML) e sulle specifiche [WHATWG HTML](https://html.spec.whatwg.org/).

## Moduli

| # | Modulo | Contenuto |
|---|--------|-----------|
| 01 | [Il documento e il DOM](docs/01-documento-dom.md) | Scheletro di una pagina (`<!doctype>`, `<html lang>`, `<head>`/`<body>`), come il markup diventa DOM, rapporto con CSS/JS |
| 02 | [Il `<head>` e i metadati](docs/02-head-metadati.md) | `charset`, `<title>`, viewport, `description`, Open Graph, `<link>`, `<script defer>` |
| 03 | [Semantica e struttura](docs/03-semantica-struttura.md) | Landmark, `<article>`/`<section>`, outline dei titoli, elementi semantici, quando `<div>`/`<span>` |
| 04 | [Testo e link](docs/04-testo-link.md) | `<strong>`/`<em>` vs `<b>`/`<i>`, liste, `<a>` (testo descrittivo, `rel="noopener"`), tabelle accessibili (`caption`, `scope`) |
| 05 | [Form](docs/05-form.md) | `method`, tipi di `<input>`, `<label>`, `<fieldset>`, validazione nativa + Constraint Validation API, `name`/`autocomplete` |
| 06 | [Media e contenuti embedded](docs/06-media-embedded.md) | `<img>` e `alt`, immagini responsive (`srcset`/`<picture>`), `<video>`/`<track>`, `<iframe>` (`title`/`sandbox`), SVG inline vs `<img>` |
| 07 | [Accessibilità e ARIA](docs/07-accessibilita-aria.md) | Albero di accessibilità, regola d'oro di ARIA, nome accessibile, tastiera/focus, WCAG, tooling (axe, Lighthouse, screen reader) |
| 08 | [Evoluzione dell'HTML](docs/08-evoluzione-html.md) | Living Standard WHATWG, i tre modelli (JS/CSS/HTML) a confronto, "nessuna versione", legacy e "don't break the web" |
| 09 | [Web Components](docs/09-web-components.md) | Custom Elements, Shadow DOM, `<template>`/`<slot>`; quando usarli e i limiti; l'aggancio con Angular Elements |
