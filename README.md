# Projet INFO734 - Développement fullstack - Quiz en ligne

## Description

Ce projet est une **application de quiz en ligne**, réalisé dans le cadre d'un cours de développement fullstack. Il est composé d'une partie front-end utilisant Angular et d'une partie back-end utilisant Node.js et Express. Les données sont stockées dans une base de données MongoDB. L'application permet aux utilisateurs de créer, rejoindre et jouer à des quiz en temps réel contre d'autres utilisateurs.

## Fonctionnalités

- Participer à des quiz **multijoueurs** en temps réel (**avec ou sans inscription**)
- Quatre types de questions : **QCM**, **Vrai/Faux**, **Question ouverte**, **Sélection de réponses multiples**
- Création de **parties personnalisées** avec un code unique pour inviter des adversaires (disponible uniquement pour les utilisateurs inscrits)
- **Ajout de questions** (disponible uniquement pour les administrateurs)
- Gestion des comptes et des parties (disponible uniquement pour les administrateurs)

## Prérequis

- Node.js
- npm

## Installation

1. Cloner le dépôt

```bash
git clone https://github.com/Mathieeeu/FullStack_Quiz.git
cd FullStack_Quiz
```

2. Installer les dépendances pour le back-end et le front-end

```bash
cd backend
npm install --no-fund express body-parser cors dotenv axios bcrypt
cd ../quiz
npm install @angular/cli
cd ..
```

3. Créer un fichier `.env` dans le dossier `backend` et ajouter les variables d'environnement suivantes (voir le modèle dans `/backend/.env.example`):

```bash
MONGO_SCHEME=mongodb+srv
MONGO_USER=<username>
MONGO_PASSWORD=<password>
MONGO_ADDRESS=mathieeeu.1kzqc.mongodb.net
MONGO_DB=quiz-app
MONGO_OPTIONS=
```

4. Changer l'adresse IP dans le fichier `quiz/src/app/service/config.ts` pour qu'elle corresponde à l'adresse IP de votre serveur :

```typescript
address: '<votre_adresse_ip>',
```

Il est possible de mettre `127.0.0.1` pour un serveur local, mais cela ne fonctionnera pour les utilisateurs distants.

## Démarrage de l'application

Sur Windows, exécuter le script `run-server.bat` à la racine du projet.

```bash
run-server.bat
```

Sur Linux, exécuter le script `run-server.sh` à la racine du projet.

```bash
./run-server.sh
```

