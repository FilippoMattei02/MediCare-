const request = require('supertest');
const express = require('express');
const router = require('./calendar'); // Assicurati di importare il router corretto
const app = express();

// Mocka il modello Employee se necessario
jest.mock('./models/employee');

describe('Shifts API', () => {
  beforeAll(() => {
    app.use(express.json());
    app.use('/calendar', router); // Usa il router nel tuo server Express
  });

  it('should return work shifts for each employee of a determined role', async () => {
    const mockUsername = 'Andrea.Rossi@apss.it';
    const mockTasks = [
            {
              _id: "6672b2ed94dd1a79312336c3",
              day: "2024-05-05T22:00:00.000Z",
              end: 17,
              start: 9
            }
      ];
      console.log(mockUsername);
    const response = await request(app)
      .get(`/calendar/${mockUsername}`)
      .expect(200);

    // Verifica che la risposta contenga i dati di Andrea Rossi
    expect(response.body).toEqual(mockTasks);
  });

  it('should return 404 if no tasks are found for the username', async () => {
    const nonexistentUsername = 'nonexistentuser';

    const response = await request(app)
      .get(`/calendar/${nonexistentUsername}`)
      .expect(404);

    expect(response.text).toBe('Nessun task trovato');
  });

  afterAll(() => {
    jest.restoreAllMocks(); // Ripristina tutti i mock dopo ogni test
  });
});