import controllers from '../guest.controller';
import mongoose from 'mongoose';
import { Guest } from '../guest.model';

const isFunction = f => typeof f == 'function';

describe('guest controllers', () => {
  test('has crud controllers', () => {
    const crudMethods = [
      'getOne',
      'getMany',
      'createOne',
      'updateOne',
      'removeOne'
    ];

    crudMethods.forEach(name =>
      expect(isFunction(controllers[name])).toBe(true)
    );
  });

  test('has signin controller', () => {
    expect(isFunction(controllers.signin)).toBe(true);
  });

  test('has updateRsvp controller', () => {
    expect(isFunction(controllers.updateRsvp)).toBe(true);
  });

  describe('updateRsvp controller', () => {
    test('update rsvp status to true', async () => {
      expect.assertions(3);

      const mockGuest = await Guest.create({
        firstName: 'Test First',
        lastName: 'Test Last',
        contact: { method: 'email' }
      });

      const req = {
        params: { id: mockGuest._id },
        body: { rsvpStatus: true }
      };

      const res = {
        status(status) {
          expect(status).toBe(200);
          return this;
        },
        json(result) {
          expect(`${result.data._id}`).toBe(`${mockGuest._id}`);
          expect(result.data.rsvpStatus).toBe(true);
        }
      };

      await controllers.updateRsvp(req, res);
    });

    test('update own and plus one rsvp status', async () => {
      expect.assertions(4);

      const mockGuest = await Guest.create({
        firstName: 'Test First',
        lastName: 'Test Last',
        plusOnes: [{ name: 'Plus One' }, { name: 'Plus Two' }],
        contact: { method: 'email' }
      });

      const req = {
        params: { id: mockGuest._id },
        body: {
          rsvpStatus: true,
          plusOnes: [
            { name: 'Plus One', rsvpStatus: true },
            { name: 'Plus Two', rsvpStatus: false }
          ]
        }
      };

      const expectedResult = [
        { name: 'Plus One', rsvpStatus: true },
        { name: 'Plus Two', rsvpStatus: false }
      ];

      const res = {
        status(status) {
          expect(status).toBe(200);
          return this;
        },
        json(result) {
          expect(`${result.data._id}`).toBe(`${mockGuest._id}`);
          expect(result.data.rsvpStatus).toBe(true);
          expect(result.data.plusOnes).toEqual(
            expect.arrayContaining(expectedResult)
          );
        }
      };

      await controllers.updateRsvp(req, res);
    });

    test('only update existing plus one rsvp status', async () => {
      expect.assertions(4);

      const mockGuest = await Guest.create({
        firstName: 'Test First',
        lastName: 'Test Last',
        plusOnes: [{ name: 'Plus One' }, { name: 'Plus Two' }],
        contact: { method: 'email' }
      });

      const req = {
        params: {
          id: mockGuest._id
        },
        body: {
          rsvpStatus: true,
          plusOnes: [
            { name: 'Plus One', rsvpStatus: true },
            { name: 'Plus Three', rsvpStatus: true }
          ]
        }
      };

      const expectedResult = [
        { name: 'Plus One', rsvpStatus: true },
        { name: 'Plus Two', rsvpStatus: false }
      ];

      const res = {
        status(status) {
          expect(status).toBe(200);
          return this;
        },
        json(result) {
          expect(`${result.data._id}`).toBe(`${mockGuest._id}`);
          expect(result.data.rsvpStatus).toBe(true);
          expect(result.data.plusOnes).toEqual(
            expect.arrayContaining(expectedResult)
          );
        }
      };

      await controllers.updateRsvp(req, res);
    });

    test("404 if guest isn't found (invalid id)", async () => {
      expect.assertions(2);

      const req = {
        params: {
          id: mongoose.Types.ObjectId()
        },
        body: {}
      };

      const res = {
        status(status) {
          expect(status).toBe(404);
          return this;
        },
        end() {
          expect(true).toBe(true);
        }
      };

      await controllers.updateRsvp(req, res);
    });
  });
});
