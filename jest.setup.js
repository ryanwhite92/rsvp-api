import mongoose from 'mongoose';
import { connect } from './src/utils/db';
import { Admin } from './src/resources/admin/admin.model';
import { Guest } from './src/resources/guest/guest.model';

const models = { Admin, Guest };

const url = process.env.DB_URL;

const remove = collection => {
  return new Promise((resolve, reject) => {
    collection.remove(err => {
      if (err) reject(err);
      resolve();
    });
  });
};

const clearDB = () => {
  return Promise.all(
    Object.values(mongoose.connection.collections).map(c => remove(c))
  );
};

beforeEach(async () => {
  if (mongoose.connection.readyState == 0) {
    try {
      await connect(url);
      await Promise.all(Object.keys(models).map(name => models[name].init())); // Build model indices
    } catch (e) {
      console.log('connection error');
      console.error(e);
      throw e;
    }
    await clearDB();
  } else {
    await clearDB();
  }
});
afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});
