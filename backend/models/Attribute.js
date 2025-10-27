const { sql } = require('../config/db');

async function getByCategory(categoryId) {
  const r = await sql.query`SELECT * FROM ProductAttribute WHERE categoryId=${categoryId}`;
  return r.recordset;
}

async function create({ categoryId, name, valueType = 'String' }) {
  await sql.query`
    INSERT INTO ProductAttribute (categoryId, name, valueType, createdAt, updatedAt)
    VALUES (${categoryId}, ${name}, ${valueType}, GETDATE(), GETDATE())
  `;
}

module.exports = { getByCategory, create };
