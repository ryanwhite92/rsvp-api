import mongoose from 'mongoose';
import config from './src/config';
import { connect } from './src/utils/db';
import { Admin } from './src/resources/admin/admin.model';
import { Guest } from './src/resources/guest/guest.model';

const models = { Admin, Guest };

const dbUser = encodeURIComponent(config.DB_USER);
const dbPwd = encodeURIComponent(config.DB_PWD);
const dbUrl = `mongodb://${dbUser}:${dbPwd}@${config.DB_HOST}:${config.DB_PORT}/${config.TEST_DB_NAME}?authSource=admin`;

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
      await connect(dbUrl);
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
  await mongoose.connections[0].db.dropDatabase();
});
afterAll(async () => {
  await Promise.all(
    mongoose.connections.map(connection => connection.db.dropDatabase())
  );
  await mongoose.disconnect();
});
