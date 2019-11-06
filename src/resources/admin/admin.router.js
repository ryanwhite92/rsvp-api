import { Rotuer } from 'express';
import { signin } from './admin.controller';

const router = Router();

router.route('/').post(signin);
