const { sql } = require("../config/db");

async function getByOrder(orderId) {
  const r = await sql.query`SELECT * FROM dbo.OrderItem WHERE orderId = ${orderId}`;
  return r.recordset;
}

async function create({ orderId, productId, quantity, price }) {
  await sql.query`
    INSERT INTO dbo.OrderItem (orderId, productId, quantity, price)
    VALUES (${orderId}, ${productId}, ${quantity}, ${price})
  `;
}

async function deleteByOrder(orderId) {
  await sql.query`DELETE FROM dbo.OrderItem WHERE orderId = ${orderId}`;
}

module.exports = { getByOrder, create, deleteByOrder };