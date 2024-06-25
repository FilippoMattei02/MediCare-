const express = require('express');
const app=express();
const cors = require('cors');
const db=require("./database")




const User   = require('./models/user');
const Employees=require('./models/employee');
const Workspace= require('./models/shiftWorkspace');
const Holidays = require('./models/holidays');
const tokenChecker= require('./loggerMiddleware');




const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const authentication = require('./authentication');
const holiday=require('./holidays');

const shifts = require('./shifts');
const calendar = require('./calendar');
const employees = require('./employees');
const coverage = require('./coverage');
const workspace= require('./SMworkspace')



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

app.use('/employees', tokenChecker);
app.use('/coverage', tokenChecker);
app.use('/workspace', tokenChecker);
app.use('/holiday',tokenChecker);
app.use('/shifts',tokenChecker);

app.use('/calendar',tokenChecker);


app.use('/holiday',holiday);
app.use('/employees', employees);
app.use('/shifts',shifts);

app.use('/calendar',calendar);
app.use('/coverage',coverage);
app.use('/workspace',workspace);


module.exports = app;