const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });



const db1Options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};


const db2Options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connessioni ai due database
const externalDBconnection = mongoose.createConnection(process.env.DB_URL, db1Options);
const internalDBConnection = mongoose.createConnection(process.env.INTERNAL_DB_URL, db2Options);

// Gestione degli errori di connessione
externalDBconnection.on('error', console.error.bind(console, 'DB1 connection error:'));
internalDBConnection.on('error', console.error.bind(console, 'DB2 connection error:'));

// Esporta le connessioni ai database
module.exports = {
  externalDBconnection,
  internalDBConnection,
};
