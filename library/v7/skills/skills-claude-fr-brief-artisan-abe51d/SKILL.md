---
name: brief-artisan
description: Crée un site vitrine one-page pour un artisan, un commerçant, une association ou une petite entreprise locale. À utiliser dès que l'utilisateur veut un site vitrine, une landing page ou une maquette pour un client local (ébéniste, plombier, coiffeur, traiteur, paysagiste, électricien, esthéticienne, association, commune…), ou quand il dit "brief artisan", "nouveau site client", "maquette vitrine", "site pour un client". Déclenche aussi sur toute demande de site vitrine local même sans ces mots-clés exacts — dès qu'un métier ou une structure locale est mentionné avec un besoin de présence web.
---

# Brief artisan — site vitrine one-page

Produire un site vitrine one-page pour un artisan, commerçant, association ou petite entreprise locale. Livrable par défaut : **un fichier HTML unique, autonome, en français**.

Cette skill combine un cadre de recueil du besoin et un cadre esthétique. Elle s'appuie sur `frontend-design` pour les principes de typographie, couleur et composition — les appliquer intégralement. **Différence de périmètre** : ici la stack est toujours HTML/CSS/JS vanilla en fichier unique, jamais React ni de framework, même si `frontend-design` couvre plus large. **Jamais** Inter / Roboto / Arial, jamais de dégradé violet sur fond blanc, jamais deux fois la même direction artistique d'une commande à l'autre.

**Si l'utilisateur demande de corriger ou nettoyer un site déjà existant** (produit ici ou ailleurs, par une IA ou non), ce n'est plus le rôle de cette skill : rediriger vers `audit-anti-vibe-coding`, qui scanne et corrige du code déjà écrit. `brief-artisan` génère depuis zéro et applique en amont l'essentiel des règles de cet audit — voir Étape 6.

Pour des exemples concrets calibrant le niveau attendu (fragments HTML/CSS commentés), voir `references/exemples-direction-artistique.md`.

---

## Étape 1 — Recueillir le besoin

Poser systématiquement les cinq questions ci-dessous via l'outil de questions à choix multiples, en **une seule salve**, même si l'utilisateur a déjà fourni des éléments de brief dans son message. Les réponses obtenues via l'outil font foi ; elles peuvent confirmer ou préciser ce qu'il a déjà écrit.

1. **Le métier exact** — jamais se contenter de « artisan »
2. **Photos client disponibles** — oui / non / quelques-unes de qualité moyenne
3. **Objectif principal** — appel téléphonique / demande de devis / prise de RDV
4. **Positionnement** — premium / milieu de gamme / accessible / dépannage-urgence
5. **Budget ou contrainte technique** — aucune contrainte / hébergement mutualisé basique / le client éditera lui-même le site ensuite

Ne pas demander autre chose que ces cinq champs à ce stade. Toute question hors de cette liste (nom du client, ton précis, contenu détaillé) suit les valeurs par défaut de l'étape 4 ou se règle plus tard dans le processus.

Ne jamais lancer la production sans connaître le métier et la disponibilité des photos. Ces deux informations conditionnent tout le reste.

**Si l'utilisateur mentionne WordPress ou une édition future par le client** : le signaler immédiatement comme changement de livrable, pas juste de design — voir Rappels en fin de fichier. Ne pas produire le HTML statique dans ce cas sans clarifier.

**Note pour l'étape 7.5** : la réponse donnée ici à la question 5 ne couvre que le cas « le client éditera lui-même le site ensuite ». Si l'utilisateur a répondu autre chose (aucune contrainte / hébergement mutualisé basique), l'information « qui gère le site après livraison » n'est **pas** déterminée — `documentation-client` devra la demander lui-même s'il est enchaîné. Ne transmettre cette pré-réponse que dans le cas où elle a été explicitement donnée.

**Nom de l'artisan et coordonnées** : cette skill ne les demande pas nativement (hors périmètre des 5 questions). Si l'utilisateur les a mentionnés spontanément dans son message initial ou dans le footer légal du site (étape 5), les conserver pour transmission à l'étape 7.5. Sinon, `documentation-client` les redemandera lui-même à son étape 1.

---

## Étape 2 — Choisir la direction artistique selon le métier

L'esthétique doit être légitime pour le métier. Une même charte appliquée à tous les corps de métier est un contresens : la clientèle, le déclencheur d'achat et l'objection à lever diffèrent radicalement.

**Métiers de la matière et du temps long** — ébéniste, tailleur de pierre, coutelier, ferronnier, luthier, céramiste, restaurateur d'art
Textures de papier, encre, teintes minérales ou boisées, serif à caractère, grain, respirations généreuses, rythme éditorial. Le récit et le savoir-faire priment sur l'urgence.

**Métiers du dépannage et de la technique** — plombier, électricien, chauffagiste, serrurier, vitrier
Lisibilité maximale, téléphone visible en permanence (sticky mobile), zone d'intervention explicite, délai d'intervention affiché, réassurance forte (assurance décennale, certifications, devis gratuit). Sobriété assumée, contrastes nets. Ni citation poétique ni typographie précieuse — le visiteur a une fuite d'eau.

