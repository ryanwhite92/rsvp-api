import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { newToken, verifyToken, protect } from '../auth';
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

  describe('protect', () => {
    const invalidMessage = 'Missing or invalid token';

    test('looks for bearer token in headers', async () => {
      expect.assertions(2);

      const req = { headers: {} };
      const res = {
        status(status) {
          expect(status).toBe(401);
          return this;
        },
        json(result) {
          expect(result.message).toBe(invalidMessage);
        }
      };

      await protect(req, res);
    });

    test('token must have correct prefix', async () => {
      expect.assertions(2);

      const req = { headers: { authorization: newToken({ id: '123asdf' }) } };
      const res = {
        status(status) {
          expect(status).toBe(401);
          return this;
        },
        json(result) {
          expect(result.message).toBe(invalidMessage);
        }
      };

      await protect(req, res);
    });
  });
});
