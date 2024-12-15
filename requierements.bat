@echo off

@REM Attention ça marche pas encore ça mais les commandes peuvent être tapées à la main :D

echo Installing npm packages...

cd backend/
npm install express
npm install body-parser
npm install cors
npm install dotenv
npm install bcrypt

cd ../quiz


echo All npm packages have been installed, this window will close in 5 seconds.
timeout /t 5