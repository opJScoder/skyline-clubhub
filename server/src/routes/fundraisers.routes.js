import {Router} from 'express';
import {auth} from '../middleware/auth.js';
import {STAFF} from '../utils/helpers.js';
import * as c from '../controllers/fundraisers.controller.js';

const router=Router();
router.get('/fundraisers',auth(),c.getFundraisers);
router.post('/fundraisers',auth(...STAFF),c.postFundraisers);
router.delete('/fundraisers/:id',auth(...STAFF),c.deleteFundraisersId);
router.post('/fundraisers/:id/tasks',auth(...STAFF),c.postFundraisersIdTasks);
router.put('/tasks/:id',auth(),c.putTasksId);
router.delete('/tasks/:id',auth(...STAFF),c.deleteTasksId);
router.post('/fundraisers/:id/raised',auth(...STAFF),c.postFundraisersIdRaised);
export default router;
