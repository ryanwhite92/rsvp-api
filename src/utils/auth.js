import config from '../config';
import jwt from 'jsonwebtoken';
import rateLimiter from '../utils/rateLimiter';
import { Guest } from '../resources/guest/guest.model';
import { Admin } from '../resources/admin/admin.model';

export const newToken = user => {
  return jwt.sign(user, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRY
  });
};

export const verifyToken = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.JWT_SECRET, (err, payload) => {
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

  const ipAddr = req.ip;
  const username = model.modelName == 'admin' ? query.email : query._id;
  const usernameIPkey = rateLimiter.getUsernameIPkey(username, ipAddr);
  const [resUsernameAndIP, resSlowByIP] = await Promise.all([
    rateLimiter.consecutiveFailsByUsernameAndIP.get(usernameIPkey),
    rateLimiter.slowBruteByIP.get(ipAddr)
  ]);

  let retrySecs = 0;
  // check if IP or username + IP are already blocked
  if (
    resSlowByIP !== null &&
    resSlowByIP.consumedPoints > rateLimiter.maxWrongAttemptsByIPperDay
  ) {
    retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
  } else if (
    resUsernameAndIP !== null &&
    resUsernameAndIP.consumedPoints >
      rateLimiter.maxConsecutiveFailsByUsernameAndIP
  ) {
    retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
  }

  if (retrySecs > 0) {
    res.set('Retry-After', String(retrySecs));
    res.status(429).json({ message: 'Too many requests' });
  } else {
    try {
      const selectFields = Object.keys(query).join(' ');
      const user = await model
        .findOne(query)
        .select(`${selectFields} password`)
        .exec();

      const passwordMatch = user ? await user.checkPassword(password) : false;
      if (!user || !passwordMatch) {
        try {
          const promises = [rateLimiter.slowBruteByIP.consume(ipAddr)];
          // Count failed attempts by username + IP if user exists
          if (user) {
            promises.push(
              rateLimiter.consecutiveFailsByUsernameAndIP.consume(usernameIPkey)
            );
          }

          await Promise.all(promises);
          return res.status(401).json({ message: invalidMessage });
        } catch (rlRejected) {
          if (rlRejected instanceof Error) {
            throw rlRejected;
          } else {
            res.set(
              'Retry-After',
              String(Math.round(rlRejected.msBeforeNext / 1000)) || 1
            );
            return res.status(429).json({ message: 'Too many requests' });
          }
        }
      }

      // reset on successful authorization
      if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
        await rateLimiter.consecutiveFailsByUsernameAndIP.delete(usernameIPkey);
      }

      const token = newToken(user.toJSON());
      return res.status(201).json({ token });
    } catch (e) {
      console.error(e);
      return res.status(500).end();
    }
  }
};

// Admin signup
export const signup = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const admin = await Admin.create({ email, password });

    if (!admin) {
      return res.status(400).end();
    }

    const token = newToken(admin.toJSON());
    return res.status(201).json({ token });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};
