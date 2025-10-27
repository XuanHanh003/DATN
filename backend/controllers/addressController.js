const db = require('../models');
const Address = db.Address;

class AddressController {
  // [POST] /api/address
  static async addAddress(req, res) {
    try {
      const userId = req.user.id;
      const { fullName, phone, province, district, ward, detail } = req.body;

      // Debug incoming payload
      console.log('📬 addAddress payload:', { fullName, phone, province, district, ward, detail });

      if (!fullName || !phone || !province || !district || !ward || !detail)
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin địa chỉ' });

      // Normalize phone: keep digits only
      const normalizedPhone = String(phone).replace(/\D/g, '');
      const phoneRegex = /^0\d{9}$/;
      console.log('📞 normalizedPhone:', normalizedPhone, 'valid:', phoneRegex.test(normalizedPhone));
      if (!phoneRegex.test(normalizedPhone))
        return res.status(400).json({ message: 'Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số' });

      const address = await Address.create({ userId, fullName, phone: normalizedPhone, province, district, ward, detail });
      res.status(201).json({ message: 'Địa chỉ đã được thêm!', address });
    } catch (error) {
      console.error('Lỗi khi thêm địa chỉ:', error);
      res.status(500).json({ message: 'Lỗi server!' });
    }
  }

  // [GET] /api/address
  static async getAddresses(req, res) {
    try {
      const userId = req.user.id;
      const addresses = await Address.getByUser(userId);
      res.json(addresses || []);
    } catch (error) {
      console.error('Lỗi getAddresses:', error);
      res.status(500).json({ message: 'Lỗi server!', error: error.message });
    }
  }

  // [PUT] /api/address/:addressId
  static async updateAddress(req, res) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;
      const { fullName, phone, province, district, ward, detail } = req.body;

      // Debug incoming payload
      console.log('✏️ updateAddress payload:', { addressId, fullName, phone, province, district, ward, detail });

      if (!fullName || !phone || !province || !district || !ward || !detail)
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin địa chỉ' });

      // Normalize phone: keep digits only
      const normalizedPhone = String(phone).replace(/\D/g, '');
      const phoneRegex = /^0\d{9}$/;
      console.log('📞 normalizedPhone(update):', normalizedPhone, 'valid:', phoneRegex.test(normalizedPhone));
      if (!phoneRegex.test(normalizedPhone))
        return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });

      // Update using model method
      await Address.update(addressId, { fullName, phone: normalizedPhone, province, district, ward, detail });
      res.json({ message: 'Địa chỉ đã được cập nhật!' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server!' });
    }
  }

  // [DELETE] /api/address/:addressId
  static async deleteAddress(req, res) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;
      await Address.remove(addressId, userId);
      res.json({ message: 'Địa chỉ đã được xóa!' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server!' });
    }
  }
}

module.exports = AddressController;
