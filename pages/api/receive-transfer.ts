import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { transferId, receivedQuantities } = req.body;

  if (!transferId) {
    return res.status(400).json({ message: 'Transfer ID is required' });
  }

  try {
    await db.query('BEGIN');

    // Get transfer items
    const transferItemsResult = await db.query(
      `SELECT ti.id as transfer_item_id, ti.item_id, i.name as item_name, ti.quantity, t.to_location_id, t.from_location_id, ti.batch_code, ti.batch_date, ti.expiry_date
       FROM transfer_items ti
       JOIN transfers t ON ti.transfer_id = t.id
       JOIN items i ON ti.item_id = i.id
       WHERE ti.transfer_id = $1`,
      [transferId]
    );
    const transferItems = transferItemsResult.rows;

    let allItemsReceived = true;

    // Update inventory and stock ledger
    for (const item of transferItems) {
      const receivedQuantity = receivedQuantities[item.item_name] || 0;

      if (receivedQuantity > 0) {
        // Add to inventory
        await db.query(
          `INSERT INTO inventory (item_id, location_id, quantity)
           VALUES ($1, $2, $3)
           ON CONFLICT (item_id, location_id)
           DO UPDATE SET quantity = inventory.quantity + $3`,
          [item.item_id, item.to_location_id, receivedQuantity]
        );

        // Update stock ledger
        const stock = await db.query('SELECT quantity FROM inventory WHERE item_id = $1 AND location_id = $2', [item.item_id, item.to_location_id]);
        const closingStock = stock.rows[0].quantity;
        const storeResult = await db.query('SELECT s.store_id FROM store s JOIN locations l ON s.store_name = l.name WHERE l.id = $1', [item.to_location_id]);
        const storeId = storeResult.rows[0].store_id;
        const itemDetails = await db.query('SELECT category FROM items WHERE id = $1', [item.item_id]);
        const { category } = itemDetails.rows[0];

        await db.query(
          `INSERT INTO stock_ledger (store_id, item_id, item_name, item_category, transaction_type, ref_doc_no, ref_doc_date, stock_in_qty, closing_stock, batch_code, batch_date, expiry_date)
           VALUES ($1, $2, $3, $4, 'transfer', $5, CURRENT_DATE, $6, $7, $8, $9, $10)`,
          [storeId, item.item_id, item.item_name, category, transferId, receivedQuantity, closingStock, item.batch_code, item.batch_date, item.expiry_date]
        );

        // Update transfer item quantity
        const newQuantity = item.quantity - receivedQuantity;
        await db.query('UPDATE transfer_items SET quantity = $1 WHERE id = $2', [newQuantity, item.transfer_item_id]);
        if (newQuantity > 0) {
          allItemsReceived = false;
        }
      } else {
        allItemsReceived = false;
      }
    }

    if (allItemsReceived) {
      await db.query("UPDATE transfers SET status = 'received', received_date = CURRENT_DATE WHERE id = $1", [transferId]);
    }

    await db.query('COMMIT');
    res.status(200).json({ message: 'Transfer received successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ message: 'Error receiving transfer', error });
  }
}
