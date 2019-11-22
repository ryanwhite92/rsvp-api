'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import config from './config';
import { connect } from './utils/db';
import { ensureAdminExists } from './utils/init';
import AdminRouter from './resources/admin/admin.router';
import GuestRouter from './resources/guest/guest.router';

const app = express();

// parses application/json and application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/guest', GuestRouter);
app.use('/admin', AdminRouter);

app.get('/', (req, res) => res.send('hello world'));

const startServer = async () => {
  try {
    await connect(config.dbUrl);
    ensureAdminExists(config.envVars);
    app.listen(config.port, () =>
      console.log(`API listening on http://localhost:${config.port}/`)
    );
  } catch (e) {
    console.error(e);
  }
};
startServer();
