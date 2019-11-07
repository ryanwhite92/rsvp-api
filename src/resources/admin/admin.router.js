import { Router } from 'express';
import { signin, signup } from './admin.controller';

const router = Router();

router.route('/signin').post(signin);
router.route('/signup').post(signup); // remove/make private for prod

export default router;
