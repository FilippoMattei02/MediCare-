const request = require('supertest');
const router = require('./calendar');
const app = require('./app');
const Employee = require('./models/employee');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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
    var payload = {email: 'test.test@apss.it'}
    var options = {expiresIn: 86400 }
    let token1 = jwt.sign(payload, process.env.SUPER_SECRET, options);

  beforeAll(async () => {

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
      .expect(200)
      .set({'Authorization': `${token1}`});

    expect(response.body).toEqual(mockTasks);
  });

  test('should return 404 if no tasks are found for the username', async () => {
    const nonexistentUsername = 'nonexistentuser';

    const response = await request(app)
      .get(`/calendar/${nonexistentUsername}`)
      .expect(404)
      .set({'Authorization': `${token1}`});

    expect(response.text).toBe('Nessun task trovato');
  });

  afterAll(async() => {
    //jest.restoreAllMocks();
    await Employee.deleteOne(testEmployee);
  });
});