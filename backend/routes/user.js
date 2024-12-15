const express = require('express');
const bcrypt = require('bcrypt');

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
    router.post('/add', async (req, res) => {
        const user = {
            userLogin: req.body.login,
            userPW: req.body.password,
            Superuser: req.body.superuser
        };
        
        try {
            // Recherche si login déjà dans la bd
            const result = await collection.findOne({ username: user.userLogin});
            if (result != null){
                res.status(409).send({ message: "User name already used" });
            }
            else{
                // Hachage du mot de passe
                const saltRounds = 10; // Plus le nombre est élevé, plus le hachage est sécurisé mais lent
                user.userPW = await bcrypt.hash(user.userPW, saltRounds);

                await collection.insertOne(user);
                res.send("User added");
                console.log(`User ${user.userLogin} added`);
            }
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour modifier les informations d'un utilisateur
    //Rajouter vérification mdp !!!!
    router.post('/edit', async (req, res) => {
        const user = {
            userLogin: req.body.login,
            userPW: req.body.password,
            Superuser: req.body.superuser
        };
        
        try {
             // Recherche si login déjà dans la bd
             const result = await collection.findOne({ username: user.userLogin});
             if (result === null){
                 res.status(404).send({ message: "User not found" });
             }
             else{
                user.userPW = await bcrypt.hash(user.userPW, 10);
                const result = await collection.updateOne({ username: user.userLogin }, { $set: { password: user.userPW, Superuser: user.Superuser } });
                console.log(`User ${user.userLogin} edited: `);
                res.send("User edited");
             }
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour supprimer un utilisateur
    //Rajouter vérification mdp !!!!
    router.post('/delete', async (req, res) => {
        const userLogin = req.body.login;
        const userPW = req.body.password;

        try {
            const deleteResult = await collection.deleteOne({userLogin});
            if (deleteResult.deletedCount === 0) {
                return res.status(404).send({ message: "User not found" });
            }
            res.send("User deleted");
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour permettre à un utilisateur de se connecter
    router.post('/login', async (req, res) => {
        const user = {
            userLogin: req.body.login,
            userPW: req.body.password
        };

        // Recherche de l'utilisateur
        try {
            const result = await collection.findOne({ username: user.userLogin, password: user.userPW});
            if(!result){
                res.send(false)
            }
            else{
                 // Comparez le mot de passe saisi avec le mot de passe haché
                const isMatch = await bcrypt.compare(password, result.password);
                if (!isMatch) {
                    res.status(401).send({ success: false, message: "Invalid credentials" });
                }
                res.send(true)
            }
        } catch (error) {
            res.status(500).send(error);
        }
    });

    return router;
};