const { openDb } = require('./database');

const backfillVendorId = async () => {
  const db = await openDb();
  try {
    await db.query('TRUNCATE TABLE stock_ledger');
    await db.query(`
      UPDATE stock_ledger
      SET vendor_id = (
        SELECT vendor.vendor_id
        FROM vendor
        JOIN item_stock ON vendor.vendor_id = item_stock.vendor_id
        WHERE item_stock.batch_code = stock_ledger.batch_code
        AND item_stock.itemId = stock_ledger.item_id
      )
      WHERE vendor_id IS NULL
      AND transaction_type = 'PURCHASE FROM VENDOR'
    `);
    console.log('Backfilled vendor_id in stock_ledger table.');
  } catch (err) {
    console.error('Error backfilling vendor_id in stock_ledger table:', err.message);
  }
};

backfillVendorId();
