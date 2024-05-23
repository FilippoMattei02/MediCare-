const swaggerJSDoc = require('swagger-jsdoc');
const holidays=require('./holidays');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'Documentation for the API',
  },
  servers: [
    {
<<<<<<< HEAD
      url: 'http://medicare-p67f.onrender.com',
=======
      url: 'https://medicare-p67f.onrender.com',
>>>>>>> main
      description: 'Development server',
    },
  ]
};

const options = {
  swaggerDefinition,
<<<<<<< HEAD
  apis: ['./holidays.js'], 
=======
  apis: ['./holidays.js'],
>>>>>>> main
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
