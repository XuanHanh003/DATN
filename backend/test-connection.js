// Test database connection
const { connectDB, sql } = require('./config/db');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await connectDB();
    
    // Test query
    const result = await sql.query`SELECT COUNT(*) as count FROM Product`;
    console.log('✅ Database connection successful!');
    console.log('Product count:', result.recordset[0].count);
    
    // Test categories
    const categories = await sql.query`SELECT * FROM Category`;
    console.log('Categories:', categories.recordset);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    process.exit(0);
  }
}

testConnection();
