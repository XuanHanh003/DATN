const { sql } = require('../config/db');

async function getByProduct(productId) {
  const r = await sql.query`SELECT * FROM ProductPrice WHERE productId = ${productId}`;
  return r.recordset;
}

async function create({ productId, optionName, optionPrice }) {
  await sql.query`
    INSERT INTO ProductPrice (productId, optionName, optionPrice, createdAt, updatedAt)
    VALUES (${productId}, ${optionName}, ${optionPrice}, GETDATE(), GETDATE())
  `;
}

module.exports = { getByProduct, create };
