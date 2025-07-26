import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Purchase API called');
  if (req.method === 'POST') {
    const { purchaseItems } = req.body;
    console.log('Received purchase items:', purchaseItems);

    try {
      await db.query('BEGIN');
      const purchaseNumber = `PUR-${Date.now()}`;
      const storeResult = await db.query("SELECT store_id FROM store WHERE store_name = 'Main Store'");
      const storeId = storeResult.rows[0].store_id;

      for (const item of purchaseItems) {
        let itemId = item.itemId;

        if (!itemId) {
          // It's a new item, check if it exists by name and category
          let itemResult = await db.query('SELECT id FROM items WHERE name = $1 AND category = $2', [item.itemName, item.itemCategory]);
          if (itemResult.rows.length > 0) {
            itemId = itemResult.rows[0].id;
          } else {
            const newItemResult = await db.query(
              `INSERT INTO items (name, category) VALUES ($1, $2) RETURNING id`,
              [item.itemName, item.itemCategory]
            );
            itemId = newItemResult.rows[0].id;
          }
        }

        // Check if vendor exists
        let vendorResult = await db.query('SELECT vendor_id FROM vendor WHERE vendor_name = $1', [item.vendorName]);
        let vendorId;

        if (vendorResult.rows.length > 0) {
          vendorId = vendorResult.rows[0].vendor_id;
        } else {
          // Insert new vendor and get the id
          const newVendorResult = await db.query(
            `INSERT INTO vendor (vendor_name) VALUES ($1) RETURNING vendor_id`,
            [item.vendorName]
          );
          vendorId = newVendorResult.rows[0].vendor_id;
        }

        // Get the most recent closing stock for this item from the ledger
        const ledgerResult = await db.query(
          'SELECT closing_stock FROM stock_ledger WHERE item_id = $1 ORDER BY id DESC LIMIT 1',
          [itemId]
        );
        
        const last_closing_stock = ledgerResult.rows.length > 0 ? Number(ledgerResult.rows[0].closing_stock) : 0;
        const new_closing_stock = last_closing_stock + Number(item.quantity);

        // A purchase always creates a new batch record in item_stock
        await db.query(
          `INSERT INTO item_stock (store_id, itemId, stock, price, unit, barcode, batch_code, batch_date, expiry_date, vendor_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9)`,
          [storeId, itemId, item.quantity, item.price, item.unit, item.barcode, item.batchCode, item.expiryDate, vendorId]
        );

        // Add to stock_ledger
        await db.query(
          `INSERT INTO stock_ledger (store_id, item_category, item_id, item_name, transaction_type, ref_doc_no, ref_doc_date, stock_in_qty, stock_out_qty, closing_stock, batch_code, batch_date, expiry_date, vendor_id)
           VALUES ($1, $2, $3, $4, 'PURCHASE FROM VENDOR', $5, NOW(), $6, 0, $7, $8, NOW(), $9, $10)`,
          [storeId, item.itemCategory, itemId, item.itemName, purchaseNumber, item.quantity, new_closing_stock, item.batchCode, item.expiryDate, vendorId]
        );

        // Update inventory
        const locationResult = await db.query('SELECT id FROM locations WHERE name = (SELECT store_name FROM store WHERE store_id = $1)', [storeId]);
        const locationId = locationResult.rows[0].id;
        await db.query(
          `INSERT INTO inventory (item_id, location_id, quantity)
           VALUES ($1, $2, $3)
           ON CONFLICT (item_id, location_id)
           DO UPDATE SET quantity = inventory.quantity + $3`,
          [itemId, locationId, item.quantity]
        );
      }
      await db.query('COMMIT');
      res.status(200).json({ message: 'Purchase successful' });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error in purchase API:', error);
      res.status(500).json({ message: 'Purchase failed' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
