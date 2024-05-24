const express = require('express');
const router = express.Router();
const Employee = require('./models/employee');
require('dotenv').config();

/**
 * @openapi
 * /employee/{employeeId}:
 *   get:
 *     summary: Get an employee by ID
 *     tags: [Employee]
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         schema:
 *           type: string
 *         required: true
 *         description: The employee ID
 *     responses:
 *       200:
 *         description: The employee description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */


router.get('/:employeeId', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.employeeId);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @openapi
 * /employee/username/{username}:
 *   get:
 *     summary: Get an employee by username
 *     tags: [Employee]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The employee username
 *     responses:
 *       200:
 *         description: The employee description by username
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 * */


router.get('/username/:username', async (req, res) => {
    console.log(`Received GET request for employee username: ${req.params.username}`);
    try {
        const employee = await Employee.findOne({ username: req.params.username });
        if (!employee) {
            console.log('Employee not found');
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (error) {
        console.error('Internal server error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





/**
 * @openapi
 * /employee/{employeeId}/work:
 *   post:
 *     summary: Add or update work schedule for an employee
 *     tags: [Employee]
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         schema:
 *           type: string
 *         required: true
 *         description: The employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Work'
 *     responses:
 *       201:
 *         description: Work schedule updated successfully
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */

router.post('/:employeeId/work', async (req, res) => {
    const { work } = req.body;
    try {
        const employee = await Employee.findById(req.params.employeeId);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        employee.work = work;
        await employee.save();
        res.status(201).json({ message: 'Work schedule updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;