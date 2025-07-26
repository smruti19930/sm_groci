const { openDb } = require('./database');

async function addStoreIdColumn() {
  const db = await openDb();

  try {
    await db.query('ALTER TABLE item_stock ADD COLUMN store_id INTEGER REFERENCES store(store_id)');
    console.log('Successfully added store_id column to item_stock table.');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('store_id column already exists in item_stock table.');
    } else {
      console.error('Error adding store_id column:', error);
    }
  }
}

addStoreIdColumn();
