// backend/routes/assets.js

const express = require('express');
const axios = require('axios');

module.exports = (collection) => {
    const router = express.Router();

    // Route pour récupérer les assets
    router.get('/', async (req, res) => {
        try {
            const result = await collection.find().toArray();
            res.send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour récupérer un motd aléatoire
    router.get('/motd', async (req, res) => {
        try {
            const result = await collection.find().toArray();
            const motd = result[0].motd;
            const randomIndex = Math.floor(Math.random() * motd.length);
            res.json({ motd: motd[randomIndex] }); // Utilisation de res.json pour envoyer une réponse JSON
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour récupérer les thèmes (et générer des informations dessus)
    router.get('/themes', async (req, res) => {
        try {
            const result = await collection.find().toArray();
            const themes = result[0].themes;
    
            // Récupérer le nombre total de questions via une requête à l'API
            const requeteAPI = 'http://127.0.0.1:3000/api/question/nb/';
            const response = await axios.get(`${requeteAPI}*`);
            const totalQuestions = response.data.nbQuestions;

            // Ajouter les informations supplémentaires à chaque thème
            const themesWithDetails = await Promise.all(themes.map(async theme => {
                const themeResponse = await axios.get(`${requeteAPI}theme=${theme}`);
                const numberOfQuestions = themeResponse.data.nbQuestions;
                return {
                    name: theme,
                    // backgroundColor: theme.backgroundColor,
                    // textColor: theme.textColor,
                    numberOfQuestions: numberOfQuestions,
                    percentageOfTotalQuestions: parseFloat((numberOfQuestions / totalQuestions).toFixed(2))
                };
            }));

            // Récupérer les questions ayant des thèmes qui ne sont pas dans la db (et indiquer les noms de ces thèmes)
            const allQuestionsResponse = await axios.get('http://127.0.0.1:3000/api/question/*');
            const allQuestions = allQuestionsResponse.data;
            const undefinedQuestions = allQuestions.filter(question => !themes.includes(question.themeText));
            const undefinedNumberOfQuestions = undefinedQuestions.length;

            const undefinedTheme = {
                numberOfQuestions: undefinedNumberOfQuestions,
                percentageOfTotalQuestions: parseFloat((undefinedNumberOfQuestions / totalQuestions).toFixed(2)),
                themes: undefinedQuestions.map(question => question.themeText).filter((value, index, self) => self.indexOf(value) === index) // Supprimer les doublons
            };

            // Ajouter l'objet * à la liste des thèmes
            const allThemes = {
                '*' : {
                    numberOfThemes: themes.length,
                    numberOfQuestions: totalQuestions,
                    percentageOfTotalQuestions: 1.0
                },
                themes: themesWithDetails,
                'undefined': undefinedTheme
            };
            res.json(allThemes);

        } catch (error) {
            res.status(500).send(error);
        }
    });

    return router;
};