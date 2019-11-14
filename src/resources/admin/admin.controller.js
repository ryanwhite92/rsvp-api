import { signin } from '../../utils/auth';
import { Admin } from './admin.model';

export const adminSignin = signin(Admin);
