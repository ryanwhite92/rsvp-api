import config from '../config';
import jwt from 'jsonwebtoken';

export const newToken = user => {
  return jwt.sign(user, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExp
  });
};
