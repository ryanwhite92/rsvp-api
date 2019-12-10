import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../server';
import { Guest } from '../resources/guest/guest.model';
import { newToken } from '../utils/auth';

describe('API authentication', () => {
  let guest;
  let token;
  beforeEach(async () => {
    guest = await Guest.create({
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

    test('user must have correct permissions to access resource', async () => {
      const jwt = `Bearer ${token}`;
      const results = await Promise.all([
        request(app)
          .get('/guest')
          .set('Authorization', jwt),
        request(app)
          .post('/guest')
          .set('Authorization', jwt),
        request(app)
          .delete('/guest')
          .set('Authorization', jwt),
        request(app)
          .get('/admin')
          .set('Authorization', jwt),
        request(app)
          .get(`/admin/${mongoose.Types.ObjectId()}`)
          .set('Authorization', jwt),
        request(app)
          .post('/admin/signup')
          .set('Authorization', jwt)
      ]);

      results.forEach(res => expect(res.statusCode).toBe(403));
    });

    test('passes with jwt and correct permissions', async () => {
      const jwt = `Bearer ${token}`;
      const results = await Promise.all([
        request(app)
          .get(`/guest/${guest._id}`)
          .set('Authorization', jwt),
        request(app)
          .put(`/guest/${guest._id}`)
          .set('Authorization', jwt)
      ]);

      results.forEach(res => expect(res.statusCode).toBe(200));
    });
  });
});
