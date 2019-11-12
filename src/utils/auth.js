import config from '../config';
import jwt from 'jsonwebtoken';
import { Guest } from '../resources/guest/guest.model';
import { Admin } from '../resources/admin/admin.model';

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

export const protect = async (req, res, next) => {
  const invalidMessage = 'Missing or invalid token';
  const bearer = req.headers.authorization;
  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).json({ message: invalidMessage });
  }

  const token = bearer.split('Bearer ')[1];
  try {
    const payload = await verifyToken(token);
    let user = await Guest.findById(payload._id)
      .select('-password')
      .lean()
      .exec();

    if (!user) {
      user = await Admin.findById(payload._id)
        .select('-password')
        .lean()
        .exec();
    }

    if (!user) {
      return res.status(401).json({ message: invalidMessage });
    }

    req.user = user;
  } catch (e) {
    console.error(e);
    return res.status(401).json({ message: invalidMessage });
  }

  next();
};
