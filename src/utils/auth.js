import rateLimiter from '../utils/rateLimiter';
import { Admin } from '../resources/admin/admin.model';

// Ensure only authenticated users have access to resources
export const authenticate = (req, res, next) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ message: 'Must be signed in to access this resource' });
  }

  next();
};

// Check that user has sufficient permissions to access and modify resources
export const checkPermissions = allowedRoles => (req, res, next) => {
  const { role } = req.session.user;
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
      const user = await model.findOne(query).exec();

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

      req.session.user = user;
      res.cookie('XSRF-TOKEN', req.csrfToken());
      return res.status(201).json({ message: 'Signin successful' });
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

    req.session.user = admin;
    return res.status(201).json({ message: 'Signup successful' });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};
