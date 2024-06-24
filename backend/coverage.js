const express = require('express');
const router = express.Router();
const coverage = require('./models/coverage');
const employee = require('./models/employee');

/**
 * @openapi
 * /:role/:
 *   get:
 *     summary: Retrieve work fields, sender, and string with status = false for a specific role
 *     tags: [Coverage]
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: Role identifier
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved coverage requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   req_username:
 *                     type: string
 *                   day:
 *                     type: string
 *                   start:
 *                     type: string
 *                   end:
 *                     type: string
 *                   message:
 *                     type: string
 *       '400':
 *         description: Invalid or missing role
 *       '404':
 *         description: Role not found or no coverage requests
 */

router.get('/:role', async (req, res) => {
    const role = req.params.role;
    
    if (role==undefined) {
        return res.status(400).json({ error: 'missing role' });
    }    
    let userID = await employee.findOne({ role: role });                  
    if (!userID) {
        return res.status(404).json({error: 'role not found' });
    }

    let covReq= await coverage.find({ role: role,state:false });
    
    if (!covReq) {
        covReq=[];
        return res.status(200).json({message: 'no coverage requests',work:covReq });
    }
    if(Array.isArray(covReq)){
        const requests = covReq.map(Req => ({
                req_username: Req.req_username,
                day: Req.day,
                start:Req.start,
                end: Req.end,
                role:role,
                state:Req.state,
                message: Req.message,
            })
        );
        
        return res.status(200).json(requests);

    }else{
        return res.status(200).json({
            req_username: covReq.req_username,
            day: dateToString(covReq.day),
            start:covReq.start,
            end: covReq.end,
            message: covReq.message,
        });
    }
    
});

/**
 * @openapi
 * /:role/:username/:day/:start:
 *   get:
 *     summary: Retrieve a single coverage request by role, username, date, and start time
 *     tags: [Coverage]
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: Role identifier
 *         schema:
 *           type: string
 *       - name: username
 *         in: path
 *         required: true
 *         description: Username
 *         schema:
 *           type: string
 *       - name: day
 *         in: path
 *         required: true
 *         description: Day of the coverage request (yyyy-mm-dd)
 *         schema:
 *           type: string
 *       - name: start
 *         in: path
 *         required: true
 *         description: Start time of the coverage request
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved the coverage request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 req_username:
 *                   type: string
 *                 res_username:
 *                   type: string
 *                 day:
 *                   type: string
 *                 start:
 *                   type: string
 *                 end:
 *                   type: string
 *                 message:
 *                   type: string
 *       '400':
 *         description: Missing or invalid parameters
 *       '404':
 *         description: User or coverage request not found
 */
router.get('/:role/:username/:day/:start', async (req, res) => {
    const role = req.params.role;
    const username = req.params.username;
    const date = req.params.day;
    let start=req.params.start;

    start=parseInt(start); 
    

    if (role==undefined) {
        return res.status(400).json({ error: 'missing role' });
    }    
    if (date==undefined) {
        return res.status(400).json({ error: 'missing date' });
    }    
    if (username==undefined) {
        return res.status(400).json({ error: 'missing username' });
    }    

    let userID = await employee.findOne({ username:username,role: role });                  
    if (!userID) {
        return res.status(404).json({error: 'user or role not found' });
    }
    let newDate=new Date(date);
    if (!(dateToString(date) === dateToString(newDate))) {
        return res.status(400).json({ error: 'Date field not valid' });
    } 

    let covReq= await coverage.findOne({ role: role,req_username:username,day:newDate,start:start});
    if (!covReq) {
        return res.status(404).json({message: 'coverage request not found'});
    }
    return res.status(200).json({
        req_username: covReq.req_username,
        res_username:covReq.res_username,
        day: covReq.day,
        start:covReq.start,
        end: covReq.end,
        message: covReq.message,
    });    
});

