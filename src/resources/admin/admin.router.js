import { Router } from 'express';
import controllers from './admin.controller';
import { protect, checkPermissions } from '../../utils/auth';

const router = Router();

router.post('/signin', controllers.signin);

router.use(protect);

router.post('/signup', checkPermissions(['admin']), controllers.signup);

router
  .route('/')
  .all(checkPermissions(['admin']))
  .get(controllers.getMany);

router
  .route('/:id')
  .all(checkPermissions(['admin']))
  .get(controllers.getOne);

export default router;
