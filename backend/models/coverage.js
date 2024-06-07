var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const {externalDBconnection,internalDBConnection} = require('../database');
// set up a mongoose model
module.exports = internalDBConnection.model('Coverage', new Schema({ 
	req_username:{type:String, required:true},
	res_username:{ type:String},
    role:{type:String, required:true},
	state:{ type:Boolean,required:true},
    message:{ type:String },
    work:[{ day:{type:Date,required:true},
			start:{type:Number, required:true},
			end:{type:Number, required:true}
	}],
}));