/**
 * @openapi
 * /:role/:username/requested:
 *   get:
 *     summary: Retrieve coverage requests asked by a specific user
 *     tags: [Coverage]
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: Role identifier
 *         schema:
 *           type: string
 *       - name: username
 *         in: path
 *         required: true
 *         description: Username
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved coverage requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   req_username:
 *                     type: string
 *                   res_username:
 *                     type: string
 *                   day:
 *                     type: string
 *                   start:
 *                     type: string
 *                   end:
 *                     type: string
 *                   message:
 *                     type: string
 *       '400':
 *         description: Missing or invalid parameters
 *       '404':
 *         description: User or coverage requests not found
 */
router.get('/:role/:username/requested', async (req, res) => {
    const role = req.params.role;
    const username = req.params.username;

    if (role==undefined) {
        return res.status(400).json({ error: 'missing role' });
    }       
    if (!username==undefined) {
        return res.status(400).json({ error: 'missing username' });
    }    

    let userID = await employee.findOne({ username:username,role: role });                  
    if (!userID) {
        return res.status(404).json({error: 'user or role not found' });
    }

    let covReq= await coverage.find({ role: role, req_username:username });
    if(Array.isArray(covReq)){
        const requests = covReq.map(Req => ({
                req_username: Req.req_username,
                res_username:Req.res_username,
                day: Req.day,
                start:Req.start,
                end: Req.end,
                message: Req.message,
                state:Req.state,
                role:Req.role
            })
        );
        
        return res.status(200).json(requests);

    }else{
        return res.status(200).json({
            req_username: covReq.req_username,
            res_username: covReq.res_username,
            day: covReq.day,
            start:covReq.start,
            end: covReq.end,
            message: covReq.message,
            state:covReq.state,
            role:covReq.role
        });
    }
    
});

/**
 * @openapi
 * /:role/:username/covered:
 *   get:
 *     summary: Retrieve coverage requests fulfilled by a specific user
 *     tags: [Coverage]
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: Role identifier
 *         schema:
 *           type: string
 *       - name: username
 *         in: path
 *         required: true
 *         description: Username
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved coverage requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   req_username:
 *                     type: string
 *                   res_username:
 *                     type: string
 *                   day:
 *                     type: string
 *                   start:
 *                     type: string
 *                   end:
 *                     type: string
 *                   message:
 *                     type: string
 *       '400':
 *         description: Missing or invalid parameters
 *       '404':
 *         description: User or coverage requests not found
 */

router.get('/:role/:username/covered', async (req, res) => {
    const role = req.params.role;
    const username = req.params.username;

    if (role==undefined) {
        return res.status(400).json({ error: 'missing role' });
    }       
    if (username==undefined) {
        return res.status(400).json({ error: 'missing username' });
    }    

    let userID = await employee.findOne({ username:username,role: role });                  
    if (!userID) {
        return res.status(404).json({error: 'user or role not found' });
    }

    let covReq= await coverage.find({ role: role, res_username:username });
    if(Array.isArray(covReq)){
        const requests = covReq.map(Req => ({
                req_username: Req.req_username,
                res_username:Req.res_username,
                day: Req.day,
                start:Req.start,
                end: Req.end,
                message: Req.message,
                state:Req.state,
                role:Req.role
            })
        );
        
        return res.status(200).json(requests);

    }else{
        return res.status(200).json({
            req_username: covReq.req_username,
            res_username: covReq.res_username,
            day: covReq.day,
            start:covReq.start,
            end: covReq.end,
            message: covReq.message,
            state:covReq.state,
            role:covReq.role
        });
    }
    
});

/**
 * @openapi
 * /:role/:username:
 *   post:
 *     summary: Create a new coverage request
 *     tags: [Coverage]
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: Role identifier
 *         schema:
 *           type: string
 *       - name: username
 *         in: path
 *         required: true
 *         description: Username
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               day:
 *                 type: string
 *               start:
 *                 type: string
 *               end:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Coverage request created successfully
 *       '400':
 *         description: Missing or invalid parameters
 *       '404':
 *         description: User or work shift not found, or coverage request already asked
 */
