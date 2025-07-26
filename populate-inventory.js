const { openDb } = require('./database');

async function populateInventory() {
  const db = await openDb();
  try {
    await db.query(`
      INSERT INTO inventory (item_id, location_id, quantity)
      SELECT
        sl.item_id,
        l.id,
        sl.closing_stock
      FROM (
        SELECT
          item_id,
          store_id,
          closing_stock,
          ROW_NUMBER() OVER(PARTITION BY item_id, store_id ORDER BY id DESC) as rn
        FROM stock_ledger
      ) sl
      JOIN store s ON sl.store_id = s.store_id
      JOIN locations l ON s.store_name = l.name
      WHERE sl.rn = 1
      ON CONFLICT (item_id, location_id) DO NOTHING;
    `);
    console.log('Inventory table populated successfully.');
  } catch (error) {
    console.error('Error populating inventory table:', error);
  }
}

populateInventory();
