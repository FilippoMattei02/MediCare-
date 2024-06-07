const express = require('express');
const router = express.Router();
const coverage = require('./models/holidays');
const employee = require('./models/employee');

//GET REQUEST: prendere campi work, mittente e string con status =false di uno specifico ruolo 

//GET SPECIFIC REQUEST: prendere una singola richiesta composta da utente e data di lavoro. Restituisce la stessa cosa che le general request solo uniche

//POST: inserire una richiesta che è composta dal turno(work),username richiedente e string message.
//Devo avere quel turno di lavoro, e non deve esserci già presente come richiesta (controllo username e work).

//PUT:posso inserire una richiesta immettendo il mio nome e cambiando la status variable. cambio il turno di lavoro facendo una remove sul turno ed una add al dipendente
// (devo controllare che non ho già un turno presente in quel giorno)


//DELETE: posso cancellare una richiesta specifica se sono il proprietario (oppure sono un admin)




module.exports = router;