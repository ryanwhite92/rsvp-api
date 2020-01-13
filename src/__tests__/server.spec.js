import request from 'supertest';
import { app } from '../server';

describe('API authentication', () => {
  describe('not signed in', () => {
    test('api should be locked down', async () => {
      let response = await request(app).get('/guest');
      expect(response.statusCode).toBe(401);

      response = await request(app).get('/admin');
      expect(response.statusCode).toBe(401);
    });
  });
});
