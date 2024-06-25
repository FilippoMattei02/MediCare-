/*function loggerMiddleware(req, res, next) {
    const req_token = req.headers['authorization'];
    console.log('sono nel middleware');
    console.log('req_Token ricevuto:', req_token);

    // Verifica se il req_token è valido
   
    if (!req_token || req_token.split(' ')[1] !== 'prova1') { // Cambia 'mysecretreq_token' con il tuo req_token di validazione
        return res.status(403).send('Accesso negato. req_Token non valido.');
    }

    next();
}*/
const jwt = require('jsonwebtoken'); // used to create, sign, and verify req_tokens
require('dotenv').config();
const loggerMiddleware = function(req, res, next) {

    // check header or url parameters or post parameters for req_token
   let req_token = req.headers['authorization'];
    //console.log("req_TOKEN CHECKER"+req_token);
    if (!req_token) {
        //console.log(req_token);
        return res.status(401).send({ 
            success: false,
            message: 'No req_token provided.'
        });
    }
    //console.log("passato1");
    // decode req_token, verifies secret and checks exp
    jwt.verify(req_token, process.env.SUPER_SECRET, function(err, decoded) {
        if (err) {
            console.log(err);
            return res.status(403).send({
                success: false,
                message: 'Failed to authenticate req_token.'
                
            });
        } else {
            // if everything is good, save to request for use in other routes
            //localStorage.setItem('id',decoded.email);
            next();
            //console.log("passato2");
        }
    });

};

module.exports = loggerMiddleware;