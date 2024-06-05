const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');
const Workspace = require('./models/testShiftWorkspace');
require('dotenv').config();

describe('Employees API', () => {
    let connection;
  
    

    beforeAll(async () => {
        jest.setTimeout(30000);
        jest.unmock('mongoose');
        connection = await mongoose.connect(process.env.TEST_DB_URL);
        console.log('Database connected!');

        await mongoose.connection.dropDatabase();

        testShiftWorkspace = new Workspace({
            year: 2024,
            month: 6,
            role: 'developer',
            peopleForShift: 2,
            shiftDuration: 8,
            daysOfWork: [
                {date: '2024-06-01',shift: [{email: 'test1@example.com',start: 9,end: 17},{email: 'test2@example.com',start: 9,end: 17}]},
                {date: '2024-06-02',shift: [{email: 'test3@example.com',start: 8,end: 16}]}
            ]
        });
        await testShiftWorkspace.save();
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        console.log("Database connection closed");
    });

    describe('GET /:role/:year/:month/shifts', () => {
        it('should return shifts for a valid role, year, and month', async () => {
            const role = 'developer';
            const year = 2024;
            const month = 6;
    
            const res = await request(app)
                .get(`/workspace/${role}/${year}/${month}/shifts`);
    
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([
                { username: 'test1@example.com', work: [{ day: '2024-06-01', start: 9, end: 17 }] },
                { username: 'test2@example.com', work: [{ day: '2024-06-01', start: 9, end: 17 }] },
                { username: 'test3@example.com', work: [{ day: '2024-06-02', start: 8, end: 16 }] }
            ]);
        });
    
        it('should return 400 if month is missing', async () => {
            const role = 'developer';
            const year = 2024;
    
            const res = await request(app)
                .get(`/workspace/${role}/${year}/shifts`);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'missing month' });
        });
    
        it('should return 400 if year is not a positive integer', async () => {
            const role = 'developer';
            const year = -2024;
            const month = 6;
    
            const res = await request(app)
                .get(`/workspace/${role}/${year}/${month}/shifts`);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'year not a positive integer' });
        });
        // Test for non-integer month
        it('should return 400 if month is not an integer', async () => {
            const role = 'developer';
            const year = 2024;
            const month = 'June'; // Non-integer month

            const res = await request(app)
                .get(`/workspace/${role}/${year}/${month}/shifts`);

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'Month not a integer' });
        });

        // Test for invalid role
        it('should return 400 if role does not exist', async () => {
            const role = 'invalidRole';
            const year = 2024;
            const month = 6;

            const res = await request(app)
                .get(`/workspace/${role}/${year}/${month}/shifts`);

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'not a valid role' });
        });

        // Test for role as array instead of string
        it('should return 400 if role is an array', async () => {
            const role = ['developer']; // Role as array instead of string
            const year = 2024;
            const month = 6;

            const res = await request(app)
                .get(`/workspace/${role}/${year}/${month}/shifts`);

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'role not a string' });
        });

        // Test for missing year
        it('should return 400 if year is missing', async () => {
            const role = 'developer';
            const month = 6;

            const res = await request(app)
                .get(`/workspace/${role}/${month}/shifts`);

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'missing year' });
        });

        // Test for non-positive year
        it('should return 400 if year is not a positive integer', async () => {
            const role = 'developer';
            const year = -2024; // Non-positive year
            const month = 6;

            const res = await request(app)
                .get(`/workspace/${role}/${year}/${month}/shifts`);

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'year not a positive integer' });
        });

        // Test for month not in range 1-12
        it('should return 400 if month is not in the range 1-12', async () => {
            const role = 'developer';
            const year = 2024;
            const month = 13; // Month not in range 1-12

            const res = await request(app)
                .get(`/workspace/${role}/${year}/${month}/shifts`);

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'Month not in the range 1-12' });
        });

    });

    describe('POST /:role/:year/:month', () => {
        // Test for missing month
        it('should return 400 if month is missing', async () => {
            const role = 'developer';
            const year = 2024;
    
            const res = await request(app)
                .post(`/workspace/${role}/${year}`);
    
            expect(res.statusCode).toBe(400 || 404);
            //expect(res.body).toEqual({ error: 'missing month' });
        });
    
        // Test for non-integer month
        it('should return 400 if month is not an integer', async () => {
            const role = 'developer';
            const year = 2024;
            const month = 'June'; // Non-integer month
    
            const res = await request(app)
                .post(`/workspace/${role}/${year}/${month}`);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'Month not a integer' });
        });
    
        // Test for month not in range 1-12
        it('should return 400 if month is not in the range 1-12', async () => {
            const role = 'developer';
            const year = 2024;
            const month = 13; // Month not in range 1-12
    
            const res = await request(app)
                .post(`/workspace/${role}/${year}/${month}`);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'Month not in the range 1-12' });
        });
    
        // Test for missing year
        it('should return 400 if year is missing', async () => {
            const role = 'developer';
            const month = 6;
    
            const res = await request(app)
                .post(`/workspace/${role}/${month}`);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'missing year' });
        });
    
        // Test for non-integer year
        it('should return 400 if year is not an integer', async () => {
            const role = 'developer';
            const year = '2024'; // Non-integer year
            const month = 6;
    
            const res = await request(app)
                .post(`/workspace/${role}/${year}/${month}`);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'year not an integer' });
        });
    
        // Test for non-positive year
        it('should return 400 if year is not a positive integer', async () => {
            const role = 'developer';
            const year = -2024; // Non-positive year
            const month = 6;
    
            const res = await request(app)
                .post(`/workspace/${role}/${year}/${month}`);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'year not a positive integer' });
        });
    
        // Test for missing role
        it('should return 400 if role is missing', async () => {
            const year = 2024;
            const month = 6;
    
            const res = await request(app)
                .post(`/workspace/${year}/${month}`);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'missing role' });
        });
    
        // Test for role as array instead of string
        it('should return 400 if role is an array', async () => {
            const role = ['developer']; // Role as array instead of string
            const year = 2024;
            const month = 6;
    
            const res = await request(app)
                .post(`/workspace/${role}/${year}/${month}`);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'role not a string' });
        });
    
        // Test for invalid role
        it('should return 400 if role does not exist', async () => {
            const role = 'invalidRole';
            const year = 2024;
            const month = 6;
    
            const res = await request(app)
                .post(`/workspace/${role}/${year}/${month}`);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'not a valid role' });
        });
    
        // Test for workspace already exists
        it('should return 409 if workspace already exists for the month', async () => {
            const role = 'developer';
            const year = 2024;
            const month = 6;
    
            // Create a workspace for the same role, year, and month first
            await shiftWorkspace.create({ year, month, role, daysOfWork: [] });
    
            const res = await request(app)
                .post(`/workspace/${role}/${year}/${month}`);
    
            expect(res.statusCode).toBe(409);
            expect(res.body).toEqual({ error: 'Workspace already exists for this month' });
        });
    
        // Test for successful workspace creation
        it('should return 200 and create workspace successfully', async () => {
            const role = 'developer';
            const year = 2024;
            const month = 6;
    
            const res = await request(app)
                .post(`/workspace/${role}/${year}/${month}`);
    
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: 'Workspace created successfully!' });
        });
    });


    describe('PUT /:role/:year/:month/shiftType', () => {
        // Test for missing month
        it('should return 400 if month is missing', async () => {
            const role = 'developer';
            const year = 2024;
            const data = {
                peopleForShift: 3,
                shiftDuration: 8
            };
    
            const res = await request(app)
                .put(`/workspace/${role}/${year}/shiftType`)
                .send(data);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'missing month' });
        });
    
        // Test for non-integer month
        it('should return 400 if month is not an integer', async () => {
            const role = 'developer';
            const year = 2024;
            const month = 'June'; // Non-integer month
            const data = {
                peopleForShift: 3,
                shiftDuration: 8
            };
    
            const res = await request(app)
                .put(`/workspace/${role}/${year}/${month}/shiftType`)
                .send(data);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'Month not a integer' });
        });
    
        // Test for month not in range 1-12
        it('should return 400 if month is not in the range 1-12', async () => {
            const role = 'developer';
            const year = 2024;
            const month = 13; // Month not in range 1-12
            const data = {
                peopleForShift: 3,
                shiftDuration: 8
            };
    
            const res = await request(app)
                .put(`/workspace/${role}/${year}/${month}/shiftType`)
                .send(data);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'Month not in the range 1-12' });
        });
    
        // Test for missing year
        it('should return 400 if year is missing', async () => {
            const role = 'developer';
            const month = 6;
            const data = {
                peopleForShift: 3,
                shiftDuration: 8
            };
    
            const res = await request(app)
                .put(`/workspace/${role}/${month}/shiftType`)
                .send(data);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'missing year' });
        });
    
        // Test for non-integer year
        it('should return 400 if year is not an integer', async () => {
            const role = 'developer';
            const year = '2024'; // Non-integer year
            const month = 6;
            const data = {
                peopleForShift: 3,
                shiftDuration: 8
            };
    
            const res = await request(app)
                .put(`/workspace/${role}/${year}/${month}/shiftType`)
                .send(data);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'year not an integer' });
        });
    
        // Test for non-positive year
        it('should return 400 if year is not a positive integer', async () => {
            const role = 'developer';
            const year = -2024; // Non-positive year
            const month = 6;
            const data = {
                peopleForShift: 3,
                shiftDuration: 8
            };
    
            const res = await request(app)
                .put(`/workspace/${role}/${year}/${month}/shiftType`)
                .send(data);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'year not a positive integer' });
        });
    
        // Test for missing role
        it('should return 400 if role is missing', async () => {
            const year = 2024;
            const month = 6;
            const data = {
                peopleForShift: 3,
                shiftDuration: 8
            };
    
            const res = await request(app)
                .put(`/workspace/${year}/${month}/shiftType`)
                .send(data);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'missing role' });
        });
    
        // Test for role as array instead of string
        it('should return 400 if role is an array', async () => {
            const role = ['developer']; // Role as array instead of string
            const year = 2024;
            const month = 6;
            const data = {
                peopleForShift: 3,
                shiftDuration: 8
            };
    
            const res = await request(app)
                .put(`/workspace/${role}/${year}/${month}/shiftType`)
                .send(data);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'role not a string' });
        });
    
        // Test for missing peopleForShift
        it('should return 400 if peopleForShift is missing', async () => {
            const role = 'developer';
            const year = 2024;
            const month = 6;
            const data = {
                shiftDuration: 8
            };
    
            const res = await request(app)
                .put(`/workspace/${role}/${year}/${month}/shiftType`)
                .send(data);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'missing people for workday' });
        });
    
        // Test for non-integer peopleForShift
        it('should return 400 if peopleForShift is not an integer', async () => {
            const role = 'developer';
            const year = 2024;
            const month = 6;
            const data = {
                peopleForShift: 'three', // Non-integer peopleForShift
                shiftDuration: 8
            };
    
            const res = await request(app)
                .put(`/workspace/${role}/${year}/${month}/shiftType`)
                .send(data);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'people for workday not an integer' });
        });
    
        // Test for negative peopleForShift
        it('should return 400 if peopleForShift is not a positive integer', async () => {
            const role = 'developer';
            const year = 2024;
            const month = 6;
            const data = {
                peopleForShift: -3, // Negative peopleForShift
                shiftDuration: 8
            };
    
            const res = await request(app)
                .put(`/workspace/${role}/${year}/${month}/shiftType`)
                .send(data);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'people for workday not a positive integer' });
        });
    
        // Test for missing shiftDuration
        it('should return 400 if shiftDuration is missing', async () => {
            const role = 'developer';
            const year = 2024;
            const month = 6;
            const data = {
                peopleForShift: 3
            };
    
            const res = await request(app)
                .put(`/workspace/${role}/${year}/${month}/shiftType`)
                .send(data);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'missing shift duration' });
        });
    
        // Test for non-integer shiftDuration
        it('should return 400 if shiftDuration is not an integer', async () => {
            const role = 'developer';
            const year = 2024;
            const month = 6;
            const data = {
                peopleForShift: 3,
                shiftDuration: 'eight' // Non-integer shiftDuration
            };
    
            const res = await request(app)
                .put(`/workspace/${role}/${year}/${month}/shiftType`)
                .send(data);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'shift duration not an integer' });
        });
    
        // Test for shiftDuration not a strictly positive integer
        it('should return 400 if shiftDuration is not a strictly positive integer', async () => {
            const role = 'developer';
            const year = 2024;
            const month = 6;
            const data = {
                peopleForShift: 3,
                shiftDuration: 0 // Zero shiftDuration
            };
    
            const res = await request(app)
                .put(`/workspace/${role}/${year}/${month}/shiftType`)
                .send(data);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'shift duration not a strictly positive integer' });
        });
    
        // Test for shiftDuration not a submultiple of 24
        it('should return 400 if shiftDuration is not a submultiple of 24', async () => {
            const role = 'developer';
            const year = 2024;
            const month = 6;
            const data = {
                peopleForShift: 3,
                shiftDuration: 7 // Not a submultiple of 24
            };
    
            const res = await request(app)
                .put(`/workspace/${role}/${year}/${month}/shiftType`)
                .send(data);
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'shift duration not a submultiple of 24!' });
        });
    
        // Test for invalid role
        it('should return 400 if role does not exist', async () => {
            const role = 'invalidRole';
            const year = 2024;
            const month = 6;
            const data = {
                peopleForShift: 3,
                shiftDuration : 8
            };

                const res = await request(app)
                    .put(`/workspace/${role}/${year}/${month}/shiftType`)
                    .send({ peopleForShift: 3, shiftDuration });
        
                expect(res.statusCode).toBe(400);
                expect(res.body).toEqual({ error: 'not a valid role' });
        });

        
        // Test for insufficient employees for given shift parameters
        it('should return 400 if not enough employees for the given shift parameters', async () => {
            // Assuming there are not enough employees available for the test role with the provided shift parameters
            const role = 'developer';
            const year = 2024;
            const month = 6;
            const peopleForShift = 5; // Assume there aren't enough employees for this number
            const shiftDuration = 8;
    
            const res = await request(app)
                .put(`/workspace/${role}/${year}/${month}/shiftType`)
                .send({ peopleForShift, shiftDuration });
    
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({
                error: 'people of this role required for a day of work are not enough: decrease the number of people for shift or increase the shift duration number'
            });
        });
    
        // Test for successful update of shift type
        it('should successfully update shift type for valid inputs', async () => {
            // Assuming we have enough employees and valid input parameters for the test role
            const role = 'developer';
            const year = 2024;
            const month = 6;
            const peopleForShift = 3;
            const shiftDuration = 8;
    
            const res = await request(app)
                .put(`/workspace/${role}/${year}/${month}/shiftType`)
                .send({ peopleForShift, shiftDuration });
    
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: 'Workspace updated successfully!' });
        });
    
        // Test for workspace not found
        it('should return 404 if workspace is not found for the given month', async () => {
            // Assuming no workspace exists for the specified role, year, and month
            const role = 'developer';
            const year = 2024;
            const month = 6;
            const peopleForShift = 3;
            const shiftDuration = 8;
    
            const res = await request(app)
                .put(`/workspace/${role}/${year}/${month}/shiftType`)
                .send({ peopleForShift, shiftDuration });
    
            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual({ error: 'Workspace not found for this month' });
        });
    });
        
        
});

