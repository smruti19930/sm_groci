const { openDb } = require('./database');

const truncateTables = async () => {
  const db = await openDb();
  try {
    await db.query('TRUNCATE TABLE items, item_stock, transactions, stock_ledger RESTART IDENTITY');
    console.log('Tables truncated successfully.');
  } catch (err) {
    console.error('Error truncating tables:', err.message);
  }
};

truncateTables();
