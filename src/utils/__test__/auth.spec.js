import jwt from 'jsonwebtoken';
import { newToken, verifyToken } from '../auth';
import config from '../../config';

describe('authentication:', () => {
  describe('newToken', () => {
    test('creates new jwt from user', () => {
      const id = 123;
      const token = newToken({ id });
      const user = jwt.verify(token, config.JWT_SECRET);

      expect(user.id).toBe(id);
    });
  });

  describe('verifyToken', () => {
    test('validates jwt and returns payload', async () => {
      const id = 1234;
      const token = jwt.sign({ id }, config.JWT_SECRET);
      const user = await verifyToken(token);

      expect(user.id).toBe(id);
    });
  });
});
