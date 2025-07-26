const { openDb } = require('./database');

async function truncateTables() {
  const db = await openDb();
  try {
    await db.query('TRUNCATE TABLE items, transactions, item_stock, stock_ledger, vendor RESTART IDENTITY CASCADE');
    console.log('Successfully truncated five tables.');
  } catch (error) {
    console.error('Error truncating tables:', error);
  }
}

truncateTables();
