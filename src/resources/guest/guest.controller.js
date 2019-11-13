import { Guest } from './guest.model';
import { newToken } from '../../utils/auth';
import { crudControllers } from '../../utils/crud';

export default crudControllers(Guest);

export const signin = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!id || !password) {
    return res.status(400).send({ message: 'ID and password required' });
  }

  const invalidMessage = 'Invalid id and password';
  try {
    const guest = await Guest.findOne({ _id: id })
      .select('password')
      .exec();

    if (!guest) {
      return res.status(401).send({ message: invalidMessage });
    }

    const passwordMatch = await guest.checkPassword(password);
    if (!passwordMatch) {
      return res.status(401).send({ message: invalidMessage });
    }

    const token = newToken(guest.toJSON());
    return res.status(201).send({ token });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};
