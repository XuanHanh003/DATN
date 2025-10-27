const express = require('express');
const OrderController = require('../controllers/OrderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/me', protect, OrderController.getUserOrders);
router.get('/', protect, restrictTo('admin'), OrderController.getOrders);
router.post('/', protect, OrderController.createOrder);
router.delete('/:id', protect, OrderController.deleteOrder);
router.patch('/:id/status', protect, OrderController.updateOrderStatus);
router.get('/transaction/:transactionNo', protect, OrderController.getOrderByTransaction);
router.get('/revenue', protect, restrictTo('admin'), OrderController.getRevenue);

module.exports = router;
