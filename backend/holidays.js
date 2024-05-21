const express = require('express');
const router = express.Router();
const holiday = require('./models/holidays');
const employee = require('./models/employee');

require('dotenv').config();

function dateToString(date){
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    return  "" + year + "-" + month + "-" + day;
}

/**
 * @openapi
 * /{id}:
 *   get:
 *     description: Get holidays list for an employee
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The employee email
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the holidays list for the employee
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 employee:
 *                   type: string
 *                 holidays_list:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: User not found
 */
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    let userID = await employee.findOne({ username: id }).exec();                  
    if (!userID) {
        return res.status(404).json({ error: 'user not found' });
    }
    let holidays = await holiday.findOne({ employee: id }).exec();
    res.status(200).json({
        employee: id,
        holidays_list: holidays.holidays_list
    });
});

/**
 * @openapi
 * /{role}/{date}:
 *   get:
 *     description: Get employees by role and holiday date
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: The employee role
 *         schema:
 *           type: string
 *       - name: date
 *         in: path
 *         required: true
 *         description: The holiday date (yyyy-mm-dd)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns a list of employees by role and holiday date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Users:
 *                     type: string
 *       400:
 *         description: Missing date or role, or date format is incorrect
 */
router.get('/:role/:date', async (req, res) => {
    let date = req.params.date;
    let role = req.params.role;
    
    if (!date) {
        return res.status(400).json({ error: 'missing date' });
    }
    newDate = new Date(date);
    if (!role) {
        return res.status(400).json({ error: 'missing role' });
    }
    
    if (!(date === dateToString(newDate))) {
        return res.status(400).json({ error: 'Date field is not of type yyyy-mm-dd' });
    } 
   
    let users = await holiday.find({ holidays_list: newDate }).exec();
    let employeeList = [];
    
    if (Array.isArray(users)) {
        users.forEach((user) => {
            employeeList.push(user.employee);
        });
    }

    let usersByRole = await employee.find({ username: { $in: employeeList }, role: role }, { username: 1 }).exec();
    
    usersByRole = usersByRole.map((dbEntry) => {
        return {
            Users: dbEntry.username            
        };
    });
    
    res.status(200).json(usersByRole);
});

/**
 * @openapi
 * /listOfDates/{id}:
 *   post:
 *     description: Add a list of holidays for an employee
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The employee ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Holiday dates added
 *       400:
 *         description: Missing date or date format is incorrect
 *       404:
 *         description: User not found
 */
router.post('/listOfDates/:id', async (req, res) => {
    const id = req.params.id;
    let userID = await employee.findOne({ username: id }).exec();                 
    
    if (!userID) {
        return res.status(404).json({ error: 'user not found' });
    }
    if (!req.body.date) {
        return res.status(400).json({ error: 'missing date ' });
    }
     
    const date = req.body.date;
    let newDate = [];
    date.forEach((element) => {
        let dates = new Date(element);
        newDate.push(dates);
        if ((element !== dateToString(dates))) {
            return res.status(400).json({ error: 'Date field is not of type yyyy-mm-dd' });
        }
    });
    
    let holidays = await holiday.findOne({ employee: id }).exec();
    let addedHolidays = [];
    newDate.forEach((element) => {
        if (holidays.holidays_list == undefined) {
            holidays.holidays_list.push(element);
            addedHolidays.push(element);
        } else {
            var value = false;
            holidays.holidays_list.forEach(date => {
                if (element.toString() == date.toString()) value = true;               
            });
            if (value == false) {
                holidays.holidays_list.push(element);
                addedHolidays.push(element);
            }
        }
    });
    
    holidays.save();
    res.location("/holidays/" + id).status(201).json({ message: 'holiday added', holidays: addedHolidays });
});

/**
 * @openapi
 * /{id}:
 *   post:
 *     description: Add a holiday for an employee
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The employee ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *     responses:
 *       201:
 *         description: Holiday date added
 *       400:
 *         description: Missing date or date format is incorrect, or holiday already set
 *       404:
 *         description: User not found
 */
router.post('/:id', async (req, res) => {
    const id = req.params.id;
    let userID = await employee.findOne({ username: id }).exec();                 
    
    if (!userID) {
        return res.status(404).json({ error: 'user not found' });
    }
    if (!req.body.date) {
        return res.status(400).json({ error: 'missing date ' });
    }
     
    const date = req.body.date;
    newDate = new Date(date);
    if (!(date === dateToString(newDate))) {
        return res.status(400).json({ error: 'Date field is not of type yyyy-mm-dd' });
    }
    
    let holidays = await holiday.findOne({ employee: id }).exec();
    
    if (holidays.holidays_list == undefined) {
        holidays.holidays_list = [];
        holidays.holidays_list.push(newDate);
        holidays.save();
        res.location("/holidays/" + id).status(201).json({ message: 'holiday added', date: dateToString(newDate) });
    } else {
        var found = false;
        holidays.holidays_list.forEach(listDate => {
            if (listDate.toString() == newDate.toString()) found = true;
        });
        if (found) {
            return res.status(400).json({ error: 'holiday already set' });   
        } else {
            holidays.holidays_list.push(newDate);
            holidays.save();
            res.location("/holidays/" + id).status(201).json({ message: 'holiday added', date: dateToString(newDate) });
        }
    }
});

/**
 * @openapi
 * /{id}:
 *   delete:
 *     description: Remove a holiday for an employee
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The employee ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *     responses:
 *       200:
 *         description: Holiday date removed
 *       400:
 *         description: Missing date or date format is incorrect, or date not present
 *       404:
 *         description: User not found
 */
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    const date = req.body.date;
    
    if (!date) {
        return res.status(400).json({ error: 'missing date ' });
    }
    newDate = new Date(date);
    if (!(date === dateToString(newDate))) {
        return res.status(400).json({ error: 'Date field is not of type yyyy-mm-dd' });
    }

    let userID = await employee.findOne({ username: id }).exec();
    if (!userID) {
        return res.status(400).json({ error: 'user not found' });
    }

    let holidays = await holiday.findOne({ employee: id }).exec();
    
    var found = false;
    holidays.holidays_list.forEach(listDate => {
        if (listDate.toString() == newDate.toString()) found = true;
    });
    if (!(found)) {
        return res.status(400).json({ error: 'date not present' });
    } else {
        holidays.holidays_list = holidays.holidays_list.filter(date => date.toString() !== newDate.toString());
        holidays.save();
        res.status(200).json({
            message: 'date removed ',
            document: holidays.holidays_list
        });
    }
});

module.exports = router;
