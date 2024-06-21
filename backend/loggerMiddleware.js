/*function loggerMiddleware(req, res, next) {
    const token = req.headers['authorization'];
    console.log('sono nel middleware');
    console.log('Token ricevuto:', token);

    // Verifica se il token è valido
   
    if (!token || token.split(' ')[1] !== 'prova1') { // Cambia 'mysecrettoken' con il tuo token di validazione
        return res.status(403).send('Accesso negato. Token non valido.');
    }

    next();
}*/
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
require('dotenv').config();
const loggerMiddleware = function(req, res, next) {

    // check header or url parameters or post parameters for token
   let token = req.headers['authorization'];
    console.log("currentToken middleware: ", token);
    // if there is no token
    console.log("valore supersecret ",process.env.SUPER_SECRET);
    if (!token) {
        return res.status(401).send({ 
            success: false,
            message: 'No token provided.'
        });
    }
    
    // decode token, verifies secret and checks exp
    jwt.verify(token, process.env.SUPER_SECRET, function(err, decoded) {
        if (err) {
            console.log(err);
            return res.status(403).send({
                success: false,
                message: 'Failed to authenticate token.'
                
            });
        } else {
            // if everything is good, save to request for use in other routes
            //localStorage.setItem('id',decoded.email);
            next();
        }
    });

};

module.exports = loggerMiddleware;