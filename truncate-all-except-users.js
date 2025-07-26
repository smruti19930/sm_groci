const { openDb } = require('./database');

async function truncateAllTablesExceptUsers() {
  const db = await openDb();
  try {
    await db.query('TRUNCATE TABLE items, item_stock, transactions, stock_ledger, vendor, store, locations, transfers, transfer_items RESTART IDENTITY CASCADE');
    console.log('All tables except users truncated successfully.');
  } catch (err) {
    console.error('Error truncating tables:', err.message);
  } finally {
    if (db) {
      db.release();
    }
  }
}

truncateAllTablesExceptUsers();
