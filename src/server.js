'use strict';

import express from 'express';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import * as rfs from 'rotating-file-stream';
import config from './config';
import mongoSanitize from 'express-mongo-sanitize';
import { connect } from './utils/db';
import { ensureAdminExists } from './utils/init';
import AdminRouter from './resources/admin/admin.router';
import GuestRouter from './resources/guest/guest.router';

export const app = express();

if (config.ENV == 'production') {
  app.use(helmet()); // Set security-related HTTP headers
  app.use(
    cors({
      origin: config.CORS_ALLOWED_ORIGIN
    })
  );
}

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
const appSession = {
  secret: config.SESSION_SECRET,
  name: 'sessionId',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 600000
  },
  store: new MongoStore({
    mongooseConnection: connection
  })
};
if (config.ENV == 'production') {
  app.set('trust proxy', 1); // trust first proxy
  appSession.cookie.secure = true;
}
app.use(session(appSession));

// parses application/json and application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sanitize user input by removing keys that start with reserved mongodb
// operators (`$` or `.`) to attempt preventing malicious input
app.use(mongoSanitize());

if (config.ENV != 'production') {
  app.use(morgan('dev'));
} else {
  // Create a (daily) rotating write stream
  const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: path.join(__dirname, '../log')
  });
  app.use(morgan('combined', { stream: accessLogStream }));
}

app.use('/guest', GuestRouter);
app.use('/admin', AdminRouter);

// Send 404 if route doesn't exist
app.all('*', (req, res) => res.status(404).json({ message: 'Not found' }));

export const startServer = async () => {
  try {
    await connect();
    ensureAdminExists();
    app.listen(config.PORT, () =>
      console.log(`API listening on http://localhost:${config.PORT}/`)
    );
  } catch (e) {
    console.error(e);
  }
};
