const db = require('./database');

const addBatchDetailsToTransferItems = async () => {
  try {
    await db.query(`
      ALTER TABLE transfer_items
      ADD COLUMN IF NOT EXISTS batch_code TEXT,
      ADD COLUMN IF NOT EXISTS batch_date DATE,
      ADD COLUMN IF NOT EXISTS expiry_date DATE;
    `);
    console.log('transfer_items table updated with batch details.');
  } catch (err) {
    console.error('Error updating transfer_items table:', err.message);
  }
};

addBatchDetailsToTransferItems();
