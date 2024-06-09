var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

let DBconnection  = mongoose.createConnection(process.env.TEST_DB_URL);

// set up a mongoose model
module.exports = DBconnection.model('testEmployee', new Schema({ 
	username:{type:String, required:true, unique:true, },
	role:{ type:String,required:true },
	work:[{ day:{type:Date,required:true},
			start:{type:Number, required:true},
			end:{type:Number, required:true}
		}],
	shiftManager:{ type:Boolean, required:true } 


}));