L'application est maintenant accessible localement à l'adresse `http://localhost:4200/` (ou à l'adresse `http://<votre_adresse_ip>:4200/` pour les utilisateurs distants).

---

## Fonctionnement de l'application

### Back-end

- `backend/` : dossier contenant le serveur express pour faire le lien avec l'api
  - `db-server.js` : point d'entrée du serveur de base de données
  - `routes/` : routes pour les requêtes HTTP

  L'ensemble des requêtes possibles vers l'api permettent de gérer les questions, utilisateurs et parties. Le serveur gère toutes les parties en cours en même temps en stockant les données dans la base de données. Toute la synchronisation des parties est gérée par le serveur directement, les clients n'ont qu'à demander les informations à une fréquence régulière (5 fois par seconde en jeu).

### Base de données MongoDB

L'une des contraintes du projet était d'utiliser une base de données NoSQL. Nous avons choisi d'héberger notre base de données sur MongoDB Atlas, un service de base de données cloud géré par MongoDB. Les données sont stockées dans une base de données nommée `quiz-app` et sont organisées en collections pour les utilisateurs, les questions et les parties. 

Voici la liste des collections utilisées :

- `question` : collection contenant les questions des quiz
- `user` : collection contenant les informations des utilisateurs
- `game` : collection contenant les parties en cours
- `assets` : collection contenant des données statiques (thèmes, motd)

#### Collection `user`

Voici le schéma d'un objet de la collection `user` :

```json
{
  "_id": "ObjectId",
  "username": "string",
  "password": "string",
  "Superuser": "boolean", 
}
```

La variable `Superuser` permet de déterminer si un utilisateur est un administrateur ou non.

#### Collection `game`

La collection `game` contient les informations des parties en cours. Chaque partie est identifiée par un code unique généré aléatoirement. Les parties sont créées par un utilisateur et peuvent être rejointes par d'autres utilisateurs. Les parties sont stockées en base de données pour permettre la synchronisation en temps réel entre les joueurs. Voici le schéma d'un objet de la collection `game` :

```json
{
  "_id": "ObjectId",
  "code": "string",
  "creationDate": "string",
  "isStarted": "boolean",
  "isOver": "boolean",
  "options": {
    "nbQuestions": "string",
    "filters": "string",
    "questionTime": "string",
  },
  "host": "string",
  "players": "array",
  "currentQuestion": "ObjectQuestion",
  "currentQuestionIndex": "number",
  "showAnswer": "boolean",
  "countdown": "number",
}
```

#### Collection `question`

La collection `question` contient les questions des quiz. Il y a 4 types de questions :

- `QCM` : Question à choix multiples (une réponse parmi 3 ou 4)
- `Vrai/Faux` : Question à réponse binaire
- `Question ouverte` : Question à réponse libre
- `Sélection de réponses multiples` : Question à choix multiples avec plusieurs réponses possibles (une ou plusieurs réponses parmi 6 à 10)

Voici le schéma d'un objet de la collection `question` de type `Question ouverte` :

```json
{
  "_id": "ObjectId",
  "questionId": "string",
  "questionText": "string",
  "answerText": "string",
  "themeText": "string",
  "difficulty": "string", //(entre "1" et "3")
  "questionType": "Ouverte"
}
```

Voici le schéma d'un objet de la collection `question` de type `QCM` :

```json
{
  "_id": "ObjectId",
  "questionId": "string",
  "questionText": "string",
  "answerText": "string", // (seule réponse correcte)
  "fakeAnswer": "array<string>", // (3 ou 4 réponses)
  "themeText": "string",
  "difficulty": "string", //(entre "1" et "3")
  "questionType": "QCM",
}
```

Voici le schéma d'un objet de la collection `question` de type `Vrai/Faux` :

```json
{
  "_id": "ObjectId",
  "questionId": "string",
  "questionText": "string",
  "answerText": "string", // ("Vrai" ou "Faux")
  "themeText": "string",
  "difficulty": "string", //(entre "1" et "3")
  "questionType": "VF",
  "explaination": "string" // Optionnel
}
```

Voici le schéma d'un objet de la collection `question` de type `Sélection de réponses multiples` :

```json
{
  "_id": "ObjectId",
  "questionId": "string",
  "questionText": "string",
  "trueAnswers": "array<string>",
  "fakeAnswers": "array<string>",
  "themeText": "string",
  "difficulty": "string", //(entre "1" et "3")
  "questionType": "Selection"
}
```

### Front-end

Voici les différentes pages de l'application (toutes doivent être accédées à partir de la page d'accueil) :

- `/` : Page d'accueil
- `/admin` : Page d'administration (donc réservée aux administrateurs, logique)
- `/connexion` : Page de connexion
- `/inscription` : Page d'inscription
- `/lobby/:code` : Page du lobby d'une partie (accessible via un code unique)
- `/game/:code` : Page du jeu (Requiert d'être dans un lobby d'abord)
- `/ajout-question` : Page pour ajouter des questions (accessible uniquement pour les administrateurs)
- `/creation-partie` : Page pour créer des parties (accessible pour les utilisateurs connectés)

La communication avec l'api (et donc la base de données) se fait via les services Angular. Ces derniers se trouvent dans le dossier `src/app/service/`.
Dans le dossier des services, le fichier `config.ts` permet de définir la configuration de l'application (adresse IP du serveur et port).

---

## Auteurs

- [Mathieu](https://github.com/Mathieeeu)
- [Louna](https://github.com/MooN101110)

---