router.post('/:role/:username', async (req, res) => {
    const role = req.params.role;
    const username = req.params.username;
    
    const date = req.body.day;
    let start=req.body.start;
    let end=req.body.end;
    const message=req.body.message;
    

    let newDate=new Date(date);
    

    if (role==undefined) {
        
        return res.status(400).json({ error: 'missing role' });
    }    
    if (date==undefined) {
        
        return res.status(400).json({ error: 'missing date' });
    }    
    if (username==undefined) {
       
        return res.status(400).json({ error: 'missing username' });
    }
    if (start==undefined || start<0 || start > 24) {
        return res.status(400).json({ error: 'wrong start parameter' });
    } 
    if (end==undefined || end<0 || end > 24) {
        return res.status(400).json({ error: 'wrong end parameter' });
    } 
    end=parseInt(end);
    start=parseInt(start); 

    if (message==undefined) {
        return res.status(400).json({ error: 'missing message' });
    }   

    let userID = await employee.findOne({ username:username,role: role });                  
    if (!userID) {
        return res.status(404).json({error: 'user not found' });
    }
    
    //console.log(newDate);
    
    let found=false;
    for (const workItem of userID.work) {

        if ( dateToString(workItem.day) == dateToString(date) && workItem.start == start && workItem.end == end) {
            found=true;
            
            break;
        }
    }    
    
    if (!found){
        return res.status(404).json({message: 'work shift not found'});
    }

    let covReq= await coverage.findOne({ role: role,req_username:username,day:newDate,start:start});
    if (covReq) {
        return res.status(400).json({message: 'coverage request already asked'});
    }
    await coverage.create({
        req_username: username,
        role:role,
        state: false,
        day: date,
        start: start,
        end: end,
        message: message,
    });
    return res.status(200).json({message:"Coverage request created successfully!"});   
});


/**
 * @openapi
 * /:role/:resUsername:
 *   put:
 *     summary: Fulfill a coverage request by changing the status variable and updating the work shift
 *     tags: [Coverage]
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: Role identifier
 *         schema:
 *           type: string
 *       - name: resUsername
 *         in: path
 *         required: true
 *         description: Response username
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reqUsername:
 *                 type: string
 *               day:
 *                 type: string
 *               start:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Coverage request accepted successfully
 *       '400':
 *         description: Missing or invalid parameters
 *       '404':
 *         description: User or coverage request not found
 */
router.put('/:role/:resUsername', async (req, res) => {
    const role = req.params.role;
    const res_username = req.params.resUsername;
    let token = req.headers['authorization'];
    
    const req_username = req.body.req_username;
    const date = req.body.day;
    let start=req.body.start;


    let newDate=new Date(date);
    

    if (role==undefined) {
        return res.status(400).json({ error: 'missing role' });
    }    
    if (start==undefined || start<0 || start > 24) {
        return res.status(400).json({ error: 'wrong start parameter' });
    } 
    if (date==undefined) {
        return res.status(400).json({ error: 'missing date' });
    }    
    if (req_username==undefined) {
        return res.status(400).json({ error: 'missing request username' });
    }    
    if (res_username==undefined) {
        return res.status(400).json({ error: 'missing response username' });
    } 

    let userID2 = await employee.findOne({ username:req_username,role: role });           
    if (!userID2) {
        return res.status(404).json({error: 'req user not found' });
    } 
    let covReq= await coverage.findOne({ role: role,state:false,req_username:req_username,day:newDate,start:start});
    if (!covReq) {
        return res.status(404).json({message: 'coverage request not found or already covered'});
    }

    let userID = await employee.findOne({ username:res_username,role: role });
    if (!userID) {
        return res.status(404).json({error: 'res user not found' });
    }
    let found=false;
    for (const workItem of userID.work) {
        if ( dateToString(workItem.day)== dateToString(date) && workItem.start <= start && workItem.end >= covReq.end) {
            found=true;
            
            break;
        }
    }    
    if (found){
        return res.status(400).json({message: 'Cannot cover the work shift already working that day at that hour'});
    }
    
    
    
    covReq.state=true;
    covReq.res_username=res_username;
    
    
    let state=await publishWorkShifts(start,covReq.end,date,req_username,res_username,role,token);
    if(state==1){
        return res.status(500).json({ error: 'Problem in the edit of work shifts' });
    }
    await covReq.save();
    return res.status(200).json({
        response:"coverage request accepted:",
        req_username: covReq.req_username,
        res_username: covReq.res_username,
        day: dateToString(covReq.day),
        start:covReq.start,
        end: covReq.end,
        message: covReq.message
    });    
});

