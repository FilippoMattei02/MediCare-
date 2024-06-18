const express = require('express');
const router = express.Router();
const Employee = require('./models/employee');
require('dotenv').config();

async function getWorkByUsername(username) {
    try {
        console.log(`Cerco lavori per username: ${username}`);
        
        // Trova l'utente con lo username specificato e ottieni il ruolo
        const query = { username: username };
        const projection = { work: 1, role: 1, _id: 0 }; // Aggiungi 'role' alla proiezione

        const result = await Employee.findOne(query).select(projection).lean();

        if (!result) {
            console.log('Nessun utente trovato con questo username.');
            return [];
        }

        const role = result.role;
        console.log(`Ruolo trovato: ${role}`);

        // Trova tutti gli utenti con lo stesso ruolo e ottieni i campi 'work' e 'username'
        const usersWithSameRole = await Employee.find({ role: role }).select({ work: 1, username: 1, _id: 0 }).lean();

        // Creare un array di oggetti contenenti 'username' e 'work'
        const workWithUsernames = usersWithSameRole.map(user => ({
            username: user.username,
            work: user.work
        }));

        return workWithUsernames;

    } catch (error) {
        console.error(`Errore durante la ricerca dei lavori: ${error.message}`);
        throw error;
    }
}

/**
 * @openapi
 * /shifts/{username}:
 *   get:
 *     summary: Retrieve work shifts for each employee of a determined role
 *     tags: [Shifts]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The employee username
 *     responses:
 *       200:
 *         description: Work shifts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   work:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         day:
 *                           type: string
 *                           format: date
 *                         start:
 *                           type: integer
 *                         end:
 *                           type: integer
 *       400:
 *         description: Username is required
 *       404:
 *         description: No tasks found
 *       500:
 *         description: Internal server error
 */

router.get('/:username', async (req, res) => {
    const username = req.params.username;

    if (!username) {
        return res.status(400).send('Username è richiesto');
    }

    try {
        const tasks = await getWorkByUsername(username);

        if (tasks && tasks.length > 0) {
            // Log dettagliato di ogni utente e il loro work
            tasks.forEach(user => {
                console.log(`Username: ${user.username}`);
                console.log(`Work: ${JSON.stringify(user.work, null, 2)}`);
            });
            return res.status(200).json(tasks);
        } else {
            return res.status(404).send('Nessun task trovato');
        }
    } catch (error) {
        console.error('Errore nel gestire la richiesta /shift:', error);
        return res.status(500).send('Errore del server');
    }
});


module.exports = router;