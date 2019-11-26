import mongoose from 'mongoose';
import options from '../config';

export const connect = (url = options.DB_URL, opts = {}) => {
  return mongoose.connect(url, {
    ...opts,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
  });
};
