import config from '../config';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import mongoose from 'mongoose';

const MongoStore = connectMongo(session);
const mongoOpts = {
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 100, // Reconnect every 100ms
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
};

const dbUser = encodeURIComponent(config.DB_USER);
const dbPwd = encodeURIComponent(config.DB_PWD);
const dbUrl = `mongodb://${dbUser}:${dbPwd}@${config.DB_HOST}:${config.DB_PORT}/${config.SESSION_DB_NAME}?authSource=admin`;
const connection = mongoose.createConnection(dbUrl, mongoOpts);

const sessionOpts = {
  secret: config.SESSION_SECRET,
  name: 'sessionId',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.ENV == 'production' ? true : false,
    httpOnly: true,
    maxAge: 600000
  },
  store: new MongoStore({
    mongooseConnection: connection
  })
};

export const appSession = app => {
  if (config.ENV == 'production') {
    app.set('trust proxy', 1); // trust first proxy
  }
  app.use(session(sessionOpts));
};