**Métiers du soin et de l'apparence** — coiffeur, esthéticienne, barbier, tatoueur, masseur, prothésiste ongulaire
Sensoriel, photographie en grand, palette douce ou au contraire très affirmée selon la gamme, prise de rendez-vous omniprésente. Ambiance avant argumentaire.

**Métiers de bouche** — traiteur, boulanger, pâtissier, boucher, caviste, restaurateur
Appétence, photographie dominante, saisonnalité, horaires et localisation immédiatement accessibles. Chaleur, densité, gourmandise visuelle.

**Métiers de l'extérieur** — paysagiste, élagueur, maçon, couvreur, terrassier
Avant / après, échelle et ampleur des chantiers, saisons, grands cadrages. Preuve par le résultat.

**Associations, communes, structures publiques**
Clarté, hiérarchie de l'information, accessibilité renforcée, ton institutionnel mais vivant. Accessibilité RGAA et fontes hébergées localement sont **obligatoires** — voir contraintes ci-dessous.

Pour un métier absent de cette liste, raisonner par analogie : quel est le déclencheur d'achat, et quelle objection faut-il lever ?

Des fragments de référence par famille de métier (bloc `:root`, structure du hero) sont disponibles dans `references/exemples-direction-artistique.md` — les consulter en cas de doute sur le niveau d'exigence attendu, pas pour copier tel quel.

---

## Étape 3 — Adapter à la disponibilité des photos

**Photos disponibles** : galerie en grille asymétrique, hero visuel fort, avant/après si pertinent.

**Pas de photos** : le design doit tenir sur la typographie, la couleur et la composition seules. Grandes citations typographiques, blocs de couleur, motifs SVG, chiffres-clés, pictogrammes dessinés. **Ne pas prévoir de galerie** qui resterait vide. Le signaler explicitement à l'utilisateur dans la réponse.

**Photos de qualité moyenne** : cadrages contraints, traitement uniforme (filtre monochrome, superposition colorée), formats réduits. Ne jamais mettre une photo médiocre en plein écran.

Dans tous les cas, les emplacements d'images portent un libellé indiquant le sujet et le ratio attendus.

---

## Étape 4 — Valeurs par défaut

| Champ non renseigné | Décision |
|---|---|
| Thème clair / sombre | Varier selon le métier, jamais deux fois le même |
| Typographie | Fontes à caractère, display + texte contrastées |
| Palette | Dominante marquée + un accent net |
| Sections | Hero, prestations, réalisations, à propos, avis, contact, footer légal |
| Contenu textuel | Texte de démonstration crédible et spécifique au métier, jamais du lorem ipsum |
| Formulaire | Fonctionnel en démonstration, non branché |
| Fontes | Google Fonts en CDN — **sauf** structure publique ou association (alors : locales) |
| Accessibilité | Contrastes AA, navigation clavier, `prefers-reduced-motion` respecté |
| Responsive | Mobile-first, points de rupture 640 / 900 / 960 px |
| Structure du code | Fichier unique, variables CSS centralisées dans `:root` sous un en-tête « zone de personnalisation » |
| Budget non précisé | Hypothèse hébergement mutualisé standard — pas d'animation lourde, pas de dépendance payante |

---

## Étape 5 — Contraintes techniques systématiques

- **Un seul fichier**, aucune dépendance hors Google Fonts
- Bloc `:root` en tête regroupant couleurs, typographies et rythme, commenté en français
- Emplacements d'images explicitement libellés (sujet + ratio)
- Formulaire avec validation native, `name=` sur chaque champ, message de confirmation, mention de consentement RGPD
- Footer légal : SIRET, assurance décennale si bâtiment, mentions légales, confidentialité
- **Le formulaire collecte un email ou une donnée personnelle** (quasi systématique) → prévoir un lien footer « Politique de confidentialité » pointant vers une ancre ou section squelette : finalité de la collecte, durée de conservation, droit d'accès/suppression (RGPD), contact du responsable. Le signaler explicitement à l'utilisateur comme contenu à faire relire avant mise en ligne — ne jamais le présenter comme juridiquement validé.
- Révélation au défilement via `IntersectionObserver`, jamais de bibliothèque externe
- `prefers-reduced-motion` neutralise les animations
- Balises `title` et `meta description` renseignées avec le métier et la ville

**Structure publique, commune ou association** : accessibilité RGAA renforcée et fontes hébergées localement (`@font-face` + `.woff2`). Le signaler à l'utilisateur, car ces deux points ne se rajoutent pas après coup sans reprise du travail.

