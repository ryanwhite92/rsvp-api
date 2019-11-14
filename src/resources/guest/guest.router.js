import { Router } from 'express';
import controllers from './guest.controller';

console.log('CONTROLLERS', controllers);

const router = Router();

router.post('/:id/signin', controllers.signin);

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
