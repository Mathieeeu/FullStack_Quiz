@echo off

@REM Attention ça marche pas encore ça mais les commandes peuvent être tapées à la main :D

echo Installing npm packages...

cd backend/
npm install @angular/cli
ng build
npm install express
npm install body-parser
npm install cors
npm install dotenv
npm install axios
npm install bcrypt
npm install -g http-server

cd ../quiz


echo All npm packages have been installed, this window will close in 5 seconds.
timeout /t 5