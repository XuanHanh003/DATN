const db = require('../models');
const Price = db.Price;

class PriceController {
  // [POST] /api/prices
  static async addPrice(req, res) {
    try {
      const { categoryId, priceByOption } = req.body;
      const price = await Price.create({ categoryId, priceByOption });
      res.status(201).json({ success: true, price });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /api/prices
  static async getPrices(req, res) {
    try {
      const { categoryId } = req.query;
      const where = categoryId ? { categoryId } : undefined;
      const prices = await Price.findAll({ where });
      res.json({ success: true, prices });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /api/prices/:id
  static async getPriceById(req, res) {
    try {
      const { id } = req.params;
      const price = await Price.findByPk(id);
      if (!price)
        return res.status(404).json({ message: 'Bảng giá không tồn tại!' });
      res.json({ success: true, price });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [PUT] /api/prices/:id
  static async updatePrice(req, res) {
    try {
      const { id } = req.params;
      const [count] = await Price.update(req.body, { where: { id } });
      if (!count)
        return res.status(404).json({ message: 'Bảng giá không tồn tại!' });

      const updated = await Price.findByPk(id);
      res.json({ success: true, price: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [DELETE] /api/prices/:id
  static async deletePrice(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Price.destroy({ where: { id } });
      if (!deleted)
        return res.status(404).json({ message: 'Bảng giá không tồn tại!' });

      res.json({ success: true, message: 'Xoá bảng giá thành công!' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = PriceController;
