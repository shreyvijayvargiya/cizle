---
name: audit-seo-firecrawl
description: Audit SEO paramétrable d'un site web via le connecteur Firecrawl (rendu JavaScript inclus, donc fiable sur WordPress avec Yoast ou RankMath). Pose d'abord les questions de paramétrage (page unique, échantillon, crawl complet, options concurrence / visibilité IA / indexation, format du livrable), annonce un devis en crédits Firecrawl et attend la validation avant de dépenser quoi que ce soit. À utiliser dès que l'utilisateur dit "audit SEO", "audite ce site", "analyse SEO de…", "crawl complet", "pourquoi ce site ne ressort pas sur Google", "diagnostic SEO", ou colle l'URL d'un site vitrine, d'une commune, d'une association ou d'un artisan à diagnostiquer, même sans prononcer le mot "audit".
compatibility: Nécessite le connecteur Firecrawl (outils firecrawl_scrape et firecrawl_search). Fonctionne dans Claude.ai (chat) et Cowork.
---

# Audit SEO paramétrable avec Firecrawl

Objectif : un audit SEO dont chaque constat est prouvé, dont le coût en crédits Firecrawl est annoncé avant d'être dépensé, et dont le livrable est directement exploitable (y compris pour un client).

## Annonce de démarrage

La toute première ligne de la réponse, avant toute question ou tout appel d'outil, est exactement :

> 🔍 Skill audit-seo-firecrawl activé

Cela permet à l'utilisateur de vérifier que c'est bien ce skill qui tourne, et pas un autre skill d'audit SEO installé.

## Règles absolues

1. **Aucun crédit dépensé sans validation**, hormis la reconnaissance (2 à 5 crédits), annoncée au préalable.
2. **Chaque constat a une preuve** : URL concernée + extrait de ce que Firecrawl a renvoyé. Pas de preuve, pas de constat. Jamais de constat inventé ou supposé.
3. **Ce que Firecrawl ne mesure pas va en "Hors périmètre"** avec l'outil adapté (voir `references/grille-audit.md`). Ne jamais présenter une estimation comme une mesure.
4. **Garde-fous de coût** sur chaque appel `firecrawl_scrape` : jamais de format `json`, `proxy: "basic"` (évite l'escalade automatique vers le mode Enhanced à +4 crédits), un seul appel par page en combinant les formats nécessaires.
5. Si le quota est dépassé ou un appel échoue en cours de route : s'arrêter, dire ce qui a été fait, demander avant de continuer.

## Étape 0 : vérifier le connecteur

Si `firecrawl_scrape` n'est pas disponible (y compris via tool_search), le dire et proposer de connecter Firecrawl. Ne pas basculer silencieusement sur un fetch simple : le rendu JS est la raison d'être de ce skill.

## Étape 1 : paramétrage

Récupérer l'URL et tout ce que l'utilisateur a déjà précisé (périmètre, mot-clé, ville). Ne poser que les questions manquantes.

Utiliser l'outil de questions à choix disponible (`ask_user_input_v0` en chat, `AskUserQuestion` dans Cowork), sinon des questions en texte. Trois questions maximum en un seul envoi :

1. **Périmètre** (choix unique) : Page unique · Échantillon représentatif (15 pages) · Crawl complet du site · Autre nombre de pages
2. **Options** (choix multiple) : Concurrence locale sur un mot-clé · Visibilité IA (ChatGPT, Perplexity…) · Vérification d'indexation Google · Aucune option
3. **Livrable** (choix unique) : Synthèse dans la conversation · Rapport client (fichier) · Les deux

Si "Concurrence locale" est cochée et que le mot-clé ou la ville manque, le demander en une phrase.

## Étape 2 : reconnaissance (2 à 5 crédits)

Annoncer : « Je lis robots.txt et le sitemap pour compter les pages, environ N crédits. »

- Scraper `/robots.txt` (format markdown) : règles, URL du sitemap déclarée.
- Scraper le sitemap déclaré, sinon `/sitemap.xml`, sinon `/sitemap_index.xml` (WordPress/Yoast). Pour un index de sitemaps, scraper chaque sous-sitemap utile (pages, articles, produits ; ignorer les sitemaps de tags/auteurs sauf crawl complet). Chaque fichier coûte 1 crédit.
- Compter les URLs distinctes. Si aucun sitemap : le noter (c'est un constat) et passer en découverte par liens (voir `references/couts.md`).

Page unique : la reconnaissance se limite à robots.txt + sitemap (pour vérifier que la page y figure).

## Étape 3 : devis et validation

Calculer avec `references/couts.md` et afficher un devis court :

```
Devis Firecrawl — exemple.fr
Reconnaissance (déjà consommée) ...... 3 crédits
Pages à analyser : 42 × 1 ............ 42 crédits
Concurrence locale (10 résultats) .... 2 crédits + 3 pages concurrentes = 5
Marge pour pages en échec (10 %) ..... 5 crédits
TOTAL estimé ......................... ~55 crédits (≈ 5 % du quota gratuit mensuel de 1 000)
```

Signaler si le total dépasse 300 crédits ou 100 pages (voir les limites dans `references/couts.md`). Rappeler que Claude ne voit pas le solde restant : à vérifier sur le tableau de bord Firecrawl.

Demander : **Lancer · Réduire le périmètre · Annuler**. Ne rien scraper de plus avant la réponse.

## Étape 4 : collecte

Deux niveaux d'analyse, toujours un seul appel par page :

- **Analyse approfondie** (page unique, échantillon, et 10 pages modèles en crawl complet : accueil, contact, une page par gabarit) : `formats: ["markdown", "links", "rawHtml"]`, `onlyMainContent: false`. Le rawHtml (rendu après JavaScript) sert au schema JSON-LD, canonical, hreflang, Open Graph, balise robots.
- **Analyse légère** (toutes les autres pages du crawl complet) : `formats: ["markdown", "links"]`, `onlyMainContent: true`. Les métadonnées renvoyées (title, description, statusCode, langue) plus le markdown (titres #, images ![alt], volume de texte) suffisent.

Échantillon de 15 pages : accueil + pages de service/produit + contact + mentions légales + 2 à 3 articles, en répartissant entre les gabarits. Lancer les appels en parallèle quand l'outil le permet.

En crawl complet, tenir au fil de l'eau un tableau compact par page (URL, statut, title + longueur, meta description + longueur, H1, nb mots, images sans alt, liens internes sortants) plutôt que de garder le contenu brut : c'est ce qui permet de tenir dans le contexte.

Options :
- **Indexation** : `firecrawl_search` "site:domaine" (limit 10, 2 crédits). Le nombre de résultats est un indicateur, pas une mesure exacte de l'index Google.
- **Concurrence locale** : `firecrawl_search` "[mot-clé] [ville]" (limit 10), position du site dans les résultats, puis analyse légère des 3 premiers concurrents.
- **Visibilité IA** : vérifier dans robots.txt les crawlers IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended), la présence de `/llms.txt` (1 crédit) et la qualité du schema Organization/LocalBusiness.

## Étape 5 : analyse

Suivre `references/grille-audit.md` dans l'ordre des priorités. Si un problème bloquant est trouvé (ex. `Disallow: /`, noindex global), le placer en tête mais continuer l'audit.

## Étape 6 : livrable

Structure et ton : `references/modele-rapport.md`.
- Synthèse conversation : score, 5 actions prioritaires, tableau des constats critiques et importants.
- Rapport client : fichier complet (Claude Doc si disponible, sinon .md ou .docx selon la demande).
- Toujours finir par la consommation réelle : « Crédits utilisés : X (devis : Y). »
