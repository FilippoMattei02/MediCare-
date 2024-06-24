const express = require('express');
const router = express.Router();
const Employee = require('./models/employee');
require('dotenv').config();

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

/**
 * @openapi
 * /calendar/{username}:
 *   get:
 *     summary: Get tasks by username
 *     description: Retrieve tasks assigned to an employee by their username.
 *     tags: [Calendar]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the employee to retrieve tasks for.
 *     responses:
 *       '200':
 *         description: A JSON array of tasks assigned to the employee.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   taskName:
 *                     type: string
 *                     description: The name of the task.
 *                   description:
 *                     type: string
 *                     description: Description of the task.
 *                   deadline:
 *                     type: string
 *                     format: date-time
 *                     description: Deadline for the task.
 *       '400':
 *         description: Bad request. Username parameter is missing.
 *       '404':
 *         description: No tasks found for the provided username.
 *       '500':
 *         description: Internal server error.
 */
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