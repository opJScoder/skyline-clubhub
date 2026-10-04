import {Router} from 'express';
import {auth} from '../middleware/auth.js';
import {STAFF} from '../utils/helpers.js';
import * as c from '../controllers/announcements.controller.js';

const router=Router();
router.get('/announcements',c.getAnnouncements);
router.post('/announcements',auth('admin'),c.postAnnouncements);
router.put('/announcements/:id',auth('admin'),c.putAnnouncementsId);
router.delete('/announcements/:id',auth('admin'),c.deleteAnnouncementsId);
export default router;
