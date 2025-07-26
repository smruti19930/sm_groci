const { openDb } = require('./database');

const addPriceToTransactions = async () => {
  const db = await openDb();
  try {
    await db.query('ALTER TABLE transactions ADD COLUMN price REAL');
    console.log('Price column added to transactions table.');
  } catch (err) {
    console.error('Error adding price column to transactions table:', err.message);
  }
};

addPriceToTransactions();
