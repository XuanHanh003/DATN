const { sql } = require('../config/db');

async function getAll() {
  const r = await sql.query`SELECT * FROM Promotion ORDER BY startDate DESC`;
  return r.recordset;
}

async function create({ code, description, discountPercent, startDate, endDate }) {
  await sql.query`
    INSERT INTO Promotion (code, description, discountPercent, startDate, endDate)
    VALUES (${code}, ${description}, ${discountPercent}, ${startDate}, ${endDate})
  `;
}

async function getByCode(code) {
  const r = await sql.query`SELECT * FROM Promotion WHERE code=${code}`;
  return r.recordset[0];
}

module.exports = { getAll, create, getByCode };
