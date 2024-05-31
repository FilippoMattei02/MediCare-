const express = require('express');
const router = express.Router();
const holiday = require('./models/holidays');
const employee = require('./models/employee');
const shiftWorkspace = require('./models/shiftWorkspace');
const automaticTool = require('./generateCasualShifts');


require('dotenv').config();


router.post('/workspace', async (req, res) => {
    const month = req.params.month;
    const year = req.body.year;
    const role= req.body.role;
    const peopleForShift= req.body.peopleForShift;
    const shiftDuration= req.body.shiftDuration;

    if (!month) {
        return res.status(400).json({ error: 'missing month' });
    }
    if(!Number.isInteger(month)){
        return res.status(400).json({ error: 'Month not a integer' });
    } else if(month<1||month>12){
        return res.status(400).json({ error: 'Month not in the range 1-12' });
    }
    
    if (!year) {
        return res.status(400).json({ error: 'missing year' });
    }
    if(!Number.isInteger(year)){
        return res.status(400).json({ error: 'year not an integer' });
    }else if(year<0){
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
    }else if(peopleForShift<0){
        return res.status(400).json({ error: 'people for workday not a positive integer' });
    }
    
    if (!shiftDuration) {
        return res.status(400).json({ error: 'missing shift duration' });
    }
    if(!Number.isInteger(year)){
        return res.status(400).json({ error: 'shift duration not an integer' });
    }
    else if(year<1){
        return res.status(400).json({ error: 'shift duration not a strictly positive integer' });
    }
    else if(!(24%shiftDuration==0)){
        return res.status(400).json({ error: 'shift duration not a submultiple of 24!' });
    }

    let shiftWorkspace_ = await shiftWorkspace.findOne({ year: year, month: month,role:role}).exec();                 
    
    if (shiftWorkspace_) {
        return res.status(409).json({ error: 'Workspace already exists for this month' });
    }  
     
    await shiftWorkspace.create({
        year:year,
        month:month,
        role:role,
        peopleForShift:peopleForShift,
        shiftDuration:shiftDuration,
        day:[]
    });
    return res.status(200).json({message:"Workspace created successfully!"});
    
});

router.update('/workspace', async (req, res) => {

    const year=req.body.year;
    const month=req.body.year;;
    const role=req.body.year;

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
    workSets.forEach((shifts, dayIndex) => {
        const day = {
            day: dayIndex+1,
            shift: shifts.map(shift => ({
                email: shift.employee,
                start: shift.startHour,
                end: shift.endHour
            }))
        };
        daysOfWork.push(day);
    });

    await workspace.daysOfWork.push(daysOfWork);

    await workspace.save();
    res.status(200).json({messagge:"Days of work casually generated and added correctly"});
});


router.update('/workspace', async (req, res) => {

    const year=req.body.year;
    const month=req.body.year;;
    const role=req.body.year;

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
    workSets.forEach((shifts, dayIndex) => {
        const day = {
            day: dayIndex+1,
            shift: shifts.map(shift => ({
                email: shift.employee,
                start: shift.startHour,
                end: shift.endHour
            }))
        };
        daysOfWork.push(day);
    });

    await workspace.daysOfWork.push(daysOfWork);

    await workspace.save();
    res.status(200).json({messagge:"Days of work casually generated and added correctly"});
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