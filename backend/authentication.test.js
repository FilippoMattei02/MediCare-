const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const crypto = require('crypto');
const dotenv = require('dotenv');
const User = require('./models/user');
const authRouter = require('./authentication');

dotenv.config();

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

// Mock del modello User
jest.mock('./models/user');

describe('Authentication API', () => {
  const mockUser = {
    email: 'test@example.com',
    password: crypto.createHash('sha256').update('password123').digest('hex')
  };

  beforeAll(() => {
    User.findOne = jest.fn().mockImplementation(({ email }) => {
      if (email === mockUser.email) {
        return Promise.resolve(mockUser);
      }
      return Promise.resolve(null);
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /auth', () => {
    it('should return a JWT token if authentication is successful', async () => {
      const response = await request(app)
        .post('/auth')
        .send({ username: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });

    it('should return 400 if username or password is missing', async () => {
      const response = await request(app)
        .post('/auth')
        .send({ username: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username e password sono richiesti');
    });

    it('should return 401 if authentication fails', async () => {
      const response = await request(app)
        .post('/auth')
        .send({ username: 'test@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Autenticazione fallita');
    });
  });

  describe('POST /auth/tokens', () => {
    it('should return the associated username if token is valid', async () => {
      const token = jwt.sign({ email: mockUser.email }, process.env.SUPER_SECRET, { expiresIn: 86400 });

      const response = await request(app)
        .post('/auth/tokens')
        .send({ token });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(mockUser.email);
    });

    it('should return 400 if token is missing', async () => {
      const response = await request(app)
        .post('/auth/tokens')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Token mancante');
    });

    it('should return 403 if token is invalid', async () => {
      const response = await request(app)
        .post('/auth/tokens')
        .send({ token: 'invalidtoken' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Failed to authenticate token.');
    });
  });
});
