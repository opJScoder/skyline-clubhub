import {Router} from 'express';
import {auth} from '../middleware/auth.js';
import {STAFF} from '../utils/helpers.js';
import * as c from '../controllers/membership.controller.js';

const router=Router();
router.get('/membership/price',c.getMembershipPrice);
router.post('/membership/buy',auth('user'),c.postMembershipBuy);
router.get('/members',auth(...STAFF),c.getMembers);
router.get('/verify/:code',auth(...STAFF),c.getVerifyCode);
export default router;
