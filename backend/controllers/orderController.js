const db = require('../models');
const Order = db.Order;
const OrderItem = db.OrderItem;
const Product = db.Product;
const User = db.User;

class OrderController {
  // [GET] /api/orders/me
  static async getUserOrders(req, res) {
    try {
      const userId = req.user.userId;
      const orders = await Order.getByUser(userId);
      if (!orders.length)
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng nào' });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  // [GET] /api/orders
  static async getOrders(req, res) {
    try {
      const orders = await Order.getAll();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  // [POST] /api/orders
  static async createOrder(req, res) {
    try {
      const userId = req.user.userId;
      const { items, totalPrice, transactionId, address } = req.body;

      if (!Array.isArray(items) || !items.length)
        return res.status(400).json({ message: 'Danh sách sản phẩm không hợp lệ' });
      if (!totalPrice || isNaN(totalPrice) || totalPrice <= 0)
        return res.status(400).json({ message: 'Tổng tiền không hợp lệ' });
      if (!address || !address.fullName || !address.phone || !address.address)
        return res.status(400).json({ message: 'Địa chỉ giao hàng không đầy đủ' });

      const orderId = await Order.create({
        userId,
        totalPrice,
        transactionId,
        address: JSON.stringify(address),
        items,
        status: 'Pending'
      });

      res.status(201).json({ message: 'Tạo đơn hàng thành công', orderId });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  // [DELETE] /api/orders/:id
  static async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const order = await Order.getById(id);
      if (!order)
        return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
      
      if (order.userId !== userId)
        return res.status(403).json({ message: 'Bạn không có quyền xóa đơn hàng này' });

      await Order.deleteById(id);
      res.json({ message: 'Đơn hàng đã bị xóa' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  // [PATCH] /api/orders/:id/status
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await Order.getById(id);
      if (!order)
        return res.status(404).json({ message: 'Đơn hàng không tồn tại' });

      if (order.userId !== req.user.userId && req.user.role !== 'admin')
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật đơn hàng này' });

      await Order.updateStatus(id, status);
      const updatedOrder = await Order.getById(id);
      res.json({ message: 'Cập nhật trạng thái thành công', order: updatedOrder });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  // [GET] /api/orders/transaction/:transactionNo
  static async getOrderByTransaction(req, res) {
    try {
      const transactionId = req.params.transactionNo;
      const order = await Order.getByTransactionId(transactionId);
      if (!order)
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng với mã giao dịch này' });

      const items = await OrderItem.getItems(order.orderId);
      const formatted = {
        items: items.map(oi => ({
          productId: oi.productId,
          quantity: oi.quantity,
          price: oi.price,
          size: oi.size,
          color: oi.color,
        })),
        total: order.totalPrice,
        address: JSON.parse(order.address || '{}'),
        transactionId: order.transactionId,
      };
      res.json(formatted);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  // [GET] /api/orders/revenue?groupBy=day|month
  static async getRevenue(req, res) {
    try {
      const { startDate, endDate, groupBy } = req.query;
      const start = startDate || '2025-01-01';
      const end = endDate || new Date().toISOString().slice(0, 10);
      const formatStr = groupBy === 'day' ? "'yyyy-MM-dd'" : "'yyyy-MM'";
      
      const sql = `
        SELECT 
          FORMAT(createdAt, ${formatStr}) AS date,
          SUM(totalPrice) AS totalRevenue,
          COUNT(*) AS orderCount
        FROM Orders
        WHERE status = 'Delivered'
          AND createdAt BETWEEN '${start}' AND DATEADD(day, 1, '${end}')
        GROUP BY FORMAT(createdAt, ${formatStr})
        ORDER BY date ASC
      `;
      
      const result = await db.sql.query(sql);
      res.json({ revenue: result.recordset });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }
}

module.exports = OrderController;
