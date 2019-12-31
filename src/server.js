'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import * as rfs from 'rotating-file-stream';
import config from './config';
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

// parses application/json and application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (config.ENV == 'development') {
  app.use(morgan('dev'));
} else {
  // Create a (daily) rotating write stream
  const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: path.join(__dirname, 'log')
  });
  app.use(morgan('combined', { stream: accessLogStream }));
}

app.use('/guest', GuestRouter);
app.use('/admin', AdminRouter);

// Send 404 if route doesn't exist
app.all('*', (req, res) => res.status(404).json({ message: 'Not found' }));

const startServer = async () => {
  try {
    await connect(config.DB_URL);
    ensureAdminExists();
    app.listen(config.PORT, () =>
      console.log(`API listening on http://localhost:${config.PORT}/`)
    );
  } catch (e) {
    console.error(e);
  }
};
startServer();
