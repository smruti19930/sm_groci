const { openDb } = require('./database');

async function updateBatchData() {
  const db = await openDb();

  try {
    const itemsResult = await db.query('SELECT id, itemid FROM item_stock');
    const items = itemsResult.rows;

    for (const item of items) {
      const batchCode = `BATCH-${item.itemid}-${Date.now()}`;
      const batchDate = new Date();
      const expiryDate = new Date();
      expiryDate.setFullYear(batchDate.getFullYear() + 1);

      await db.query(
        'UPDATE item_stock SET batch_code = $1, batch_date = $2, expiry_date = $3 WHERE id = $4',
        [batchCode, batchDate, expiryDate, item.id]
      );
    }

    console.log(`Successfully updated batch data for ${items.length} items.`);
  } catch (error) {
    console.error('Error updating batch data:', error);
  }
}

updateBatchData();
