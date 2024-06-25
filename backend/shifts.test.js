const request = require('supertest');
const express = require('express');
const app = require('./app');
const Employee = require('./models/employee');



describe('Shifts API', () => {
    const testEmployee = {
        username: 'test.test2@apss.it',
        role: 'tester',
        work: [{ 
            _id: "667995b947909adf950c181b",
            day: "2024-03-31T22:00:00.000Z",
            end: 17,
            start: 9 
        }],
        shiftManager: true
    };

    beforeAll(async () => {

        await Employee.create(testEmployee); 
    });

    it('should return work shifts for each employee of a determined role', async () => {
        const mockUsername = 'test.test2@apss.it';
        const mockTasks = [
            {
                username: "test.test2@apss.it",
                work: [
                    {
                        _id: "667995b947909adf950c181b",
                        day: "2024-03-31T22:00:00.000Z",
                        end: 17,
                        start: 9
                    }
                ]
            }
        ];

        const response = await request(app)
            .get(`/shifts/${mockUsername}`)
            .expect(200);

        expect(response.body).toEqual(mockTasks);
    });

    it('should return 404 if no tasks are found for the username', async () => {
        const nonexistentUsername = 'nonexistentuser';

        const response = await request(app)
            .get(`/shifts/${nonexistentUsername}`)
            .expect(404);

        expect(response.text).toBe('Nessun task trovato');
    });

    afterAll(async () => {
        //jest.restoreAllMocks();
        await Employee.deleteOne(testEmployee);
    });
});
