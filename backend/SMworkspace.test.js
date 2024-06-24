const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');
const Workspace = require('./models/shiftWorkspace');
const Employees = require('./models/employee');

const jwt = require('jsonwebtoken');
require('dotenv').config();

describe('WORKSPACE API', () => {
    let connection;
    jest.setTimeout(15000);
  
    let testShiftWorkspace ={
        year: 2024,
        month: 1,
        role: 'tester',
        peopleForShift: 2,
        shiftDuration: 8,
        daysOfWork: [
            {date: '2024-01-01',shift: [{email: 'test.user4@apss.it',start: 9,end: 17},{email: 'test.user5@apss.it',start: 9,end: 17}]},
            {date: '2024-01-02',shift: [{email: 'test.user5@apss.it',start: 8,end: 16}]}
        ]
    };

    let testShiftWorkspace2 = {
        year: 2024,
        month: 2,
        role: 'tester',
        peopleForShift: 1,
        shiftDuration: 12,
        daysOfWork: []
    };

    let testShiftWorkspace3 = {
        year: 2024,
        month: 3,
        role: 'tester',
        peopleForShift: 1,
        shiftDuration: 12,
        daysOfWork: [
            {date: '2024-03-01',shift: [{email: 'test.user6@apss.it',start: 0,end: 12}]},
            {date: '2024-03-02',shift: [{email: 'test.user6@apss.it',start: 0,end: 12}]}
        ]
    };


    let testEmployee = {
        username: 'test.user4@apss.it',
        role: 'tester',
        work: [{ day: new Date('2024-12-25'), start: 0, end: 12 }, { day: new Date('2024-01-09'), start: 0, end: 12 }],
        shiftManager: true
    };
    const testEmployee2 = {
        username: 'test.user5@apss.it',
        role: 'tester',
        work: [{ day: new Date('2024-12-26'), start: 0, end: 12 }],
        shiftManager: false
    };
    let testEmployee3 = {
        username: 'test.user6@apss.it',
        role: 'tester',
        work: [{ day: new Date('2024-03-01'), start: 0, end: 12 }, { day: new Date('2024-03-02'), start: 0, end: 12 }],
        shiftManager: false
    };
    var payload1 = {email: 'test.user4@apss.it'};
    var options = {expiresIn: 86400 };
    let token1 = jwt.sign(payload1, process.env.SUPER_SECRET, options);

    beforeAll(async () => {
        
        jest.unmock('mongoose');
        // connection = await mongoose.connect(process.env.TEST_DB_URL);
        console.log('Database connected!');

        // await mongoose.connection.dropDatabase();

        
        
        await Workspace.deleteMany({role:"tester"});
        
        await Employees.create(testEmployee);
        await Employees.create(testEmployee2);
        await Employees.create(testEmployee3);
       

        await Workspace.create(testShiftWorkspace);
        await Workspace.create(testShiftWorkspace2);
        await Workspace.create(testShiftWorkspace3);
        


    });

    
        
      
        
      

    

    afterAll(async () => {
        
        await Employees.deleteOne({username:"test.user4@apss.it"});
        await Employees.deleteOne({username:"test.user5@apss.it"});
        await Employees.deleteOne({username:"test.user6@apss.it"});
        await Workspace.deleteMany({role:"tester"});

        //await mongoose.connection.close();
        console.log("Database connection closed");
    });

    //GET workspace/:role/:year/:month/shifts
    test('GET workspace/:role/:year/:month/shifts should return shifts for a valid role, year, and month', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 1;

        const res = await request(app)
            .get(`/workspace/${role}/${year}/${month}/shifts`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(200);
        expect(res.body).toContainEqual({ username: 'test.user4@apss.it', work: [{ day: '2024-01-01', start: 9, end: 17 }] });
        
        expect(res.body).toContainEqual({ username: 'test.user5@apss.it', work: [{ day: '2024-01-01', start: 9, end: 17 },{ day: '2024-01-02', start: 8, end: 16 }] });
    });

    test('GET workspace/:role/:year/:month/shifts should return 400 if year is not a positive integer', async () => {
        const role = 'tester';
        const year = -2024;
        const month = 1;

        const res = await request(app)
            .get(`/workspace/${role}/${year}/${month}/shifts`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'Invalid or missing year' });
    });
    test('GET workspace/:role/:year/:month/shifts should return 400 if month is not an integer', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 'June'; 

        const res = await request(app)
            .get(`/workspace/${role}/${year}/${month}/shifts`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'Invalid or missing month' });
    });
    test('GET workspace/:role/:year/:month/shifts should return 400 if role does not exist', async () => {
        const role = 'invalidRole';
        const year = 2024;
        const month = 1;

        const res = await request(app)
            .get(`/workspace/${role}/${year}/${month}/shifts`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'Not a valid role' });
    });
    test('GET workspace/:role/:year/:month/shifts should return 400 if month is not in the range 1-12', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 13; // Month not in range 1-12

        const res = await request(app)
            .get(`/workspace/${role}/${year}/${month}/shifts`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'Invalid or missing month' });
    });
    test('GET workspace/:role/:year/:month/shifts Month not in range 1-12', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 13; 

        const res = await request(app)
            .get(`/workspace/${role}/${year}/${month}/shifts`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'Invalid or missing month' });
    });
    test('GET workspace/:role/:year/:month/shifts Month not in range 1-12', async () => {
        const role = 'tester';
        const year = 2029;
        const month = 10; 

        const res = await request(app)
            .get(`/workspace/${role}/${year}/${month}/shifts`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ error: 'Workspace not found for this month' });
    });
    



    


    //POST  /workspace/:role/:year/:month
    test('POST  /workspace/:role/:year/:month - should return 400 if month is not an integer', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 'June'; // Non-integer month

        const res = await request(app)
            .post(`/workspace/${role}/${year}/${month}`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid month' });
    });

    test('POST  /workspace/:role/:year/:month - should return 400 if month is not in the range 1-12', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 13; // Month not in range 1-12

        const res = await request(app)
            .post(`/workspace/${role}/${year}/${month}`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid month' });
    });
    test('POST  /workspace/:role/:year/:month - should return 400 if year is not an integer', async () => {
        const role = 'tester';
        const year = 'not-a-year'; // Non-integer year
        const month=1;

        const res = await request(app)
            .post(`/workspace/${role}/${year}/${month}`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid year' });
    });

   
    test('POST  /workspace/:role/:year/:month - should return 400 if year is not a positive integer', async () => {
        const role = 'tester';
        const year = -2024; // Non-positive year
        const month=1;

        const res = await request(app)
            .post(`/workspace/${role}/${year}/${month}`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid year' });
    });

 
    test('POST  /workspace/:role/:year/:month - should return 400 if role does not exist', async () => {
        const role = 'invalidRole';
        const year = 2024;
        const month=1;

        const res = await request(app)
            .post(`/workspace/${role}/${year}/${month}`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'not a valid role' });
    });


    test('POST  /workspace/:role/:year/:month - should return 400 and not create duplicate workspace', async () => {
        const role = 'tester';
        const year = 2024;
        const month=1;

        const res = await request(app)
            .post(`/workspace/${role}/${year}/${month}`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(409);
        expect(res.body).toEqual({ error: 'Workspace already exists for this month' });
    });
    test('POST  /workspace/:role/:year/:month - should return 200 and create workspace successfully', async () => {
        const role = 'tester';
        const year = 2020;
        const month=9;

        const res = await request(app)
            .post(`/workspace/${role}/${year}/${month}`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Workspace created successfully!' });
    });




    //PUT  /workspace/:role/:year/:month/shiftType
    
    // Test for non-integer month
    test('PUT  /workspace/:role/:year/:month/shiftType - should return 400 if month is not an integer', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 'June'; // Non-integer month
        const data = {
            peopleForShift: 3,
            shiftDuration: 8
        };

        const res = await request(app)
            .put(`/workspace/${role}/${year}/${month}/shiftType`)
            .send(data) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid month' });
    });

    // Test for month not in range 1-12
    test('PUT  /workspace/:role/:year/:month/shiftType - should return 400 if month is not in the range 1-12', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 13; // Month not in range 1-12
        const data = {
            peopleForShift: 3,
            shiftDuration: 8
        };

        const res = await request(app)
            .put(`/workspace/${role}/${year}/${month}/shiftType`)
            .send(data) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid month' });
    });

    // Test for non-integer year
    test('PUT  /workspace/:role/:year/:month/shiftType - should return 400 if year is not an integer', async () => {
        const role = 'tester';
        const year = 'prova'; // Non-integer year
        const month=1;

        const data = {
            peopleForShift: 3,
            shiftDuration: 8
        };

        const res = await request(app)
            .put(`/workspace/${role}/${year}/${month}/shiftType`)
            .send(data) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid year' });
    });

    // Test for non-positive year
    test('PUT  /workspace/:role/:year/:month/shiftType - should return 400 if year is not a positive integer', async () => {
        const role = 'tester';
        const year = -2024; // Non-positive year
        const month=1;

        const data = {
            peopleForShift: 3,
            shiftDuration: 8
        };

        const res = await request(app)
            .put(`/workspace/${role}/${year}/${month}/shiftType`)
            .send(data) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid year' });
    });



    // Test for missing peopleForShift
    test('PUT  /workspace/:role/:year/:month/shiftType - should return 400 if peopleForShift is missing', async () => {
        const role = 'tester';
        const year = 2024;
        const month=1;
        const data = {
            shiftDuration: 8
        };

        const res = await request(app)
            .put(`/workspace/${role}/${year}/${month}/shiftType`)
            .send(data) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'people for workday not valid or missing' });
    });

    // Test for non-integer peopleForShift
    test('PUT  /workspace/:role/:year/:month/shiftType - should return 400 if peopleForShift is not an integer', async () => {
        const role = 'tester';
        const year = 2024;
        const month=1;
        const data = {
            peopleForShift: 'three', // Non-integer peopleForShift
            shiftDuration: 8
        };

        const res = await request(app)
            .put(`/workspace/${role}/${year}/${month}/shiftType`)
            .send(data) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'people for workday not valid or missing' });
    });

    // Test for negative peopleForShift
    test('PUT  /workspace/:role/:year/:month/shiftType - should return 400 if peopleForShift is not a positive integer', async () => {
        const role = 'tester';
        const year = 2024;
        const month=1;
        const data = {
            peopleForShift: -3, // Negative peopleForShift
            shiftDuration: 8
        };

        const res = await request(app)
            .put(`/workspace/${role}/${year}/${month}/shiftType`)
            .send(data) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'people for workday not valid or missing' });
    });

    // Test for missing shiftDuration
    test('PUT  /workspace/:role/:year/:month/shiftType - should return 400 if shiftDuration is missing', async () => {
        const role = 'tester';
        const year = 2024;
        const month=1;
        const data = {
            peopleForShift: 3
        };

        const res = await request(app)
            .put(`/workspace/${role}/${year}/${month}/shiftType`)
            .send(data) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'shift duration not valid or missing' });
    });

    // Test for non-integer shiftDuration
    test('PUT  /workspace/:role/:year/:month/shiftType - should return 400 if shiftDuration is not an integer', async () => {
        const role = 'tester';
        const year = 2024;
        const month=1;
        const data = {
            peopleForShift: 3,
            shiftDuration: 'eight' // Non-integer shiftDuration
        };

        const res = await request(app)
            .put(`/workspace/${role}/${year}/${month}/shiftType`)
            .send(data) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'shift duration not valid or missing' });
    });

    // Test for shiftDuration not a strictly positive integer
    test('PUT  /workspace/:role/:year/:month/shiftType - should return 400 if shiftDuration is not a strictly positive integer', async () => {
        const role = 'tester';
        const year = 2024;
        const month=1;
        const data = {
            peopleForShift: 3,
            shiftDuration: 0 // Zero shiftDuration
        };

        const res = await request(app)
            .put(`/workspace/${role}/${year}/${month}/shiftType`)
            .send(data) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'shift duration not valid or missing' });
    });

    // Test for shiftDuration not a submultiple of 24
    test('PUT  /workspace/:role/:year/:month/shiftType - should return 400 if shiftDuration is not a submultiple of 24', async () => {
        const role = 'tester';
        const year = 2024;
        const month=1;
        const data = {
            peopleForShift: 3,
            shiftDuration: 7 // Not a submultiple of 24
        };

        const res = await request(app)
            .put(`/workspace/${role}/${year}/${month}/shiftType`)
            .send(data) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'shift duration not valid or missing' });
    });

    // Test for invalid role
    test('PUT  /workspace/:role/:year/:month/shiftType - should return 400 if role does not exist', async () => {
        const role = 'invalidRole';
        const year = 2024;
        const month=1;
        const data = {
            peopleForShift: 3,
            shiftDuration : 8
        };

            const res = await request(app)
                .put(`/workspace/${role}/${year}/${month}/shiftType`)
                .send(data) .set({'Authorization': `${token1}`});
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'not a valid role' });
    });

    
    // Test for insufficient employees for given shift parameters
    test('PUT  /workspace/:role/:year/:month/shiftType - should return 400 if not enough employees for the given shift parameters', async () => {
        // Assuming there are not enough employees available for the test role with the provided shift parameters
        const role = 'tester';
        const year = 2024;
        const month=1;
        const peopleForShift = 5; // Assume there aren't enough employees for this number
        const shiftDuration = 8;

        const res = await request(app)
            .put(`/workspace/${role}/${year}/${month}/shiftType`)
            .send({ peopleForShift, shiftDuration }) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: 'people of this role required for a day of work are not enough: decrease the number of people for shift or increase the shift duration number'
        });
    });

    // Test for successful update of shift type
    test('PUT  /workspace/:role/:year/:month/shiftType - should successfully update shift type for valid inputs', async () => {
        // Assuming we have enough employees and valid input parameters for the test role
        const role = 'tester';
        const year = 2024;
        const month=1;
        const peopleForShift = 1;
        const shiftDuration = 12;

        const res = await request(app)
            .put(`/workspace/${role}/${year}/${month}/shiftType`)
            .send({ peopleForShift, shiftDuration }) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Workspace updated successfully!' });
    });

    // Test for workspace not found
    test('PUT  /workspace/:role/:year/:month/shiftType - should return 404 if workspace is not found for the given month', async () => {
        // Assuming no workspace exists for the specified role, year, and month
        const role = 'tester';
        const year = 2019;
        const month=1;
        const peopleForShift = 1;
        const shiftDuration = 12;

        const res = await request(app)
            .put(`/workspace/${role}/${year}/${month}/shiftType`)
            .send({ peopleForShift, shiftDuration }) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ error: 'Workspace not found for this month' });
    });






    //PUT /workspace/automate/:role/:year/:month/daysOfWork
    
    
    // Test for non-integer month
    test('PUT workspace/automate/:role/:year/:month/daysOfWork - should return 400 if month is not an integer', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 'June'; // Non-integer month

        const res = await request(app)
            .put(`/workspace/automate/${role}/${year}/${month}/daysOfWork`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        
        expect(res.body).toEqual({ error: 'invalid month' });
    });

    // Test for month not in range 1-12
    test('PUT workspace/automate/:role/:year/:month/daysOfWork - should return 400 if month is not in the range 1-12', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 13; // Month not in range 1-12

        const res = await request(app)
            .put(`/workspace/automate/${role}/${year}/${month}/daysOfWork`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid month' });
    });

    // Test for non-integer year
    test('PUT workspace/automate/:role/:year/:month/daysOfWork - should return 400 if year is not an integer', async () => {
        const role = 'tester';
        const year = 'prova'; // Non-integer year
        const month = 1;

        const res = await request(app)
            .put(`/workspace/automate/${role}/${year}/${month}/daysOfWork`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid year' });
    });

    // Test for non-positive year
    test('PUT workspace/automate/:role/:year/:month/daysOfWork - should return 400 if year is not a positive integer', async () => {
        const role = 'tester';
        const year = -2024; // Non-positive year
        const month = 1;

        const res = await request(app)
            .put(`/workspace/automate/${role}/${year}/${month}/daysOfWork`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid year' });
    });


    // Test for invalid role
    test('PUT workspace/automate/:role/:year/:month/daysOfWork - should return 400 if role does not exist', async () => {
        const role = 'invalidRole';
        const year = 2024;
        const month = 1;

        const res = await request(app)
            .put(`/workspace/automate/${role}/${year}/${month}/daysOfWork`) .set({'Authorization': `${token1}`});
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'not a valid role' });
    });

    // Test for successful update of days of work
    test('PUT workspace/automate/:role/:year/:month/daysOfWork - should successfully update days of work for valid inputs', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 2;

        const res = await request(app)
            .put(`/workspace/automate/${role}/${year}/${month}/daysOfWork`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Days of work casually generated and added correctly' });
    });

    // Test for workspace not found
    test('PUT workspace/automate/:role/:year/:month/daysOfWork - should return 404 if workspace is not found for the given month', async () => {
        const role = 'tester';
        const year = 2018;
        const month = 10;



        const res = await request(app)
            .put(`/workspace/automate/${role}/${year}/${month}/daysOfWork`) .set({'Authorization': `${token1}`});
        expect(res.statusCode).toBe(404);
        
        expect(res.body).toEqual({ error: 'Workspace not found for this month' });
    });


    //------------------------------------------------------------------------------------------------------------------------

    //PUT /workspace/employee/:role/:year/:month/work:

    
    test('PUT workspace/employee/:role/:year/:month/work - should return 400 if month is not an integer', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 'June'; // Non-integer month

        const res = await request(app)
            .put(`/workspace/employee/${role}/${year}/${month}/work`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'Invalid or missing month' });
    });

    
    test('PUT workspace/employee/:role/:year/:month/work - should return 400 if month is not in the range 1-12', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 13; // Month not in range 1-12

        const res = await request(app)
            .put(`/workspace/employee/${role}/${year}/${month}/work`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'Invalid or missing month' });
    });

    
    test('PUT workspace/employee/:role/:year/:month/work - should return 400 if year is not an integer', async () => {
        const role = 'tester';
        const year = 'prova'; // Non-integer year
        const month = 1;

        const res = await request(app)
            .put(`/workspace/employee/${role}/${year}/${month}/work`) .set({'Authorization': `${token1}`});
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'Invalid or missing year' });
    });

    
    test('PUT workspace/employee/:role/:year/:month/work - should return 400 if year is not a positive integer', async () => {
        const role = 'tester';
        const year = -2024; // Non-positive year
        const month = 1;

        const res = await request(app)
            .put(`/workspace/employee/${role}/${year}/${month}/work`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'Invalid or missing year' });
    });


    
    test('PUT workspace/employee/:role/:year/:month/work - should return 400 if role does not exist', async () => {
        const role = 'invalidRole';
        const year = 2024;
        const month = 1;

    

        const res = await request(app)
            .put(`/workspace/employee/${role}/${year}/${month}/work`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'Not a valid role' });
    });

    
    test('PUT workspace/employee/:role/:year/:month/work - should return 404 if workspace is not found', async () => {
        const role = 'tester';
        const year = 2090;
        const month = 10;

      

        const res = await request(app)
            .put(`/workspace/employee/${role}/${year}/${month}/work`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ error: 'Workspace not found' });
    });



    test('PUT workspace/employee/:role/:year/:month/work - should successfully update work shifts for valid inputs', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 1;        

        const res = await request(app)
            .put(`/workspace/employee/${role}/${year}/${month}/work`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Work shifts added to employee schedules' });
    });






    //------------------------------------------------------------------------------------------------------------------------
    
    
    // DELETE workspace/employee/:role/:year/:month/work


    // Test for non-integer month
    test('DELETE workspace/employee/:role/:year/:month/work - should return 400 if month is not an integer', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 'June'; // Non-integer month

        const res = await request(app)
            .delete(`/workspace/employee/${role}/${year}/${month}/work`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid month' });
    });

    // Test for month not in range 1-12
    test('DELETE workspace/employee/:role/:year/:month/work - should return 400 if month is not in the range 1-12', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 13; // Month not in range 1-12

        const res = await request(app)
            .delete(`/workspace/employee/${role}/${year}/${month}/work`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid month' });
    });


    // Test for non-integer year
    test('DELETE workspace/employee/:role/:year/:month/work - should return 400 if year is not an integer', async () => {
        const role = 'tester';
        const year = 'prova'; // Non-integer year
        const month = 1;

        const res = await request(app)
            .delete(`/workspace/employee/${role}/${year}/${month}/work`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid year' });
    });

    // Test for non-positive year
    test('DELETE workspace/employee/:role/:year/:month/work - should return 400 if year is not a positive integer', async () => {
        const role = 'tester';
        const year = -2024; // Non-positive year
        const month = 1;

        const res = await request(app)
            .delete(`/workspace/employee/${role}/${year}/${month}/work`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid year' });
    });



    // Test for invalid role
    test('DELETE workspace/employee/:role/:year/:month/work - should return 400 if role is not valid', async () => {
        const role = 'invalidRole';
        const year = 2024;
        const month = 1;

        const res = await request(app)
            .delete(`/workspace/employee/${role}/${year}/${month}/work`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'not a valid role' });
    });

    // Test for workspace not found
    test('DELETE workspace/employee/:role/:year/:month/work - should return 404 if workspace is not found', async () => {
        const role = 'tester';
        const year = 2050;
        const month = 1;

        const res = await request(app)
            .delete(`/workspace/employee/${role}/${year}/${month}/work`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ error: 'Workspace not found' });
    });

    // Test for successfully removing work shifts
    test('DELETE workspace/employee/:role/:year/:month/work - should successfully remove work shifts for valid inputs', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 3;
        
        
        
        const res = await request(app)
            .delete(`/workspace/employee/${role}/${year}/${month}/work`) .set({'Authorization': `${token1}`});
        
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Work shifts removed from employee schedules' });
        
    });

