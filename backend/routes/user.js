const express = require('express');

module.exports = (collection) => {
    const router = express.Router();

    // Route pour récupérer les noms d'utilisateur inscrits (provisoire)
    router.get('/names', async (req, res) => {
        try {
            const names = await collection.distinct("username");
            res.send(names);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour créer un nouvel utilisateur


    // Route pour modifier les informations d'un utilisateur


    // Route pour supprimer un utilisateur


    // Route pour permettre à un utilisateur de se connecter
    router.post('/login', async (req, res) => {
        console.log(req.body);
    });

    return router;
};