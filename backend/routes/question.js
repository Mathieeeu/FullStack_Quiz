// backend/routes/question.js

const express = require('express');

module.exports = (collection) => {
    const router = express.Router();

    // Fonction pour générer la requête
    const generateQuery = (conditions) => {
        let themes = [];
        let difficulties = [];
        let types = [];
        let n = null;

        // Récupération des valeurs des conditions si elles sont précisées
        conditions.forEach(condition => {
            const [key, value] = condition.split('=');
            if (key === "theme") {
                themes = value.split(',');
            } else if (key === "difficulty") {
                difficulties = value.split(',');
            } else if (key === "type") {
                types = value.split(',');
            } else if (key === "n") {
                n = parseInt(value);
            }
        });

        // Génération de la requête avec les conditions
        let query = {};
        // Conditions sur le thème
        if (themes.length > 0) {
            const includeThemes = themes.filter(theme => !theme.startsWith('!'));
            const excludeThemes = themes.filter(theme => theme.startsWith('!')).map(theme => theme.substring(1));
            query.themeText = {};
            if (includeThemes.length > 0) {
                query.themeText.$in = includeThemes;
            }
            if (excludeThemes.length > 0) {
                query.themeText.$nin = excludeThemes;
            }
        }
        // Conditions sur la difficulté
        if (difficulties.length > 0) {
            const includeDifficulties = difficulties.filter(difficulty => !difficulty.startsWith('!'));
            const excludeDifficulties = difficulties.filter(difficulty => difficulty.startsWith('!')).map(difficulty => difficulty.substring(1));
            query.difficulty = {};
            if (includeDifficulties.length > 0) {
                query.difficulty.$in = includeDifficulties;
            }
            if (excludeDifficulties.length > 0) {
                query.difficulty.$nin = excludeDifficulties;
            }
        }

        // Conditions sur le type de question
        if (types.length > 0) {
            const includeTypes = types.filter(type => !type.startsWith('!'));
            const excludeTypes = types.filter(type => type.startsWith('!')).map(type => type.substring(1));
            query.questionType = {};
            if (includeTypes.length > 0) {
                query.questionType.$in = includeTypes;
            }
            if (excludeTypes.length > 0) {
                query.questionType.$nin = excludeTypes;
            }
        }

        return { query, n };
    };

    // Route pour récupérer les questions respectant des conditions
    router.get('/:conditions', async (req, res) => {
        const conditions = req.params.conditions.split('&');
        const { query, n } = generateQuery(conditions);

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
        const { query } = generateQuery(conditions);

        try {
            const nbQuestions = await collection.countDocuments(query);
            res.send({ nbQuestions });
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour ajouter une question
    router.post('/add', async (req, res) => {
        // req.body contient {questionText, answerText, themeText, difficulty, questionType, fakeAnswer?, trueAnswers?, fakeAnswers?}
        const question = {
            questionId: "",
            questionText: req.body.questionText,
            themeText: req.body.themeText,
            difficulty: req.body.difficulty,
            questionType: req.body.questionType
        };

        // Ajouter les champs spécifiques selon le type de question
        if (req.body.questionType === 'QCM') {
            question.fakeAnswer = req.body.fakeAnswer;
        } else if (req.body.questionType === 'Selection') {
            question.trueAnswers = req.body.trueAnswers;
            question.fakeAnswers = req.body.fakeAnswers;
        }
        if (req.body.questionType !== 'Selection') {
            question.answerText = req.body.answerText;
        }

        // Récupération du nombre de questions pour générer un nouvel id
        const nbQuestions = await collection.countDocuments();
        question.questionId = (nbQuestions + 1).toString();

        // Ajout de la question
        try {
            const result = await collection.insertOne(question);
            res.send(result);

            // Réorganisation des ids (car on a des soucis car les ids sont attribués trop lentement) ######## TODO : Trouver une solution pour éviter ça
            const questions = await collection.find().sort({ questionId: 1 }).toArray();
            for (let i = 0; i < questions.length; i++) {
                questions[i].questionId = i.toString();
                await collection.updateOne({ _id: questions[i]._id }, { $set: { questionId: questions[i].questionId } });
            }
            console.log(`Question ${question.questionId} added and IDs updated: `, question);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour modifier une question
    router.post('/edit/:id', async (req, res) => {
        const questionId = req.params.id;
        const question = {
            questionText: req.body.questionText,
            answerText: req.body.answerText,
            themeText: req.body.themeText,
            difficulty: req.body.difficulty
        };

        try {
            const result = await collection.updateOne({ questionId }, { $set: question });
            console.log(`Question ${questionId} edited: `, question);
            res.send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour supprimer une question
    router.post('/delete/:id', async (req, res) => {
        const questionId = req.params.id;
    
        try {
            // Suppression de la question
            const deleteResult = await collection.deleteOne({ questionId });
            if (deleteResult.deletedCount === 0) {
                return res.status(404).send({ message: "Question not found" });
            }
    
            // Récupération de toutes les questions restantes
            const questions = await collection.find().sort({ questionId: 1 }).toArray();
    
            // Réattribution des ids
            for (let i = 0; i < questions.length; i++) {
                questions[i].questionId = i.toString();
                await collection.updateOne({ _id: questions[i]._id }, { $set: { questionId: questions[i].questionId } });
            }
    
            console.log(`Question ${questionId} deleted and IDs updated`);
            res.send({ message: "Question deleted and IDs updated" });
        } catch (error) {
            res.status(500).send(error);
        }
    });

    return router;
};
