---
name: documentation-client
description: Génère les documents professionnels remis au client après livraison d'un site vitrine artisan — cahier des charges, notice d'utilisation ou contrat de maintenance, checklist de mise en ligne, fiche technique, quick start, et en option analyse SEO initiale et roadmap de maintenance sur 3 mois. Se déclenche automatiquement en fin de brief-artisan si le client accepte la documentation, ou directement quand l'utilisateur demande "la doc client", "les documents pour le client", "le cahier des charges", ou veut documenter un site déjà livré.
---

# Documentation client — site vitrine artisan

Produire les documents professionnels remis au client après livraison d'un site vitrine (généré par `brief-artisan` ou existant). Livrable par défaut : **un jeu de fichiers Markdown/PDF prêts à imprimer ou envoyer**, en français, adaptés au métier du client.

**Différence avec `brief-artisan`** : cette skill ne touche jamais au code du site. Elle documente ce qui a été livré, pour le client final — pas pour le développeur. Le vocabulaire, le ton et le niveau de détail sont pensés pour quelqu'un qui n'est pas technicien.

**Se déclenche** : automatiquement en fin de `brief-artisan` si le client répond « oui » à la question bonus (voir étape 7.5 de ce skill), ou directement si l'utilisateur invoque `/documentation-client` sur un site déjà existant.

---

## Étape 1 — Récupérer le contexte

Si appelée depuis `brief-artisan`, réutiliser sans reposer : métier, ville/zone, objectif principal (appel / devis / RDV), positionnement, nom de l'artisan, coordonnées.

Si appelée seule (site déjà existant), demander en une seule salve via l'outil de questions :

1. **Métier exact et ville/zone d'intervention**
2. **Qui va gérer le site après livraison ?** → Client lui-même / L'agence (toi) en maintenance / Pas encore décidé
3. **Le client veut-il une analyse SEO initiale ?** → Oui / Non
4. **Le client veut-il une roadmap de maintenance sur 3 mois ?** → Oui / Non

Ne jamais deviner la réponse à la question 2 : elle détermine si on produit une Notice d'Utilisation ou un Contrat de Maintenance, et ce sont deux documents avec un contenu et un engagement différents.

---

## Étape 2 — Documents systématiques (toujours produits)

### 2.1 Checklist Mise en Ligne
Format check-box, une page. Le client coche au fur et à mesure que le site part en production. Contient au minimum : domaine actif, HTTPS, photos chargées, formulaire testé (email reçu), téléphone cliquable en mobile, localisation correcte si carte, métadonnées SEO renseignées, réseaux sociaux liés si pertinent, politique de confidentialité accessible, analytics installé si demandé.

Adapter les items au métier : un plombier a besoin du numéro d'urgence testé, une association a besoin du RGAA vérifié.

### 2.2 Fiche Technique — Fonctionnalités du Site
Une page, lisible en 2 minutes. Liste factuelle de ce que le site fait, pas comment c'est codé : « Le formulaire de contact envoie un email à [email] », « Le bouton téléphone ouvre l'appel direct sur mobile », etc. Objectif : que le client puisse la montrer à son associé ou son comptable et dire « voilà ce qu'on a ».

### 2.3 Quick Start — Premiers Pas
Une demi-page, ton rassurant. Trois à cinq étapes très courtes : le site est en ligne à telle adresse, testez le formulaire, partagez le lien. But : que le client se sente opérationnel immédiatement, pas qu'il apprenne quelque chose.

---

## Étape 3 — Document conditionnel : Notice ou Contrat

**Si le client gère lui-même le site :**
Produire une **Notice d'Utilisation**. Contenu : comment modifier un texte, comment changer une photo, comment ajouter un témoignage, comment mettre à jour horaires/tarifs, et une section « à ne jamais toucher » (structure HTML, CSS critique). Pas de jargon : dire « ouvrez le fichier avec un éditeur de texte » plutôt que « accédez au DOM ».

**Si l'agence gère la maintenance :**
Produire un **Contrat de Maintenance**. Contenu : périmètre couvert (photos, texte, FAQ, formulaire), coûts (forfait mensuel ou à la demande), délai de réponse engagé, durée d'engagement, qui a accès aux données (Airtable, Brevo, etc. si applicable), qui est responsable du renouvellement de domaine. Ce document engage — le rédiger avec des montants et délais réalistes, jamais des placeholders vagues type `[À définir]` sur les clauses financières : soit l'utilisateur donne les chiffres, soit on les lui demande explicitement plutôt que d'inventer.

