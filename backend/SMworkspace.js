const express = require('express');
const router = express.Router();
const holiday = require('./models/holidays');
const employee = require('./models/employee');
const shiftWorkspace = require('./models/shiftWorkspace');
const automaticTool = require('./generateCasualShifts');



require('dotenv').config();


app.get('/:role/:year/:month/shifts', async (req, res) => {
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

    try {
        const shifts = await shiftWorkspace.find({
            role: role,
            year: parseInt(year),
            month: parseInt(month)
        });

        
        let workWithUsernames = [];


        shifts.forEach(shift => {
            
            shift.daysOfWork.forEach(day => {
                
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
        });
        res.status(200).json(workWithUsernames);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST endpoint to create a new shiftWorkspace instance
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

    let shiftWorkspace_ = await shiftWorkspace.findOne({ year: year, month: month, role: role }).exec();                 
    
    if (!shiftWorkspace_) {
        return res.status(404).json({ error: 'Workspace not found for this month' });
    }

    shiftWorkspace_.peopleForShift = peopleForShift;
    shiftWorkspace_.shiftDuration = shiftDuration;
    
    await shiftWorkspace_.save();
    return res.status(200).json({message:"Workspace updated successfully!"});
});


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

    let workSets=automaticTool(employeeList,numberOfDays,peopleForShift,shiftDuration,role,yearMonth);
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



router.put('/employee/:role/:year/:month/work', async (req, res) => {
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


    const numberOfDays = getNumberOfDays(month, year);

    let workspace = await shiftWorkspace.findOne({ year: year, month: month, role: role }).exec();

    if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
    }

    const postWorkShift = async (email, day, start, end) => {
        const url = `http://localhost:3050/employees/${email}/work/add`;
        const payload = { day, start, end };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            return data;

        } catch (error) {
            console.error('Error during API call:', error);
        }
    };

    for (const dayOfWork of workspace.daysOfWork) {
        for (const shift of dayOfWork.shift) {
            try {
                await postWorkShift(shift.email, dayOfWork.date, shift.start, shift.end);
            } catch (error) {
                console.error(`Error adding work shift for ${shift.email}:`, error);
            }
        }
    }

    res.status(200).json({ message: "Work shifts added to employee schedules" });
});


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



module.exports = router;