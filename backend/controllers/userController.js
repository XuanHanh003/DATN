const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;


class UserController {
static async register(req, res) {
try {
const { email, password } = req.body;
if (!email || !password) return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });

const exists = await User.findByEmail(email);
if (exists) return res.status(400).json({ message: 'Email đã tồn tại' });

await User.create({ email, password });

const user = await User.findByEmail(email);
const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
res.status(201).json({ token, user: { id: user.userId, email: user.email } });
} catch (error) {
console.error('Đăng ký lỗi:', error);
res.status(500).json({ message: 'Lỗi server khi đăng ký' });
}
}


static async login(req, res) {
try {
const { email, password } = req.body;
if (!email || !password) return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });

const user = await User.findByEmail(email);
if (!user) return res.status(401).json({ message: 'Thông tin đăng nhập không hợp lệ' });

const ok = await User.comparePassword(password, user.password);
if (!ok) return res.status(401).json({ message: 'Thông tin đăng nhập không hợp lệ' });

const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
res.json({ token, user: { id: user.userId, email: user.email } });
} catch (error) {
console.error('Đăng nhập lỗi:', error);
res.status(500).json({ message: 'Lỗi server khi đăng nhập' });
}
}


static async getMe(req, res) {
try {
const me = await User.findById(req.user.userId);
if (!me) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
const { password, ...userWithoutPassword } = me;
res.json(userWithoutPassword);
} catch (error) {
res.status(500).json({ message: 'Lỗi server khi lấy thông tin' });
}
}


static async changePassword(req, res) {
try {
const { oldPassword, newPassword } = req.body;
const user = await User.findById(req.user.userId);
if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

const ok = await User.comparePassword(oldPassword, user.password);
if (!ok) return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });

await User.updatePassword(req.user.userId, newPassword);
res.json({ message: 'Đổi mật khẩu thành công' });
} catch (error) {
res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu' });
}
}


static async getName(req, res) {
try {
const { userId } = req.params;
const user = await User.findById(userId);
if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });
const username = user.username && user.username.trim() !== '' ? user.username : 'Ẩn danh';
res.json({ username });
} catch (error) {
res.status(500).json({ message: 'Lỗi hệ thống khi lấy tên người dùng' });
}
}
}
module.exports = UserController;