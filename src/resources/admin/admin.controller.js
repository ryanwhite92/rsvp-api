import { signin, signup } from '../../utils/auth';
import { Admin } from './admin.model';

export default {
  signin: signin(Admin),
  signup
};
