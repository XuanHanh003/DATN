const { sql } = require('../config/db');

async function getByProduct(productId) {
  const r = await sql.query(`
    SELECT r.*, u.username 
    FROM Review r
    JOIN Users u ON r.userId = u.userId
    WHERE r.productId = ${productId}
    ORDER BY r.createdAt DESC
  `);
  return r.recordset;
}

async function create({ userId, orderId, productId, rating, comment }) {
  await sql.query`
    INSERT INTO Review (userId, orderId, productId, rating, comment, createdAt)
    VALUES (${userId}, ${orderId}, ${productId}, ${rating}, ${comment}, GETDATE())
  `;
}

module.exports = { getByProduct, create };
