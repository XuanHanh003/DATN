const db = require('../models');
const Category = db.Category;

class CategoryController {
  // [POST] /api/categories
  static async addCategory(req, res) {
    try {
      const { name, description, parentId, slug } = req.body;
      await Category.create({
        name,
        description,
        parentId: parentId || null,
        slug,
      });
      res.status(201).json({ success: true, message: 'Danh mục đã được tạo thành công' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /api/categories
  static async getCategories(req, res) {
    try {
      const categories = await Category.getAll();
      res.json({ success: true, categories });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /api/categories/:id
  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.getById(id);
      if (!category)
        return res.status(404).json({ message: 'Danh mục không tồn tại!' });
      res.json({ success: true, category });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [PUT] /api/categories/:id
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      await Category.update(id, req.body);
      const updated = await Category.getById(id);
      if (!updated)
        return res.status(404).json({ message: 'Danh mục không tồn tại!' });

      res.json({ success: true, category: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [DELETE] /api/categories/:id
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Category.deleteById(id);
      if (!deleted)
        return res.status(404).json({ message: 'Danh mục không tồn tại!' });

      res.json({ success: true, message: 'Xoá danh mục thành công!' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = CategoryController;
