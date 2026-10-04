import {Router} from 'express';
import {auth} from '../middleware/auth.js';
import {STAFF} from '../utils/helpers.js';
import * as c from '../controllers/auth.controller.js';

const router=Router();
router.post('/auth/register',c.postAuthRegister);
router.post('/auth/login',c.postAuthLogin);
router.get('/me',auth(),c.getMe);
export default router;
