const { openDb } = require('./database');

const truncateAllTables = async () => {
  const db = await openDb();
  try {
    await db.query('TRUNCATE TABLE items, item_stock, transactions, stock_ledger, vendor RESTART IDENTITY');
    console.log('All tables truncated successfully.');
  } catch (err) {
    console.error('Error truncating tables:', err.message);
  }
};

truncateAllTables();
