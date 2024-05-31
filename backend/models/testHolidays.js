var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
let DBconnection  = mongoose.createConnection(process.env.TEST_DB_URL);



// set up a mongoose model
module.exports = DBconnection.model('testHolidays', new Schema({ 
	employee:{ type:String, required:true, unique:true},
	holidays_list:[{ type:Date }] 
}));