import {Router} from 'express';
import {auth} from '../middleware/auth.js';
import {STAFF} from '../utils/helpers.js';
import * as c from '../controllers/finance.controller.js';

const router=Router();
router.post('/expenses',auth(),c.postExpenses);
router.get('/expenses',auth(),c.getExpenses);
router.put('/expenses/:id',auth('treasurer'),c.putExpensesId);
router.post('/ledger',auth('treasurer'),c.postLedger);
router.get('/finance',auth(...STAFF),c.getFinance);
export default router;
