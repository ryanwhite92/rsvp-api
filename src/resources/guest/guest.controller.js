import { Guest } from './guest.model';
import { signin } from '../../utils/auth';
import { crudControllers } from '../../utils/crud';

export default {
  ...crudControllers(Guest),
  signin: signin(Guest)
};
