'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import config from './config';
import { connect } from './utils/db';

const app = express();

// parses application/json and application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => res.send('hello world'));

const startServer = async () => {
  try {
    await connect(config.dbUrl);
    app.listen(config.port, () =>
      console.log(`API listening on http://localhost:${config.port}/`)
    );
  } catch (e) {
    console.error(e);
  }
};
startServer();
