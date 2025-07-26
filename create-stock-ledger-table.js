const { openDb } = require('./database');

async function createStockLedgerTable() {
  const db = await openDb();

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS stock_ledger (
        id SERIAL PRIMARY KEY,
        store_id INTEGER REFERENCES store(store_id),
        item_category TEXT,
        item_id UUID REFERENCES items(id),
        item_name TEXT,
        transaction_type TEXT,
        ref_doc_no TEXT,
        ref_doc_date DATE,
        stock_in_qty INTEGER,
        stock_out_qty INTEGER,
        closing_stock INTEGER,
        batch_code TEXT,
        batch_date DATE,
        expiry_date DATE
      );
    `);
    console.log('Successfully created stock_ledger table.');
  } catch (error) {
    console.error('Error creating stock_ledger table:', error);
  }
}

createStockLedgerTable();
