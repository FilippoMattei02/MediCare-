var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const {externalDBconnection,internalDBConnection} = require('../database');
// set up a mongoose model
module.exports = internalDBConnection.model('Employee', new Schema({ 
	username:{type:String, required:true, unique:true, },
	role:{ type:String,required:true },
	work:[{ day:{type:Date,required:true},
			start:{type:Number, required:true},
			end:{type:Number, required:true}
		}],
	shiftManager:{ type:Boolean, required:true } 


}));