const { openDb } = require('./database');

async function addTransactionTypeColumn() {
  const db = await openDb();

  try {
    await db.query('ALTER TABLE transactions ADD COLUMN transaction_type TEXT');
    console.log('Successfully added transaction_type column to transactions table.');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('transaction_type column already exists in transactions table.');
    } else {
      console.error('Error adding transaction_type column:', error);
    }
  }
}

addTransactionTypeColumn();
