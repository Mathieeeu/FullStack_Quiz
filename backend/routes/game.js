// backend/routes/game.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

module.exports = (collection) => {
    
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

    router.get('/generate-code', async (req, res) => {
        try {
            const code = await generateGameCode();
            res.json({ code });  // Renvoie le code généré
          } catch (error) {
            res.status(500).send('Erreur lors de la génération du code');
          }
        });

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

        // Modèle d'une partie dans la base de données
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
            currentQuestionIndex: -1,
            showAnswer: false,
            countdown:-1
        };

        try {
            const result = await collection.insertOne(game);
            res.send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour supprimer une partie
    router.delete('/delete/:code', async (req, res) => {
        console.log("Suppression de la partie " + req.params.code);
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
            score: 0,
            hasAnswered: false,
            answerCorrect: false
        };

        try {
            const game = await collection.findOne({ code });
            if (!game) {
                return res.status(404).send({ message: "Game not found" });
            }

            if (game.isOver) {
                return res.status(410).send({ message: "Game is over" });
            }

            // Vérifier si le pseudo existe déjà
            const existingPlayer = game.players.find(p => p.username === player.username);
            if (existingPlayer) {
                return res.status(409).send({ message: "Username already taken" });
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

            // Initialisation de la partie et envoi de la première question
            game.isStarted = true;
            // game.questions = questions; // Retiré pour ne pas "stocker" les questions sur l'api
            game.currentQuestion = questions[0];
            game.countdown = game.options.questionTime;

            // await collection.updateOne({ code }, { $set: { isStarted: game.isStarted, questions: game.questions, currentQuestion: game.currentQuestion } }); // Retiré pour ne pas "stocker" les questions sur l'api
            await collection.updateOne({ code }, { $set: { isStarted: game.isStarted, currentQuestion: game.currentQuestion, showAnswer:game.showAnswer, countdown:game.countdown} }); // Ajouté pour ne pas "stocker" les questions sur l'api
 
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
                    setInterval(sendQuestion, questionTime + answerTime); // Questions suivantes toutes les (questionTime + answerTime) secondes
                }
            }, 1000);

            // Compte à rebours pour chaque question
            let countdownInterval = setInterval(async () => {
                if (!game.showAnswer && game.countdown > 0) {
                    game.countdown--;
                    await collection.updateOne({ code }, { $set: { countdown: game.countdown } });
                }
            }, 1000);

            // Fonction pour envoyer une question aux joueurs
            async function sendQuestion() {
                if (game.isOver) {
                    clearInterval(countdownInterval);
                    return;
                }
                else {
                    // Récupère le score des joueurs (qui a été changé par d'autres routes)
                    game.players = await collection.findOne({ code }).then(game => game.players);
                }

                currentQuestionIndex++;
                // if (currentQuestionIndex >= game.questions.length) { // Retiré pour ne pas "stocker" les questions sur l'api
                if (currentQuestionIndex >= questions.length) { // Ajouté pour ne pas "stocker" les questions sur l'api
                    game.isOver = true;
                    await collection.updateOne({ code }, { $set: { isOver: game.isOver } });
                    console.log("La partie est terminée !");
                    clearInterval(countdownInterval);


                } else {
                    // game.currentQuestion = game.questions[currentQuestionIndex]; // Retiré pour ne pas "stocker" les questions sur l'api
                    game.countdown = game.options.questionTime;
                    game.showAnswer = false;
                    game.currentQuestion = questions[currentQuestionIndex]; // Ajouté pour ne pas "stocker" les questions sur l'api

                    // met à jour la valeur de hasAnswered pour tous les joueurs
                    game.players = game.players.map(player => {
                        player.hasAnswered = false;
                        player.answerCorrect = false;
                        return player;
                    });
                    console.log(`Question ${currentQuestionIndex + 1}: ${game.currentQuestion.questionText}`);
                    await collection.updateOne({ code }, { $set: { 
                        currentQuestionIndex, 
                        currentQuestion: game.currentQuestion, 
                        countdown:game.countdown, 
                        showAnswer:game.showAnswer, 
                        players: game.players
                    } });

                    // Afficher le scoreboard
                    // console.log("Scoreboard:");
                    // console.log(game.players);

                    // Afficher la réponse après (questionTime) secondes
                    setTimeout(async () => {
                        console.log(`Réponse : ${game.currentQuestion.answerText}`);
                        game.showAnswer = true;
                        game.countdown = -1;
                        await collection.updateOne({ code }, { $set: { showAnswer: game.showAnswer, countdown:game.countdown } });

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

    router.post('/increaseScore/:code', async (req, res) => {
        const code = req.params.code;
        const username = req.body.username;
        const pourcentageSelectionCorrecte = req.body.pourcentageSelectionCorrecte;

        // Points de base pour une question (score max en gros)
        const base_points = 10;

        try {
            const game = await collection.findOne({ code });
            if (!game) {
                return res.status(404).send({ message: "Game not found" });
            }
    
            // Vérifier si le joueur existe dans le jeu :)
            const playerIndex = game.players.findIndex(player => player.username === username);
            if (playerIndex === -1) {
                return res.status(404).send({ message: "Player not found" });
            }

            // Augmenter le score du joueur (différemment selon le type de question si c'est selection) et trier les joueurs par score
            if (game.currentQuestion.questionType === "Selection") {
                
                // Pour la selection, le score est égal à la base_points multiplié par le pourcentage de réponses correctes (passé en paramètre)
                game.players[playerIndex].score += Math.floor(base_points * pourcentageSelectionCorrecte);
                game.players[playerIndex].hasAnswered = true;
                if (pourcentageSelectionCorrecte === 1) {
                    game.players[playerIndex].answerCorrect = true;
                } else {
                    game.players[playerIndex].answerCorrect = false;
                }
            }
            else {
                game.players[playerIndex].score += Math.ceil(game.countdown * base_points / game.options.questionTime); // Max = base_points, diminue linéairement avec le temps
                game.players[playerIndex].hasAnswered = true;
                game.players[playerIndex].answerCorrect = true;
            }
            
            // Trier les joueurs par score
            game.players.sort((a, b) => b.score - a.score); 
    
            // Metttre à jour le jeu dans la base de données
            await collection.updateOne({ code }, { $set: { players: game.players } });
    
            res.send(game);

        } catch (error) {
            res.status(500).send(error);
        }
    });
 
    // Route pour indiquer qu'un joueur a répondu à une question avec une seule réponse possible
    router.post('/hasAnswered/:code', async (req, res) => {
        const code = req.params.code;
        const username = req.body.username;

        try {
            const game = await collection.findOne({ code });
            if (!game) {
                return res.status(404).send({ message: "Game not found" });
            }

            // Vérifier si le joueur existe dans le jeu :)
            const playerIndex = game.players.findIndex(player => player.username === username);
            if (playerIndex === -1) {
                return res.status(404).send({ message: "Player not found" });
            }

            game.players[playerIndex].hasAnswered = true;
            game.players[playerIndex].answerCorrect = false;
            await collection.updateOne({ code }, { $set: { players: game.players } });

            res.send(game);

        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour indiquer qu'un joueur a répondu à une question avec plusieurs réponses possibles (hasAnswered = true pedant 1sec
    router.post('/hasTriedToAnswer/:code', async (req, res) => {
        const code = req.params.code;
        const username = req.body.username;

        try {
            const game = await collection.findOne({ code });
            if (!game) {
                return res.status(404).send({ message: "Game not found" });
            }

            // Vérifier si le joueur existe dans le jeu :)
            const playerIndex = game.players.findIndex(player => player.username === username);
            if (playerIndex === -1) {
                return res.status(404).send({ message: "Player not found" });
            }

            game.players[playerIndex].hasAnswered = true;
            game.players[playerIndex].answerCorrect = false;
            await collection.updateOne({ code }, { $set: { players: game.players } });

            setTimeout(async () => {
                game.players[playerIndex].hasAnswered = false;
                await collection.updateOne({ code }, { $set: { players: game.players } });
            }, 750);

            res.send(game);

        } catch (error) {
            res.status(500).send(error);

        }
    });

    return router;
};