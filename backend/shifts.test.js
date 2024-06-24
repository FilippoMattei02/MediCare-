// const request = require('supertest');
// const express = require('express');
// const router = require('./shifts'); // Assicurati di importare il router corretto
// const app = express();

// // Mocka il modello Employee se necessario
// jest.mock('./models/employee');

// describe('Shifts API', () => {
//   beforeAll(() => {
//     app.use(express.json());
//     app.use('/shifts', router); // Usa il router nel tuo server Express
//   });

//   it('should return work shifts for each employee of a determined role', async () => {
//     const mockUsername = 'Andrea.Rossi@apss.it';
//     const mockTasks = [
//         {
//           username: "Andrea.Rossi@apss.it",
//           work: [
//             {
//               _id: "6672b2ed94dd1a79312336c3",
//               day: "2024-03-31T22:00:00.000Z",
//               end: 17,
//               start: 9
//             }
//           ]
//         },
//         {
//           username: "Francesca.Esposito@apss.it",
//           work: [
//             {
//               _id: "6672b2ed94dd1a79312336d2",
//               day: "2024-03-31T22:00:00.000Z",
//               end: 20,
//               start: 12
//             }
//           ]
//         },
//         {
//           username: "Martina.Colombo@apss.it",
//           work: [
//             {
//               _id: "6672b2ed94dd1a79312336e1",
//               day: "2024-03-31T22:00:00.000Z",
//               end: 23,
//               start: 15
//             }
//           ]
//         },
//         {
//           username: "Francesco.Greco@apss.it",
//           work: [
//             {
//               _id: "6672b2ee94dd1a79312336f0",
//               day: "2024-03-31T22:00:00.000Z",
//               end: 2,
//               start: 18
//             }
//           ]
//         }
//       ];

//     const response = await request(app)
//       .get(`/shifts/${mockUsername}`)
//       .expect(200);

//     // Verifica che la risposta contenga i dati di Andrea Rossi
//     expect(response.body).toEqual(mockTasks);
//   });

//   it('should return 404 if no tasks are found for the username', async () => {
//     const nonexistentUsername = 'nonexistentuser';

//     const response = await request(app)
//       .get(`/shifts/${nonexistentUsername}`)
//       .expect(404);

//     expect(response.text).toBe('Nessun task trovato');
//   });

//   afterAll(() => {
//     jest.restoreAllMocks(); // Ripristina tutti i mock dopo ogni test
//   });
// });