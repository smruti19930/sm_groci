const db = require('./database');

const addReturnedStatusToTransfers = async () => {
  try {
    await db.query(`
      ALTER TABLE transfers
      DROP CONSTRAINT IF EXISTS transfers_status_check,
      ADD CONSTRAINT transfers_status_check CHECK (status IN ('pending', 'in_transit', 'received', 'returned'));
    `);
    console.log('transfers table updated with returned status.');
  } catch (err) {
    console.error('Error updating transfers table:', err.message);
  }
};

addReturnedStatusToTransfers();
