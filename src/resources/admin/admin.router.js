import { Router } from 'express';
import { adminSignin } from './admin.controller';

const router = Router();

router.route('/signin').post(adminSignin);

export default router;
