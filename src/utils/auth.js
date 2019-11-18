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

// Check that user has sufficient permissions to access and modify resources
export const checkPermissions = allowedRoles => (req, res, next) => {
  const { role } = req.user;
  if (!allowedRoles.includes(role)) {
    return res
      .status(403)
      .json({ message: 'Insufficient permissions to access this resource' });
  }

  next();
};

export const signin = model => async (req, res) => {
  let invalidMessage;
  const { password } = req.body;
  const query = {};

  if (model.modelName == 'guest') {
    invalidMessage = 'Invalid id and password';
    query._id = req.params.id;
    if (!query._id || !password) {
      return res.status(400).json({ message: 'Id and password required' });
    }
  }

  if (model.modelName == 'admin') {
    invalidMessage = 'Invalid username and password';
    query.email = req.body.email;
    if (!query.email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
  }

  try {
    const selectFields = Object.keys(query).join(' ');
    const user = await model
      .findOne(query)
      .select(`${selectFields} password`)
      .exec();

    if (!user) {
      return res.status(401).json({ message: invalidMessage });
    }

    const passwordMatch = await user.checkPassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: invalidMessage });
    }

    const token = newToken(user.toJSON());
    return res.status(201).json({ token });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};
