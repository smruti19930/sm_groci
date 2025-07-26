import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { fromLocation, toLocation, transferItems, username } = req.body;

    try {
      await db.query('BEGIN');
      // Create a new transfer record
      const transferResult = await db.query(
        `INSERT INTO transfers (from_location_id, to_location_id, transfer_type, status, transfer_date, created_by, created_at)
         VALUES ($1::uuid, $2::uuid, 'in-transit', 'in_transit', NOW(), $3, NOW()) RETURNING id`,
        [fromLocation, toLocation, username]
      );
      const transferId = transferResult.rows[0].id;

      // Add items to the transfer
      for (const item of transferItems) {
        await db.query(
          `INSERT INTO transfer_items (transfer_id, item_id, quantity, batch_code, batch_date, expiry_date)
           VALUES ($1, $2::uuid, $3, $4, $5, $6)`,
          [transferId, item.item.item_id, item.quantity, item.item.batch_code, item.item.batch_date, item.item.expiry_date]
        );

        // Deduct stock from the source location and get the new quantity
        const inventoryUpdateResult = await db.query(
          `UPDATE inventory SET quantity = quantity - $1 WHERE location_id = $2::uuid AND item_id = $3::uuid RETURNING quantity`,
          [item.quantity, fromLocation, item.item.item_id]
        );
        const new_closing_stock = inventoryUpdateResult.rows[0].quantity;

        // Add to stock_ledger
        const storeResult = await db.query("SELECT store_id FROM locations WHERE id = $1", [fromLocation]);
        const storeId = storeResult.rows[0].store_id;

        await db.query(
          `INSERT INTO stock_ledger (store_id, item_category, item_id, item_name, transaction_type, ref_doc_no, ref_doc_date, stock_in_qty, stock_out_qty, closing_stock, batch_code, batch_date, expiry_date)
           VALUES ($1, $2, $3, $4, 'TRANSFER', $5, NOW(), 0, $6, $7, $8, $9, $10)`,
          [storeId, item.item.category, item.item.item_id, item.item.item_name, transferId, item.quantity, new_closing_stock, item.item.batch_code, item.item.batch_date, item.item.expiry_date]
        );
      }
      await db.query('COMMIT');
      res.status(200).json({ message: 'Transfer successful' });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error in transfer API:', error);
      res.status(500).json({ message: 'Transfer failed' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
