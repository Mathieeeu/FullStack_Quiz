#!/bin/bash
# filepath: /c:/Users/Mathieu/OneDrive/cours/IDU-4/INFO734 - Developpement FullStack/5- Projet Quiz/FullStack_Quiz/run-server.sh
# Script qui démarre l'API et l'application de quiz en même temps

# Démarrage du serveur backend
cd backend
node db-server.js &

# Démarrage du serveur frontend
cd ../quiz
# ng build --configuration production
ng serve --host 0.0.0.0 --disable-host-check
