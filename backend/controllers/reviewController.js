const db = require('../models');
const Review = db.Review;
const redis = require('redis');
const client = redis.createClient();
client.on('error', err => console.error('Redis error:', err));

class ReviewController {
  // [POST] /api/reviews
  static async createOrUpdateReview(req, res) {
    try {
      const { productId, orderId, rating, comment } = req.body;
      const userId = req.user.id;

      let review = await Review.findOne({ where: { userId, productId, orderId } });

      if (review) {
        review.rating = rating;
        review.comment = comment;
        await review.save();
        client.publish('reviews', JSON.stringify({ action: 'update', review }));
        return res.json({ message: 'Đánh giá đã được cập nhật.', review });
      }

      review = await Review.create({ userId, orderId, productId, rating, comment });
      client.publish('reviews', JSON.stringify({ action: 'create', review }));
      res.status(201).json({ message: 'Đánh giá đã được tạo.', review });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
    }
  }

  // [GET] /api/reviews/order/:orderId/product/:productId
  static async getReviewByOrderAndProduct(req, res) {
    try {
      const { orderId, productId } = req.params;
      const userId = req.user.id;
      const review = await Review.findOne({ where: { orderId, productId, userId } });
      if (!review)
        return res.status(404).json({ message: 'Không tìm thấy đánh giá.' });
      res.json(review);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
    }
  }

  // [GET] /api/reviews/product/:productId
  static async getReviewsByProduct(req, res) {
    try {
      const { productId } = req.params;
      const reviews = await Review.findAll({ where: { productId }, order: [['createdAt', 'DESC']] });
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
    }
  }

  // [DELETE] /api/reviews/:reviewId
  static async deleteReviewById(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;
      const review = await Review.findByPk(reviewId);
      if (!review)
        return res.status(404).json({ message: 'Không tìm thấy đánh giá.' });
      if (review.userId !== userId)
        return res.status(403).json({ message: 'Bạn không có quyền xoá đánh giá này.' });
      await review.destroy();
      res.json({ message: 'Đánh giá đã được xoá.' });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
    }
  }
}

module.exports = ReviewController;
