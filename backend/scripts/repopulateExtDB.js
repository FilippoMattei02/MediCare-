//script for populating the external database by using random names and surnames
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
var User   = require('../models/user'); // get our mongoose model


var jsonData = require ('../static/names.json');
const crypto=require('crypto');






// connect to database
// mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
// .then ( () => {
// 	console.log("Connected to Database")
// });


  
 
 

	// Clear users
User.deleteMany().then(()=>{
    
    let n_user=50;
    let j=0;

    for(let i=0;i<n_user;i++){
        var json_name=jsonData.names[i%(jsonData.names.length)];
        var json_surname=jsonData.surnames[i%(jsonData.names.length)];
        var json_role=jsonData.roles[i%(jsonData.roles.length)];
        let shiftMan=false;
        if(i<3)  shiftMan=true;
        
        const newUser = User.create({
            email:json_name + "." + json_surname + "@apss.it",
            password:crypto.createHash('sha256').update(json_name).digest('hex'),
            id:{
                name:json_name,
                surname:json_surname
            },
            role:json_role,
            
            shiftManager: shiftMan
        })
        .then(newUser => {
            console.log("New user created:", newUser);
            j++;
            if(j==n_user){
                console.log("Database repopulated");
                process.exit();
            }
        })
        .catch(err => {
          console.error("Error creating user:", err);
        })
    }
})

    


