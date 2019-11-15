import { Router } from 'express';
import { protect } from '../../utils/auth';
import controllers from './guest.controller';

const router = Router();

router.post('/:id/signin', controllers.signin);

// Only allow authorized users to access guest routes
router.use(protect);

router
  .route('/')
  .get(controllers.getMany)
  .post(controllers.createOne);

router
  .route('/:id')
  .get(controllers.getOne)
  .put(controllers.updateOne)
  .delete(controllers.removeOne);

export default router;