//-------------------------------------------------------------------------------------------
    // DELETE workspace/employee/:role/:year/:month/work



    // Test for non-integer month
    test('DELETE workspace/:role/:year/:month/daysOfWork - should return 400 if month is not an integer', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 'June'; // Non-integer month

        const res = await request(app)
            .delete(`/workspace/${role}/${year}/${month}/daysOfWork`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid month' });
    });

    // Test for month not in range 1-12
    test('DELETE workspace/:role/:year/:month/daysOfWork - should return 400 if month is not in the range 1-12', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 13; // Month not in range 1-12

        const res = await request(app)
            .delete(`/workspace/${role}/${year}/${month}/daysOfWork`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid month' });
    });

    // Test for non-integer year
    test('DELETE workspace/:role/:year/:month/daysOfWork - should return 400 if year is not an integer', async () => {
        const role = 'tester';
        const year = 'prova'; // Non-integer year
        const month = 1;

        const res = await request(app)
            .delete(`/workspace/${role}/${year}/${month}/daysOfWork`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid year' });
    });

    // Test for non-positive year
    test('DELETE workspace/:role/:year/:month/daysOfWork - should return 400 if year is not a positive integer', async () => {
        const role = 'tester';
        const year = -2024; // Non-positive year
        const month = 1;

        const res = await request(app)
            .delete(`/workspace/${role}/${year}/${month}/daysOfWork`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'invalid year' });
    });
    // Test for invalid role
    test('DELETE workspace/:role/:year/:month/daysOfWork - should return 400 if role is not valid', async () => {
        const role = 'invalidRole';
        const year = 2024;
        const month = 1;


        const res = await request(app)
            .delete(`/workspace/${role}/${year}/${month}/daysOfWork`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'not a valid role' });
    });

    // Test for workspace not found
    test('DELETE workspace/:role/:year/:month/daysOfWork - should return 404 if workspace is not found', async () => {
        const role = 'tester';
        const year = 1900;
        const month = 10;

        const res = await request(app)
            .delete(`/workspace/${role}/${year}/${month}/daysOfWork`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ error: 'Workspace not found' });
    });

    // Test for successfully removing days of work
    test('DELETE workspace/:role/:year/:month/daysOfWork - should successfully remove days of work for valid inputs', async () => {
        const role = 'tester';
        const year = 2024;
        const month = 1;
        
        const res = await request(app)
            .delete(`/workspace/${role}/${year}/${month}/daysOfWork`) .set({'Authorization': `${token1}`});

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'days of work removed' });
        let workspace = await Workspace.findOne({ year: year, month: month, role: role });
        expect (workspace.daysOfWork.length==0);
    });




    
    
});
