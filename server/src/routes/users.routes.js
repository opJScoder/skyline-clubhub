import {Router} from 'express';
import {auth} from '../middleware/auth.js';
import {STAFF} from '../utils/helpers.js';
import * as c from '../controllers/users.controller.js';

const router=Router();
router.get('/users',auth(...STAFF),c.getUsers);
router.put('/users/:id/role',auth('admin'),c.putUsersIdRole);
router.delete('/users/:id',auth('admin'),c.deleteUsersId);
export default router;
