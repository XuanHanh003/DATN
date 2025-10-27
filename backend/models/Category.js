const { sql } = require('../config/db');

async function getAll() {
  const r = await sql.query`SELECT * FROM Category ORDER BY createdAt DESC`;
  return r.recordset;
}

async function create({ name, description, parentId = null, slug }) {
  await sql.query`
    INSERT INTO Category (name, description, parentId, slug, createdAt, updatedAt)
    VALUES (${name}, ${description}, ${parentId}, ${slug}, GETDATE(), GETDATE())
  `;
}

async function getById(categoryId) {
  const r = await sql.query`SELECT * FROM Category WHERE categoryId = ${categoryId}`;
  return r.recordset[0];
}

async function update(categoryId, data) {
  const setClause = Object.keys(data)
    .filter(key => data[key] !== undefined)
    .map(key => `${key} = '${data[key]}'`)
    .join(', ');
  
  if (setClause) {
    await sql.query`
      UPDATE Category 
      SET ${setClause}, updatedAt = GETDATE()
      WHERE categoryId = ${categoryId}
    `;
  }
}

async function deleteById(categoryId) {
  const r = await sql.query`
    DELETE FROM Category WHERE categoryId = ${categoryId}
  `;
  return r.rowsAffected[0] > 0;
}

module.exports = { getAll, create, getById, update, deleteById };
