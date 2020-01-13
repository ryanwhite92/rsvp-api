import mongoose from 'mongoose';
import config from '../../config';
import { authenticate, checkPermissions, signin, signup } from '../auth';
import { Guest } from '../../resources/guest/guest.model';
import { Admin } from '../../resources/admin/admin.model';

describe('authentication:', () => {
  describe('authenticate', () => {
    const invalidMessage = 'Must be signed in to access this resource';

    test('user must be authenticated', async () => {
      expect.assertions(2);

      const req = { session: {} };
      const res = {
        status(status) {
          expect(status).toBe(401);
          return this;
        },
        json(result) {
          expect(result.message).toBe(invalidMessage);
        }
      };

      await authenticate(req, res);
    });

    test('must be a real user', async () => {
      expect.assertions(2);

      const userId = mongoose.Types.ObjectId();
      const req = { session: { user: { userId } } };
      const res = {
        status(status) {
          expect(status).toBe(401);
          return this;
        },
        json(result) {
          expect(result.message).toBe(invalidMessage);
        }
      };

      await authenticate(req, res);
    });

    test('ensures guest session exists and passes through', async () => {
      expect.assertions(1);

      const mockGuest = await Guest.create({
        firstName: 'Test First',
        lastName: 'Test Last',
        contact: { method: 'email' }
      });
      const userId = mockGuest.userId;
      const req = { session: { user: { userId } } };
      const next = () => {};

      await authenticate(req, {}, next);
      expect(`${req.session.user.userId}`).toBe(`${userId}`);
    });

    test('ensures admin session exists and passes through', async () => {
      expect.assertions(1);

      const mockAdmin = await Admin.create({
        email: 'test@email.com',
        password: 'admin'
      });
      const userId = mockAdmin.userId;
      const req = { session: { user: { userId } } };
      const next = () => {};

      await authenticate(req, {}, next);
      expect(`${req.session.user.userId}`).toBe(`${userId}`);
    });
  });

  describe('checkPermissions', () => {
    test('user must have sufficient permissions', () => {
      const req = { session: { user: { role: 'guest' } } };
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
      const req = { session: { user: { role: 'guest' } } };
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
          params: { id: mockGuest.userId }
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

      test('signs in guest', async () => {
        expect.assertions(2);

        const mockGuest = await Guest.create({
          firstName: 'Test First',
          lastName: 'Test Last',
          contact: { method: 'email' }
        });
        const req = {
          body: { password: config.GUEST_PASSWORD },
          params: { id: mockGuest.userId },
          session: {}
        };
        const res = {
          status(status) {
            expect(status).toBe(201);
            return this;
          },
          async json(result) {
            expect(result.message).toBe('Signin successful');
          }
        };

        await signin(Guest)(req, res);
      });
    });

    describe('admin', () => {
      test('admin signin requires email and password', async () => {
        expect.assertions(2);

        const req = { body: {} };
        const res = {
          status(status) {
            expect(status).toBe(400);
            return this;
          },
          json(result) {
            expect(result).toHaveProperty('message');
          }
        };

        await signin(Admin)(req, res);
      });

      test('admin must be real', async () => {
        expect.assertions(2);

        const req = { body: { email: 'admin@email.com', password: 'admin' } };
        const res = {
          status(status) {
            expect(status).toBe(401);
            return this;
          },
          json(result) {
            expect(result).toHaveProperty('message');
          }
        };

        await signin(Admin)(req, res);
      });

      test('passwords must match', async () => {
        expect.assertions(2);

        const mockAdmin = await Admin.create({
          email: 'admin@email.com',
          password: 'admin'
        });
        const req = { body: { email: mockAdmin.email, password: 'wrong' } };
        const res = {
          status(status) {
            expect(status).toBe(401);
            return this;
          },
          json(result) {
            expect(result).toHaveProperty('message');
          }
        };

        await signin(Admin)(req, res);
      });

      test('signs in admin', async () => {
        expect.assertions(2);

        const fields = {
          email: 'admin@email.com',
          password: 'admin'
        };
        const mockAdmin = await Admin.create(fields);
        const req = {
          body: fields,
          session: {}
        };
        const res = {
          status(status) {
            expect(status).toBe(201);
            return this;
          },
          async json(result) {
            expect(result.message).toBe('Signin successful');
          }
        };

        await signin(Admin)(req, res);
      });
    });
  });

  // describe('signup', () => {
  //   test('requires email and password', async () => {
  //     expect.assertions(2);

  //     const req = { body: {} };
  //     const res = {
  //       status(status) {
  //         expect(status).toBe(400);
  //         return this;
  //       },
  //       json(result) {
  //         expect(result).toHaveProperty('message');
  //       }
  //     };

  //     await signup(req, res);
  //   });

  //   test('creates admin and and sends token', async () => {
  //     expect.assertions();

  //     const req = { body: { email: 'admin@email.com', password: 'admin' } };
  //     const res = {
  //       status(status) {
  //         expect(status).toBe(201);
  //         return this;
  //       },
  //       async json(result) {
  //         let user = await verifyToken(result.token);
  //         user = await Admin.findById(user._id)
  //           .lean()
  //           .exec();
  //         expect(user.email).toBe(req.body.email);
  //       }
  //     };

  //     await signup(req, res);
  //   });
  // });
});
