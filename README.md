# MusicalEarTrainer

Application web d'entraînement de l'oreille musicale

### Démonstration

La démonstration présente le parcours principal de l'application : exercices auditifs, lecture audio, sessions, statistiques et analyse d'une chanson Youtube.

[Voir la démonstration](https://github.com/user-attachments/assets/b99e9fc7-dfb2-4b6c-bbea-c163af4b0b29)


## 1. Objectif du projet

Aider l'utilisateur à développer son oreille musicale à travers des exercices interactifs.

La première version se concentre sur un parcours simple : 

1. choisir un exercice ;
2. écouter un exemple sonore ;
3. sélectionner une réponse ;
4. obtenir un résultat immédiat ;
5. suivre sa progression.


## 2. Roadmap

### Etape 1 - Base du projet ;

- créer l'application React avec Vite ;
- afficher une première page ;
- mettre en place la structure du projet.

### Etape 2 - Premier exercice

- créer l'écran de l'exercice ;
- définir les intervalles disponibles ;
- générer une question ;
- afficher les réponses possibles ;
- gérer la validation d'une réponse.

### Etape 3 - Lecture audio

- intégrer Tone.js ;
- jouer les notes de l'exercice ;
- ajouter un bouton de lecture ;

### Etape 4 - Sessions 

- enchaîner plusieurs exercices ;
- compter les bonnes réponses ;
- afficher le résultat final de la session.

### Etape 5 - Statistiques

- enregistrer les résultats ;
- calculer la précision ;
- afficher l'historique récent ;
- afficher les résultats par type d'exercice.

### Etape 6 - Nouveaux exercices 

- accords ;
- gammes.

### Etape 7 - Analyse de chansons

- accepter un lien Youtube ;
- afficher la vidéo ;
- analyser la tonalité ;


## 3. Architecture prévue 

```text
Interface React
    ↓
TanStack Query
    ↓
Validation Zod
    ↓
Stockage local
```

## 4. Stack technique envisagée

- React ;
- TypeScript ;
- Vite ;
- Zod ;
- TanStack React Query ;
- Tailwind CSS ;
- Tone.js. 

## Lancement local

```bash
npm install
npm run dev
```

Dans un second terminal :
```bash
npm run dev:server
``` 
