// routes/ChatBotRoutes.js
const express = require('express');
const router = express.Router();
const ChatBotController = require('../controllers/ChatBotController');
const multer = require('multer');
const path = require('path');

// Cấu hình multer cho upload hình ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/temp/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload hình ảnh (JPEG, PNG, GIF, WebP)'));
    }
  }
});

// [POST] /api/chatbot/natural-query - Xử lý câu hỏi tự nhiên
router.post('/natural-query', ChatBotController.processNaturalLanguageQuery);

// [POST] /api/chatbot/search-by-image - Tìm kiếm theo hình ảnh
router.post('/search-by-image', upload.single('image'), ChatBotController.searchByImage);

module.exports = router;
