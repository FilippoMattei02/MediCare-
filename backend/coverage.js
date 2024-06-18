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

router.get('/:role/', async (req, res) => {
    const role = req.params.role;

    if (!role) {
        return res.status(400).json({ error: 'missing role' });
    }    
    let userID = await employee.findOne({ role: role });                  
    if (!userID) {
        return res.status(404).json({error: 'role not found' });
    }

    let covReq= await coverage.find({ role: role,state:false });
    // console.log(covReq);
    // console.log(role);
    if (!covReq) {
        covReq=[];
        return res.status(200).json({message: 'no coverage requests',work:covReq });
    }
    if(Array.isArray(covReq)){
        const requests = covReq.map(Req => ({
                req_username: Req.req_username,
                day: dateToString(Req.day),
                start:Req.start,
                end: Req.end,
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
    const start=req.params.start;
    

    if (!role) {
        return res.status(400).json({ error: 'missing role' });
    }    
    if (!date) {
        return res.status(400).json({ error: 'missing date' });
    }    
    if (!username) {
        return res.status(400).json({ error: 'missing username' });
    }    

    let userID = await employee.findOne({ username:username,role: role });                  
    if (!userID) {
        return res.status(404).json({error: 'user not found' });
    }
    let newDate=new Date(date);
    if (!(date === dateToString(newDate))) {
        return res.status(400).json({ error: 'Date field is not of type yyyy-mm-dd' });
    } 

    let covReq= await coverage.findOne({ role: role,req_username:username,day:newDate,start:start});
    if (!covReq) {
        return res.status(404).json({message: 'coverage request not found'});
    }
    return res.status(200).json({
        req_username: covReq.req_username,
        res_username:covReq.res_username,
        day: dateToString(covReq.day),
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

    if (!role) {
        return res.status(400).json({ error: 'missing role' });
    }       
    if (!username) {
        return res.status(400).json({ error: 'missing username' });
    }    

    let userID = await employee.findOne({ username:username,role: role });                  
    if (!userID) {
        return res.status(404).json({error: 'user not found' });
    }

    let covReq= await coverage.find({ role: role, req_username:username });
    if (!covReq) {
        covReq=[];
        return res.status(200).json({message: 'no coverage requests asked by this user ',req:covReq });
    }
    if(Array.isArray(covReq)){
        const requests = covReq.map(Req => ({
                req_username: Req.req_username,
                res_username:Req.res_username,
                day: dateToString(Req.day),
                start:Req.start,
                end: Req.end,
                message: Req.message,
            })
        );
        
        return res.status(200).json(requests);

    }else{
        return res.status(200).json({
            req_username: covReq.req_username,
            res_username: covReq.res_username,
            day: dateToString(covReq.day),
            start:covReq.start,
            end: covReq.end,
            message: covReq.message,
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

    if (!role) {
        return res.status(400).json({ error: 'missing role' });
    }       
    if (!username) {
        return res.status(400).json({ error: 'missing username' });
    }    

    let userID = await employee.findOne({ username:username,role: role });                  
    if (!userID) {
        return res.status(404).json({error: 'user not found' });
    }

    let covReq= await coverage.find({ role: role, res_username:username });
    if (!covReq) {
        covReq=[];
        return res.status(200).json({message: 'no coverage requests covered by this user ',req:covReq });
    }
    if(Array.isArray(covReq)){ 
        const requests = covReq.map(Req => ({
                req_username: Req.req_username,
                res_username:Req.res_username,
                day: dateToString(Req.day),
                start:Req.start,
                end: Req.end,
                message: Req.message,
            })
        );
        
        return res.status(200).json(requests);

    }else{
        return res.status(200).json({
            req_username: covReq.req_username,
            res_username: covReq.res_username,
            day: dateToString(covReq.day),
            start:covReq.start,
            end: covReq.end,
            message: covReq.message,
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
    const start=req.body.start;
    const end=req.body.end;
    const message=req.body.message;
    

    if (!role) {
        return res.status(400).json({ error: 'missing role' });
    }    
    if (!date) {
        return res.status(400).json({ error: 'missing date' });
    }    
    if (!username) {
        return res.status(400).json({ error: 'missing username' });
    }
    if (!start) {
        return res.status(400).json({ error: 'missing start' });
    }   
    if (!end) {
        return res.status(400).json({ error: 'missing end' });
    }   
    if (!message) {
        return res.status(400).json({ error: 'missing message' });
    }   

    let userID = await employee.findOne({ username:username,role: role });                  
    if (!userID) {
        return res.status(404).json({error: 'user not found' });
    }
    let newDate=new Date(date);
    if (!(date === dateToString(newDate))) {
        return res.status(400).json({ error: 'Date field is not of type yyyy-mm-dd' });
    } 
    let found=false;
    for (const workItem of userID.work) {
        if ( dateToString(workItem.day)== date && workItem.start == start && workItem.end == end) {
            found=true;
            
            break;
        }
    }    
    console.log(found)
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
    
    const req_username = req.body.req_username;
    const date = req.body.day;
    const start=req.body.start;
    
    

    if (!role) {
        return res.status(400).json({ error: 'missing role' });
    }    
    if (!start) {
        return res.status(400).json({ error: 'missing start' });
    } 
    if (!date) {
        return res.status(400).json({ error: 'missing date' });
    }    
    if (!req_username) {
        return res.status(400).json({ error: 'missing request username' });
    }    
    if (!res_username) {
        return res.status(400).json({ error: 'missing response username' });
    }   

    let userID = await employee.findOne({ username:res_username,role: role });
                   
    if (!userID) {
        return res.status(404).json({error: 'user not found' });
    }
    let found=false;
    for (const workItem of userID.work) {
        if ( dateToString(workItem.day)== date) {
            found=true;
            
            break;
        }
    }    
    if (found){
        return res.status(400).json({message: 'Cannot cover the work shift already working that day'});
    }
    let newDate=new Date(date);
    if (!(date === dateToString(newDate))) {
        return res.status(400).json({ error: 'Date field is not of type yyyy-mm-dd' });
    } 
    let covReq= await coverage.findOne({ role: role,state:false,req_username:req_username,day:newDate,start:start});
    if (!covReq) {
        return res.status(404).json({message: 'coverage request not found or already covered'});
    }
    covReq.state=true;
    covReq.res_username=res_username;
    
    
    let state=await publishWorkShifts(start,covReq.end,date,req_username,res_username,role);
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
 *     summary: Delete a specific coverage request if you are the owner or an admin
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
    

    if (!role) {
        return res.status(400).json({ error: 'missing role' });
    }    
    if (!date) {
        return res.status(400).json({ error: 'missing date' });
    }    
    if (!username) {
        return res.status(400).json({ error: 'missing username' });
    }    

    let userID = await employee.findOne({ username:username,role: role });                  
    if (!userID) {
        return res.status(404).json({error: 'user not found' });
    }
    let newDate=new Date(date);
    if (!(date === dateToString(newDate))) {
        return res.status(400).json({ error: 'Date field is not of type yyyy-mm-dd' });
    } 

    

    let covReq=await coverage.findOneAndDelete({ role: role,req_username:username,day:newDate,start:start });
    return res.status(200).json({
        response:"coverage request deleted"
    });       
});


function dateToString(date){
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    return  "" + year + "-" + month + "-" + day;
}

async function publishWorkShifts(start,end,day,req_username,res_username,role){
    try {
        await deleteWorkShift(req_username, day, start, end);         
        
        try {
            await postWorkShift(res_username, day,start,end);
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

async function postWorkShift (email, day, start, end) {
    try {
        const payload = { day, start, end };
        const response = await fetch(`http://localhost:3050/employees/${email}/work/add `, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
async function deleteWorkShift (email, day1, start, end) {
    const url = `http://localhost:3050/employees/${email}/work`;
    const day=new Date(day1).toISOString();
    const payload = { day, start, end };

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        return data;

    } catch (error) {
        console.error('Error during API call:', error);
    }
};

module.exports = router;