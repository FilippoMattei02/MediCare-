var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const {externalDBconnection,internalDBConnection} = require('../database');

module.exports = internalDBConnection.model('Employee', new Schema({ 
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

