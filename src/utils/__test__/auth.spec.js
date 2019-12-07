import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import config from '../../config';
import {
  newToken,
  verifyToken,
  protect,
  checkPermissions,
  signin
} from '../auth';
import { Guest } from '../../resources/guest/guest.model';
import { Admin } from '../../resources/admin/admin.model';

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

    test('must be a real user', async () => {
      expect.assertions(2);

      const token = `Bearer ${newToken({ id: mongoose.Types.ObjectId() })}`;
      const req = { headers: { authorization: token } };
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

    test('finds guest from token and passes on', async () => {
      expect.assertions(3);

      const mockGuest = await Guest.create({
        firstName: 'Test First',
        lastName: 'Test Last',
        contact: { method: 'email' }
      });
      const token = `Bearer ${newToken(mockGuest.toJSON())}`;
      const req = { headers: { authorization: token } };
      const next = () => {};

      await protect(req, {}, next);
      expect(`${req.user._id}`).toBe(`${mockGuest._id}`);
      expect(req.user.role).toBe('guest');
      expect(req.user).not.toHaveProperty('password');
    });

    test('finds admin from token and passes on', async () => {
      expect.assertions(3);

      const mockAdmin = await Admin.create({
        email: 'test@email.com',
        password: 'admin'
      });
      const token = `Bearer ${newToken(mockAdmin.toJSON())}`;
      const req = { headers: { authorization: token } };
      const next = () => {};

      await protect(req, {}, next);
      expect(`${req.user._id}`).toBe(`${mockAdmin._id}`);
      expect(req.user.role).toBe('admin');
      expect(req.user).not.toHaveProperty('password');
    });
  });

  describe('checkPermissions', () => {
    test('user must have sufficient permissions', () => {
      const req = { user: { role: 'guest' } };
      const res = {
        status(status) {
          expect(status).toBe(403);
          return this;
        },
        json(result) {
          expect(result).toHaveProperty('message');
        }
      };
      const next = jest.fn();

      checkPermissions(['admin'])(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    test('passes through user with sufficient permissions', () => {
      const req = { user: { role: 'guest' } };
      const next = jest.fn();

      checkPermissions(['guest'])(req, {}, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('signin', () => {
    describe('guest', () => {
      test('guest signin requires id and password', async () => {
        expect.assertions(2);

        const req = { body: {}, params: {} };
        const res = {
          status(status) {
            expect(status).toBe(400);
            return this;
          },
          json(result) {
            expect(result).toHaveProperty('message');
          }
        };

        await signin(Guest)(req, res);
      });
      test('guest must be real', async () => {
        expect.assertions(2);

        const req = {
          body: { password: 'guest' },
          params: { id: mongoose.Types.ObjectId() }
        };
        const res = {
          status(status) {
            expect(status).toBe(401);
            return this;
          },
          json(result) {
            expect(result).toHaveProperty('message');
          }
        };

        await signin(Guest)(req, res);
      });

      test('passwords must match', async () => {
        expect.assertions(2);

        const mockGuest = await Guest.create({
          firstName: 'Test First',
          lastName: 'Test Last',
          contact: { method: 'email' }
        });
        const req = {
          body: { password: 'wrong' },
          params: { id: mockGuest._id }
        };
        const res = {
          status(status) {
            expect(status).toBe(401);
            return this;
          },
          json(result) {
            expect(result).toHaveProperty('message');
          }
        };

        await signin(Guest)(req, res);
      });

      test('creates new token', async () => {
        expect.assertions(2);

        const mockGuest = await Guest.create({
          firstName: 'Test First',
          lastName: 'Test Last',
          contact: { method: 'email' }
        });
        const req = {
          body: { password: config.GUEST_PASSWORD },
          params: { id: mockGuest._id }
        };
        const res = {
          status(status) {
            expect(status).toBe(201);
            return this;
          },
          async json(result) {
            let guest = await verifyToken(result.token);
            guest = await Guest.findById(guest._id)
              .lean()
              .exec();
            expect(`${guest._id}`).toBe(`${mockGuest._id}`);
          }
        };

        await signin(Guest)(req, res);
      });
    });
  });
});
