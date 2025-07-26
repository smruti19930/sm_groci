const { openDb } = require('./database');

const removeAvailableStockFromItemStock = async () => {
  const db = await openDb();
  const query = `
    ALTER TABLE item_stock DROP COLUMN available_stock;
  `;
  try {
    await db.query(query);
    console.log('available_stock column removed from item_stock table.');
  } catch (err) {
    if (err.message.includes('does not exist')) {
      console.log('available_stock column does not exist in item_stock table.');
    } else {
      console.error('Error removing available_stock column from item_stock table:', err.message);
    }
  }
};

removeAvailableStockFromItemStock();
