import { getOne, getMany, createOne, updateOne, removeOne } from '../crud';
import { Guest } from '../../resources/guest/guest.model';
import mongoose from 'mongoose';

describe('crud controllers', () => {
  describe('getOne', () => {
    test('finds by id', async () => {
      expect.assertions(2);

      const mockGuest = await Guest.create({
        firstName: 'Test First',
        lastName: 'Test Last',
        contact: { method: 'email' }
      });

      const req = {
        params: {
          id: mockGuest._id
        }
      };

      const res = {
        status(status) {
          expect(status).toBe(200);
          return this;
        },
        json(result) {
          expect(`${result.data._id}`).toBe(`${mockGuest._id}`);
        }
      };

      await getOne(Guest)(req, res);
    });

    test('404 if no guest doc is found', async () => {
      expect.assertions(2);

      const req = {
        params: {
          id: mongoose.Types.ObjectId()
        }
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

      await getOne(Guest)(req, res);
    });
  });
});
