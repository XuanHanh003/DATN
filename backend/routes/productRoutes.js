const express = require('express');
const ProductController = require('../controllers/ProductController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', ProductController.getProducts);
router.get('/list', ProductController.getProducts);
router.get('/search', ProductController.searchProducts);
router.get('/search-expanded', ProductController.searchExpandedProducts);
router.get('/search-embedding', ProductController.searchProductsByEmbedding);
router.get('/:id', ProductController.getProductById);
router.get('/:category/:id', ProductController.getProductByCategoryAndId);
router.get('/category/:category/id/:id', ProductController.getProductByCategoryAndId);
router.post('/', protect, restrictTo('admin'), ProductController.addProduct);
router.post('/bulk', protect, restrictTo('admin'), ProductController.addProductsBulk);
router.put('/:id', protect, restrictTo('admin'), ProductController.updateProduct);
router.delete('/:id', protect, restrictTo('admin'), ProductController.deleteProduct);

module.exports = router;