**Données factices — règle stricte** : toute information qui ressemble à une donnée réelle et vérifiable (SIRET, numéro de téléphone, adresse, avis client nommé, note Google) doit être un placeholder explicite et non crédible : `[SIRET À COMPLÉTER]`, `[TÉLÉPHONE À COMPLÉTER]`, `Avis client — texte de démonstration`. Ne jamais inventer un numéro qui ressemble à un vrai SIRET ou un vrai téléphone français : le client peut livrer le site sans relire, et une fausse donnée qui a l'air vraie devient un risque juridique ou une tromperie involontaire.

---

## Étape 6 — Vérification avant livraison

Avant de présenter le fichier, contrôler dans l'ordre :

1. Aucun texte « lorem ipsum » ou placeholder générique oublié
2. Tous les inputs du formulaire ont un `name=` et un `label` associé
3. Contraste texte/fond vérifié mentalement sur chaque combinaison couleur utilisée (pas seulement l'accent)
4. Aucune police interdite n'a filtré dans le CSS (Inter, Roboto, Arial, system-ui en fallback uniquement)
5. Aucune donnée factice ne ressemble à une vraie donnée (voir règle stricte ci-dessus)
6. Le site fonctionne réellement en ouverture directe du fichier (pas de dépendance cassée)
7. Cohérence : la direction artistique retenue correspond bien à la famille de métier de l'étape 2, pas à une esthétique généraliste
8. Aucun tic visuel générique d'IA n'a filtré : pas de dégradé multi-teintes criard, pas d'ombre portée sur tout, pas d'emoji en guise d'icône, pas de verre dépoli décoratif sans overlay réel, pas de liseré coloré vertical par défaut, pas de border-radius identique partout, pas de trois cartes strictement symétriques, pas de puces-coches sur du texte qui n'est pas une validation

Ces huit points reprennent en amont l'essentiel du skill `audit-anti-vibe-coding` — l'objectif est de ne pas produire le défaut plutôt que de le corriger après coup. Si un doute persiste sur un site déjà livré, lancer cet autre skill dessus directement.

---

## Étape 7 — Livrer

Enregistrer le fichier dans le dossier de sortie, le présenter à l'utilisateur, puis résumer en quelques lignes :

- La direction artistique retenue et **pourquoi elle est légitime pour ce métier**
- Ce qu'il reste à faire pour la mise en production : photos à intégrer, formulaire à brancher, mentions légales à compléter, SIRET et téléphone à renseigner
- Une limite ou un arbitrage discutable, s'il y en a un

Ne pas décrire section par section ce que l'utilisateur peut voir lui-même dans le fichier.

---

## Étape 7.5 — Question bonus : documentation client

Une fois le fichier livré et le résumé donné, poser une dernière question via l'outil de questions :

**« Veux-tu la documentation client pour ce site (cahier des charges, notice, checklist...) ? »** — Oui / Non

**Si Oui** : lancer directement le skill `documentation-client` en lui transmettant sans reposer : le métier, la ville/zone, l'objectif principal, le positionnement. Transmettre en plus, **seulement si connus** : le nom de l'artisan et ses coordonnées (voir note ci-dessus), et l'information sur qui éditera le site ensuite si elle a été explicitement donnée (voir note ci-dessus). Pour tout champ non transmis faute d'être connu, laisser `documentation-client` le demander lui-même à son étape 1 — ne jamais deviner à sa place.

**Si Non** : terminer ici, ne rien produire de plus.

Ne jamais poser cette question avant l'étape 7 : le site doit être vu et accepté par l'utilisateur avant de proposer la documentation qui en découle — proposer les deux en même temps dilue la livraison principale.

---

## Cas particulier — plusieurs pages demandées

Cette skill produit du one-page par défaut. Si l'utilisateur demande explicitement plusieurs pages séparées (ex. mentions légales à part, page « avis » dédiée) :

- Si la demande est mineure (juste les mentions légales isolées) : proposer une ancre one-page d'abord, expliquer que c'est plus simple à maintenir en fichier unique
- Si la demande est structurelle (plusieurs vraies pages de contenu) : sortir du cadre de cette skill, le signaler à l'utilisateur, et demander s'il veut basculer sur une structure multi-fichiers ou un site WordPress — ce n'est plus le même livrable ni le même outil

---

## Rappels

- Le champ **photos** prime sur le champ **couleurs** : un design pensé pour de belles images s'effondre sans elles.
- Demander **qui éditera le site après livraison** si l'utilisateur envisage WordPress — cela change le livrable, pas seulement le design. HTML statique et client autonome sont incompatibles : un client qui doit éditer lui-même son site a besoin d'un CMS, pas d'un fichier HTML figé.
- Un brief à moitié rempli avec des informations justes vaut mieux qu'un brief complet à moitié deviné. Ne pas pousser l'utilisateur à remplir des champs qu'il ne connaît pas.
- Le budget/contrainte technique n'est pas cosmétique : il détermine si des fontes locales, des animations élaborées ou des dépendances sont acceptables.
- La question 7.5 ne se pose qu'une fois, en fin de skill — ne pas la répéter si l'utilisateur a déjà refusé dans une itération précédente de la même conversation.
