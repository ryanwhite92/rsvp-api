import { newToken } from '../../utils/auth';
import { Admin } from './admin.model';

export const signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password required' });
  }

  const invalidMessage = 'Invalid username and password';
  try {
    const admin = await Admin.findOne({ email })
      .select('email password')
      .exec();

    if (!admin) {
      return res.status(401).send({ message: invalidMessage });
    }

    const passwordMatch = await admin.checkPassword(password);
    if (!passwordMatch) {
      return res.status(401).send({ message: invalidMessage });
    }

    const token = newToken(admin.toJSON());
    return res.status(201).send({ token });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};

export const signup = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password required' });
  }

  try {
    const admin = await Admin.create({ email, password });
    console.log('admin', admin);
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
