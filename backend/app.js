const express = require('express');
const app=express();
const cors = require('cors');
const db=require("./database")




const User   = require('./models/user');
const Employees=require('./models/employee');
const Holidays = require('./models/holidays');



const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const authentication = require('./authentication');
const holiday=require('./holidays');

const shifts = require('./shifts');
const employees = require('./employees');
const workspace= require('./SMworkspace');
const coverage= require('./coverage');


const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Abilita CORS per tutte le richieste
app.use(cors());

// Serve the Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authentication);

//If you want you can make a middleware for authentication 
/*
*app.use('/holiday', tokenChecker);
*/

app.use('/holiday',holiday);
app.use('/employees', employees);
app.use('/shifts',shifts);
app.use('/workspace',workspace);
app.use('/coverage',coverage);

module.exports = app;
