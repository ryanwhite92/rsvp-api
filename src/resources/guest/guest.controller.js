import { Guest } from './guest.model';
import { createOne } from '../../utils/crud';

export const createGuest = createOne(Guest);
