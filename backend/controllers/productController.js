const db = require('../models');
const Product = db.Product;
const Category = db.Category;
const axios = require('axios');
const { findSimilarProducts } = require('../utils/word2vecSearch');



class ProductController {
  static async searchProductsByEmbedding(req, res) {
    try {
      const { keyword } = req.query;
      if (!keyword) {
        return res.status(400).json({ message: 'Thiếu từ khóa' });
      }
  
      const products = await Product.getAll();
      const results = findSimilarProducts(keyword, products)
        .filter(p => p.similarity > 0.3)
        .slice(0, 20);
  
      res.json({ success: true, results });
    } catch (error) {
      console.error('❌ Lỗi tìm kiếm embedding:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
  // [POST] /api/products
  static async addProduct(req, res) {
    try {
      const { name, description, image, categoryId, prices, attributes, stock } = req.body;
      const embedding = await getEmbeddingFromPython(name || '');
      await Product.create({
        name, description, image, categoryId, prices, attributes, stock, embedding,
      });
      res.status(201).json({ success: true, message: 'Sản phẩm đã được tạo thành công' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [POST] /api/products/bulk
  static async addProductsBulk(req, res) {
    try {
      const items = Array.isArray(req.body) ? req.body : [];
      for (const item of items) {
        const embedding = item.embedding || await getEmbeddingFromPython(item.name || '');
        await Product.create({
          ...item,
          embedding,
        });
      }
      res.status(201).json({ success: true, message: `${items.length} sản phẩm đã được tạo thành công` });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /api/products
  static async getProducts(req, res) {
    try {
      const { categoryId } = req.query;
      let products;
      
      if (categoryId) {
        products = await Product.getByCategory(categoryId);
      } else {
        products = await Product.getAll();
      }
      
      res.json({ success: true, products });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /api/products/:id
  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.getById(id);
      if (!product)
        return res.status(404).json({ message: 'Sản phẩm không tồn tại!' });
      res.json({ success: true, product });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /api/products/category/:category/id/:id
  static async getProductByCategoryAndId(req, res) {
    try {
      const { category, id } = req.params;
      console.log('🔍 Getting product by category and id:', { category, id });
      
      const product = await Product.getById(id);
      console.log('🔍 Product found:', product);
      
      if (!product)
        return res.status(404).json({ message: 'Sản phẩm không tồn tại!' });

      res.json({ success: true, product });
    } catch (error) {
      console.error('❌ Error getting product by category and id:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /api/products/search
  static async searchProducts(req, res) {
    try {
      const { keyword } = req.query;
      if (!keyword)
        return res.status(400).json({ message: 'Từ khoá không được để trống!' });
      const products = await Product.searchByName(keyword);
      res.json({ success: true, products });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /api/products/search-expanded
  static async searchExpandedProducts(req, res) {
    try {
      const { keyword } = req.query;
      if (!keyword)
        return res.status(400).json({ message: 'Từ khoá không được để trống!' });

      const main = await Product.searchByName(keyword);
      const catIds = [...new Set(main.map(p => p.categoryId))];
      
      let related = [];
      for (const catId of catIds) {
        const catProducts = await Product.searchByCategory(catId);
        related = related.concat(catProducts.filter(p => 
          !p.name.toLowerCase().includes(keyword.toLowerCase())
        ));
      }

      const unique = Array.from(new Map([...main, ...related].map(p => [p.productId, p])).values());
      res.json({ success: true, products: unique });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }


  // [PUT] /api/products/:id
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      if (data.name)
        data.embedding = await getEmbeddingFromPython(data.name);

      await Product.update(id, data);
      const updated = await Product.getById(id);
      if (!updated)
        return res.status(404).json({ message: 'Sản phẩm không tồn tại!' });

      res.json({ success: true, product: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [DELETE] /api/products/:id
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Product.deleteById(id);
      if (!deleted)
        return res.status(404).json({ message: 'Sản phẩm không tồn tại!' });

      res.json({ success: true, message: 'Xoá sản phẩm thành công!' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = ProductController;
