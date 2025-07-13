const { openDb } = require('./database');

async function addBarcodeColumn() {
  console.log('Adding barcode column to item_stock table...');
  try {
    const db = await openDb();
    await db.query('ALTER TABLE item_stock ADD COLUMN barcode TEXT');
    console.log('Barcode column added successfully.');
  } catch (err) {
    console.error('Error adding barcode column:', err);
  }
}

addBarcodeColumn();
