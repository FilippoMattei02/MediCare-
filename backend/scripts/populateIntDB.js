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

        let n_user = 50;

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
                    { day: new Date("2024-05-1"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-2"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-3"), start: (1 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-4"), start: (4 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-5"), start: (9 + i) % 24, end: (14 + i) % 24 },
                    { day: new Date("2024-05-6"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-7"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-8"), start: (3 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-9"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-10"), start: (1 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-11"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-12"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-13"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-14"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-15"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-16"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-17"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-18"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-19"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-20"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-21"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-22"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-23"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-24"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-25"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-26"), start: (9 + i) % 24, end: (14 + i) % 24 },
                    { day: new Date("2024-05-27"), start: (9 + i) % 24, end: (14 + i) % 24 },
                    { day: new Date("2024-05-28"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-29"), start: (9 + i) % 24, end: (17 + i) % 24 },
                    { day: new Date("2024-05-30"), start: (9 + i) % 24, end: (17 + i) % 24 }
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