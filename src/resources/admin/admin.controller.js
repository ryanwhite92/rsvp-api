import { Admin } from './admin.model';
import { crudControllers } from '../../utils/crud';
import { signin, signup } from '../../utils/auth';

export default {
  ...crudControllers(Admin),
  signin: signin(Admin),
  signup
};
