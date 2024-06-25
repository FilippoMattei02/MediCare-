const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../', '.env') });
const Employee = require('../models/employee'); // get our mongoose model
const Holidays = require('../models/holidays'); 
const jsonData = require('../static/names.json');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

async function populateDatabase() {
    try {
        await mongoose.connect(process.env.INTERNAL_DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to INTERNAL Database");

        await Employee.deleteMany();
        await Holidays.deleteMany().then(console.log("db cleaned"));

        let n_user = 10;

        for (let i = 0; i < n_user; i++) {
            const json_name = jsonData.names[i % jsonData.names.length];
            const json_surname = jsonData.surnames[i % jsonData.surnames.length];
            const json_role = jsonData.roles[i % jsonData.roles.length];
            var list=[];

            const shiftMan = i < 3;
            
            const newEmployee = await Employee.create({
                username: json_name + "." + json_surname + "@apss.it",
                role: json_role,
                work: [
                ],
                shiftManager: shiftMan
            });

            const newHoliday = await Holidays.create({
                employee: json_name + "." + json_surname + "@apss.it",
                holidays_list:list
            });

            console.log("New employee created:", newEmployee);
            console.log("New holiday created:", newHoliday);
        }

        console.log("Database repopulated");
        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

populateDatabase();
