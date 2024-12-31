// backend/routes/user.js

const express = require('express');
const bcrypt = require('bcrypt');

module.exports = (collection) => {
    const router = express.Router();

    // Route pour récupérer les noms d'utilisateur inscrits (provisoire)
    router.get('/superuser', async (req, res) => {
        const user = {
            username: req.query.login,
        };
        try {
            const result = await collection.findOne({ username: user.username});
            res.send(result.Superuser);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour récupérer la liste des utilisateurs 
    router.get('/users', async (req, res) => { 
        try { 
            const users = await collection.find({}, { projection: { _id: 0, username: 1, Superuser: 1 } }).toArray();
            res.send(users); 
        } catch (error) { 
            res.status(500).send(error); 
        }
    });

    // Route pour créer un nouvel utilisateur
    router.post('/add', async (req, res) => {
        const user = {
            username: req.body.login,
            password: req.body.password,
            Superuser: req.body.superuser
        };
        
        try {
            // Recherche si login déjà dans la bd
            const result = await collection.findOne({ username: user.username});
            if (result != null){
                res.status(409).send({ message: "User name already used" });
            }
            else{
                // Hachage du mot de passe
                const saltRounds = 10; // Plus le nombre est élevé, plus le hachage est sécurisé mais lent
                user.password = await bcrypt.hash(user.password, saltRounds);

                await collection.insertOne(user);
                res.status(200).send({ isAuthenticated: true });
                console.log(`User ${user.username} added`);
            }
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Route pour modifier les informations d'un utilisateur
    //Rajouter vérification mdp !!!!
    router.post('/edit', async (req, res) => {
        const user = {
            username: req.body.user.username,
            password: req.body.user.password,
            Superuser: req.body.user.Superuser
        };
        const action = req.body.action;
        // console.log(user, action);

        // Recherche si login déjà dans la bd
        const result = await collection.findOne({ username: user.username});
        if (result === null){
                console.log(`User ${user.username} not found\n` );
                res.status(404).send({ message: `User ${user.username} not found` });
        }
        else{
            if (action === "rename") {
                const newUsername = req.body.newUsername;
                const result = await collection.updateOne({ username: user.username }, { $set: { username: newUsername } });
                console.log(`User ${user.username} edited\n`);
                res.status(200).send({ message: `User ${user.username} edited` });
            }
            else if (action === "password") {
                // Ici on pourrait ajouter une modification du mot de passe mais flemme
                // user.password = await bcrypt.hash(user.password, 10);
                console.log("Password modification not implemented yet\n");
            }
            else if (action === "superuser") {
                const result = await collection.updateOne({ username: user.username }, { $set: { Superuser: user.Superuser } });
                console.log(`User ${user.username} edited\n`);
                res.status(200).send({ message: `User ${user.username} edited` });
            } 
            else {
                console.log("Invalid action\n");
                res.status(400).send({ message: "Invalid action" });
            }
        }
    });

    // Route pour supprimer un utilisateur
    //Rajouter vérification mdp !!!!
    router.post('/delete', async (req, res) => {
        const username = req.body.login;
        const password = req.body.password;

        try {
            const deleteResult = await collection.deleteOne({username});
            if (deleteResult.deletedCount === 0) {
                return res.status(404).send({ message: "User not found" });
            }
            res.status(200).send({ message: "User deleted" });
        } catch (error) {
            res.status(500).send(error);
        }
    });

    //Route pour permettre à un utilisateur de se connecter
    router.post('/login', async (req, res) => {
        const user = {
            username: req.body.login,
            password: req.body.password
        };

        // Recherche de l'utilisateur
        try {
            const result = await collection.findOne({ username: user.username});
            if(!result){
                res.send(false)
            }
            else{
                 // Comparez le mot de passe saisi avec le mot de passe haché
                const isMatch = await bcrypt.compare(user.password, result.password);
                if (!isMatch) {
                    res.status(401).send({ success: false, message: "Invalid credentials" });
                }
                else{
                    res.status(200).send({ success: true, message: "Login successful" });
                }
            }
        } catch (error) {
            res.status(500).send(error);
        }
    });

    return router;
};