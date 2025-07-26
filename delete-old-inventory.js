const { openDb } = require('./database');

async function deleteOldInventory() {
  const db = await openDb();
  try {
    await db.query('DELETE FROM inventory WHERE quantity = 9');
    console.log('Successfully deleted the old inventory record.');
  } catch (err) {
    console.error('Error deleting old inventory record:', err.message);
  } finally {
    if (db) {
      db.release();
    }
  }
}

deleteOldInventory();
