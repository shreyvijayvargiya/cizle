---
name: site-haut-de-gamme
description: Enchaîne la création complète d'un site web haut de gamme en 9 phases validées une par une — stratégie, système de design, contenu, code, actifs visuels, raffinement, recette, préparation au lancement, mise en ligne. À utiliser quand l'utilisateur veut créer un site premium de bout en bout, dit "la chaîne des 9 prompts", "phase 1 du site", "on passe à la phase suivante", "refais-moi un site complet pour X", ou reprend un chantier de site déjà commencé avec cette méthode. Convient aussi bien à un site vitrine qu'à une boutique. Ne pas utiliser pour une simple page unique (voir brief-artisan) ni pour corriger un site existant (voir audit-anti-vibe-coding).
---

# Site haut de gamme — chaîne en 9 phases

Cette skill remplace neuf prompts enchaînés à la main. Elle produit un site professionnel complet, avec un livrable daté et versionné à chaque phase, et **une validation de l'utilisateur entre chaque phase**.

## Règle d'or : les portes de validation

**Ne jamais enchaîner deux phases sans accord explicite.** La valeur de cette méthode vient des points d'arrêt : chaque phase s'appuie sur des décisions approuvées à la précédente. Un enchaînement automatique produit un site cohérent avec lui-même mais faux par rapport au besoin.

Chaque phase se termine par :
1. un livrable écrit sous forme de fichier téléchargeable (ou, si la création de fichiers n'est pas activée, livré dans la conversation) ;
2. un résumé court dans le fil de discussion, qui dit ce qui a été décidé et **ce qui a été découvert ou corrigé** ;
3. **une seule question** à l'utilisateur, celle qui bloque la suite.

Seule exception : l'utilisateur écrit explicitement « enchaîne tout » ou « ne t'arrête pas ». Le lui rappeler une fois, puis obéir.

## Où en est le chantier

Au démarrage, chercher `JOURNAL-<projet>.md` dans les fichiers du projet ou les documents joints.
- **Trouvé** → le lire, annoncer la phase atteinte, reprendre là.
- **Absent** → on commence à la phase 1. Créer le journal à partir de `assets/modele-journal.md` dès la fin de la phase 1.

Le journal est la mémoire du chantier : décisions closes, versions des livrables, informations manquantes, écarts signalés. Le mettre à jour à la fin de chaque phase.

## Les 9 phases

| # | Phase | Livrable | Skills à charger en plus |
|---|---|---|---|
| 1 | Stratégie et plan du site | `strategie-<projet>-vN.md` | — |
| 2 | Système de design | `systeme-design-<projet>-vN.md` + spécimen HTML | `frontend-design`, `ui-ux-pro-max` |
| 3 | Contenu rédactionnel | `contenu-<projet>-vN.md`, `pages-legales-<projet>-vN.md` | `humanizer` |
| 4 | Développement | code complet + `LISEZ-MOI.md` | `frontend-design` |
| 5 | Actifs visuels | `inventaire-visuels-<projet>-vN.md` + actifs générés | — |
| 6 | Raffinement premium | `raffinement-vN.md` + différentiel | `audit-anti-vibe-coding` |
| 7 | Recette complète | `recette-vN.md` + corrections | `audit-anti-vibe-coding`, `searchfit-seo:seo-audit` |
| 8 | Préparation au lancement | `lancement-<projet>-vN.md` + fichiers de configuration | `searchfit-seo:technical-seo` |
| 9 | Mise en ligne guidée | `mise-en-ligne-<projet>-vN.md` | `documentation-client` si le site est livré à un client |

Les skills de la colonne de droite sont **facultatives** : les utiliser si elles sont installées, sinon appliquer directement les consignes de `references/phases.md`.

Le détail de chaque phase, ses contrôles et ses pièges : `references/phases.md`. **Le lire avant de commencer une phase**, pas seulement au démarrage du chantier.

## Garde-fous permanents

Ils s'appliquent aux neuf phases. Détail et justification dans `references/garde-fous.md`.

1. **Ne rien inventer.** Aucun témoignage, chiffre, avis, tarif, prénom, date ou capacité produit qui ne vienne pas de l'utilisateur ou d'une source vérifiée. Toute information manquante devient un repère `[[EN MAJUSCULES]]`, visible en rouge sur le site, et listée dans un fichier `A-COMPLETER.md`.
2. **Vérifier avant d'écrire.** Tarifs, limites d'offres gratuites, noms de fonctionnalités, articles de loi : recherche web à la date du jour. Un trou signalé vaut mieux qu'une valeur plausible.
3. **Ne pas rouvrir une décision close** consignée au journal, sauf demande explicite.
4. **Signaler tout de suite ce qui coûtera cher plus tard.** Un arbitrage à effet transversal se dit au moment où il apparaît, avec le coût de la reprise.
5. **Choisir la bonne pile technique, pas la plus simple à écrire.** Un site qui encaisse des paiements, gère des comptes ou livre des fichiers protégés a besoin d'un vrai socle (WordPress/WooCommerce, ou équivalent). Le HTML statique est alors la **référence visuelle**, pas le produit livré. Le dire dès la phase 1.
6. **Mesurer, ne pas estimer.** Contrastes calculés, débordements testés, accessibilité passée à l'outil. Voir `references/verifications.md`.
7. **Assumer les erreurs.** Si une phase antérieure s'est trompée, le dire dans le livrable suivant, avec la correction et son coût.

## Ton et format des livrables

- Langue de l'utilisateur, phrases courtes. Tutoiement par défaut, vouvoiement si l'utilisateur vouvoie.
- Pas de tiret cadratin, pas d'emoji, pas de tournure « pas X, mais Y », pas de superlatif.
- Chaque livrable porte une date, un numéro de version, et un historique en fin de document.
- Les livrables sont des documents de travail : tableaux, décisions, raisons. Pas de prose de présentation.

## Outils fournis

- `scripts/build.py` — assembleur de site statique : partiels, repères `[[…]]`, espaces insécables françaises, plan du site, `robots.txt`, rapport des informations manquantes. Modèle à adapter au projet.
- `scripts/verifier.py` — banc de recette (nécessite Playwright et axe-core : fonctionne dans Claude Code ou sur un poste local, souvent pas dans l'environnement de Claude.ai ; dans ce cas, faire les contrôles à la main avec la liste de `references/verifications.md`) : liens et ancres, titres, débordements de 320 à 1440 px, accessibilité axe-core, erreurs console. Utilisé aux phases 4, 6, 7 et 9.
- `assets/modele-journal.md` — modèle du journal de chantier.

## Démarrage

Si l'utilisateur lance la chaîne sans préciser le projet, poser en une seule salve, avec l'outil de questions : le nom du projet, ce que le site doit accomplir en priorité, qui est visé, et s'il existe déjà un hébergement ou un domaine. Puis enchaîner sur la phase 1.
