import { Router } from 'express';
import controllers from './admin.controller';
import { protect, checkPermissions } from '../../utils/auth';

const router = Router();

router.route('/signin').post(controllers.signin);

router.use(protect);

router.route('/signup').post(checkPermissions(['admin']), controllers.signup);

export default router;
