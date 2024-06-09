const express = require('express');
const router = express.Router();
const Employee = require('./models/employee');
require('dotenv').config();

/**
 * @openapi
 * /{username}:
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
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 role:
 *                   type: string
 *                 work:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: string
 *                       start:
 *                         type: integer
 *                       end:
 *                         type: integer
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
router.get('/:username', async (req, res) => {
    console.log(`Received GET request for employee username: ${req.params.username}`);
    try {
        const employee = await Employee.findOne({ username: req.params.username }).exec();
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
 * /role/{username}:
 *   get:
 *     summary: Get the role and work schedule of an employee by username
 *     tags: [Employee]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the employee
 *     responses:
 *       200:
 *         description: The employee's role and work schedule
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shiftManager:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                     work:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: string
 *                           start:
 *                             type: integer
 *                           end:
 *                             type: integer
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
router.get('/role/:username', async (req, res) => {
    console.log(`Received GET request for employee username: ${req.params.username}`);
    try {
        const employee = await Employee.findOne({ username: req.params.username }).exec();
        if (!employee) {
            console.log('Employee not found');
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.status(200).json(employee.shiftManager);
    } catch (error) {
        console.error('Internal server error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @openapi
 * /{username}/work:
 *   post:
 *     summary: Modify work schedule for an employee
 *     tags: [Employee]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The employee username
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 day:
 *                   type: string
 *                 start:
 *                   type: integer
 *                 end:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Work schedule updated successfully
 *       400:
 *         description: Work schedule must be an array
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Conflict, duplicate work schedule
 *       500:
 *         description: Internal server error
 */
