const { sql } = require('../config/db');

async function getByProduct(productId) {
  const r = await sql.query`SELECT * FROM ProductSummary WHERE productId=${productId}`;
  return r.recordset[0];
}

async function upsert({ productId, summary, wordFreq, totalReviews }) {
  const exist = await sql.query`SELECT * FROM ProductSummary WHERE productId=${productId}`;
  if (exist.recordset.length > 0) {
    await sql.query`
      UPDATE ProductSummary
      SET summary=${summary}, wordFreq=${wordFreq},
          totalReviews=${totalReviews}, lastUpdated=GETDATE()
      WHERE productId=${productId}
    `;
  } else {
    await sql.query`
      INSERT INTO ProductSummary (productId, summary, wordFreq, totalReviews, lastUpdated)
      VALUES (${productId}, ${summary}, ${wordFreq}, ${totalReviews}, GETDATE())
    `;
  }
}

module.exports = { getByProduct, upsert };
