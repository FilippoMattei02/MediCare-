const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');
const User   = require('./models/user');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/auth', async (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({ error: 'Username e password sono richiesti' });
    }

    const username = req.body.username;
    const password = req.body.password;

    try {
        const user = await User.findOne({ email: username });
        if (!user) {
            console.log('401 primo');
            return res.status(401).json({ error: 'Autenticazione fallita' });
        }
        
        const passwordHash = crypto.createHash('sha256').update(req.body.password).digest('hex');
        
        if (passwordHash==user.password) {
            var payload = {
                email: user.email
                // other data encrypted in the token	
            }
            var options = {
                expiresIn: 86400 // expires in 24 hours
            }
            var token = jwt.sign(payload, process.env.SUPER_SECRET, options);
            console.log(token);
            return res.status(200).json({ token: token });
        } else {
            console.log('401 secondo');
            return res.status(401).json({ error: 'Autenticazione fallita' });
        }
    } catch (error) {
        console.error('Errore durante il confronto delle password:', error);
        return res.status(500).json({ error: 'Errore interno del server' });
    }
});

app.post('/readUsernameFromToken', (req, res) => {
    const token = req.body.token;

    // Verifica se il token è presente nei dati della richiesta
    if (!token) {
        return res.status(400).json({ error: 'Token mancante' });
    }

    jwt.verify(token, process.env.SUPER_SECRET, function(err, decoded) {			
		if (err) {
			return res.status(403).send({
				message: 'Failed to authenticate token.'
			});		
		} else {
            const username = decoded.username;
            console.log('username :', username);
			return res.status(200).send({
				message: 'success'
			});		
		}
	});

});

module.exports = app;