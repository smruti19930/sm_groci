const { openDb } = require('./database');

const addVendorIdToStockLedger = async () => {
  const db = await openDb();
  try {
    const res = await db.query("SELECT 1 FROM information_schema.columns WHERE table_name='stock_ledger' AND column_name='vendor_id'");
    if (res.rowCount === 0) {
      await db.query('ALTER TABLE stock_ledger ADD COLUMN vendor_id INTEGER');
      console.log('vendor_id column added to stock_ledger table.');
    } else {
      console.log('vendor_id column already exists in stock_ledger table.');
    }
  } catch (err) {
    console.error('Error adding vendor_id column to stock_ledger table:', err.message);
  }
};

addVendorIdToStockLedger();
