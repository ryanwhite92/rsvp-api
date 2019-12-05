import jwt from 'jsonwebtoken';
import { newToken } from '../auth';
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
});
