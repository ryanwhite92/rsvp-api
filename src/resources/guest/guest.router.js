import { Router } from 'express';
import { authenticate, checkPermissions } from '../../utils/auth';
import controllers from './guest.controller';

const router = Router();

router.post('/:id/signin', controllers.signin);

// Only allow authorized users to access guest routes
router.use(authenticate);

router
  .route('/')
  .all(checkPermissions(['admin']))
  .get(controllers.getMany)
  .post(controllers.createOne);

router
  .route('/:id')
  .get(checkPermissions(['admin', 'guest']), controllers.getOne)
  .put(checkPermissions(['admin', 'guest']), (req, res) => {
    if (req.session.user.role == 'guest') {
      controllers.updateRsvp(req, res);
    } else if (req.session.user.role == 'admin') {
      controllers.updateOne(req, res);
    }
  })
  .delete(checkPermissions(['admin']), controllers.removeOne);

export default router;
