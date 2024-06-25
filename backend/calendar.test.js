const request = require('supertest');
const express = require('express');
const router = require('./calendar');
const app = express();
const Employee = require('./models/employee');

//let employee=jest.mock('./models/employee');

describe('Shifts API', () => {


    const testEmployee = {
        username: 'test.test@apss.it',
        role: 'tester',
        work: [{ _id: "667995b947909adf950c181c",
            day: "2024-03-31T22:00:00.000Z",
            end: 17,
            start: 9 }],
        shiftManager: true
    };

  beforeAll(async () => {
    app.use(express.json());
    app.use('/calendar', router);

    await Employee.create(testEmployee);
  });

  test('should return work shifts for each employee of a determined role', async () => {
    const mockUsername = 'test.test@apss.it';
    const mockTasks = [
      {
        _id: "667995b947909adf950c181c",
        day: "2024-03-31T22:00:00.000Z",
        end: 17,
        start: 9
      }
    ];

    const response = await request(app)
      .get(`/calendar/${mockUsername}`)
      .expect(200);

    expect(response.body).toEqual(mockTasks);
  });

  test('should return 404 if no tasks are found for the username', async () => {
    const nonexistentUsername = 'nonexistentuser';

    const response = await request(app)
      .get(`/calendar/${nonexistentUsername}`)
      .expect(404);

    expect(response.text).toBe('Nessun task trovato');
  });

  afterAll(async() => {
    //jest.restoreAllMocks();
    await Employee.deleteOne(testEmployee);
  });
});