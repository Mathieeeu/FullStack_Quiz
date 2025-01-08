@REM Script qui démarre l'api ET l'application de quiz en même temps

@REM Solution à un serveur qui gère toutes les parties directement :
cd backend
start node db-server.js

cd ../quiz
@REM ng build --configuration production
ng serve --host 0.0.0.0 --disable-host-check