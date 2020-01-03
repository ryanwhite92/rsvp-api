import mongoose from 'mongoose';
import config from '../config';

const dbUser = encodeURIComponent(config.DB_USER);
const dbPwd = encodeURIComponent(config.DB_PWD);
const dbUrl = `mongodb://${dbUser}:${dbPwd}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}?authSource=admin`;

export const connect = (url = dbUrl, opts = {}) => {
  return mongoose.connect(url, {
    ...opts,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  });
};
