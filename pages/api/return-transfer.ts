import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { transferId, username } = req.body;

  if (!transferId) {
    return res.status(400).json({ message: 'Transfer ID is required' });
  }

  try {
    await db.query('BEGIN');

    // Update transfer status to 'returned'
    await db.query("UPDATE transfers SET status = 'returned', received_date = CURRENT_DATE WHERE id = $1", [transferId]);

    // Get transfer items
    const transferItemsResult = await db.query(
      `SELECT ti.item_id, ti.quantity, t.from_location_id, ti.batch_code, ti.batch_date, ti.expiry_date
       FROM transfer_items ti 
       JOIN transfers t ON ti.transfer_id = t.id 
       WHERE ti.transfer_id = $1`,
      [transferId]
    );
    const transferItems = transferItemsResult.rows;

    // Update inventory and stock ledger
    for (const item of transferItems) {
      // Add stock back to the source location
      await db.query(
        `UPDATE inventory SET quantity = quantity + $1 WHERE location_id = $2 AND item_id = $3`,
        [item.quantity, item.from_location_id, item.item_id]
      );

      const stock = await db.query('SELECT quantity FROM inventory WHERE item_id = $1 AND location_id = $2', [item.item_id, item.from_location_id]);
      const closingStock = stock.rows[0].quantity;

      const storeResult = await db.query('SELECT s.store_id FROM store s JOIN locations l ON s.store_name = l.name WHERE l.id = $1', [item.from_location_id]);
      const storeId = storeResult.rows[0].store_id;

      const itemDetails = await db.query('SELECT category, name FROM items WHERE id = $1', [item.item_id]);
      const { category, name: itemName } = itemDetails.rows[0];

      await db.query(
        `INSERT INTO stock_ledger (store_id, item_id, item_name, item_category, transaction_type, ref_doc_no, ref_doc_date, stock_in_qty, closing_stock, batch_code, batch_date, expiry_date)
         VALUES ($1, $2, $3, $4, 'transfer_return', $5, CURRENT_DATE, $6, $7, $8, $9, $10)`,
        [storeId, item.item_id, itemName, category, transferId, item.quantity, closingStock, item.batch_code, item.batch_date, item.expiry_date]
      );
    }

    await db.query('COMMIT');
    res.status(200).json({ message: 'Transfer returned successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ message: 'Error returning transfer', error });
  }
}
