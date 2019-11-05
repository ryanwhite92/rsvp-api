import config from '../config';
import jwt from 'jsonwebtoken';
import { rejects } from 'assert';

export const newToken = user => {
  return jwt.sign(user, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExp
  });
};

export const verifyToken = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (err, payload) => {
      if (err) {
        return reject(err);
      }
      resolve(payload);
    });
  });
};
