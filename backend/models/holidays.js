var mongoose = require('mongoose');
const {externalDBconnection,internalDBConnection} = require('../database');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = internalDBConnection.model('Holidays', new Schema({ 
	employee:{ type:String, required:true, unique:true},
	holidays_list:[{ type:Date }] 
}));