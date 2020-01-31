'use strict';

import express from 'express';
import { appSession } from './utils/session';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import csurf from 'csurf';
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

  // Create a (daily) rotating write stream
  const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: path.join(__dirname, '../log')
  });
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  app.use(cors({ origin: 'http://localhost:1234', credentials: true }));
  app.use(morgan('dev'));
}

// Setup express session middleware
appSession(app);

// Setup CSRF protection
app.use(csurf());

// Get CSRF token for signin routes
app.get('/auth-token', (req, res) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  return res.status(200).send();
});

// parses application/json and application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sanitize user input by removing keys that start with reserved mongodb
// operators (`$` or `.`) to attempt preventing malicious input
app.use(mongoSanitize());

app.use('/guest', GuestRouter);
app.use('/admin', AdminRouter);

// CSRF Error handling middleware
app.use((err, req, res, next) => {
  // Go to next middleware if error is not a CSRF token error
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  // Handle CSRF token errors
  return res.status(403).json({ message: 'Invalid token' });
});

// Send 404 if route doesn't exist
app.all('*', (req, res) => res.status(404).json({ message: 'Not found' }));

export const startServer = async () => {
  try {
    await connect();
    ensureAdminExists();
    app.listen(config.PORT, () =>
      console.log(`API listening on ${config.PORT}`)
    );
  } catch (e) {
    console.error(e);
  }
};
