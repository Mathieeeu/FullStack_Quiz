cd backend

@REM Solution à un serveur qui gère des serveurs de parties en multithreading :
@REM start node server.js

@REM Solution à un serveur qui gère toutes les parties directement :
start node db-server.js

cd ../quiz
@REM ng build --configuration production
ng serve --host 0.0.0.0 --disable-host-check

@REM cd dist/quiz/browser
@REM start http-server -p 80

@REM pause