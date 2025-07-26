const { openDb } = require('./database');

async function mapItemsToStore() {
  const db = await openDb();

  try {
    // Get the store_id for 'G-STORE'
    const storeResult = await db.query('SELECT store_id FROM store WHERE store_name = $1', ['G-STORE']);
    if (storeResult.rows.length === 0) {
      console.error('Store "G-STORE" not found.');
      return;
    }
    const storeId = storeResult.rows[0].store_id;

    // Update existing item_stock records with the store_id
    const updateResult = await db.query('UPDATE item_stock SET store_id = $1 WHERE store_id IS NULL', [storeId]);

    console.log(`Successfully mapped ${updateResult.rowCount} items to the store.`);
  } catch (error) {
    console.error('Error mapping items to store:', error);
  }
}

mapItemsToStore();
