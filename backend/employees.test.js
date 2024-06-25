const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');
const jwt = require('jsonwebtoken');
const Employee = require('./models/employee');
require('dotenv').config();

describe('Employees API', () => {
    let connection;
    jest.setTimeout(30000);

    const testEmployee = {
        username: 'test.user@apss.it',
        role: 'tester',
        work: [{ day: new Date('2024-12-26T00:00:00.000Z'), start: 9, end: 17 }],
        shiftManager: true
    };
    var payload = {email: 'test.user@apss.it'}
    var options = {expiresIn: 86400 }
    let token1 = jwt.sign(payload, process.env.SUPER_SECRET, options);

    beforeAll(async () => {
        
        jest.unmock('mongoose');
        //connection = await mongoose.connect(process.env.TEST_DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Database connected!');

        
        
        await Employee.create(testEmployee);
    });

    afterAll(async () => {
        // await Employee.deleteMany({role:"tester"});
        await Employee.deleteOne({username:"test.user@apss.it"});
        //await mongoose.connection.close();
        console.log("Database connection closed");
    });

    test('GET /employees/:username - Get an employee by username', async () => {
        const res = await request(app).get('/employees/test.user@apss.it')
            .set({'Authorization': `${token1}`});
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('username', 'test.user@apss.it');
        expect(res.body).toHaveProperty('role', 'tester');
        expect(res.body).toHaveProperty('work');
        expect(res.body.work[0]).toHaveProperty('day', '2024-12-26T00:00:00.000Z');
        expect(res.body.work[0]).toHaveProperty('start', 9);
        expect(res.body.work[0]).toHaveProperty('end', 17);
    });

    test('POST /employees/:username/work - Modify work schedule for an employee', async () => {
        const res = await request(app)
            .post('/employees/test.user@apss.it/work')
            .send({ work: [{ day: '2024-12-26', start: 9, end: 17 }] })
            .set({'Authorization': `${token1}`});
        expect(res.statusCode).toBe(409); 
        expect(res.body).toHaveProperty('error', 'Conflict, duplicate work schedule'); 
    });
    
    test('POST /employees/:username/work/add - Add a new work shift for an employee', async () => {
        const res = await request(app)
            .post('/employees/test.user@apss.it/work/add')
            .send({ day: '2024-12-27', start: 10, end: 18 })
            .set({'Authorization': `${token1}`});
        expect(res.statusCode).toBe(201); 
        expect(res.body).toHaveProperty('message', 'Shift added successfully');
    });
    
    test('DELETE /employees/:username/work - Delete a specific work shift for an employee', async () => {
        await request(app)
            .post('/employees/test.user@apss.it/work/add')
            .send({ day: '2024-12-25', start: 8, end: 16 })
            .set({'Authorization': `${token1}`});
    
        const res = await request(app)
            .delete('/employees/test.user@apss.it/work')
            .send({ day: '2024-12-25', start: 8, end: 16 })
            .set({'Authorization': `${token1}`});
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Shift deleted successfully');
    });
    
    test('GET /employees/:username - Employee not found', async () => {
        const res = await request(app).get('/employees/nonexistentuser')
        .set({'Authorization': `${token1}`});
        expect(res.statusCode).toBe(404); 
        expect(res.body).toHaveProperty('error', 'Employee not found');
    });

    test('POST /employees/:username/work - Work schedule must be an array', async () => {
        const res = await request(app)
            .post('/employees/test.user@apss.it/work')
            .send({ work: { day: '2024-12-26', start: 9, end: 17 } })
            .set({'Authorization': `${token1}`});
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Work schedule must be an array');
    });

    test('POST /employees/:username/work/add - Conflict, duplicate work schedule', async () => {
        await request(app)
            .post('/employees/test.user@apss.it/work/add')
            .send({ day: '2024-12-28', start: 11, end: 19 })
            .set({'Authorization': `${token1}`});

        const res = await request(app)
            .post('/employees/test.user@apss.it/work/add')
            .send({ day: '2024-12-28', start: 11, end: 19 })
            .set({'Authorization': `${token1}`});
        expect(res.statusCode).toBe(409);
        expect(res.body).toHaveProperty('error', 'Conflict, Duplicate work schedule');
    });

    test('DELETE /employees/:username/work - Missing day, start, or end parameters', async () => {
        const res = await request(app)
            .delete('/employees/test.user@apss.it/work')
            .send({ start: 8, end: 16 })
            .set({'Authorization': `${token1}`});
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Day, start, and end are required');
    });

    test('DELETE /employees/:username/work - Shift not found', async () => {
        const res = await request(app)
            .delete('/employees/test.user@apss.it/work')
            .send({ day: '2024-12-29', start: 12, end: 20 })
            .set({'Authorization': `${token1}`});
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Shift not found');
    });

    test('POST /employees/:username/work/listOfShifts - Add multiple work shifts for an employee', async () => {
        const res = await request(app)
            .post('/employees/test.user@apss.it/work/listOfShifts')
            .send([
                { day: '2024-12-30', start: 9, end: 17 },
                { day: '2024-12-31', start: 10, end: 18 }
            ])
            .set({'Authorization': `${token1}`});
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Shift processing complete');
        expect(res.body).toHaveProperty('addedShifts');
        expect(res.body).toHaveProperty('duplicateShifts');
    });
});