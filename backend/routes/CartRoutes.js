const express = require('express');
const CartController = require('../controllers/CartController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, CartController.getCart);
router.post('/add', protect, CartController.addToCart);
router.post('/increase/:productId', protect, CartController.increaseQuantity);
router.post('/decrease/:productId', protect, CartController.decreaseQuantity);
router.delete('/:productId', protect, CartController.removeFromCart);

module.exports = router;
