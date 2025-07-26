const { openDb } = require('./database');

const backfillPrices = async () => {
  const db = await openDb();
  try {
    // Get all sales from the ledger
    const salesLedger = await db.query(`
      SELECT item_id, ref_doc_no, batch_code 
      FROM stock_ledger 
      WHERE transaction_type = 'SELL INVOICE' AND batch_code IS NOT NULL
    `);

    for (const sale of salesLedger.rows) {
      // Get the price for that batch
      const stockInfo = await db.query(
        'SELECT price FROM item_stock WHERE itemId = $1 AND batch_code = $2',
        [sale.item_id, sale.batch_code]
      );

      if (stockInfo.rows.length > 0) {
        const price = stockInfo.rows[0].price;
        
        // Update the transaction with the correct price
        await db.query(
          'UPDATE transactions SET price = $1 WHERE invoiceNumber = $2 AND itemId = $3',
          [price, sale.ref_doc_no, sale.item_id]
        );
        console.log(`Updated price for invoice ${sale.ref_doc_no}, item ${sale.item_id} to ${price}`);
      }
    }
    console.log('Price backfill complete.');
  } catch (err) {
    console.error('Error backfilling prices:', err.message);
  }
};

backfillPrices();
