const db = require('../models');
const Cart = db.Cart;
const Product = db.Product;

const isSameAttr = (a = {}, b = {}) => JSON.stringify(a) === JSON.stringify(b);

class CartController {
  // [GET] /api/cart
  static async getCart(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      console.log('🔍 Getting cart for userId:', userId);
      console.log('🔍 req.user:', req.user);
      
      const items = await Cart.getByUser(userId);
      console.log('🔍 Cart items from database:', items);
      console.log('🔍 Number of items:', items.length);
      
      res.json({ userId, items });
    } catch (error) {
      console.error('❌ Lỗi getCart:', error);
      res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng', error: error.message });
    }
  }

  // [POST] /api/cart/add
  static async addToCart(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const { productId, quantity, attributes, name, price, image, categoryName } = req.body;

      if (!productId || !quantity)
        return res.status(400).json({ message: 'Thiếu thông tin sản phẩm' });

      const product = await Product.getById(productId);
      if (!product)
        return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

      await Cart.addItem({
        userId,
        productId,
        quantity,
        price: price || 0,
        attributes: JSON.stringify(attributes || {}),
        image: image || product.image,
        categoryName: categoryName || ''
      });

      const updated = await Cart.getByUser(userId);
      res.json({ userId, items: updated });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi thêm vào giỏ hàng', error: error.message });
    }
  }

  // [POST] /api/cart/:productId/increase
  static async increaseQuantity(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const { productId } = req.params;
      const { attributes } = req.body;

      console.log('Increasing quantity for:', { userId, productId, attributes });

      // Tìm cart item theo productId và attributes
      const items = await Cart.getByUser(userId);
      const item = items.find(i => 
        i.productId == productId && 
        JSON.stringify(JSON.parse(i.attributes || '{}')) === JSON.stringify(attributes || {})
      );
      
      if (!item) {
        return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
      }

      await Cart.updateItem(item.cartItemId, item.quantity + 1);
      const updated = await Cart.getByUser(userId);
      res.json({ userId, items: updated });
    } catch (error) {
      console.error('Lỗi increaseQuantity:', error);
      res.status(500).json({ message: 'Lỗi khi tăng số lượng', error: error.message });
    }
  }

  // [POST] /api/cart/:productId/decrease
  static async decreaseQuantity(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const { productId } = req.params;
      const { attributes } = req.body;

      console.log('Decreasing quantity for:', { userId, productId, attributes });

      // Tìm cart item theo productId và attributes
      const items = await Cart.getByUser(userId);
      const item = items.find(i => 
        i.productId == productId && 
        JSON.stringify(JSON.parse(i.attributes || '{}')) === JSON.stringify(attributes || {})
      );
      
      if (!item) {
        return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
      }

      if (item.quantity > 1) {
        await Cart.updateItem(item.cartItemId, item.quantity - 1);
      } else {
        await Cart.removeItem(item.cartItemId);
      }

      const updated = await Cart.getByUser(userId);
      res.json({ userId, items: updated });
    } catch (error) {
      console.error('Lỗi decreaseQuantity:', error);
      res.status(500).json({ message: 'Lỗi khi giảm số lượng', error: error.message });
    }
  }

  // [DELETE] /api/cart/:productId
  static async removeFromCart(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const { productId } = req.params;
      const { attributes } = req.body;

      console.log('Removing from cart:', { userId, productId, attributes });

      // Tìm cart item theo productId và attributes
      const items = await Cart.getByUser(userId);
      const item = items.find(i => 
        i.productId == productId && 
        JSON.stringify(JSON.parse(i.attributes || '{}')) === JSON.stringify(attributes || {})
      );
      
      if (!item) {
        return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
      }

      await Cart.removeItem(item.cartItemId);
      const updated = await Cart.getByUser(userId);
      res.json({ userId, items: updated });
    } catch (error) {
      console.error('Lỗi removeFromCart:', error);
      res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error: error.message });
    }
  }

  // [POST] /api/cart/remove-items
  static async removeItems(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Danh sách sản phẩm không hợp lệ' });
      }

      const productIds = items.map(item => item.productId);
      await Cart.removeItemsByProductIds(userId, productIds);
      
      const updated = await Cart.getByUser(userId);
      res.json({ userId, items: updated });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa sản phẩm' });
    }
  }

  // [DELETE] /api/cart
  static async clearCart(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      await Cart.clearCart(userId);
      res.json({ message: 'Giỏ hàng đã được xóa' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa giỏ hàng' });
    }
  }
}

module.exports = CartController;
