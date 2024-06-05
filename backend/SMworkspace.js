const express = require('express');
const router = express.Router();
const holiday = require('./models/holidays');
const employee = require('./models/employee');
const shiftWorkspace = require('./models/shiftWorkspace');
const generateCasualShifts = require('./generateCasualShifts');



require('dotenv').config();

/**
 * @openapi
 * /workspace/:role/:year/:month/shifts:
 *   get:
 *     summary: Retrieve shifts for a specific role, year, and month
 *     tags: [Workspace]
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: Role identifier
 *         schema:
 *           type: string
 *       - name: year
 *         in: path
 *         required: true
 *         description: Year
 *         schema:
 *           type: integer
 *       - name: month
 *         in: path
 *         required: true
 *         description: Month
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successfully retrieved shifts
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
 *                         start:
 *                           type: string
 *                         end:
 *                           type: string
 */
router.get('/:role/:year/:month/shifts', async (req, res) => {
    const month = parseInt(req.params.month, 10);
    const year = parseInt(req.params.year, 10);
    const role = req.params.role;

    if (!month || !Number.isInteger(month) || month < 1 || month > 12) {
        return res.status(400).json({ error: 'Invalid or missing month' });
    }

    if (!year || !Number.isInteger(year) || year < 0) {
        return res.status(400).json({ error: 'Invalid or missing year' });
    }

    if (!role || typeof role !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing role' });
    }

    try {
        console.log(role);
        const employees = await employee.findOne({ role: role }).select('username').exec();
        if (!employees || employees.length === 0) {
            return res.status(400).json({ error: 'Not a valid role' });
        }

        const workspace = await shiftWorkspace.findOne({ role, year, month }).exec();
        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found for this month' });
        }

        let workWithUsernames = [];
        workspace.daysOfWork.forEach(day => {
            day.shift.forEach(employeeShift => {
                const { email, start, end } = employeeShift;
                let employeeData = workWithUsernames.find(item => item.username === email);
                if (!employeeData) {
                    employeeData = { username: email, work: [] };
                    workWithUsernames.push(employeeData);
                }
                employeeData.work.push({ day: day.date, start, end });
            });
        });

        res.status(200).json(workWithUsernames);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @openapi
 * /workspace/:role/:year/:month:
 *   post:
 *     summary: Create a new shift workspace for a specific role, year, and month
 *     tags: [Workspace]
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: Role identifier
 *         schema:
 *           type: string
 *       - name: year
 *         in: path
 *         required: true
 *         description: Year
 *         schema:
 *           type: integer
 *       - name: month
 *         in: path
 *         required: true
 *         description: Month
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Workspace created successfully
 *       '409':
 *         description: Workspace already exists for this month
 */
router.post('/:role/:year/:month', async (req, res) => {
    const month = parseInt(req.params.month, 10);
    const year = parseInt(req.params.year, 10);
    const role = req.params.role;

    if (!month) {
        return res.status(400).json({ error: 'missing month' });
    }
    if(!Number.isInteger(month)){
        return res.status(400).json({ error: 'Month not a integer' });
    } else if(month < 1 || month > 12){
        return res.status(400).json({ error: 'Month not in the range 1-12' });
    }
    
    if (!year) {
        return res.status(400).json({ error: 'missing year' });
    }
    if(!Number.isInteger(year)){
        return res.status(400).json({ error: 'year not an integer' });
    } else if(year < 0){
        return res.status(400).json({ error: 'year not a positive integer' });
    }
    
    if (!role) {
        return res.status(400).json({ error: 'missing role' });
    }
    if(Array.isArray(role)){
        return res.status(400).json({ error: 'role not a string' });
    }

    let employees=await employee.find({role:role}).exec();
    if(!employees || employees.length === 0){
        return res.status(400).json({ error: 'not a valid role' });
    }

    let shiftWorkspace_ = await shiftWorkspace.findOne({ year: year, month: month, role: role }).exec();                 
    
    if (shiftWorkspace_) {
        return res.status(409).json({ error: 'Workspace already exists for this month' });
    }

    await shiftWorkspace.create({
        year: year,
        month: month,
        role: role,
        daysOfWork: []
    });
    return res.status(200).json({message:"Workspace created successfully!"});
});

/**
 * @openapi
 * /workspace/:role/:year/:month/shiftType:
 *   put:
 *     summary: Update shift type parameters for a specific role, year, and month
 *     tags: [Workspace]
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: Role identifier
 *         schema:
 *           type: string
 *       - name: year
 *         in: path
 *         required: true
 *         description: Year
 *         schema:
 *           type: integer
 *       - name: month
 *         in: path
 *         required: true
 *         description: Month
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               peopleForShift:
 *                 type: integer
 *               shiftDuration:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Workspace updated successfully
 *       '404':
 *         description: Workspace not found for this month
 */
router.put('/:role/:year/:month/shiftType', async (req, res) => {
    const month = parseInt(req.params.month, 10);
    const year = parseInt(req.params.year, 10);
    const role = req.params.role;
    const peopleForShift = parseInt(req.body.peopleForShift, 10);
    const shiftDuration = parseInt(req.body.shiftDuration, 10);

    if (!month) {
        return res.status(400).json({ error: 'missing month' });
    }
    if(!Number.isInteger(month)){
        return res.status(400).json({ error: 'Month not a integer' });
    } else if(month < 1 || month > 12){
        return res.status(400).json({ error: 'Month not in the range 1-12' });
    }
    
    if (!year) {
        return res.status(400).json({ error: 'missing year' });
    }
    if(!Number.isInteger(year)){
        return res.status(400).json({ error: 'year not an integer' });
    } else if(year < 0){
        return res.status(400).json({ error: 'year not a positive integer' });
    }
    
    if (!role) {
        return res.status(400).json({ error: 'missing role' });
    }
    if(Array.isArray(role)){
        return res.status(400).json({ error: 'role not a string' });
    }
    
    if (!peopleForShift) {
        return res.status(400).json({ error: 'missing people for workday' });
    }
    if(!Number.isInteger(peopleForShift)){
        return res.status(400).json({ error: 'people for workday not an integer' });
    } else if(peopleForShift < 0){
        return res.status(400).json({ error: 'people for workday not a positive integer' });
    }
    
    if (!shiftDuration) {
        return res.status(400).json({ error: 'missing shift duration' });
    }
    if(!Number.isInteger(shiftDuration)){
        return res.status(400).json({ error: 'shift duration not an integer' });
    } else if(shiftDuration < 1){
        return res.status(400).json({ error: 'shift duration not a strictly positive integer' });
    } else if(!(24 % shiftDuration === 0)){
        return res.status(400).json({ error: 'shift duration not a submultiple of 24!' });
    }

    let employees=await employee.find({role:role}).exec();
    if(!employees || employees.length === 0){
        return res.status(400).json({ error: 'not a valid role' });
    }else if(employees.length < 24/shiftDuration*peopleForShift){
        return res.status(400).json({ error: 'people of this role required for a day of work are not enough: decrease the number of people for shift or increase the shift duration number' });
    }
    let shiftWorkspace_ = await shiftWorkspace.findOne({ year: year, month: month, role: role }).exec();                 
    
    if (!shiftWorkspace_) {
        return res.status(404).json({ error: 'Workspace not found for this month' });
    }

    shiftWorkspace_.peopleForShift = peopleForShift;
    shiftWorkspace_.shiftDuration = shiftDuration;
    
    await shiftWorkspace_.save();
    return res.status(200).json({message:"Workspace updated successfully!"});
});

/**
 * @openapi
 * /workspace/automate/:role/:year/:month/daysOfWork:
 *   put:
 *     summary: Generate casual shift days of work for a specific role, year, and month
 *     tags: [Workspace]
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: Role identifier
 *         schema:
 *           type: string
 *       - name: year
 *         in: path
 *         required: true
 *         description: Year
 *         schema:
 *           type: integer
 *       - name: month
 *         in: path
 *         required: true
 *         description: Month
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Days of work generated and added correctly
 *       '400':
 *         description: Invalid input parameters
 *       '404':
 *         description: No users found for this role or workspace not found
 */
router.put('/automate/:role/:year/:month/daysOfWork', async (req, res) => {

    const month = parseInt(req.params.month, 10);
    const year = parseInt(req.params.year, 10);
    const role = req.params.role;

    if (!month) {
        return res.status(400).json({ error: 'missing month' });
    }
    if(!Number.isInteger(month)){
        return res.status(400).json({ error: 'Month not a integer' });
    } else if(month < 1 || month > 12){
        return res.status(400).json({ error: 'Month not in the range 1-12' });
    }
    
    if (!year) {
        return res.status(400).json({ error: 'missing year' });
    }
    if(!Number.isInteger(year)){
        return res.status(400).json({ error: 'year not an integer' });
    } else if(year < 0){
        return res.status(400).json({ error: 'year not a positive integer' });
    }
    
    if (!role) {
        return res.status(400).json({ error: 'missing role' });
    }
    if(Array.isArray(role)){
        return res.status(400).json({ error: 'role not a string' });
    }
    let employees=await employee.find({role:role}).exec();
    if(!employees || employees.length === 0){
        return res.status(400).json({ error: 'not a valid role' });
    }


    const numberOfDays=getNumberOfDays(month,year);
    

    let users = await employee.find({ role: role }).exec();
    let employeeList = [];
    
    if (Array.isArray(users)) {
        users.forEach((user) => {
            employeeList.push(user.username);
        });
    }else if(users==undefined){
        return res.status(400).json({ error: 'No users for this role' });
    }
    else{
        employeeList.push(users.username);
    }
    let workspace = await shiftWorkspace.findOne({ year: year, month: month,role:role }).exec(); 
    
    let peopleForShift=workspace.peopleForShift;
    let shiftDuration=workspace.shiftDuration;
    let yearMonth=""+year+"-"+month.toString().padStart(2,'0')+"-";

    let workSets= await generateCasualShifts(employeeList,numberOfDays,peopleForShift,shiftDuration,role,yearMonth);
    let daysOfWork = [];
    workSets.forEach((shifts, date) => {
        const day = {
            date,
            shift: shifts.map(shift => ({
                email: shift.employee,
                start: shift.startHour,
                end: shift.endHour
            }))
        };
        daysOfWork.push(day);
    });

    workspace.daysOfWork.push(...daysOfWork);

    await workspace.save();
    res.status(200).json({message:"Days of work casually generated and added correctly"});
});


/**
 * @openapi
 * /workspace/employee/:role/:year/:month/work:
 *   put:
 *     summary: publish work shifts to employees calendar for a specific role, year, and month
 *     tags: [Workspace]
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: Role identifier
 *         schema:
 *           type: string
 *       - name: year
 *         in: path
 *         required: true
 *         description: Year
 *         schema:
 *           type: integer
 *       - name: month
 *         in: path
 *         required: true
 *         description: Month
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Work shifts added to employee schedules
 *       '400':
 *         description: Invalid input parameters
 *       '404':
 *         description: Workspace not found
 */
router.put('/employee/:role/:year/:month/work', async (req, res) => {
    const { year, month, role } = req.params;
    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10);

    const isValidMonth = (month) => Number.isInteger(month) && month >= 1 && month <= 12;
    const isValidYear = (year) => Number.isInteger(year) && year >= 0;

    if (!parsedMonth || !isValidMonth(parsedMonth)) {
        return res.status(400).json({ error: 'Invalid or missing month' });
    }

    if (!parsedYear || !isValidYear(parsedYear)) {
        return res.status(400).json({ error: 'Invalid or missing year' });
    }

    if (!role || typeof role !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing role' });
    }

    try {
        const employees = await employee.find({ role }).exec();
        if (!employees || employees.length === 0) {
            return res.status(400).json({ error: 'Not a valid role' });
        }

        const numberOfDays = getNumberOfDays(parsedMonth, parsedYear);
        const workspace = await shiftWorkspace.findOne({ year: parsedYear, month: parsedMonth, role }).exec();

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        try {
            // Chiamata asincrona a getWorkShift
            const jsonData = await getWorkShift(role, year, month);

            // Iterazione sui dati ottenuti per aggiungere i turni di lavoro
            for (const user of jsonData) {
                const { username, work } = user;
                try {
                    await postWorkShift(username, work);
                    console.log(`Successfully added work shifts for ${username}`);
                } catch (error) {
                    console.error(`Error adding work shifts for ${username}:`, error);
                    // Potresti voler inviare una risposta parziale in caso di errori specifici
                }
            }

            res.status(200).json({ message: "Work shifts added to employee schedules" });

        } catch (error) {
            console.error('Error fetching or processing work shifts:', error);
            res.status(500).json({ error: 'Failed to process work shifts' });
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



router.delete('/employee/:role/:year/:month/work', async (req, res) => {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);
    const role = req.params.role;

    if (!month) {
        return res.status(400).json({ error: 'missing month' });
    }
    if(!Number.isInteger(month)){
        return res.status(400).json({ error: 'Month not a integer' });
    } else if(month < 1 || month > 12){
        return res.status(400).json({ error: 'Month not in the range 1-12' });
    }
    
    if (!year) {
        return res.status(400).json({ error: 'missing year' });
    }
    if(!Number.isInteger(year)){
        return res.status(400).json({ error: 'year not an integer' });
    } else if(year < 0){
        return res.status(400).json({ error: 'year not a positive integer' });
    }
    
    if (!role) {
        return res.status(400).json({ error: 'missing role' });
    }
    if(Array.isArray(role)){
        return res.status(400).json({ error: 'role not a string' });
    }
    let employees=await employee.find({role:role}).exec();
    if(!employees || employees.length === 0){
        return res.status(400).json({ error: 'not a valid role' });
    }

    const numberOfDays = getNumberOfDays(month, year);

    let workspace = await shiftWorkspace.findOne({ year: year, month: month, role: role }).exec();

    if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
    }

    for (const dayOfWork of workspace.daysOfWork) {
        for (const shift of dayOfWork.shift) {
            try {
                await deleteWorkShift(shift.email, dayOfWork.date, shift.start, shift.end);
            } catch (error) {
                console.error(`Error deleting work shift for ${shift.email}:`, error);
            }
        }
    }

    res.status(200).json({ message: "Work shifts removed from employee schedules" });
});



/**
 * @openapi
 * /workspace/:role/:year/:month/daysOfWork:
 *   delete:
 *     summary: Delete all days of work for a specific role, year, and month
 *     tags: [Workspace]
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: Role identifier
 *         schema:
 *           type: string
 *       - name: year
 *         in: path
 *         required: true
 *         description: Year
 *         schema:
 *           type: integer
 *       - name: month
 *         in: path
 *         required: true
 *         description: Month
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Days of work removed
 *       '400':
 *         description: Invalid input parameters
 *       '404':
 *         description: Workspace not found
 */
router.delete('/:role/:year/:month/daysOfWork', async (req, res) => {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);
    const role = req.params.role;

    if (!month) {
        return res.status(400).json({ error: 'missing month' });
    }
    if(!Number.isInteger(month)){
        return res.status(400).json({ error: 'Month not a integer' });
    } else if(month < 1 || month > 12){
        return res.status(400).json({ error: 'Month not in the range 1-12' });
    }
    
    if (!year) {
        return res.status(400).json({ error: 'missing year' });
    }
    if(!Number.isInteger(year)){
        return res.status(400).json({ error: 'year not an integer' });
    } else if(year < 0){
        return res.status(400).json({ error: 'year not a positive integer' });
    }
    
    if (!role) {
        return res.status(400).json({ error: 'missing role' });
    }
    if(Array.isArray(role)){
        return res.status(400).json({ error: 'role not a string' });
    }
    let employees=await employee.find({role:role}).exec();
    if(!employees || employees.length === 0){
        return res.status(400).json({ error: 'not a valid role' });
    }

    let workspace = await shiftWorkspace.findOne({ year: year, month: month, role: role }).exec();

    if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
    }
    workspace.daysOfWork=[];

    await workspace.save();
    res.status(200).json({
        message: 'days of work removed',
    });
});



function getNumberOfDays(month,year){
    if(month==4|| month == 6 || month== 9 || month == 11){
        return 30;
    }
    else if(month==2){
        if(year%4==0){
            return 29;
        }else{
            return 28;
        }
    }
    else{
        return 31;
    }
    
}

async function getWorkShift  (role, year, month) {
    console.log(role,year,month);
    try {
        const response = await fetch(`http://localhost:3050/workspace/${role}/${year}/${month}/shifts `);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        //console.log(data);
        return data;

    } catch (error) {
        console.error('Error during API call:', error);
        throw error;
    }
};

 async function postWorkShift (email, shiftList) {
    try {
        const response = await fetch(`http://localhost:3050/employees/${email}/work/listOfShifts `, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(shiftList),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        //console.log(data);
        return data;

    } catch (error) {
        console.error('Error during API call:', error);
        throw error;
    }
};
async function deleteWorkShift (email, day, start, end) {
    const url = `http://localhost:3050/employees/${email}/work`;
    const payload = { day, start, end };

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        //console.log(data);
        return data;

    } catch (error) {
        console.error('Error during API call:', error);
    }
};

module.exports = router;