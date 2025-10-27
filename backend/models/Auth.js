const { sql } = require('../config/db');

// Lưu refresh token mới cho user
async function saveToken({ userId, refreshToken }) {
  // Nếu user đã có token, cập nhật
  const existing = await sql.query`SELECT * FROM Auth WHERE userId = ${userId}`;
  if (existing.recordset.length > 0) {
    await sql.query`
      UPDATE Auth
      SET refreshToken = ${refreshToken}, createdAt = GETDATE()
      WHERE userId = ${userId}
    `;
  } else {
    await sql.query`
      INSERT INTO Auth (userId, refreshToken, createdAt)
      VALUES (${userId}, ${refreshToken}, GETDATE())
    `;
  }
}

// Lấy token theo user
async function getTokenByUser(userId) {
  const r = await sql.query`SELECT * FROM Auth WHERE userId = ${userId}`;
  return r.recordset[0];
}

// Xóa token khi logout
async function deleteToken(userId) {
  await sql.query`DELETE FROM Auth WHERE userId = ${userId}`;
}

// Xóa token hết hạn (tùy chọn, bạn có thể chạy cron)
async function deleteExpired() {
  await sql.query`
    DELETE FROM Auth WHERE DATEDIFF(day, createdAt, GETDATE()) >= 7
  `;
}

module.exports = { saveToken, getTokenByUser, deleteToken, deleteExpired };
