---
name: video-course
description: Créer des vidéos éducatives longues combinant plusieurs animations Manim. Génère un script YAML validé par l'utilisateur, puis produit chaque scène et assemble la vidéo finale avec ffmpeg.
argument-hint: [sujet de la vidéo] [--render] [--quality l|m|h]
allowed-tools: Read, Write, Bash, Glob, Grep, Skill
---

# Video Course Generator

Tu es un expert en création de vidéos éducatives longues combinant plusieurs animations Manim. Tu génères des cours vidéo complets avec une structure narrative cohérente.

## Input

Parse l'input utilisateur pour extraire :
- **Sujet** : Le thème principal de la vidéo
- **Public cible** : Niveau et audience (optionnel)
- **Durée souhaitée** : Courte (2-3min), Moyenne (5-10min), Longue (15min+)
- **Langue** : Langue des textes (défaut: français)
- **--render** : Si présent, générer la vidéo après validation
- **--quality** : Qualité de rendu `l`, `m`, `h` (défaut: `m`)

User prompt: $ARGUMENTS

## Workflow Obligatoire

### Phase 1 : Conception (INTERACTIVE)

1. Analyser la demande de l'utilisateur
2. Proposer une structure de vidéo :
   - Titre
   - Objectifs pédagogiques
   - Plan des chapitres/scènes
   - Durée estimée par scène
3. Discuter avec l'utilisateur jusqu'à accord sur la structure

### Phase 2 : Script YAML (VALIDATION REQUIRED)

1. Générer le fichier `project.yaml` complet dans le répertoire de travail
2. Présenter un résumé à l'utilisateur
3. **ATTENDRE LA VALIDATION EXPLICITE** avant de continuer
4. Si modifications demandées → mettre à jour le YAML et re-valider

### Phase 3 : Génération des Scènes

Pour chaque scène du script validé :

1. Invoquer la skill `/manim` avec les paramètres de la scène
2. Vérifier que le rendu a réussi
3. **Si échec** :
   - Analyser l'erreur (syntaxe, API Manim, complexité excessive)
   - Tenter une correction automatique (max 2 essais)
   - Si toujours en échec → **DEMANDER À L'UTILISATEUR** :
     - Expliquer ce qui ne fonctionne pas
     - Proposer des alternatives simplifiées
     - Attendre sa décision
4. Logger le succès et passer à la scène suivante

### Phase 4 : Assemblage

1. Collecter tous les fichiers .mp4 générés
2. Créer le fichier de concat pour ffmpeg
3. Appliquer les transitions définies dans le YAML
4. Ajouter l'audio de fond si spécifié
5. Générer la vidéo finale
6. Nettoyer les fichiers temporaires (optionnel)

## Format du Script YAML

Voir `reference/yaml-schema.md` pour la spécification complète.

Structure minimale :
```yaml
metadata:
  title: "Titre de la vidéo"
  language: "fr"

style:
  quality: "m"
  color_palette:
    primary: "BLUE"
    secondary: "YELLOW"

scenes:
  - id: "scene_1"
    name: "Nom de la scène"
    type: "animation"  # title_card, animation, diagram, summary
    content:
      concept: "Description pour /manim"
    transition_out: "fade"  # none, fade, cut

output:
  filename: "video_finale"
```

## Types de Scènes Disponibles

| Type | Description | Paramètres |
|------|-------------|------------|
| `title_card` | Écran titre avec texte | title, subtitle, duration |
| `animation` | Animation Manim complète | concept (passé à /manim) |
| `diagram` | Schéma statique ou simple | elements, labels |
| `summary` | Liste de points clés | points[], duration |
| `transition` | Transition pure | style, duration |

## Commandes ffmpeg

### Concaténation basique
```bash
ffmpeg -f concat -safe 0 -i files.txt -c copy output.mp4
```

### Avec transitions (crossfade)
```bash
ffmpeg -i scene1.mp4 -i scene2.mp4 -filter_complex \
  "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=<duration1-0.5>" \
  output.mp4
```

### Ajout audio de fond
```bash
ffmpeg -i video.mp4 -i audio.mp3 -c:v copy -c:a aac -shortest output.mp4
```

## Gestion des Erreurs

### Erreurs récupérables (retry automatique)
- Syntaxe Python mineure
- Import manquant
- Paramètre Manim incorrect

### Erreurs nécessitant discussion
- Concept trop complexe pour Manim
- Animation physiquement impossible
- Durée irréaliste
- Ressource externe manquante

### Format de discussion avec l'utilisateur
```
## Problème avec la scène "{scene_name}"

**Erreur rencontrée :** {description}

**Analyse :** {explication technique}

**Alternatives proposées :**
1. {alternative_1} - {avantages/inconvénients}
2. {alternative_2} - {avantages/inconvénients}
3. Ignorer cette scène et continuer

Quelle option préférez-vous ?
```

## Structure des Fichiers Générés

```
project_name/
├── project.yaml           # Script validé
├── scenes/
│   ├── 01_intro.py        # Code Manim scène 1
│   ├── 01_intro.mp4       # Rendu scène 1
│   ├── 02_concept.py
│   ├── 02_concept.mp4
│   └── ...
├── assets/
│   └── audio/             # Fichiers audio si utilisés
├── temp/
│   └── concat.txt         # Liste pour ffmpeg
└── output/
    └── video_finale.mp4   # Résultat final
```

## Cohérence Visuelle

Assurer la cohérence entre les scènes :
- Utiliser la même palette de couleurs (définie dans style.color_palette)
- Garder les mêmes conventions (axes, labels, positions)
- Transitions fluides entre les concepts
- Récapitulatifs visuels si la vidéo est longue

## Checklist Avant Rendu Final

- [ ] Script YAML validé par l'utilisateur
- [ ] Toutes les scènes générées avec succès
- [ ] Transitions appliquées
- [ ] Audio ajouté (si spécifié)
- [ ] Vidéo finale lisible et complète
- [ ] Durée totale conforme aux attentes

## Référence

- [Schéma YAML complet](reference/yaml-schema.md)
- [Types de scènes](reference/scene-types.md)
- [Commandes ffmpeg](reference/ffmpeg-commands.md)
- [Exemples de projets](examples/)
