const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const crypto = require('crypto');
const User   = require('./models/user');
var jsonData = require ('./static/names.json');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = require('./authentication');
const port = 3050;

mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
.then ( () => {
	console.log("Connected to Database")
});

/*
User.deleteMany().then(()=>{
    
    let n_user=20;
    let j=0;

    for(let i=0;i<n_user;i++){
        var json_name=jsonData.names[i%(jsonData.names.length)];
        var json_surname=jsonData.surnames[i%(jsonData.names.length)];
        var json_role=jsonData.roles[i%(jsonData.roles.length)];
        let shiftMan=false;
        if(i<3)  shiftMan=true;
        
        const newUser = User.create({
            email:json_name + "." + json_surname + "@apss.it",
            //password:bcrypt.hashSync(json_name,8),
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
*/

app.use(bodyParser.json());
// Abilita CORS per tutte le richieste
app.use(cors());

app.listen(port, () => {
    console.log(`Il server è in ascolto sulla porta ${port}`);
});