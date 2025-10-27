const { sql } = require('../config/db');

async function getByUser(userId) {
  const r = await sql.query`SELECT * FROM Orders WHERE userId = ${userId} ORDER BY createdAt DESC`;
  return r.recordset;
}

async function getItems(orderId) {
  const r = await sql.query`SELECT * FROM OrderItem WHERE orderId = ${orderId}`;
  return r.recordset;
}

async function getAll() {
  const r = await sql.query`
    SELECT o.*, u.username, u.email
    FROM Orders o
    JOIN Users u ON o.userId = u.userId
    ORDER BY o.createdAt DESC
  `;
  return r.recordset;
}

async function create({ userId, totalPrice, fullName, phone, address, items, transactionId, status = 'Pending' }) {
  const transaction = new sql.Transaction();
  try {
    await transaction.begin();

    const req = new sql.Request(transaction);
    const inserted = await req.query(`
      INSERT INTO Orders (userId, totalPrice, fullName, phone, address, transactionId, status, createdAt)
      OUTPUT INSERTED.orderId
      VALUES (${userId}, ${totalPrice}, N'${fullName}', '${phone}', N'${address}', '${transactionId}', N'${status}', GETDATE())
    `);
    const orderId = inserted.recordset[0].orderId;

    for (const item of items) {
      await transaction.request().query(`
        INSERT INTO OrderItem (orderId, productId, quantity, price, size, color)
        VALUES (${orderId}, ${item.productId}, ${item.quantity}, ${item.price}, N'${item.size}', N'${item.color}')
      `);
    }

    await transaction.commit();
    return orderId;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function getById(orderId) {
  const r = await sql.query`SELECT * FROM Orders WHERE orderId = ${orderId}`;
  return r.recordset[0];
}

async function getByTransactionId(transactionId) {
  const r = await sql.query`SELECT * FROM Orders WHERE transactionId = ${transactionId}`;
  return r.recordset[0];
}

async function updateStatus(orderId, status) {
  await sql.query`
    UPDATE Orders 
    SET status = ${status}, updatedAt = GETDATE()
    WHERE orderId = ${orderId}
  `;
}

async function deleteById(orderId) {
  const transaction = new sql.Transaction();
  try {
    await transaction.begin();
    
    // Xóa OrderItems trước
    await transaction.request().query(`
      DELETE FROM OrderItem WHERE orderId = ${orderId}
    `);
    
    // Xóa Order
    await transaction.request().query(`
      DELETE FROM Orders WHERE orderId = ${orderId}
    `);
    
    await transaction.commit();
    return true;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

module.exports = { getByUser, getItems, create, getAll, getById, getByTransactionId, updateStatus, deleteById };
