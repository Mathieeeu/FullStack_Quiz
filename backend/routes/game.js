// backend/routes/game.js

const express = require('express');
const router = express.Router();

module.exports = (collection) => {
    
    // Fonction pour générer un code de jeu aléatoire
    function generateGameCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let code = '';

        for (let i = 0; i < 4; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        // TODO : En vrai, il faudrait vérifier que le code n'est pas déjà utilisé

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
    router.post('/create/:code', async (req, res) => {
        // S'il n'y a pas de code fourni, on en génère un aléatoirement
        let code = req.params.code;
        if (!code) {
            code = generateGameCode();
        }
        const game = {
            code: code,
            creationDate: new Date(),
            isStarted: false,
            isOver: false,
            options: { 
                nbQuestions: req.body.nbQuestions,
                filters:f`[${req.body.filters}]`,
                questionTime: req.body.questionTime,
            },
            host: req.body.host,
            players: []
        };

        console.log(game);

        // try {
        //     const result = await collection.insertOne(game);
        //     res.send(result);
        // } catch (error) {
        //     res.status(500).send(error);
        // }
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
            game.players.push(player);
            await collection.updateOne({ code }, { $set: { players: game.players } });
            res.send(game);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour démarrer une partie
    router.post('/start/:code', async (req, res) => {
        const code = req.params.code;

        try {
            const game = await collection.findOne({ code });
            if (!game) {
                return res.status(404).send({ message: "Game not found" });
            }
            game.isStarted = true;
            await collection.updateOne({ code }, { $set: { isStarted: game.isStarted } });
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

    return router;
};
