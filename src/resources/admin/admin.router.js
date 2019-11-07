import { Router } from 'express';
import { signin } from './admin.controller';

const router = Router();

router.route('/signin').post(signin);

export default router;
