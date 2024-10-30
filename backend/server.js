const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
const user = "docherm"
const password = "info734"
const adress = "193.48.125.44"
const url = `mongodb://${user}:${password}@${adress}:27017/?authMechanism=DEFAULT&authSource=admin`;


client = new MongoClient(url, { useUnifiedTopology: true });
client.connect()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit the process with an error code
    });

// Define a schema and model
const FormSchema = {
    questionId: Number,
    questionText: String,
    themeText: String,
    answerText: String
};

const database = client.db("louna_mathieu");
const collection = database.collection("question");

// Routes
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
                <li><span class="cmd">POST</span> <span class="path">/api/form</span> : Soumettre un formulaire pour ajouter une question</li>
                <li><span class="cmd">GET</span> <span class="path">/api/forms</span> : Récupérer la liste des questions</li>
                <li><span class="cmd">GET</span> <span class="path">/api/forms/:theme</span> : Récupérer la liste des questions d'un thème</li>
                <li><span class="cmd">GET</span> <span class="path">/api/form/random/:n</span> : Récupérer n questions aléatoires</li>
            </ul>
        </body>
        </html>
    `);
});

// app.post('/api/form', async (req, res) => {
//     const form = new Form(req.body);
//     try {
//         await form.save();
//         res.status(201).send(form);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// });

app.get('/api/forms', async (req, res) => {
    try {
        const forms = await collection.find().toArray();
        res.send(forms);
    } catch (error) {
        res.status(500)
            .send(error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on ${"localhost"}:${port}`);
});