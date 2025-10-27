const { sql } = require("../config/db");

async function getAll() {
  const r = await sql.query`SELECT * FROM dbo.ProductAttributeValue`;
  return r.recordset;
}

async function getByProduct(productId) {
  const r = await sql.query`SELECT * FROM dbo.ProductAttributeValue WHERE productId = ${productId}`;
  return r.recordset;
}

async function create({ productId, attributeName, attributeValue }) {
  await sql.query`
    INSERT INTO dbo.ProductAttributeValue (productId, attributeName, attributeValue)
    VALUES (${productId}, ${attributeName}, ${attributeValue})
  `;
}

module.exports = { getAll, getByProduct, create };
