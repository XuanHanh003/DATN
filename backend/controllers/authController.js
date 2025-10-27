const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.User;

class AuthController {
  // [POST] /api/auth/register
  static async register(req, res) {
    try {
      const { username, email, phone, password } = req.body;

      // Kiểm tra trùng email
      const existing = await User.findByEmail(email);
      if (existing)
        return res.status(400).json({ message: 'Email đã tồn tại' });

      // Tạo user mới
      await User.create({
        username,
        email,
        phone,
        password,
      });

      // Lấy user vừa tạo
      const user = await User.findByEmail(email);

      // Tạo JWT
      const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(201).json({
        token,
        user: {
          id: user.userId,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error);
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  // [POST] /api/auth/login
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findByEmail(email);
      if (!user)
        return res.status(400).json({ message: 'Email không tồn tại' });

      // Kiểm tra mật khẩu
      const isMatch = await User.comparePassword(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: 'Mật khẩu không đúng' });

      // Tạo JWT token
      const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({
        token,
        user: {
          id: user.userId,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Lỗi khi đăng nhập:', error);
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  // [GET] /api/auth/me
  static async getMe(req, res) {
    try {
      // req.user đã được set từ middleware và đã loại bỏ password
      if (!req.user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
      
      res.json(req.user);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user:', error);
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }
}

module.exports = AuthController;
