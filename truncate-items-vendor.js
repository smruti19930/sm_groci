const { openDb } = require('./database');

async function truncateItemsAndVendor() {
  const db = await openDb();
  try {
    await db.query('TRUNCATE TABLE items, vendor RESTART IDENTITY CASCADE');
    console.log('Items and vendor tables truncated successfully.');
  } catch (err) {
    console.error('Error truncating tables:', err.message);
  } finally {
    if (db) {
      db.release();
    }
  }
}

truncateItemsAndVendor();
