const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'Documentation for the API',
  },
  servers: [
    {
      url: 'http://medicare-p67f.onrender.com',
      description: 'Development server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./holidays.js'] // Specifica il percorso ai tuoi file di route
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
