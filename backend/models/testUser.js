var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
let DBconnection  = mongoose.createConnection(process.env.TEST_DB_URL);

const PersonSchema= new Schema({
	name:{ type:String, required:true },
	surname:{ type:String, required:true }
}
);

// set up a mongoose model
module.exports = externalDBconnection.model('User', new Schema({ 
	email:{ type:String, required:true, unique:true },
	password: { type:String,required:true },
	id:{ type:PersonSchema, required:true },
	role:{ type:String,required:true },
	shiftManager:{ type:Boolean, required:true } 
}));