# Démo HTML4 / CSS2.1 / jQuery 1

Ce projet illustre une page moderne visuellement, réalisée uniquement avec des technologies « anciennes »: HTML 4.01, CSS 2.1 et jQuery 1.x. Aucune fonctionnalité CSS3/HTML5 moderne n’est utilisée côté 2.1 (pas de flex, grid, @media, animations CSS, etc.).

## Lancer le projet
- Prérequis: PHP (pour servir les fichiers et les endpoints en /api)
- Démarrage rapide:
  - `php -S 0.0.0.0:8000 -t .`
  - Ouvrir http://localhost:8000/

## Structure
- index.html — Page principale (doctype HTML 4.01 Transitional)
- styles_21.css — Feuilles de style CSS 2.1 (sans @media, sans effets CSS3)
- scripts_21.js — Interactions jQuery 1 (menu burger, tabs, carrousel, lazy-loading, galerie/lightbox, thème)
- api/ — Endpoints PHP de démonstration (avis)
- data/ — Base SQLite de test

## Fonctionnalités (compatibles 2000–2010)
- Navigation « burger »: jQuery 1 (`slideDown/slideUp`) pour afficher/masquer le menu en mobile.
- Responsive sans @media: la classe `body.mobile` est ajoutée dynamiquement en JS <768px; les règles CSS 2.1 ciblent `body.mobile`.
- Carrousel d’images: changement de slide simple, points de navigation.
- Galerie + lightbox: vignettes cliquables ouvrent une image agrandie.
- Vidéo intégrée via `<iframe>` (compatible HTML4).
- Lazy-loading classique: images avec `data-src` + écouteurs `scroll/resize` (pas d’IntersectionObserver).
- Thème jour/nuit basique (classes et couleurs CSS simples).
- Formulaire « Avis »: validation jQuery, envoi POST vers PHP, persistance locale de secours (localStorage).

## Contraintes respectées
- HTML: Doctype HTML 4.01 Transitional.
- CSS: Niveau 2.1 uniquement.
  - Pas de flexbox, grid, animations, transitions, gradients CSS3, etc. (dans styles_21.css)
  - Mise en page via floats, pourcentages, `overflow: hidden`.
- JS: jQuery 1.x uniquement pour les interactions.

## Validation W3C
- CSS 2.1: utiliser le W3C CSS Validation Service (niveau 2.1) sur `styles_21.css`.
- HTML: passer `index.html` au validateur du W3C.

## Notes d’accessibilité et de performance
- Les images sont fluides (`max-width:100%`) et lazy-loadées pour réduire le temps de chargement initial.
- Les actions au clavier (Esc pour fermer la lightbox) sont prises en charge.
- Couleurs avec contraste lisible pour les champs et labels.

## Adaptation visuelle
- Version 2.1: styles sobres et plats pour rester conforme.
- Une version « moderne » (styles.css / scripts.js) peut exister à côté, mais n’est pas nécessaire pour la soutenance CSS 2.1.

## Personnalisation rapide
- Largeurs colonnes: `.col-left` et `.col-right` dans `styles_21.css`.
- Galerie: 3 vignettes par ligne via `.gallery .thumb { width:31%; margin:1%; }` et équivalent `body.mobile`.
- Hauteur zone commentaire: `textarea { height: 180px; }`.

## Limitations connues
- Pas de media queries: la bascule responsive passe par `body.mobile` contrôlé en JS.
- Pas d’effets avancés CSS (ombres, blur, etc.) dans la version 2.1.
