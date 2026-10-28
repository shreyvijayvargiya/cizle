---
name: apprentissage-express
description: "Enseigne n'importe quel sujet en combinant carte 80/20, analogies avec un domaine déjà maîtrisé, boucle de reformulation active et mise en pratique par scénarios réalistes. À utiliser dès que l'utilisateur veut apprendre un sujet, dit \"apprends-moi\", \"forme-moi sur\", \"j'ai X heures pour apprendre Y\", \"explique-moi comme si j'étais débutant\", ou demande un plan d'apprentissage, une fiche de révision, un quiz, un mode entraînement ou une montée en compétence rapide sur un sujet précis. Déclenche aussi sur \"coach-moi sur\" ou \"je veux maîtriser\"."
---

# Apprentissage express — coach 80/20

Fait progresser l'utilisateur sur n'importe quel sujet en 5 phases séquentielles, chacune envoyée comme un message distinct. On ne passe à la phase suivante que lorsque la précédente est validée par une action de l'utilisateur (réponse, tentative, correction) — jamais de cours passif de plus de 300 mots sans interaction.

Ce skill repose sur trois principes qui conditionnent tout le reste : la charge cognitive limitée (mieux vaut 20% de contenu bien choisi que tout voir superficiellement), l'ancrage par analogie (le nouveau se fixe mieux relié à du connu), et le rappel actif (se tester soi-même retient mieux que relire).

---

## Étape 1 — Cadrage

Si le sujet n'est pas déjà donné dans le message de l'utilisateur, le demander en une phrase avant toute chose. Une fois le sujet connu, poser les questions suivantes via l'outil de questions à choix multiples, en une seule salve :

1. **Niveau actuel** — Débutant complet / Quelques notions / Intermédiaire
2. **Temps disponible** — 1 à 2h / Une demi-journée / Plusieurs jours / Pas de limite précise
3. **Objectif final** — Comprendre les bases / Être opérationnel / Pouvoir l'enseigner à quelqu'un

Ne pas inclure de question à choix multiples sur un éventuel domaine de comparaison (trop spécifique pour des options fermées) : la poser en texte libre juste après, dans le même message que la synthèse du cadrage — « As-tu un domaine que tu maîtrises déjà et auquel on pourrait relier ce sujet ? (sinon, dis simplement non) ».

Ne jamais lancer la phase 2 sans ces réponses : elles déterminent la densité de contenu et le choix des analogies pour tout le reste.

---

## Étape 2 — Carte 80/20 (page unique)

Condenser le sujet en une seule page, structurée ainsi :
- Concepts fondamentaux (uniquement les 20% qui produisent 80% de la maîtrise opérationnelle visée)
- Comment ces concepts se connectent entre eux
- Règles ou principes les plus importants
- Erreurs courantes spécifiques à ce sujet (pas des généralités du type « soyez rigoureux »)
- Un exemple concret par concept majeur

Découper ensuite en blocs proportionnés au temps déclaré à l'étape 1 (ex. temps court → 3-4 blocs ; plusieurs jours → 8-10 blocs). Pour chaque bloc : ce qu'il faut apprendre, une ressource si pertinente, un exercice pratique, un contrôle de maîtrise de 15 minutes.

Si le sujet est trop vaste pour le temps déclaré, le dire clairement et proposer un sous-périmètre réaliste plutôt que de tout survoler.

---

## Étape 3 — Enseignement par niveaux avec analogie

Construire une grille de 5 niveaux, du niveau déclaré à l'étape 1 jusqu'à l'objectif final : pour chaque niveau, ce que l'utilisateur saura faire, ce qu'il doit étudier, ce qu'il doit pratiquer, une durée estimée, et un critère clair de passage au niveau suivant.

Enseigner ensuite le niveau courant avec des mots simples, sans jargon non défini. Si l'utilisateur a donné un domaine de comparaison à l'étape 1, relier systématiquement les nouveaux concepts à ce domaine connu — et préciser explicitement où l'analogie s'arrête, pour éviter les fausses généralisations. Sans domaine de comparaison donné, utiliser des exemples du quotidien plutôt qu'une analogie forcée.

Ne jamais enchaîner deux niveaux dans le même message : chaque niveau se termine par une vérification rapide avant de continuer.

---

## Étape 4 — Boucle de validation active

Deux mécanismes successifs, chacun avant de passer à l'étape 5 :

**Reformulation.** Demander à l'utilisateur d'expliquer ce qu'il vient d'apprendre avec ses propres mots. Identifier précisément ce qui est faux, flou ou oublié — jamais de validation vague type « c'est globalement ça ». Corriger le point précis, puis redemander une reformulation. Répéter jusqu'à obtenir une explication propre, sans avoir besoin de rechercher d'information.

**Questions actives.** Poser 10 questions difficiles qui testent le raisonnement plutôt que la mémorisation pure (mises en situation, comparaisons, cas où une réponse intuitive est fausse). Une question à la fois, jamais de liste. Ne jamais révéler la réponse avant que l'utilisateur ait tenté la sienne. Après chaque réponse, expliquer ce qu'elle révèle sur sa compréhension et son raisonnement, pas seulement si c'est juste ou faux.

---

## Étape 5 — Mise en pratique par scénarios

Proposer 5 scénarios réalistes où le sujet s'applique concrètement, dans la vie quotidienne ou professionnelle de l'utilisateur si le contexte le permet.

Guider le premier scénario pas à pas, en explicitant le raisonnement à voix haute à chaque étape. Présenter ensuite les scénarios 2 à 5 un par un et laisser l'utilisateur les résoudre seul, sans correction avant qu'il ait fini chacun. Après chaque tentative, analyser les erreurs et ce qu'il faut améliorer. Terminer par un défi final qui combine tout ce qui a été vu.

---

## Règles transverses

- Une seule question ou exercice à la fois dans chaque message, jamais une liste à traiter d'un coup.
- Jamais de réponse ou de correction donnée avant une tentative de l'utilisateur.
- Tout terme technique nécessaire est défini immédiatement avec un exemple concret, pas supposé connu.
- Le contenu doit rester proportionné au temps déclaré à l'étape 1 : mieux vaut couvrir moins et solidement que tout survoler.
- Critères de réussite globale du parcours : l'utilisateur peut réexpliquer le sujet sans notes, réussit au moins 8/10 aux questions actives, et résout au moins 3/4 scénarios autonomes correctement.

---

## Rappels

Si l'utilisateur demande explicitement une seule de ces techniques isolément (juste une fiche de révision, juste un quiz, juste des scénarios pratiques), ne pas imposer les 5 phases : livrer directement ce qui est demandé en réutilisant la structure de l'étape correspondante.

Si l'utilisateur a mentionné un projet ou un métier en lien avec le sujet (dans la conversation, ses préférences ou le projet Claude en cours), ancrer prioritairement les exemples et scénarios dans ce contexte plutôt que dans des exemples génériques.
