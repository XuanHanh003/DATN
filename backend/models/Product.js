const { sql } = require('../config/db');

async function getAll() {
  const r = await sql.query(`
    SELECT p.*, c.name AS categoryName
    FROM Product p
    JOIN Category c ON p.categoryId = c.categoryId
    ORDER BY p.productId DESC
  `);
  
  // Lấy giá cho từng sản phẩm và parse embedding
  for (let product of r.recordset) {
    // Parse embedding JSON -> mảng số
    if (product.embedding) {
      try { 
        product.embedding = JSON.parse(product.embedding); 
      } catch { 
        product.embedding = []; 
      }
    } else {
      product.embedding = [];
    }

    const priceResult = await sql.query`SELECT optionName, optionPrice FROM ProductPrice WHERE productId = ${product.productId}`;
    const prices = {};
    priceResult.recordset.forEach(price => {
      const key = price.optionName || 'default';
      prices[key] = price.optionPrice;
    });
    product.prices = prices;
  }
  
  return r.recordset;
}

async function getById(productId) {
  const r = await sql.query`SELECT * FROM Product WHERE productId = ${productId}`;
  const product = r.recordset[0];
  
  if (product) {
    // Lấy giá từ bảng ProductPrice
    const priceResult = await sql.query`SELECT optionName, optionPrice FROM ProductPrice WHERE productId = ${productId}`;
    const prices = {};
    priceResult.recordset.forEach(price => {
      const key = price.optionName || 'default';
      prices[key] = price.optionPrice;
    });
    product.prices = prices;
  }
  
  return product;
}

async function create({ categoryId, name, description, image, stock = 0, prices, attributes, embedding }) {
  await sql.query`
    INSERT INTO Product (categoryId, name, description, image, stock, prices, attributes, embedding, createdAt, updatedAt)
    VALUES (${categoryId}, ${name}, ${description}, ${image}, ${stock}, ${JSON.stringify(prices)}, ${JSON.stringify(attributes)}, ${JSON.stringify(embedding)}, GETDATE(), GETDATE())
  `;
}

async function searchByName(keyword) {
  const r = await sql.query`
    SELECT p.*, c.name AS categoryName
    FROM Product p
    JOIN Category c ON p.categoryId = c.categoryId
    WHERE p.name LIKE ${'%' + keyword + '%'}
    ORDER BY p.productId DESC
  `;
  return r.recordset;
}

async function searchByCategory(categoryId) {
  const r = await sql.query`
    SELECT p.*, c.name AS categoryName
    FROM Product p
    JOIN Category c ON p.categoryId = c.categoryId
    WHERE p.categoryId = ${categoryId}
    ORDER BY p.productId DESC
  `;
  return r.recordset;
}

async function getByCategory(categoryId) {
  const r = await sql.query`
    SELECT p.*, c.name AS categoryName
    FROM Product p
    JOIN Category c ON p.categoryId = c.categoryId
    WHERE p.categoryId = ${categoryId}
    ORDER BY p.productId DESC
  `;
  
  // Lấy giá cho từng sản phẩm
  for (let product of r.recordset) {
    const priceResult = await sql.query`SELECT optionName, optionPrice FROM ProductPrice WHERE productId = ${product.productId}`;
    const prices = {};
    priceResult.recordset.forEach(price => {
      const key = price.optionName || 'default';
      prices[key] = price.optionPrice;
    });
    product.prices = prices;
  }
  
  return r.recordset;
}

async function update(productId, data) {
  const setClause = Object.keys(data)
    .filter(key => data[key] !== undefined)
    .map(key => {
      const value = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
      return `${key} = '${value}'`;
    })
    .join(', ');
  
  if (setClause) {
    await sql.query`
      UPDATE Product 
      SET ${setClause}, updatedAt = GETDATE()
      WHERE productId = ${productId}
    `;
  }
}

async function deleteById(productId) {
  const r = await sql.query`
    DELETE FROM Product WHERE productId = ${productId}
  `;
  return r.rowsAffected[0] > 0;
}

module.exports = { getAll, getById, create, searchByName, searchByCategory, getByCategory, update, deleteById };
