const sql = require('mssql');

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Thang@123',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'EcommerceDB',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

const connectDB = async () => {
  try {
    await sql.connect(config);
    console.log('✅ Connected to SQL Server (localhost:1433)');
  } catch (error) {
    console.error('❌ Lỗi kết nối SQL Server:', error);
  }
};

module.exports = { connectDB, sql };