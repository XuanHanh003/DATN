const { sql } = require('../config/db');
const bcrypt = require('bcryptjs');

async function getAll() {
  const r = await sql.query`SELECT * FROM Users`;
  return r.recordset;
}

async function findById(userId) {
  const r = await sql.query`SELECT * FROM Users WHERE userId = ${userId}`;
  return r.recordset[0];
}

async function findByEmail(email) {
  const r = await sql.query`SELECT * FROM Users WHERE email = ${email}`;
  return r.recordset[0];
}

async function create({ username, email, phone, password, role = 'customer' }) {
  const hash = await bcrypt.hash(password, 10);
  await sql.query`
    INSERT INTO Users (username, email, phone, password, role, createdAt, updatedAt)
    VALUES (${username}, ${email}, ${phone}, ${hash}, ${role}, GETDATE(), GETDATE())
  `;
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

async function updatePassword(userId, newPassword) {
  const hash = await bcrypt.hash(newPassword, 10);
  await sql.query`
    UPDATE Users 
    SET password = ${hash}, updatedAt = GETDATE()
    WHERE userId = ${userId}
  `;
}

module.exports = { getAll, findById, findByEmail, create, comparePassword, updatePassword };
