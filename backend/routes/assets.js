// backend/routes/assets.js

const express = require('express');

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


    return router;

};