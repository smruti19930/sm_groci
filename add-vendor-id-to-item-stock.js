const { openDb } = require('./database');

const addVendorIdToItemStock = async () => {
  const db = await openDb();
  try {
    await db.query('ALTER TABLE item_stock ADD COLUMN vendor_id INTEGER');
    console.log('vendor_id column added to item_stock table.');
  } catch (err) {
    console.error('Error adding vendor_id column to item_stock table:', err.message);
  }
};

addVendorIdToItemStock();
