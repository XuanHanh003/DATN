const db = require('../models');
const Attribute = db.Attribute;

class AttributeController {
  // [POST] /api/attributes
  static async addAttribute(req, res) {
    try {
      const { categoryId, name, valueType } = req.body;
      const attribute = await Attribute.create({ categoryId, name, valueType });
      res.status(201).json({ success: true, attribute });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /api/attributes
  static async getAttributes(req, res) {
    try {
      const { categoryId } = req.query;
      const where = categoryId ? { categoryId } : undefined;
      const attributes = await Attribute.findAll({ where });
      res.json({ success: true, attributes });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /api/attributes/:id
  static async getAttributeById(req, res) {
    try {
      const { id } = req.params;
      const attribute = await Attribute.findByPk(id);
      if (!attribute)
        return res.status(404).json({ message: 'Thuộc tính không tồn tại!' });
      res.json({ success: true, attribute });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [PUT] /api/attributes/:id
  static async updateAttribute(req, res) {
    try {
      const { id } = req.params;
      const [count] = await Attribute.update(req.body, { where: { id } });
      if (!count)
        return res.status(404).json({ message: 'Thuộc tính không tồn tại!' });

      const updated = await Attribute.findByPk(id);
      res.json({ success: true, attribute: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [DELETE] /api/attributes/:id
  static async deleteAttribute(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Attribute.destroy({ where: { id } });
      if (!deleted)
        return res.status(404).json({ message: 'Thuộc tính không tồn tại!' });

      res.json({ success: true, message: 'Xoá thuộc tính thành công!' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = AttributeController;
