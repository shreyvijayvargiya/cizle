---
name: audit-anti-vibe-coding
description: "Audite et corrige les tics visuels génériques de code généré par IA (dégradés criards, ombres partout, emojis en icônes, verre dépoli décoratif, cartes symétriques, etc.) sur un projet WEB EXISTANT, quel que soit le stack (HTML statique, React, Tailwind, WordPress...). À utiliser dès que l'utilisateur dit \"audit anti vibe-coding\", \"ça sent l'IA\", \"corrige les tics IA\", \"nettoie ce site généré\", ou demande de revoir/professionnaliser un site déjà codé. Différent de brief-artisan : ce skill corrige du code EXISTANT, il n'en génère pas de nouveau. Déclenche aussi quand l'utilisateur partage un site ou un composant déjà produit (par lui, par une autre IA, ou par une session précédente) et veut qu'on le rende moins générique."
---

# Audit Anti Vibe Coding

Scanner un projet web existant, repérer les 30 tics visuels et structurels qui trahissent un design généré sans direction artistique, corriger ce qui est automatisable, et poser une question ciblée pour ce qui relève d'une décision.

**Différence de périmètre avec `brief-artisan`** : ce skill n'intervient que sur du code déjà écrit. Il ne conçoit rien depuis zéro. Si l'utilisateur veut créer un nouveau site vitrine, rediriger vers `brief-artisan` — qui applique déjà en amont une partie de ces règles (polices interdites, fausses données, contraste AA) pour éviter d'avoir à les corriger après coup.

---

## Étape 1 — Sauvegarde avant toute modification

- Si le projet est sous git : faire un commit de sauvegarde avant de toucher quoi que ce soit.
- Sinon : copier les fichiers qui vont être modifiés dans `.avant-audit/` avant intervention.

Ne jamais modifier de code sans filet, même pour des corrections jugées mineures.

---

## Étape 2 — Scanner

Scanner tout le code servi au navigateur : HTML, CSS, Tailwind, composants JS/JSX, templates. Pour chacun des 30 points ci-dessous, produire une ligne de rapport : **OK**, **TROUVÉ** (fichier + ligne), ou **NON APPLICABLE**.

### Points [auto] — à corriger directement si trouvés

Règle absolue sur tous les points [auto] : on **ajuste** le design existant, on ne le **redessine** pas. Une correction touche l'élément fautif, pas la structure autour.

1. Dégradés criards multi-teintes → garder une seule teinte d'accent, dégradé subtil ou fond uni.
2. Fond blanc pur `#ffffff` → décaler vers un blanc cassé cohérent avec l'accent.
3. Palette arc-en-ciel (4 couleurs vives ou plus) → réduire à un accent plus des neutres.
4. Ombres portées sur tout → garder uniquement sur les éléments au-dessus du flux (modales, menus), supprimer le reste.
5. Trois cartes de features alignées et identiques → casser la symétrie (liste, layout asymétrique, tailles différenciées).
6. Emojis en guise d'icônes → remplacer par du SVG ou supprimer.
7. Verre dépoli (`backdrop-blur`) décoratif → supprimer partout où il ne sert pas la lisibilité d'un overlay réel.
8. Tirets cadratins dans les textes → tirets simples ou reformuler.
9. Liseré coloré vertical à gauche des encadrés → supprimer ou remplacer par une hiérarchie typographique.
10. Grille bento décorative → garder seulement si chaque case informe réellement, sinon simplifier en sections classiques.
11. Fenêtre de terminal décorative → supprimer si elle ne montre pas le vrai produit.
12. « C'est pas X, c'est Y » dans la copy → réécrire avec le bénéfice concret.
13. Puces-coches partout → varier les puces, garder la coche pour les vraies validations.
14. Même border-radius sur tout → hiérarchiser, grand rayon réservé à un ou deux éléments.
15. Violet saturé sur fond noir → remplacer par un accent moins générique.
16. Spinner seul sans contexte → squelette de contenu ou libellé de ce qui charge.
17. Orbes lumineux flous décoratifs → supprimer.
18. Trame de points décorative → supprimer.
19. Icônes étincelles pour désigner "IA" → utiliser le mot exact de la fonction.
20. Flèches animées vers le CTA → supprimer.
21. Animation au survol sur tout → garder la réaction uniquement sur les éléments cliquables.
22. Néon saturé → désaturer vers des tons qui tiennent sur un écran mal calibré.
23. Pastels sans contraste → monter le contraste texte/fond à 4,5:1 minimum, le mesurer réellement (pas à l'œil).

### Points [décision] — ne jamais corriger seul, poser la question avec une recommandation en une phrase

24. Icônes Lucide/Feather par défaut → proposer un set cohérent avec la marque, ou une taille/graisse uniques.
25. Inter, Geist ou Space Grotesk en police unique → proposer une alternative avec du caractère, lisible.
26. Témoignages sans nom vérifiable, 5 étoiles systématiques, logos de presse → du vrai ou rien. **Rien ne s'invente.**
27. Trois formules de prix, milieu mis en avant → à repenser si l'offre réelle ne colle pas à ce moule.
28. Aucune démo du vrai produit → demander ce qui existe (capture, enregistrement, lien) pour remplacer le placeholder.
29. Pas de CGU → générer un squelette adapté au projet, à faire relire avant mise en ligne.
30. Pas de politique de confidentialité → squelette à faire relire, **obligatoire** dès qu'un email ou une donnée personnelle est collecté (formulaire de contact, newsletter, etc.).

---

## Étape 3 — Corriger

Corriger uniquement les points marqués **TROUVÉ** sur la liste [auto]. Ne rien toucher aux points [décision] tant que l'utilisateur n'a pas tranché.

Contraintes strictes pendant la correction :
- Aucune dépendance ajoutée
- Aucun changement de framework ou de stack
- Chaque correction laisse le site fonctionnel à chaque étape (pas de correction groupée non vérifiable)
- Si un point semble faux dans le contexte du projet (ex. un dégradé assumé comme identité de marque volontaire), le signaler à l'utilisateur au lieu de corriger — ne jamais forcer une règle contre un choix délibéré et cohérent.

---

## Étape 4 — Livrer le rapport

Toujours terminer par, dans cet ordre :

1. **Diff résumé** — ce qui a été changé, point par point, fichier par fichier.
2. **Questions en attente** — chaque point [décision] trouvé, avec la recommandation en une phrase.
3. **Ce qui reste à faire à la main** — ce qu'aucune automatisation ne peut trancher (ex. vrais témoignages à collecter, vraie démo à enregistrer).

Ne pas noyer l'utilisateur dans le rapport complet des 30 points si la majorité est NON APPLICABLE ou OK — regrouper ces deux catégories en une ligne de synthèse, et détailler uniquement les TROUVÉ.

---

## Cas particulier — site issu de `brief-artisan`

Si le fichier audité a été produit avec `brief-artisan`, la plupart des points [auto] devraient déjà être à OK (polices, fausses données, contraste). Un audit qui remonte beaucoup de TROUVÉ sur un tel fichier signale soit une modification manuelle ultérieure du client, soit une dérive à signaler pour corriger `brief-artisan` lui-même à la source plutôt que de corriger chaque site généré après coup.
