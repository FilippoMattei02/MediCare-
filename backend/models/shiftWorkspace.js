var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const {externalDBconnection,internalDBConnection} = require('../database');

module.exports = internalDBConnection.model('ShiftWorkspace', new Schema({ 
	year:{type:Number, required:true },
    month:{type:Number, required:true},
	role:{ type:String,required:true },
    peopleForShift:{type:Number},
    shiftDuration:{type:Number},
	daysOfWork:[{ 
        date:{type:String},
        shift:[{
			email:{type:String},
			start:{type:Number},
			end:{type:Number}
		}],
	}]
}));