**Si pas encore décidé :**
Produire les deux en version courte, avec une note en tête indiquant que le client doit choisir avant la mise en ligne définitive.

---

## Étape 4 — Cahier des Charges

Document signable, formel mais lisible par un non-technicien. Contient : contexte et objectifs du site, public cible, liste des fonctionnalités livrées, délais de réponse attendus côté client (validation, retours), calendrier de livraison si en plusieurs versions, répartition claire des responsabilités après livraison.

Ce document sert de référence en cas de désaccord ultérieur sur ce qui avait été convenu — le rédiger avec cette fonction en tête, pas comme une formalité.

---

## Étape 5 — Documents optionnels (selon réponses étape 1)

### 5.1 Analyse SEO Initiale (si demandé)
État des lieux au lancement, format court : mots-clés cibles identifiés pour le métier et la zone, présence des balises title/description, résultat mobilité (à indiquer comme estimation, pas comme mesure officielle sauf test réel effectué), structure hiérarchique des titres, présence d'un sitemap. Terminer par 2-3 recommandations simples et actionnables pour les 3 mois suivants — sans se positionner comme une vente déguisée d'une prestation SEO supplémentaire, sauf si l'utilisateur le souhaite explicitement.

### 5.2 Roadmap de Maintenance (si demandé)
Calendrier sur 3 mois glissants : semaine 1 (support post-lancement, corrections), semaines 2-4 (optimisation photos/texte selon retours), mois 2-3 (améliorations avis/FAQ), au-delà (rythme de maintenance régulier). Inclure les dates clés à ne pas manquer : renouvellement de domaine, renouvellement SSL si non automatique, révision annuelle du contenu.

---

## Étape 6 — Cohérence métier

Comme pour `brief-artisan`, le ton et les priorités changent selon la famille de métier :

- **Dépannage/technique** (plombier, électricien...) : la Checklist et la Fiche Technique insistent sur le numéro d'urgence et la zone d'intervention. Le Cahier des Charges mentionne les délais d'intervention promis.
- **Matière/temps long** (ébéniste, restaurateur d'art...) : le Cahier des Charges peut inclure une section portfolio/galerie plus développée.
- **Soin/apparence** : la Fiche Technique met en avant la prise de RDV en ligne si présente.
- **Structures publiques/associations** : le Cahier des Charges intègre une section accessibilité RGAA, et la Notice d'Utilisation est écrite pour un potentiel non-technicien bénévole qui tournera dans le poste.

Ne pas produire un jeu de documents identique pour tous les métiers en changeant juste le nom : reprendre la logique de différenciation de `brief-artisan` étape 2.

---

## Étape 7 — Placeholders et données factices

Même règle stricte que `brief-artisan` : SIRET, téléphone, montants de contrat, dates d'engagement — si l'information n'a pas été donnée par l'utilisateur, utiliser un placeholder explicite et non crédible (`[MONTANT MENSUEL À DÉFINIR]`, `[SIRET À COMPLÉTER]`), jamais une valeur inventée qui a l'air réelle. Le signaler clairement dans le résumé de livraison.

---

## Étape 8 — Livrer

Enregistrer tous les fichiers dans le dossier de sortie, les présenter, puis résumer en quelques lignes :
- La liste des documents produits et pourquoi (quels choix ont déterminé Notice vs Contrat, SEO inclus ou non)
- Ce qui reste à compléter avant remise au client (SIRET, montants, dates)
- Un rappel si la clé USB physique (voir note ci-dessous) doit être préparée en parallèle

Ne pas relire section par section chaque document — l'utilisateur peut les ouvrir lui-même.

---

## Note — Support physique (clé USB)

Si l'utilisateur mentionne vouloir remettre les documents sur une clé USB personnalisée, générer aussi un fichier `README-cle-usb.txt` à la racine du jeu de documents, avec message d'accueil court et liste du contenu de la clé. Ce fichier n'est pas un document de plus dans le sens métier — c'est la table des matières de la clé physique. Ne pas le produire si le client reçoit tout par email uniquement.

---

## Rappels

- Cette skill ne réécrit jamais le HTML du site — seulement la documentation autour.
- Un document non pertinent pour le métier (ex. analyse SEO pour une association qui ne veut pas de visibilité Google) vaut mieux ne pas être produit : redemander plutôt que de forcer les 7 documents systématiquement.
- Le Contrat de Maintenance engage financièrement — ne jamais y mettre de montant halluciné.
