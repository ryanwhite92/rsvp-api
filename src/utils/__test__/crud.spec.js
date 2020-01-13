import { getOne, getMany, createOne, updateOne, removeOne } from '../crud';
import { Guest } from '../../resources/guest/guest.model';
import mongoose from 'mongoose';

describe('crud controllers', () => {
  describe('getOne', () => {
    test('finds by userId', async () => {
      expect.assertions(2);

      const mockGuest = await Guest.create({
        firstName: 'Test First',
        lastName: 'Test Last',
        contact: { method: 'email' }
      });

      const req = {
        params: {
          id: mockGuest.userId
        }
      };

      const res = {
        status(status) {
          expect(status).toBe(200);
          return this;
        },
        json(result) {
          expect(`${result.data.userId}`).toBe(`${mockGuest.userId}`);
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

  describe('getMany', () => {
    test('gets all existing docs', async () => {
      expect.assertions(2);

      await Guest.create([
        {
          firstName: 'Test First',
          lastName: 'Test Last',
          contact: { method: 'email' }
        },
        {
          firstName: 'Test',
          lastName: 'Testerson',
          contact: { method: 'email' }
        }
      ]);

      const req = {};
      const res = {
        status(status) {
          expect(status).toBe(200);
          return this;
        },
        json(result) {
          expect(result.data.length).toBe(2);
        }
      };

      await getMany(Guest)(req, res);
    });

    test('404 if no docs exist', async () => {
      expect.assertions(2);

      const req = {};
      const res = {
        status(status) {
          expect(status).toBe(404);
          return this;
        },
        end() {
          expect(true).toBe(true);
        }
      };

      await getMany(Guest)(req, res);
    });
  });

  describe('createOne', () => {
    test('creates a new doc', async () => {
      expect.assertions(3);

      const guest = {
        firstName: 'Test First',
        lastName: 'Test Last'
      };

      const req = {
        body: {
          firstName: 'Test First',
          lastName: 'Test Last',
          contact: { method: 'email' }
        }
      };

      const res = {
        status(status) {
          expect(status).toBe(201);
          return this;
        },
        json(result) {
          expect(result.data.firstName).toBe(guest.firstName);
          expect(result.data.lastName).toBe(guest.lastName);
        }
      };

      await createOne(Guest)(req, res);
    });
  });

  describe('updateOne', () => {
    test('find doc by id to update', async () => {
      expect.assertions(5);

      const mockGuest = await Guest.create({
        firstName: 'Test First',
        lastName: 'Test Last',
        contact: { method: 'email' }
      });

      const update = {
        firstName: 'First',
        lastName: 'Last',
        contact: { method: 'phone' }
      };

      const req = {
        params: {
          id: mockGuest.userId
        },
        body: update
      };

      const res = {
        status(status) {
          expect(status).toBe(200);
          return this;
        },
        json(result) {
          expect(`${result.data.userId}`).toBe(`${mockGuest.userId}`);
          expect(result.data.firstName).toBe(update.firstName);
          expect(result.data.lastName).toBe(update.lastName);
          expect(result.data.contact.method).toBe(update.contact.method);
        }
      };

      await updateOne(Guest)(req, res);
    });

    test('404 if no doc is found', async () => {
      expect.assertions(2);

      const id = mongoose.Types.ObjectId();

      const req = {
        params: { id }
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

      await updateOne(Guest)(req, res);
    });
  });

  describe('removeOne', () => {
    test('find doc by id and remove', async () => {
      expect.assertions(2);

      const mockGuest = await Guest.create({
        firstName: 'Test First',
        lastName: 'Test Last',
        contact: { method: 'email' }
      });

      const req = {
        params: { id: mockGuest.userId }
      };

      const res = {
        status(status) {
          expect(status).toBe(200);
          return this;
        },
        json(result) {
          expect(`${result.data.userId}`).toBe(`${mockGuest.userId}`);
        }
      };

      await removeOne(Guest)(req, res);
    });

    test('404 if no doc is found', async () => {
      expect.assertions(2);

      const id = mongoose.Types.ObjectId();

      const req = {
        params: { id }
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

      await removeOne(Guest)(req, res);
    });
  });
});
