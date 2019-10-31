'use strict';

import express from 'express';
import config from './config';
import { connect } from './utils/db';

const app = express();

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
