import {Router} from 'express';
import {auth} from '../middleware/auth.js';
import {STAFF} from '../utils/helpers.js';
import * as c from '../controllers/events.controller.js';

const router=Router();
router.get('/events',c.getEvents);
router.get('/events/all',auth('admin'),c.getEventsAll);
router.post('/events',auth('admin'),c.postEvents);
router.put('/events/:id',auth('admin'),c.putEventsId);
router.delete('/events/:id',auth('admin'),c.deleteEventsId);
router.post('/events/:id/buy',auth('user'),c.postEventsIdBuy);
router.get('/tickets/mine',auth(),c.getTicketsMine);
router.post('/checkin',auth(...STAFF),c.postCheckin);
router.get('/events/:id/report',auth(...STAFF),c.getEventsIdReport);
export default router;
