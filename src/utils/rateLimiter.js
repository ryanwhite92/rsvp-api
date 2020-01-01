import { RateLimiterMongo } from 'rate-limiter-flexible';
import mongoose from 'mongoose';
import config from '../config';

const mongoOpts = {
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 100, // Reconnect every 100ms
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
};

const mongoConn = mongoose.createConnection(
  config.RATE_LIMITER_DB_URL,
  mongoOpts
);

const maxWrongAttemptsByIPperDay = 100;
const maxConsecutiveFailsByUsernameAndIP = 10;

const slowBruteByIP = new RateLimiterMongo({
  storeClient: mongoConn,
  keyPrefix: 'login_fail_ip_per_day',
  points: maxWrongAttemptsByIPperDay,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24 //Block for 1 day if 100 wrong attempts per day
});

const consecutiveFailsByUsernameAndIP = new RateLimiterMongo({
  storeClient: mongoConn,
  keyPrefix: 'login_fail_consecutive_username_and_ip',
  points: maxConsecutiveFailsByUsernameAndIP,
  duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
  blockDuration: 60 * 60 // block for 1 hour
});

const getUsernameIPkey = (username = 'guest', ip) => `${username}_${ip}`;

export default {
  maxWrongAttemptsByIPperDay,
  maxConsecutiveFailsByUsernameAndIP,
  slowBruteByIP,
  consecutiveFailsByUsernameAndIP,
  getUsernameIPkey
};
