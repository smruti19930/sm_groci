const { openDb } = require('./database');

async function updateTransactionType() {
  const db = await openDb();

  try {
    const result = await db.query(`
      UPDATE transactions
      SET transaction_type = 'INVOICE'
      WHERE invoiceNumber IS NOT NULL AND transaction_type IS NULL
    `);
    console.log(`Successfully updated ${result.rowCount} transactions to type 'INVOICE'.`);
  } catch (error) {
    console.error('Error updating transaction types:', error);
  }
}

updateTransactionType();
