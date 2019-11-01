import { Router } from 'express';
import { createGuest } from './guest.controller';

const router = Router();

router.route('/').post(createGuest);

export default router;
