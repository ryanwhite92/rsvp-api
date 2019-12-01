import controllers from '../guest.controller';
import mongoose from 'mongoose';

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
