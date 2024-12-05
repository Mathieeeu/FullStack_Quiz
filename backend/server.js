<<<<<<< Updated upstream
// server.js
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const questionRoutes = require('./routes/question');
=======
// backend/server.js

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
>>>>>>> Stashed changes

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());


// Connect to MongoDB
if (!process.env.MONGO_USER || !process.env.MONGO_PASSWORD || !process.env.MONGO_ADDRESS || !process.env.MONGO_DB) {
    console.error('Les variables d\'environnement MONGO_USER, MONGO_PASSWORD, MONGO_ADDRESS et MONGO_DB doivent être définies !');
    process.exit(1);
}
const user = process.env.MONGO_USER;
const password = process.env.MONGO_PASSWORD;
const address = process.env.MONGO_ADDRESS;
const url = `mongodb://${user}:${password}@${address}:27017/?authMechanism=DEFAULT&authSource=admin`;

client = new MongoClient(url, { useUnifiedTopology: true });
client.connect()
    .then(() => {
        console.log('Connected to MongoDB');
        const database = client.db(process.env.MONGO_DB);
        const collection = database.collection("question");

        // Routes (la collection est passée en paramètre pour qu'elles puissent l'utiliser)
        app.use('/api/question', questionRoutes(collection));
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });   

// Route pour la racine de l'API
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>qAPI</title>
            <style>
                body {
                    font-family: 'Courier New', Courier, monospace;
                    background-color: #1e1e1e;
                    color: #d4d4d4;
                    font-size: 0.7em;
                }
                p {
                    color: #FF8700;
                }
                ul {
                    list-style-type: none;
                }
                li {
                    margin: 5px 0;
                }
                .cmd {
                    color: #569cd6;
                }
                .path{
                    color: #4ec9b0;
                }
            </style>
        </head>
        </body>
            <p>API de la base de données de questions</p>
            <p>Voici les différentes opérations possibles :</p>
            <ul>
                <li><span class="cmd">GET</span> <span class="path">/api/question/*</span> : Récupérer la liste des questions</li>
                <li><span class="cmd">GET</span> <span class="path">/api/question/&ltconditions&gt</span> : Récupérer des questions aléatoires selon des conditions</li>
                <li><span class="cmd">GET</span> <span class="path">/api/question/nb/*</span> : Renvoie le nombre total de questions</li>
                <li><span class="cmd">GET</span> <span class="path">/api/question/nb/&ltconditions&gt</span> : Renvoie le nombre de questions respectant des conditions</li>
                    <span>Conditions possibles (séparées de '&', si une condition a plusieurs valeurs, elles sont séparées par ',') :</span>
                    <ul>
                        <li><span class="cmd">theme=&ltstring&gt</span> : Thème(s) à rechercher</li>
                        <li><span class="cmd">difficulty=&ltint&gt</span> : Difficulté(s) à rechercher</li>
                        <li><span class="cmd">n=&ltint&gt</span> : Nombre de questions à récupérer</li>
                    </ul>
                <li><span class="cmd">POST</span> <span class="path">/api/question/add</span> : Soumettre un formulaire pour ajouter une question</li>
                <li><span class="cmd">POST</span> <span class="path">/api/question/edit/</span> : Modifier une question</li>
                <li><span class="cmd">POST</span> <span class="path">/api/question/delete/</span> : Supprimer une question</li>
            </ul>
        </body>
        </html>
    `);
});

<<<<<<< Updated upstream
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
=======
lookForGames();

// wait for input
process.stdin.resume();
console.log('Press any key to exit...');
process.stdin.on('data', process.exit.bind(process, 0));
>>>>>>> Stashed changes
