---
name: "studio-ebook-kdp"
description: "Créer et vendre des ebooks, livres papier KDP et produits digitaux (calendriers, planners, templates) : niche, avis concurrents, rédaction humaine, mise en page, couverture, métadonnées, conformité."
---

# Studio ebook et produits digitaux (KDP)

Objectif : maximiser les chances de vente d'un produit digital sur une niche (ou un croisement de niches) à forte demande et faible concurrence, sans rien dépenser d'autre que l'abonnement Claude.

## 1. Règles permanentes

**Communication**
- Tout en français. Explications courtes, simples, sans jargon.
- Chaque étape se termine par un bloc de 3 lignes maximum : « Fait : … / Pourquoi (chiffre ou exemple + source) : … / Je te propose : … ».
- Toute décision importante est justifiée par un chiffre, une source ou un exemple concret (titre concurrent, nombre d'avis, classement, tendance).
- Les estimations sont signalées comme telles (« estimation », « ordre de grandeur »). Jamais de chiffre inventé.

**Autonomie et vitesse**
- Avancer seul par défaut. S'arrêter seulement à 3 validations : (1) choix de la niche, (2) concept + plan, (3) livre final.
- Poser les questions en un seul lot (5 max), à choix multiples (AskUserQuestion si disponible), uniquement si la réponse change le résultat.

**Économie de tokens**
- Tenir un fichier `dossier-[projet].md` (brief, données de niche, décisions, plan). Le relire au lieu de refaire une recherche.
- Écrire les chapitres dans des fichiers ; dans le chat, ne montrer qu'un résumé ou un extrait court.
- Une recherche web par besoin précis, requêtes courtes. Pas de recherche « au cas où ».
- Sous-agents uniquement pour : (a) la collecte large d'avis/concurrents, (b) la relecture à l'aveugle finale. Modèle `haiku` pour l'extraction en masse, `sonnet` pour l'analyse, `opus` seulement pour la relecture finale.
- Si le web est bloqué (Amazon refuse souvent les lectures automatiques), demander à l'utilisateur 1 à 3 captures d'écran plutôt que multiplier les tentatives.

**Gratuit uniquement**
- Outils autorisés : Amazon (recherche, autocomplétion, classements, avis), Google Trends, Google autocomplete, Goodreads, Babelio, Reddit, forums, Canva (gratuit/connecté), KDP Cover Calculator, Kindle Previewer. Jamais d'outil payant sans demande explicite.

## 2. Choix du modèle (le dire à l'utilisateur au début de chaque phase)

| Phase | Modèle conseillé | Raison |
|---|---|---|
| Brief, métadonnées, mise en forme simple | Sonnet | Rapide, consomme peu |
| Recherche et choix de niche, concept | Opus | Décision à fort impact |
| Rédaction des chapitres | Sonnet | Volume élevé, coût maîtrisé |
| Relecture à l'aveugle finale | Opus (sous-agent) | Exigence maximale |
| Extraction d'avis en masse | Haiku (sous-agent) | Tâche répétitive |

Rappeler en une ligne : « Pour cette étape, passe sur [modèle] » (l'utilisateur change le modèle lui-même).

## 3. Déroulé

### Phase 0. Brief (5 questions max, un seul lot)
Type de produit, public visé, date de publication souhaitée, temps disponible, formats (Kindle, broché, relié, produit imprimable), sujets qu'il connaît bien ou veut éviter. Si l'utilisateur dit « choisis pour moi », proposer la meilleure option et avancer.

### Phase 1. Niche (validation n°1)
Chercher 8 à 15 idées, dont des croisements (ex. « batch cooking » × « étudiants » × « petit budget »). Pour chacune, noter sur 100 :

| Critère | Points | Signal gratuit |
|---|---|---|
| Demande | 30 | Classement des meilleures ventes (BSR) du top 10 Amazon. Ordres de grandeur à présenter comme estimations : BSR < 20 000 = ventes quotidiennes ; 20 000 à 100 000 = ventes régulières ; > 300 000 = faibles. Autocomplétion Amazon, Google Trends. |
| Concurrence faible | 30 | Peu de résultats très ciblés ; top 10 avec peu d'avis (< 100) ; couvertures amateurs ; livres anciens ou datés. |
| Saisonnalité / actualité | 15 | Google Trends sur 5 ans ; pic connu (Noël, rentrée, Black Friday, régimes de janvier, été). Publier 6 à 8 semaines avant le pic. |
| Faiblesses exploitables | 15 | Avis 1 à 3 étoiles récurrents chez les concurrents (voir Phase 2). |
| Faisabilité | 10 | Rédigeable sans expertise réglementée, sans illustrations coûteuses. |

Sortie : tableau des 3 meilleures niches avec score, chiffres clés, fenêtre de publication idéale, et une recommandation claire. Éliminer d'office tout sujet de la liste « Interdits » (section 5).

### Phase 2. Avis et critiques
- Analyser les avis 1 à 3 étoiles (et les éloges récurrents) des 5 à 10 meilleurs concurrents : Amazon .fr et .com, Goodreads, Babelio, Reddit, forums.
- Produire un tableau : reproche (paraphrasé, jamais copié), fréquence, réponse concrète dans notre livre, argument marketing.
- Exemples typiques : « trop court / remplissage », « contenu générique type IA », « mise en page cassée sur Kindle », « recettes sans photos », « ingrédients introuvables en France », « pas d'exemples concrets ».
- Chaque faiblesse trouvée devient une promesse du livre (description, sous-titre, sommaire).

### Phase 3. Concept + plan (validation n°2)
- 3 angles possibles, chacun avec : titre, sous-titre, promesse en une phrase, lecteur cible, différence nette avec les concurrents.
- Plan détaillé : chapitres, objectif de chaque chapitre, éléments visuels prévus, longueur visée (référence : nombre de pages des 3 meilleurs concurrents).

### Phase 4. Rédaction sans « style IA »
Écrire chapitre par chapitre dans des fichiers. Puis appliquer la skill `humanizer` si elle est disponible.

À bannir (français) :
- Ouvertures creuses : « Dans un monde où… », « Plongeons dans… », « À l'ère de… », « Vous êtes-vous déjà demandé… ».
- Tics : « Il est important de noter », « En somme », « En définitive », « véritable », « incontournable », « essentiel », « crucial », « n'est pas seulement… mais aussi… », « Que vous soyez… ou… ».
- Énumérations systématiques par trois, tirets cadratins en série, phrases toutes de même longueur, conclusions moralisatrices à chaque section, gras partout, emojis.

À faire :
- Exemples précis (chiffres, lieux, prix, marques génériques, situations vécues), une anecdote ou un cas concret par section.
- Longueur de phrases variée, vocabulaire courant, une vraie voix (avis tranchés, humour léger si le genre s'y prête).
- Adapter au marché français : unités, ingrédients, réglementation, références culturelles.
- Vérifier les faits (chiffres, dates). En cas de doute : retirer ou sourcer.

### Phase 5. Mise en page
Proposer 3 niveaux et recommander celui qui colle à la niche :
1. **Textuel soigné** (romans, essais, développement personnel) : typographie lisible, lettrines, ornements discrets entre sections, résumé en fin de chapitre.
2. **Enrichi** (guides pratiques) : encadrés « À retenir », checklists, tableaux simples, exercices, mini-résumés, pages de notes.
3. **Graphique « effet wow »** (recettes, enfants, planners, beaux livres) : illustrations, pleines pages, fiches, codes couleur par partie, infographies.

Justifier le choix par des exemples réels : citer les titres concurrents ou best-sellers observés et décrire leurs choix de mise en page (sans reproduire leurs pages), avec lien vers la fiche produit.

Règles techniques :
- **Kindle** : fichier DOCX ou EPUB redimensionnable (« reflowable ») pour le texte ; les tableaux larges deviennent des images ou des listes ; tester dans Kindle Previewer (gratuit). Mise en page fixe seulement si le contenu l'exige (enfants, BD, recettes très graphiques).
- **Broché** : PDF avec polices incorporées ; formats courants 15,24 × 22,86 cm (6×9 in) pour guides et romans, 21,59 × 27,94 cm (8,5×11 in) pour cahiers, recettes, planners ; images 300 DPI ; fond perdu 3,2 mm (0,125 in) si des éléments touchent le bord ; marges intérieures selon le nombre de pages (consulter le guide KDP).
- Utiliser les skills `docx` et `pdf` pour produire les fichiers.

### Phase 6. Couverture (expert ebook)
- **Ebook** : 1 600 × 2 560 px, JPG, RVB, devant uniquement.
- **Broché/relié** : couverture complète (4e, dos, 1re) aux dimensions données par le KDP Cover Calculator (format + nombre de pages + papier). Pas de texte sur le dos sous environ 80 pages.
- Règles de vente : titre lisible en miniature (test à ~80 px de large), 3 éléments maximum, codes visuels du genre respectés mais avec une touche distinctive, contraste fort, police du titre adaptée au genre.
- Proposer 3 pistes (description + justification par les couvertures du top 10 observées). Réaliser dans Canva (connecté) si disponible.
- Image générée par IA : aucun texte dans l'image (le texte est ajouté ensuite dans Canva). Déclaration IA obligatoire (section 5).
- Jamais : logo, personnage, marque ou œuvre protégée ; mention « best-seller » mensongère.

### Phase 7. Relecture à l'aveugle (validation n°3)
1. Demander à l'utilisateur de coller ~1 page d'extrait gratuit (« Feuilleter » sur Amazon) d'un best-seller de la niche. Ce texte sert uniquement à l'évaluation et n'est jamais reproduit dans le livre ni dans le chat.
2. Lancer un sous-agent `opus` qui ne sait pas quel texte vient de nous. Lui donner les 2 extraits anonymisés (A/B, ordre aléatoire) + la grille. Il doit : deviner lequel est généré par IA (avec certitude en %), et noter chaque texte /10 sur : accroche, clarté, concret, voix, rythme, absence de tics IA, valeur pratique, mise en forme.
3. Validation seulement si : le relecteur se trompe ou hésite (certitude ≤ 60 %) sur 3 extraits différents du livre, ET notre note moyenne ≥ celle du best-seller − 0,5.
4. Sinon : corriger les points signalés, puis recommencer. Maximum 3 boucles (économie de tokens) ; au-delà, montrer à l'utilisateur ce qui bloque.
5. Vérifier aussi : orthographe, cohérence, sommaire, liens, rendu Kindle Previewer, PDF broché page par page.

Rappel honnête à donner : ce test mesure la qualité, il ne garantit ni les ventes ni l'indétectabilité, et il ne dispense jamais de la déclaration IA à KDP.

### Phase 8. Métadonnées, référencement, lancement
- **Titre et sous-titre** : promesse claire ; mots-clés naturels dans le sous-titre ; jamais de mots-clés empilés, de nom d'auteur connu ou de marque déposée (ex. « Thermomix », « Airfryer » de marque) dans le titre.
- **Description** (jusqu'à 4 000 caractères) : accroche, problème, bénéfices en puces, ce que contient le livre, pour qui, appel à l'action. Mise en forme simple (gras, puces).
- **7 mots-clés** par format : expressions de 2 à 5 mots tirées de l'autocomplétion Amazon, sans répéter le titre, sans marques ni auteurs.
- **3 catégories** par format, choisies là où les meilleures ventes ont un BSR atteignable (ordre de grandeur, à justifier).
- **Prix** : ebook entre 2,99 € et 9,99 € pour la redevance de 70 % ; broché = coût d'impression + marge (redevance 60 % du prix moins impression). Se caler sur la médiane du top 10.
- **KDP Select** (exclusivité 90 jours) : recommander oui ou non avec la raison (Kindle Unlimited, 5 jours gratuits par période).
- **Plan de lancement gratuit** : date calée sur la saisonnalité, jours gratuits, page Auteur (Author Central), contenu A+ si pertinent, extraits partageables pour réseaux sociaux.

## 4. Autres produits digitaux
Même méthode (niche → avis → conception → conformité → fiche) pour :
- **Livres à faible contenu KDP** : agendas, planners, carnets, journaux, calendriers, cahiers d'exercices (option « low-content » dans KDP).
- **Imprimables et templates** (PDF, Canva) : calendriers, menus de la semaine, budgets, plannings, gabarits de mise en page d'ebook.
Pour chaque produit : format, dimensions, nombre de pages, déclinaisons possibles (saisons, années, publics) pour créer une série à partir d'un seul travail.

## 5. Conformité (toujours vérifier avant validation)
- **Déclaration IA KDP** : tout texte, image ou traduction créé par une IA doit être déclaré comme « généré par IA », même s'il a été fortement retravaillé. L'aide (correction, brainstorming sur un texte écrit par l'humain) n'a pas à être déclarée. À remplir pour chaque format. Toujours le rappeler en Phase 8.
- **Droit d'auteur** : aucun passage copié ; pas de résumé de livre protégé vendu comme produit ; images libres de droits ou créées ; polices avec licence commerciale.
- **Marques** : pas de marque déposée dans le titre ou la couverture.
- **Interdits ou à refuser** : conseils médicaux, régimes, santé mentale, finance/investissement, juridique présentés comme avis d'expert ; contenu sexuel, violent, haineux, politique, religieux polémique ; sujets liés aux mineurs sensibles ; complots, fausses informations ; actualité tragique exploitée ; contenu trompeur (faux avis, faux auteurs, promesses de résultats garantis).
- **Recettes et activités** : allergènes signalés, sécurité alimentaire, mention « conseils généraux » si utile.
- **France** : vérifier l'obligation de dépôt légal (BnF) pour une version papier diffusée en France.
- **Règles KDP** : respecter les directives de contenu et de métadonnées KDP ; pas de contenu du domaine public sans valeur ajoutée nette.

En cas de doute sur un sujet : le signaler en une ligne et proposer une alternative proche et sûre.
## 6. Avertissement
Les chiffres KDP (redevances, formats, seuils de prix, règles de déclaration IA) évoluent. Vérifie-les dans l'aide KDP officielle avant toute publication.
