const db=require("./database")

const User   = require('./models/user');
const Employees=require('./models/employee');

const app = require('./app');
const port = process.env.PORT || 3050;

app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
});