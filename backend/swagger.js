const swaggerJSDoc = require('swagger-jsdoc');
const holidays=require('./holidays');
const employees = require('./employees');


const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'Documentation for the API',
  },
  servers: [
    {
      url: 'https://medicare-p67f.onrender.com',
      description: 'Development server',
    },
  ]
};

const options = {
  swaggerDefinition,
<<<<<<< HEAD
  apis: ['./holidays.js', './employees.js', './authentication.js', './calendar.js', './shifts.js', './SMworkspace.js', './coverage.js'],
=======
  apis: ['./holidays.js', './employees.js', './authentication.js','./SMworkspace.js','./coverage.js'],
>>>>>>> coverage
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
