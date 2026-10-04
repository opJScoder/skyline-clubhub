import {Router} from 'express';
import {auth} from '../middleware/auth.js';
import {STAFF} from '../utils/helpers.js';
import * as c from '../controllers/shop.controller.js';

const router=Router();
router.get('/products',c.getProducts);
router.post('/products',auth(...STAFF),c.postProducts);
router.put('/products/:id',auth(...STAFF),c.putProductsId);
router.delete('/products/:id',auth(...STAFF),c.deleteProductsId);
router.post('/orders',auth('user'),c.postOrders);
router.get('/orders/mine',auth(),c.getOrdersMine);
router.get('/orders',auth(...STAFF),c.getOrders);
router.put('/orders/:id',auth(...STAFF),c.putOrdersId);
export default router;
