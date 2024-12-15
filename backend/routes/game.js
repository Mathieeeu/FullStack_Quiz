const express = require('express');
const axios = require('axios');
const router = express.Router();

module.exports = (collection, questionCollection) => {
    
    // Fonction pour générer un code de jeu aléatoire
    async function generateGameCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let code = '';

        do {
            code = '';
            for (let i = 0; i < 4; i++) {
                code += characters.charAt(Math.floor(Math.random() * characters.length));
            }
        } while (await collection.findOne({ code }));

        return code;
    }

    // Route pour récupérer la liste des parties
    router.get('/', async (req, res) => {
        try {
            const games = await collection.find().toArray();
            res.send(games);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour créer une nouvelle partie
    router.post('/create/:code?', async (req, res) => {
        let code = req.params.code;
        if (!code) {
            code = await generateGameCode();
        }
        const game = {
            code: code,
            creationDate: new Date().toISOString().replace(/T/, '_').replace(/\..+/, ''),
            isStarted: false,
            isOver: false,
            options: { 
                nbQuestions: req.body.nbQuestions,
                filters: req.body.filters,
                questionTime: req.body.questionTime,
            },
            host: req.body.host,
            players: [],
            currentQuestion: null,
            currentQuestionIndex: -1
        };

        try {
            const result = await collection.insertOne(game);
            res.send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour supprimer une partie
    router.post('/delete/:code', async (req, res) => {
        const code = req.params.code;
        try {
            const result = await collection.deleteOne({ code });
            res.send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour rejoindre une partie
    router.post('/join/:code', async (req, res) => {
        const code = req.params.code;
        const player = {
            username: req.body.username,
            score: 0
        };

        try {
            const game = await collection.findOne({ code });
            if (!game) {
                return res.status(404).send({ message: "Game not found" });
            }

            // Vérifier si le pseudo existe déjà
            const existingPlayer = game.players.find(p => p.username === player.username);
            if (existingPlayer) {
                return res.status(400).send({ message: "Username already taken" });
            }

            game.players.push(player);
            await collection.updateOne({ code }, { $set: { players: game.players } });
            res.send(game);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour déconnecter un joueur
    router.post('/leave/:code', async (req, res) => {

        // PAS ENCORE TESTEE, SIMPLEMENT ECRITE POUR LE MOMENT !!!!

        const code = req.params.code;
        const username = req.body.username;

        try {
            const game = await collection.findOne({ code });
            if (!game) {
                return res.status(404).send({ message: "Game not found" });
            }

            const playerIndex = game.players.findIndex(p => p.username === username);
            if (playerIndex === -1) {
                return res.status(404).send({ message: "Player not found" });
            }

            game.players.splice(playerIndex, 1);
            await collection.updateOne({ code }, { $set: { players: game.players } });
            res.send(game);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour démarrer une partie et générer les questions
    router.post('/start/:code', async (req, res) => {
        const code = req.params.code;

        try {
            const game = await collection.findOne({ code });
            if (!game) {
                return res.status(404).send({ message: "Game not found" });
            }

            // Vérifier que le jeu n'est pas déjà démarré ou terminé
            if (game.isStarted) {
                return res.status(400).send({ message: "Game already started" });
            }
            if (game.isOver) {
                return res.status(400).send({ message: "Game is over" });
            }

            // Générer les questions
            const filters = game.options.filters;
            const nbQuestions = game.options.nbQuestions;

            let requeteAPI = `http://127.0.0.1:3000/api/question/n=${nbQuestions}&${filters}`;
            let requeteAPIQuestionsPossibles = `http://127.0.0.1:3000/api/question/nb/${filters}`;
            let requeteAPIToutesQuestions = `http://127.0.0.1:3000/api/question/nb/*`;

            const nbQuestionsPossibles = (await axios.get(requeteAPIQuestionsPossibles)).data.nbQuestions
            const nbToutesQuestions = (await axios.get(requeteAPIToutesQuestions)).data.nbQuestions

            console.log(`\nRequête à l'API: ${requeteAPI} - (${nbQuestionsPossibles}/${nbToutesQuestions} questions correspondantes)\n`);

            const response = await axios.get(requeteAPI);
            const questions = response.data;

            game.isStarted = true;
            // game.questions = questions; // Retiré pour ne pas "stocker" les questions sur l'api
            game.currentQuestion = questions[0];
            // await collection.updateOne({ code }, { $set: { isStarted: game.isStarted, questions: game.questions, currentQuestion: game.currentQuestion } }); // Retiré pour ne pas "stocker" les questions sur l'api
            await collection.updateOne({ code }, { $set: { isStarted: game.isStarted, currentQuestion: game.currentQuestion } }); // Ajouté pour ne pas "stocker" les questions sur l'api
 
            // Changer les questions toutes les x secondes
            const questionTime = game.options.questionTime * 1000;
            let currentQuestionIndex = -1;

            // Informations de la partie
            console.log(`Informations de la partie ${code}:`);
            console.log(`Nombre de questions: ${nbQuestions}`);
            console.log(`Filtres: ${filters}`);
            console.log(`Temps par question: ${game.options.questionTime} secondes`);
            console.log("");

            // Petit countdown pour laisser du temps aux joueurs un peu inattentifs
            let countdown = 5;
            const countdownIntervalId = setInterval(() => {
                console.log(`La partie commence dans ${countdown} seconde(s)`);
                countdown--;
                if (countdown < 0) {
                    clearInterval(countdownIntervalId);
                    console.log("");

                    const answerTime = 5000;
                    sendQuestion(); // Première question
                    setInterval(sendQuestion, questionTime + answerTime); // Questions suivantes
                }
            }, 1000);

            async function sendQuestion() {
                currentQuestionIndex++;
                // if (currentQuestionIndex >= game.questions.length) { // Retiré pour ne pas "stocker" les questions sur l'api
                if (currentQuestionIndex >= questions.length) { // Ajouté pour ne pas "stocker" les questions sur l'api
                    game.isOver = true;
                    await collection.updateOne({ code }, { $set: { isOver: game.isOver } });
                    console.log("La partie est terminée !");
                } else {
                    // game.currentQuestion = game.questions[currentQuestionIndex]; // Retiré pour ne pas "stocker" les questions sur l'api
                    game.currentQuestion = questions[currentQuestionIndex]; // Ajouté pour ne pas "stocker" les questions sur l'api
                    console.log(`Question ${currentQuestionIndex + 1}: ${game.currentQuestion.questionText}`);
                    await collection.updateOne({ code }, { $set: { currentQuestionIndex, currentQuestion: game.currentQuestion } });

                    // Afficher le scoreboard
                    // console.log("Scoreboard:");
                    // console.log(game.players);

                    setTimeout(async () => {
                        console.log(`Réponse : ${game.currentQuestion.answerText}`);

                        // Afficher le scoreboard
                        // console.log("Scoreboard:");
                        // console.log(game.players);
                    }, questionTime);
                }
            }

            res.send(game);

        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour finir une partie
    router.post('/end/:code', async (req, res) => {
        const code = req.params.code;

        try {
            const game = await collection.findOne({ code });
            if (!game) {
                return res.status(404).send({ message: "Game not found" });
            }
            game.isOver = true;
            await collection.updateOne({ code }, { $set: { isOver: game.isOver } });
            res.send(game);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour récupérer les détails d'une partie
    router.get('/:code', async (req, res) => {
        const code = req.params.code;
        try {
            const game = await collection.findOne({ code });
            if (!game) {
                return res.status(404).send({ message: "Game not found" });
            }
            res.send(game);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour mettre à jour le score d'un joueur
    router.post('/update-score/:code', async (req, res) => {
        const code = req.params.code;
        const { username, score } = req.body;

        try {
            const game = await collection.findOne({ code });
            if (!game) {
                return res.status(404).send({ message: "Game not found" });
            }
            const player = game.players.find(p => p.username === username);
            if (player) {
                player.score = score;
                await collection.updateOne({ code }, { $set: { players: game.players } });
                res.send(game);
            } else {
                res.status(404).send({ message: "Player not found" });
            }
        } catch (error) {
            res.status(500).send(error);
        }
    });

    return router;
};