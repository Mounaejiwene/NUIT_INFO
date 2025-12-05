# Démo HTML4 / CSS2.1 / jQuery 1

Ce projet démontre une page « moderne » et responsive sans technologies modernes côté CSS/HTML: HTML 4.01, CSS 2.1, jQuery 1.x uniquement. Pas de flexbox, grid, @media, transitions/animations, gradients, etc. Les avis utilisateurs sont stockés via une petite API PHP (PDO SQLite).

## Petit cours de démonstration
- Objectif: montrer qu’on peut obtenir une interface « moderne » avec les technos 2000–2010.
- HTML 4.01: structure classique (doctype Transitional), aucune balise HTML5.
- CSS 2.1: mise en page par floats et largeurs en %, pas de media queries. L’adaptation mobile est faite via une classe `body.mobile` ajoutée en JavaScript.
- jQuery 1: interactions essentielles seulement (menu burger en `slideToggle`, onglets, carrousel simple, galerie + lightbox, lazy‑loading d’images, thème jour/nuit).
- Média: intégration vidéo par `<iframe>` (méthode compatible avec l’époque).

## Lancer le projet
- Prérequis: PHP 7+ avec extension PDO SQLite (`pdo_sqlite`) activée
- Démarrage rapide:
  - `php -S 0.0.0.0:8000 -t .`
  - Ouvrir http://localhost:8000/
  - L’appli appelle automatiquement `api/init_db.php` pour créer/mettre à jour `data/reviews.sqlite`.

## Structure
- index.html — Page principale (doctype HTML 4.01 Transitional)
- styles.css — Feuilles de style CSS 2.1 (sans @media, sans effets CSS3)
- scripts.js — Interactions jQuery 1 (menu burger, tabs, carrousel, lazy-loading, galerie/lightbox, thème, appels API)
- api/ — Endpoints PHP (stockage/lecture des avis)
- data/ — Base SQLite (`reviews.sqlite`) créée au premier lancement

## Fonctionnalités (compatibles 2000–2010)
- Navigation « burger »: jQuery 1 (`slideDown/slideUp`) pour afficher/masquer le menu en mobile.
- Responsive sans @media: la classe `body.mobile` est ajoutée dynamiquement en JS <768px; les règles CSS 2.1 ciblent `body.mobile`.
- Carrousel d’images: changement de slide simple, points de navigation.
- Galerie + lightbox: vignettes cliquables ouvrent une image agrandie.
- Vidéo intégrée via `<iframe>` (compatible HTML4).
- Lazy-loading classique: images avec `data-src` + écouteurs `scroll/resize` (pas d’IntersectionObserver).
- Thème jour/nuit basique (classes et couleurs CSS simples).
- Formulaire « Avis »: validation jQuery et enregistrement côté serveur via API PHP/SQLite.

## API (PHP + SQLite)
- `api/init_db.php` — crée/ajoute les colonnes de la table `reviews`
- `api/save_review.php` — POST pour enregistrer un avis
  - Champs: `name`, `rating` (1..5), `comment`, `experience`, `likes` (CSV), `pains` (CSV)
- `api/get_reviews.php` — GET les 20 derniers avis
- `api/get_stats.php` — GET le nombre d’avis, moyenne, histogramme

## Avis sur ce site (comment ça marche ?)
- Remplissez le formulaire « Votre Avis » (nom, expérience, ce que vous aimez/difficile, note, commentaire) puis envoyez.
- Le navigateur envoie une requête POST à `api/save_review.php`.
- Le serveur stocke l’avis dans `data/reviews.sqlite` (table `reviews`).
- La page recharge la liste via `api/get_reviews.php` et les statistiques via `api/get_stats.php`.
- Affichages côté client: derniers avis (limités à 20), compteur, moyenne, histogramme des notes.
- Confidentialité: aucun compte ni suivi; seules les données du formulaire sont enregistrées en base locale SQLite.

## Contraintes respectées
- HTML: Doctype HTML 4.01 Transitional.
- CSS: Niveau 2.1 uniquement.
  - Pas de flexbox, grid, animations, transitions, gradients CSS3, etc. (dans styles.css)
  - Mise en page via floats, pourcentages, `overflow: hidden`.
- JS: jQuery 1.x uniquement pour les interactions.

## Validation W3C
- CSS 2.1: utiliser le W3C CSS Validation Service (niveau 2.1) sur `styles.css`.
- HTML: passer `index.html` au validateur du W3C (doctype HTML 4.01). Note: la meta `viewport` peut être signalée comme non standard en HTML4.

## Notes d’accessibilité et de performance
- Les images sont fluides (`max-width:100%`) et lazy-loadées pour réduire le temps de chargement initial.
- Les actions au clavier (Esc pour fermer la lightbox) sont prises en charge.
- Couleurs avec contraste lisible pour les champs et labels.

## Adaptation visuelle
- Styles sobres et plats pour rester conforme CSS 2.1, fournis via `styles.css` et `scripts.js`.

## Personnalisation rapide
- Largeurs colonnes: `.col-left` et `.col-right` dans `styles.css`.
- Galerie: 3 vignettes par ligne via `.gallery .thumb { width:31%; margin:1%; }` et équivalent `body.mobile`.
- Hauteur zone commentaire: `textarea { min-height: 200px; }`.

## Limitations connues
- Pas de media queries: la bascule responsive passe par `body.mobile` contrôlé en JS.
- Pas d’effets avancés CSS (ombres, blur, etc.) dans la version 2.1.

## Liens
- Dépôt GitHub: <ajouter_lien_du_dépôt_ici>
- Démo en ligne: <ajouter_lien_de_démo_ici>
