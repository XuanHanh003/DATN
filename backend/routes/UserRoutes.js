const express = require('express');
const UserController = require('../controllers/UserController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/me', protect, UserController.getMe);
router.patch('/change-password', protect, UserController.changePassword);
router.get('/:userId/name', UserController.getName);

module.exports = router;
