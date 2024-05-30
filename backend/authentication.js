const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
//const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User   = require('./models/user');
require('dotenv').config();




/**
 * @openapi
 * /auth:
 *   post:
 *     description: Authenticates a user and returns a JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Returns a JWT token if authentication is successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Username and password are required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('', async (req, res) => {
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

/**
 * @openapi
 * /auth/tokens:
 *   post:
 *     description: Verifies a JWT token and returns the associated username
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The JWT token to be verified
 *             required:
 *               - token
 *     responses:
 *       200:
 *         description: Returns the username associated with the token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The username associated with the token
 *       400:
 *         description: Token is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating that the token is missing
 *       403:
 *         description: Failed to authenticate token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the token authentication failed
 */

router.post('/tokens', (req, res) => {
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
            const username = decoded.email;
            console.log('username :', username);
			return res.status(200).send({
				message: username
			});
		}
	});

});

module.exports = router;