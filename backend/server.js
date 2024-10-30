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
                <li><span class="cmd">GET</span> <span class="path">/api/forms</span> : Récupérer la liste des questions</li>
                <li><span class="cmd">GET</span> <span class="path">/api/forms/&ltconditions&gt</span> : Récupérer des questions aléatoires selon des conditions</li>
                <li><span class="cmd">GET</span> <span class="path">/api/forms/nb/&ltconditions&gt</span> : Renvoie le nombre de questions respectant des conditions</li>
                    <span>Conditions possibles (séparées de '&', si une condition a plusieurs valeurs, elles sont séparées par ',') :</span>
                    <ul>
                        <li><span class="cmd">theme=&ltstring&gt</span> : Thème(s) à rechercher</li>
                        <li><span class="cmd">difficulty=&ltint&gt</span> : Difficulté(s) à rechercher</li>
                        <li><span class="cmd">n=&ltint&gt</span> : Nombre de questions à récupérer</li>
                    </ul>
                <li><span class="cmd">POST</span> <span class="path">/api/form/add</span> : Soumettre un formulaire pour ajouter une question</li>
                <li><span class="cmd">POST</span> <span class="path">/api/form/edit/</span> : Modifier une question</li>
                <li><span class="cmd">POST</span> <span class="path">/api/form/delete/</span> : Supprimer une question</li>
            </ul>
        </body>
        </html>
    `);
});

// Route pour récupérer la liste des questions
app.get('/api/forms', async (req, res) => {
    try {
        const forms = await collection.find().toArray();
        res.send(forms);
    } catch (error) {
        res.status(500)
            .send(error);
    }
});

// Route pour récupérer les questions respectant des conditions 
// (si le nombre n est précisé, donne n questions aléatoires)
app.get('/api/forms/:conditions', async (req, res) => {
    const conditions = req.params.conditions.split('&');
    let themes = [];
    let difficulties = [];
    let n = null;

    // Récupération des valeurs des conditions si elles sont précisées
    conditions.forEach(condition => {
        const [key, value] = condition.split('=');
        if (key === "theme") {
            themes = value.split(','); // Si plusieurs thèmes sont précisés, on les sépare par des virgules
        } else if (key === "difficulty") {
            difficulties = value.split(',');
        } else if (key === "n") {
            n = parseInt(value);
        }
    });
    console.log("Parsed conditions:", { themes, difficulties, n });

    let query = {};
    if (themes.length > 0) {
        query.themeText = { $in: themes };
    }
    if (difficulties.length > 0) {
        query.difficulty = { $in: difficulties };
    }
    console.log("Constructed query:", query);

    try {
        let forms;

        // Si n est précisé, on renvoie n questions tirées aléatoirement
        if (n) {
            forms = await collection
                .aggregate([{ $match: query }, { $sample: { size: n } }])
                .toArray();
        } else {
            forms = await collection
                .find(query)
                .toArray();
        }

        if (forms.length === 0) {
            res.status(404).send({status: "404", error: "Aucune question ne correspond aux critères", query: query});
        } else {
            res.send(forms);
        }

    } catch (error) {
        res.status(500).send(error);
    }
});

// Route pour récupérer le nombre de questions respectant des conditions
app.get('/api/forms/nb/:conditions', async (req, res) => {
    const conditions = req.params.conditions.split('&');
    let themes = [];
    let difficulties = [];

    // Récupération des valeurs des conditions si elles sont précisées
    conditions.forEach(condition => {
        const [key, value] = condition.split('=');
        if (key === "theme") {
            themes = value.split(','); // Si plusieurs thèmes sont précisés, on les sépare par des virgules
        } else if (key === "difficulty") {
            difficulties = value.split(',');
        }
    });
    console.log("Parsed conditions:", { themes, difficulties });

    let query = {};
    if (themes.length > 0) {
        query.themeText = { $in: themes };
    }
    if (difficulties.length > 0) {
        query.difficulty = { $in: difficulties };
    }
    console.log("Constructed query:", query);

    try {
        const nbForms = await collection.countDocuments(query);
        res.send({ nbForms });
    } catch (error) {
        res.status(500).send(error);
    }
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

app.listen(port, () => {
    console.log(`Server is running on ${"localhost"}:${port}`);
});