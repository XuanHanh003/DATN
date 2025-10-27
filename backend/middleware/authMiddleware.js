// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return res.status(401).json({ message: 'Token không hợp lệ, thiếu giá trị hoặc sai định dạng' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'Không tìm thấy người dùng, token không hợp lệ' });
      }

      // Loại bỏ password khỏi user object và đảm bảo có cả id và userId
      const { password, ...userWithoutPassword } = user;
      req.user = {
        ...userWithoutPassword,
        id: userWithoutPassword.userId, // Thêm id để tương thích
        userId: userWithoutPassword.userId // Giữ nguyên userId
      };

      next();
    } catch (error) {
      console.error('Lỗi xác thực token:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token không hợp lệ (malformed)' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token đã hết hạn' });
      }
      return res.status(401).json({ message: 'Không có quyền truy cập, token không hợp lệ' });
    }
  } else {
    return res.status(401).json({ message: 'Không có quyền truy cập, thiếu token' });
  }
};

const restrictTo = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
    }
    next();
  };
};

module.exports = { protect, restrictTo };