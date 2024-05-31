var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

let DBConnection  = mongoose.createConnection(process.env.TEST_DB_URL);

module.exports = DBConnection.model('testShiftWorkspace', new Schema({ 
	year:{type:Number, required:true },
    month:{type:Number, required:true},
	role:{ type:String,required:true },
    peopleForShift:{type:Number,required:true},
    shiftDuration:{type:Number,required:true},
	daysOfWork:[{ 
        date:{type:String},
        shift:[{
			email:{type:String},
			start:{type:Number},
			end:{type:Number}
		}],
	}]
}));