const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');
const Holidays = require('./models/holidays'); 
const Employees = require('./models/employee'); 

require('dotenv').config();



describe('Holiday API', () => {
  let connection;

  const testEmployee = {
    username: 'test.user@apss.it',
    role: 'tester',
    work: [{ day: new Date(), start: 8, end: 16 }],
    shiftManager: true
  };
  const testHoliday = {
    employee: 'test.user@apss.it',
    holidays_list: [new Date('2024-12-25')]
  };

  beforeAll(async () => {
    jest.setTimeout(30000);
    jest.unmock('mongoose')
    console.log('Database connected!');

    await Employees.deleteMany({role:"tester"});
    await Holidays.deleteMany({role:"tester"});

    

    
    await Employees.create(testEmployee);
    await Holidays.create(testHoliday);
  });

  afterAll(async () => {
    await Employees.deleteMany({role:"tester"});
    await Holidays.deleteMany({role:"tester"});
    console.log("Database connection closed");
  });

  test('GET /holiday/:id - Get holidays list for an employee', async () => {
    const res = await request(app).get('/holiday/test.user@apss.it');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('employee', 'test.user@apss.it');
    expect(res.body).toHaveProperty('holidays_list');
    expect(res.body.holidays_list).toContain('2024-12-25');
  });

  test('GET /holiday/:role/:date - Get employees by role and holiday date', async () => {
    const res = await request(app).get('/holiday/tester/2024-12-25'); 
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body[0]).toHaveProperty('Users', 'test.user@apss.it');
  });

  test('POST /holiday/listOfDates/:id - Add a list of holidays for an employee', async () => {
    const res = await request(app)
      .post('/holiday/listOfDates/test.user@apss.it')
      .send({ date: ['2024-12-26'] });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'holiday added');
    expect(res.body.holidays).toContain('2024-12-26');
  });

  test('POST /holiday/:id - Add a holiday for an employee', async () => {
    const res = await request(app)
      .post('/holiday/test.user@apss.it')
      .send({ date: '2024-12-27' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'holiday added');
    expect(res.body.date).toBe('2024-12-27');
  });

  test('DELETE /holiday/:id - Remove a holiday for an employee', async () => {
    const res = await request(app)
      .delete('/holiday/test.user@apss.it')
      .send({ date: '2024-12-25' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'date removed');
    expect(res.body.document).not.toContain('2024-12-25');
  });

  test('GET /holiday/:id - User not found', async () => {// Usa '/holiday' per i percorsi definiti nel router
    const res = await request(app).get('/holiday/nonexistentuser');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'user not found');
  });


  test('POST /holiday/listOfDates/:id - Missing date', async () => {
    const res = await request(app)
      .post('/holiday/listOfDates/test.user@apss.it')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'missing date ');
  });

  test('POST /holiday/:id - Holiday already set', async () => {
    const res = await request(app)
      .post('/holiday/test.user@apss.it')
      .send({ date: '2024-12-26' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'holiday already set');
  });

  test('DELETE /holiday/:id - Date not present', async () => {
    const res = await request(app)
      .delete('/holiday/test.user@apss.it')
      .send({ date: '2024-12-28' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'date not present');
  });

});