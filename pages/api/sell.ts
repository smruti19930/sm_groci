import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const {items, invoiceNumber, userId} = req.body;

    try {
      await db.query('BEGIN');
      const storeResult = await db.query("SELECT store_id FROM user_store_mappings WHERE user_id = $1", [userId]);
      const storeId = storeResult.rows[0].store_id;

      for (const item of items) {
        const stockInfo = await db.query('SELECT price, batch_date, expiry_date FROM item_stock WHERE itemId = $1 AND batch_code = $2', [item.id, item.batch_code]);
        const { price, batch_date, expiry_date } = stockInfo.rows[0] || { price: 0, batch_date: null, expiry_date: null };

        await db.query(
          "INSERT INTO transactions (invoiceNumber, itemId, quantity, transaction_type, price) VALUES ($1, $2, $3, 'SELL INVOICE', $4)",
          [invoiceNumber, item.id, item.quantity, price]
        );
        const itemDetails = await db.query('SELECT name, category FROM items WHERE id = $1', [item.id]);
        const { name, category } = itemDetails.rows[0];

        // Decrement the stock for the specific batch
        await db.query(
          'UPDATE item_stock SET stock = stock - $1 WHERE itemId = $2 AND batch_code = $3',
          [item.quantity, item.id, item.batch_code]
        );

        // Get the latest total closing stock for the item
        const ledgerResult = await db.query(
          'SELECT closing_stock FROM stock_ledger WHERE item_id = $1 ORDER BY id DESC LIMIT 1',
          [item.id]
        );
        
        const last_total_stock = ledgerResult.rows.length > 0 ? Number(ledgerResult.rows[0].closing_stock) : 0;
        const new_total_stock = last_total_stock - Number(item.quantity);
        
        const closing_stock = new_total_stock;

        await db.query(
          `INSERT INTO stock_ledger (store_id, item_category, item_id, item_name, transaction_type, ref_doc_no, ref_doc_date, stock_in_qty, stock_out_qty, closing_stock, batch_code, batch_date, expiry_date)
           VALUES ($1, $2, $3, $4, 'SELL INVOICE', $5, NOW(), 0, $6, $7, $8, $9, $10)`,
          [storeId, category, item.id, name, invoiceNumber, item.quantity, closing_stock, item.batch_code, batch_date, expiry_date]
        );

        // Update inventory
        const locationResult = await db.query('SELECT id FROM locations WHERE name = (SELECT store_name FROM store WHERE store_id = $1)', [storeId]);
        const locationId = locationResult.rows[0].id;
        await db.query(
          `INSERT INTO inventory (item_id, location_id, quantity)
           VALUES ($1, $2, $3)
           ON CONFLICT (item_id, location_id)
           DO UPDATE SET quantity = inventory.quantity - $3`,
          [item.id, locationId, item.quantity]
        );
      }
      await db.query('COMMIT');
      res.status(200).json({message: "Sale successful"});
    } catch (error) {
      await db.query('ROLLBACK');
      console.error(error);
      res.status(500).json({message: "Sale failed"});
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
