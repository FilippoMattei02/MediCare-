const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');
const Coverage = require('./models/coverage'); 
const Employees = require('./models/employee'); 
const cov= require('./coverage');
const employee = require('./models/employee');
const coverage = require('./models/coverage');

require('dotenv').config();

describe('coverage API', () => {
    let connection;
  
    let testEmployee = {
      username: 'test.user@apss.it',
      role: 'tester',
      work: [{ day: new Date('2024-12-25'), start: 0, end: 12 }, { day: new Date('2024-01-09'), start: 0, end: 12 }],
      shiftManager: true
    };
    const testEmployee2 = {
        username: 'test.user2@apss.it',
        role: 'tester',
        work: [{ day: new Date('2024-12-26'), start: 0, end: 12 }],
        shiftManager: false
    };
    let testEmployee3 = {
        username: 'test.user3@apss.it',
        role: 'tester',
        work: [{ day: new Date('2024-12-26'), start: 0, end: 12 },{ day: new Date('2024-12-25'), start: 0, end: 16 }],
        shiftManager: false
    };

    let testCoverage = {
        req_username:"test.user@apss.it",
        role:"tester",
        state:false,
        message:"test message",
        day:new Date('2024-12-25').toISOString(),
		start:0,
		end:12

    };
    let testCoverage2 = {
        req_username:"test.user@apss.it",
        res_username:"test.user2@apss.it",
        role:"tester",
        state:true,
        message:"test message2",
        day:new Date('2024-09-01').toISOString(),
		start:0,
		end:12
    };
    const username="test.user@apss.it";
    const username2="test.user2@apss.it";
    const username3="test.user3@apss.it";
    let day1=new Date('2024-01-09');
    const role="tester";
    const state=false;
    let message="test message";
  
    beforeAll(async () => {
        jest.setTimeout(30000);
        jest.unmock('mongoose')
        connection = await mongoose.connect(process.env.INTERNAL_DB_URL);
        console.log('Database connected!');
    
     
        await Employees.deleteMany({role:"tester"});
        await Coverage.deleteMany({role:"tester"});
        
      
        
      

        await Employees.create(testEmployee);
        await Employees.create(testEmployee2);
        await Employees.create(testEmployee3);
        //await Employees.create(testEmployee4);
        await Coverage.create(testCoverage);
        await Coverage.create(testCoverage2);

      
    });
  
    afterAll(async () => {
        
        await Employees.deleteMany({role:"tester"});
        await Coverage.deleteMany({role:"tester"});

        await mongoose.connection.close();
        console.log("Database connection closed");
    });

    //GET coverage/:role
    test('GET /coverage/:role - Get coverage not covered list', async () => {
        const res = await request(app).get('/coverage/tester');
        expect(res.statusCode).toBe(200);
        expect(res.body).toContainEqual(testCoverage);
        expect(res.body).not.toContain(testCoverage2);
    });
    test('GET /coverage/:role - Get coverage list role not found', async () => {
        const res = await request(app).get('/coverage/nottester');
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain("role not found");
    });


    //GET coverage/:role/:username/:day/:start
    test('GET /coverage/:role/:username/:day/:start - Get a specific coverage', async () => {
        const res = await request(app).get('/coverage/tester/test.user@apss.it/2024-12-25/0');
        expect(res.statusCode).toBe(200);
        expect(res.body.req_username).toBe(testCoverage.req_username);
        expect(res.body.day).toBe(testCoverage.day);
        expect(res.body.start).toBe(testCoverage.start);
        expect(res.body.message).toBe(testCoverage.message);
        expect(res.body.end).toBe(testCoverage.end);
    });

    test('GET /coverage/:role/:username/:day/:start - wrong request day(404)', async () => {
        const res = await request(app).get('/coverage/tester/test.user@apss.it/2024-12-17/0');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toContain("coverage request not found");
    });
    test('GET /coverage/:role/:username/:day/:start - wrong user(404)', async () => {
        const res = await request(app).get('/coverage/tester/nottest.user@apss.it/2024-12-12/0');
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain("user or role not found");
    });
    test('GET /coverage/:role/:username/:day/:start - wrong role(404)', async () => {
        const res = await request(app).get('/coverage/nottester/test.user@apss.it/2024-12-12/0');
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain("user or role not found");
    });


    //GET coverage/:role/:username/requested
    test('GET /coverage/:role/:username/requested- Get all coverage requested by a specific user', async () => {
        const res = await request(app).get('/coverage/tester/test.user@apss.it/requested');
        expect(res.statusCode).toBe(200);
        expect(res.body).toContainEqual(testCoverage);
        expect(res.body).toContainEqual(testCoverage2);
    });
    test('GET /coverage/:role/:username/requested- Get empty object if the user does not have any request', async () => {
        const res = await request(app).get('/coverage/tester/test.user2@apss.it/requested');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(0);
    });

    test('GET /coverage/:role/:username/requested- wrong username', async () => {
        const res = await request(app).get('/coverage/tester/nottest.user@apss.it/requested');
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain("user or role not found");
    });

    test('GET /coverage/:role/:username/requested- wrong role', async () => {
        const res = await request(app).get('/coverage/nottester/test.user@apss.it/requested');
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain("user or role not found");
    });

    //GET coverage/:role/:username/covered
    test('GET /coverage/:role/:username/covered- Get empty object if the user does not have any covered request', async () => {
        const res = await request(app).get('/coverage/tester/test.user@apss.it/covered');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(0);
    });
    test('GET /coverage/:role/:username/covered- Get all coverage covered by a specific user', async () => {
        const res = await request(app).get('/coverage/tester/test.user2@apss.it/covered');
        expect(res.statusCode).toBe(200);
        expect(res.body).toContainEqual(testCoverage2);
    });

    test('GET /coverage/:role/:username/covered- wrong username', async () => {
        const res = await request(app).get('/coverage/tester/nottest.user@apss.it/covered');
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain("user or role not found");
    });

    test('GET /coverage/:role/:username/covered- wrong role', async () => {
        const res = await request(app).get('/coverage/nottester/test.user@apss.it/covered');
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain("user or role not found");
    });

    //POST coverage/:role/:username
    test('POST /coverage/:role/:username- POST a request of an user of an existing shift', async () => {
        const res = await request(app)
            .post('/coverage/tester/test.user@apss.it')
            .send({
                start:0,
                end:12,
                message:"test message",
                day:day1.toISOString()
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Coverage request created successfully!");
    });

    test('POST /coverage/:role/:username- missing start', async () => {
        const res = await request(app)
            .post('/coverage/tester/test.user@apss.it')
            .send({
                
                end:12,
                message:"test message",
                day:day1.toISOString()
            });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain("wrong start parameter");
    });

    test('POST /coverage/:role/:username- negative start', async () => {
        const res = await request(app)
            .post('/coverage/tester/test.user@apss.it')
            .send({
                start:-1,
                end:12,
                message:"test message",
                day:day1.toISOString()
            });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain("wrong start parameter");
    });

    test('POST /coverage/:role/:username- start>24', async () => {
        const res = await request(app)
            .post('/coverage/tester/test.user@apss.it')
            .send({
                start:25,
                end:12,
                message:"test message",
                day:day1.toISOString()
            });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain("wrong start parameter");
    });


    test('POST /coverage/:role/:username- missing end', async () => {
        const res = await request(app)
            .post('/coverage/tester/test.user@apss.it')
            .send({
                
                start: 0,
                message:"test message",
                day:day1.toISOString()
            });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain("wrong end parameter");
    });
    test('POST /coverage/:role/:username- end<0', async () => {
        const res = await request(app)
            .post('/coverage/tester/test.user@apss.it')
            .send({
                end:-1,
                start: 0,
                message:"test message",
                day:day1.toISOString()
            });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain("wrong end parameter");
    });
    test('POST /coverage/:role/:username- missing end', async () => {
        const res = await request(app)
            .post('/coverage/tester/test.user@apss.it')
            .send({
                end:25,
                start: 0,
                message:"test message",
                day:day1.toISOString()
            });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain("wrong end parameter");
    });

    test('POST /coverage/:role/:username- missing day', async () => {
        const res = await request(app)
            .post('/coverage/tester/test.user@apss.it')
            .send({
                
                start: 0,
                end:12,
                message:"test message"
                
            });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain("missing date");
    });

    test('POST /coverage/:role/:username- missing message', async () => {
        const res = await request(app)
            .post('/coverage/tester/test.user@apss.it')
            .send({
                
                start: 0,
                end:12,
                day:day1.toISOString()
                
            });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain("missing message");
    });

    test('POST /coverage/:role/:username- POST a request of an user of a non existing shift(start)', async () => {
        const res = await request(app)
            .post('/coverage/tester/test.user@apss.it')
            .send({
                start:5,
                end:12,
                message:"test message",
                day:day1.toISOString()
            });
        
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toContain("work shift not found");
    });
    test('POST /coverage/:role/:username- POST a request of an user of a non existing shift(end)', async () => {
        const res = await request(app)
            .post('/coverage/tester/test.user@apss.it')
            .send({
                start:0,
                end:15,
                message:"test message",
                day:day1.toISOString()
            });
        
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toContain("work shift not found");
    });
    test('POST /coverage/:role/:username- POST a request of an user of a non existing shift(day)', async () => {
        const res = await request(app)
            .post('/coverage/tester/test.user@apss.it')
            .send({
                start:0,
                end:12,
                message:"test message",
                day:new Date("2025-01-02").toISOString()
            });
        
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toContain("work shift not found");
    });

    test('POST /coverage/:role/:username- already existent request', async () => {
        const res = await request(app)
            .post('/coverage/tester/test.user@apss.it')
            .send({
                start:0,
                end:12,
                message:"test message",
                day:new Date('2024-12-25').toISOString(),
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("coverage request already asked");
    });


    //PUT coverage/:role/:resUsername
    test('PUT /coverage/:role/:resUsername- PUT shift already present cannot cover', async () => {
        const res = await request(app)
            .put('/coverage/tester/test.user3@apss.it')
            .send({
                start:0,
                day:new Date('2024-12-25').toISOString(),
                req_username:username
            });      
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Cannot cover the work shift already working that day at that hour");
    });

    test('PUT /coverage/:role/:resUsername- PUT non existent res user', async () => {
        const res = await request(app)
            .put('/coverage/tester/not-test.user@apss.it')
            .send({
                start:0,
                day:new Date('2024-12-25').toISOString(),
                req_username:username
            });      
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain("res user not found");
    });

    test('PUT /coverage/:role/:resUsername- PUT non existent req user', async () => {
        const res = await request(app)
            .put('/coverage/tester/test.user3@apss.it')
            .send({
                start:0,
                day:new Date('2024-12-25').toISOString(),
                req_username:"not_test_user"
            });      
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain("req user not found");
    });

    test('PUT /coverage/:role/:resUsername- PUT wrong start parameter(missing)', async () => {
        const res = await request(app)
            .put('/coverage/tester/test.user3@apss.it')
            .send({
                
                day:new Date('2024-12-25').toISOString(),
                req_username:"not_test_user"
            });      
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain("wrong start parameter");
    });
    test('PUT /coverage/:role/:resUsername- PUT wrong start parameter(>24)', async () => {
        const res = await request(app)
            .put('/coverage/tester/test.user3@apss.it')
            .send({
                start:25,
                day:new Date('2024-12-25').toISOString(),
                req_username:"not_test_user"
            });      
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain("wrong start parameter");
    });
    test('PUT /coverage/:role/:resUsername- PUT wrong start parameter(<0)', async () => {
        const res = await request(app)
            .put('/coverage/tester/test.user3@apss.it')
            .send({
                start:-1,
                day:new Date('2024-12-25').toISOString(),
                req_username:"not_test_user"
            });      
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain("wrong start parameter");
    });

    test('PUT /coverage/:role/:resUsername- PUT missing date', async () => {
        const res = await request(app)
            .put('/coverage/tester/test.user3@apss.it')
            .send({
                start:0,
                
                req_username:username
            });      
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain("missing date");
    });

    test('PUT /coverage/:role/:resUsername- PUT shift already present cannot cover', async () => {
        const res = await request(app)
            .put('/coverage/tester/test.user3@apss.it')
            .send({
                start:0,
                day:new Date('2024-12-25').toISOString()
            });      
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain("missing request username");
    });

    test('PUT /coverage/:role/:resUsername- PUT request coverage not present', async () => {
        const res = await request(app)
            .put('/coverage/tester/test.user3@apss.it')
            .send({
                start:0,
                day:new Date('2025-09-28').toISOString(),
                req_username:username
            });      
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toContain("coverage request not found or already covered");
    });

    test('PUT /coverage/:role/:resUsername- PUT request coverage already covered', async () => {
        const res = await request(app)
            .put('/coverage/tester/test.user3@apss.it')
            .send({
                start:0,
                day:new Date('2024-09-01').toISOString(),
                req_username:username
            });      
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toContain("coverage request not found or already covered");
    });

    test('PUT /coverage/:role/:resUsername- PUT request coverage successfully covered', async () => {
        const res = await request(app)
            .put('/coverage/tester/test.user2@apss.it')
            .send({
                start:0,
                day:new Date('2024-12-25').toISOString(),
                req_username:username
            });      
        expect(res.statusCode).toBe(200);
        expect(res.body.response).toContain("coverage request accepted");
        let user= await employee.find({work:{$elemMatch :{start:0,end:12,day:new Date('2024-12-25').toISOString()}}},{username:1});
        user=user.map(u => u.username);
        expect(user).toContain(username2);
        expect(user).not.toContain(username);

    });

    //DELETE coverage/:role/:me/:day/:start
    test('PUT coverage/:role/:me/:day/:start- DELETE coverage request deleted', async () => {
        const res = await request(app)
            .delete('/coverage/tester/test.user@apss.it/2024-12-25/0');      
        expect(res.statusCode).toBe(200);
        expect(res.body.response).toContain("coverage request deleted");
        let cov= await coverage.findOne( {role: "tester",req_username:username,day:new Date('2024-12-25').toISOString(),start:0});
        expect(cov).toBe(null);
    });

    test('PUT coverage/:role/:me/:day/:start- DELETE wrong username', async () => {
        const res = await request(app)
            .delete('/coverage/tester/not-test.user@apss.it/2024-12-25/0');      
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain("user not found");
    });

    test('PUT coverage/:role/:me/:day/:start- DELETE non existing coverage ', async () => {
        const res = await request(app)
            .delete('/coverage/tester/test.user@apss.it/2025-12-25/0');      
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toContain("coverage request not found");
    });




});