const express = require('express');
const router = express.Router();
const Employee = require('./models/employee');
require('dotenv').config();

const loggerMiddleware = require('./loggerMiddleware'); // Importa il middleware

// Funzione per ottenere il lavoro per username
async function getWorkByUsername(username) {
    try {
        console.log(`Cerco lavori per username: ${username}`);
        const query = { username: username };
        const projection = { work: 1, _id: 0 };

        const result = await Employee.findOne(query).select(projection).lean();

        if (result && result.work) {
            console.log('Work:', result.work);
            return result.work;
        } else {
            console.log('Nessun documento trovato o campo "work" mancante', result);
            return null;
        }
    } catch (error) {
        console.error('Errore durante la query:', error);
        throw error;
    }
}

// Usa il middleware per tutte le richieste a questo router
router.use(loggerMiddleware);

// Endpoint API per ottenere i task
router.get('/:username', async (req, res) => {
    const username = req.params.username;

    if (!username) {
        return res.status(400).send('Username è richiesto');
    }

    try {
        const tasks = await getWorkByUsername(username);
        if (tasks) {
            return res.status(200).json(tasks);
        } else {
            return res.status(404).send('Nessun task trovato');
        }
    } catch (error) {
        console.error('Errore nel gestire la richiesta /calendar:', error);
        return res.status(500).send('Errore del server');
    }
});

module.exports = router;