router.post('/:username/work', async (req, res) => {
    const { work } = req.body;

    if (!Array.isArray(work)) {
        return res.status(400).json({ error: 'Work schedule must be an array' });
    }

    try {
        const employee = await Employee.findOne({ username: req.params.username }).exec();
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Check if date already exists
        const isDuplicate = work.some(newWork => 
            employee.work.some(existingWork =>
                new Date(existingWork.day).toISOString() === new Date(newWork.day).toISOString() &&
                existingWork.start === newWork.start && existingWork.end === newWork.end
            )
        );

        if (isDuplicate) {
            return res.status(409).json({ error: 'Conflict, duplicate work schedule' });
        }

        // Update work schedule
        employee.work = work;
        await employee.save();
        res.status(201).json({ message: 'Work schedule updated successfully', employee });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


/**
 * @openapi
 * /{username}/work:
 *   delete:
 *     summary: Delete a specific work shift for an employee
 *     tags: [Employee]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The employee username
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               day:
 *                 type: string
 *                 format: date
 *                 description: The day of the work shift
 *               start:
 *                 type: integer
 *                 description: The start time of the work shift (24-hour format)
 *               end:
 *                 type: integer
 *                 description: The end time of the work shift (24-hour format)
 *     responses:
 *       200:
 *         description: Shift deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 work:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: string
 *                       start:
 *                         type: integer
 *                       end:
 *                         type: integer
 *       400:
 *         description: Missing day, start, or end parameters
 *       404:
 *         description: Employee or shift not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:username/work', async (req, res) => {
    const { day, start, end } = req.body;

    if (!day || start == null || end == null) {
        return res.status(400).json({ error: 'Day, start, and end are required' });
    }

    try {
        const employee = await Employee.findOne({ username: req.params.username }).exec();
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const initialLength = employee.work.length;
        employee.work = employee.work.filter(shift =>
            !(new Date(shift.day).toISOString() === new Date(day).toISOString() && shift.start === start && shift.end === end)
        );

        if (employee.work.length === initialLength) {
            return res.status(404).json({ error: 'Shift not found' });
        }

        await employee.save();
        res.status(200).json({ message: 'Shift deleted successfully', employee });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


/**
 * @openapi
 * /{username}/work/add:
 *   post:
 *     summary: Add a new work shift for an employee
 *     tags: [Employee]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The employee username
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               day:
 *                 type: string
 *                 format: date
 *                 description: The day of the work shift
 *               start:
 *                 type: integer
 *                 description: The start time of the work shift (24-hour format)
 *               end:
 *                 type: integer
 *                 description: The end time of the work shift (24-hour format)
 *     responses:
 *       201:
 *         description: Shift added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 work:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: string
 *                       start:
 *                         type: integer
 *                       end:
 *                         type: integer
 *       400:
 *         description: Missing day, start, or end parameters
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Conflict, Duplicate work schedule
 *       500:
 *         description: Internal server error
 */


router.post('/:username/work/add', async (req, res) => {
    const { day, start, end } = req.body;
    console.log("ADD");
    console.log("username:", req.params.username);
    console.log("date:", day);console.log("start:", start);console.log("end:", end);
    if (!day || start == null || end == null) {
        return res.status(400).json({ error: 'Day, start, and end are required' });
    }

    try {
        const employee = await Employee.findOne({ username: req.params.username }).exec();
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Check if the shift already exists
        const isDuplicate = employee.work.some(existingWork =>
            new Date(existingWork.day).toISOString() === new Date(day).toISOString() &&
            existingWork.start === start && existingWork.end === end
        );

        if (isDuplicate) {
            return res.status(409).json({ error: 'Conflict, Duplicate work schedule' });
        }

        // Add the new shift
        employee.work.push({ day, start, end });
        await employee.save();
        res.status(201).json({ message: 'Shift added successfully', work: employee.work });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}); 


/**
 * @openapi
 * /{username}/work/listOfShifts:
 *   post:
 *     summary: Add multiple work shifts for an employee
 *     tags: [Employee]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The employee username
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 day:
 *                   type: string
 *                   format: date
 *                   description: The day of the work shift
 *                 start:
 *                   type: integer
 *                   description: The start time of the work shift (24-hour format)
 *                 end:
 *                   type: integer
 *                   description: The end time of the work shift (24-hour format)
 *     responses:
 *       201:
 *         description: Shift processing complete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 addedShifts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: string
 *                         description: The day of the added work shift
 *                       start:
 *                         type: integer
 *                         description: The start time of the added work shift
 *                       end:
 *                         type: integer
 *                         description: The end time of the added work shift
 *                 duplicateShifts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: string
 *                         description: The day of the duplicate work shift
 *                       start:
 *                         type: integer
 *                         description: The start time of the duplicate work shift
 *                       end:
 *                         type: integer
 *                         description: The end time of the duplicate work shift
 *                       error:
 *                         type: string
 *                         description: Error message indicating why the shift was a duplicate
 *       400:
 *         description: Array of work schedules is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */


router.post('/:username/work/listOfShifts', async (req, res) => {
    const workSchedules = req.body;

    if (!Array.isArray(workSchedules) || workSchedules.length === 0) {
        return res.status(400).json({ error: 'Array of work schedules is required' });
    }

    try {
        const employee = await Employee.findOne({ username: req.params.username }).exec();
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const duplicateShifts = [];
        const addedShifts = [];

        workSchedules.forEach(work => {
            const { day, start, end } = work;

            if (!day || start == null || end == null) {
                duplicateShifts.push({ day, start, end, error: 'Day, start, and end are required' });
                return;
            }

            const isDuplicate = employee.work.some(existingWork =>
                new Date(existingWork.day).toISOString() === new Date(day).toISOString() &&
                existingWork.start === start && existingWork.end === end
            );

            if (isDuplicate) {
                duplicateShifts.push({ day, start, end, error: 'Duplicate work schedule' });
            } else {
                employee.work.push({ day, start, end });
                addedShifts.push({ day, start, end });
            }
        });

        await employee.save();

        res.status(201).json({
            message: 'Shift processing complete',
            addedShifts,
            duplicateShifts
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
