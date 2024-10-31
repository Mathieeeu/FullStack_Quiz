const express = require('express');

module.exports = (collection) => {
    const router = express.Router();

    // Route pour récupérer les questions respectant des conditions
    router.get('/:conditions', async (req, res) => {
        const conditions = req.params.conditions.split('&');
        let themes = [];
        let difficulties = [];
        let n = null;

        // Récupération des valeurs des conditions si elles sont précisées
        conditions.forEach(condition => {
            const [key, value] = condition.split('=');
            if (key === "theme") {
                themes = value.split(',');
            } else if (key === "difficulty") {
                difficulties = value.split(',');
            } else if (key === "n") {
                n = parseInt(value);
            }
        });

        let query = {};
        if (themes.length > 0) {
            query.themeText = { $in: themes };
        }
        if (difficulties.length > 0) {
            query.difficulty = { $in: difficulties };
        }

        try {
            let questions;

            // Si n est précisé, on renvoie n questions tirées aléatoirement
            if (n) {
                questions = await collection.aggregate([{ $match: query }, { $sample: { size: n } }]).toArray();
            } else {
                questions = await collection.find(query).toArray();
            }

            if (questions.length === 0) {
                res.status(404).send({status: "404", error: "Aucune question ne correspond aux critères", query: query});
            } else {
                res.send(questions);
            }
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour récupérer le nombre de questions respectant des conditions
    router.get('/nb/:conditions', async (req, res) => {
        const conditions = req.params.conditions.split('&');
        let themes = [];
        let difficulties = [];

        // Récupération des valeurs des conditions si elles sont précisées
        conditions.forEach(condition => {
            const [key, value] = condition.split('=');
            if (key === "theme") {
                themes = value.split(',');
            } else if (key === "difficulty") {
                difficulties = value.split(',');
            }
        });

        let query = {};
        if (themes.length > 0) {
            query.themeText = { $in: themes };
        }
        if (difficulties.length > 0) {
            query.difficulty = { $in: difficulties };
        }

        try {
            const nbQuestions = await collection.countDocuments(query);
            res.send({ nbQuestions });
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour ajouter une question
    router.post('/add', async (req, res) => {
        try {
            const newQuestion = req.body;
            const result = await collection.insertOne(newQuestion);
            res.status(201).send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    return router;
};
