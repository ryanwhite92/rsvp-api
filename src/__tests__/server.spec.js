import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../server';
import { Guest } from '../resources/guest/guest.model';
import { newToken } from '../utils/auth';

describe('API authentication', () => {
  let token;
  beforeEach(async () => {
    const guest = await Guest.create({
      firstName: 'Test First',
      lastName: 'Test Last',
      contact: { method: 'email' }
    });
    token = newToken(guest.toJSON());
  });

  describe('API auth', () => {
    test('api should be locked down', async () => {
      let response = await request(app).get('/guest');
      expect(response.statusCode).toBe(401);

      response = await request(app).get('/admin');
      expect(response.statusCode).toBe(401);
    });
  });
});