/**
 * @openapi
 * /:role/:me/:day/:start:
 *   delete:
 *     summary: Delete a specific coverage request 
 *     tags: [Coverage]
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: Role identifier
 *         schema:
 *           type: string
 *       - name: me
 *         in: path
 *         required: true
 *         description: Username
 *         schema:
 *           type: string
 *       - name: day
 *         in: path
 *         required: true
 *         description: Day of the coverage request (yyyy-mm-dd)
 *         schema:
 *           type: string
 *       - name: start
 *         in: path
 *         required: true
 *         description: Start time of the coverage request
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Coverage request deleted successfully
 *       '400':
 *         description: Missing or invalid parameters
 *       '404':
 *         description: Coverage request not found or already covered
 */
router.delete('/:role/:me/:day/:start', async (req, res) => {
    const role = req.params.role;
    const username = req.params.me;
    const date = req.params.day;
    const start=req.params.start;
    

    if (role==undefined) {
        return res.status(400).json({ error: 'missing role' });
    }    
    if (date==undefined) {
        return res.status(400).json({ error: 'missing date' });
    }    
    if (username==undefined) {
        return res.status(400).json({ error: 'missing username' });
    }    

    let userID = await employee.findOne({ username:username,role: role });                  
    if (!userID) {
        return res.status(404).json({error: 'user not found' });
    }
    let newDate=new Date(date);
    
    

    let covReq=await coverage.findOneAndDelete({ role: role,req_username:username,day:newDate,start:start });
    if(!covReq){
        return res.status(404).json({message: 'coverage request not found'});
    }
    return res.status(200).json({
        response:"coverage request deleted"
    });       
});


/*function dateToString(date){
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    return  "" + year + "-" + month + "-" + day;
}*/

function dateToString(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return date.toISOString().split('T')[0];
}

async function publishWorkShifts(start,end,day,req_username,res_username,role,token){
    try {
        await deleteWorkShift(req_username, day, start, end,token);         
        
        try {
            await postWorkShift(res_username, day,start,end,token);
            console.log(`Successfully added work shifts for ${res_username}`);
        } catch (error) {
            console.error(`Error adding work shifts for ${res_username}:`, error);
        }

        console.log("Work shifts modified to employee schedules" );
        return 0;

    } catch (error) {
        console.error('Error fetching or processing work shifts:', error);
        return
    }
}

async function postWorkShift (email, day, start, end,token) {
    try {
        const payload = { day, start, end };
        const response = await fetch(`https://medicare-p67f.onrender.com/employees/${email}/work/add `, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','Authorization': `${token}` },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        //console.log(data);
        return data;

    } catch (error) {
        console.error('Error during API call:', error);
        throw error;
    }
};

async function deleteWorkShift (email, day, start, end,token) {
    const url = `https://medicare-p67f.onrender.com/employees/${email}/work`;
    const payload = { day, start, end };

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`

            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        //console.log(data);
        return data;

    } catch (error) {
        console.error('Error during API call:', error);
    }
};

module.exports = router;