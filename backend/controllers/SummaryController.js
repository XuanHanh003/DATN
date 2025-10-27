const db = require('../models');
const ProductSummary = db.ProductSummary;
const stopwords = require('stopword');

function preprocess(text) {
  return stopwords.removeStopwords((text || '').toLowerCase().match(/\b[a-zA-Z]+\b/g) || []);
}

class SummaryController {
  // [POST] /api/summary/:productId/review
  static async addReviewAndUpdateSummary(req, res) {
    try {
      const { productId } = req.params;
      const { reviewText } = req.body;

      if (!reviewText || !reviewText.trim())
        return res.status(400).json({ error: 'Review text is required' });

      const tokens = preprocess(reviewText);
      const delta = tokens.reduce((acc, w) => ((acc[w] = (acc[w] || 0) + 1), acc), {});

      let summary = await ProductSummary.findOne({ where: { productId } });

      if (!summary) {
        summary = await ProductSummary.create({
          productId,
          summary: reviewText,
          wordFreq: delta,
          totalReviews: 1,
          lastUpdated: new Date(),
        });
      } else {
        const freq = { ...(summary.wordFreq || {}) };
        for (const [w, c] of Object.entries(delta))
          freq[w] = (freq[w] || 0) + c;

        const top = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5000);

        summary.wordFreq = Object.fromEntries(top);
        summary.summary = `${summary.summary} ${reviewText}`.trim();
        summary.totalReviews += 1;
        summary.lastUpdated = new Date();
        await summary.save();
      }

      res.json({ message: 'Summary updated successfully', data: summary });
    } catch (err) {
      console.error('Error updating summary:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // [GET] /api/summary/:productId
  static async getSummary(req, res) {
    try {
      const { productId } = req.params;
      const summary = await ProductSummary.findOne({ where: { productId } });
      if (!summary)
        return res.status(404).json({ error: 'Summary not found' });

      res.json(summary);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = SummaryController;
