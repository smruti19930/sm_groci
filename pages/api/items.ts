import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    try {
      const storeResult = await db.query('SELECT l.id FROM user_store_mappings usm JOIN store s ON usm.store_id = s.store_id JOIN locations l ON s.store_name = l.name WHERE usm.user_id = $1', [userId]);

      if (storeResult.rows.length === 0) {
        return res.status(200).json([]);
      }

      const storeId = storeResult.rows[0].id;

      const query = `
        SELECT
          i.id,
          i.name,
          i.category,
          COALESCE(inv.quantity, 0) as stock,
          ist.price,
          ist.unit
        FROM items i
        LEFT JOIN inventory inv ON i.id = inv.item_id AND inv.location_id = $1
        LEFT JOIN (
          SELECT
            itemId,
            price,
            unit,
            store_id,
            ROW_NUMBER() OVER(PARTITION BY itemId ORDER BY id DESC) as rn
          FROM item_stock
        ) ist ON i.id = ist.itemId AND ist.rn = 1
      `;
      const { rows } = await db.query(query, [storeId]);
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ message: 'Failed to fetch items' });
    }
  } else if (req.method === "DELETE") {
    const {ids} = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({message: "Invalid request"});
    }
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
    await db.query(`DELETE FROM item_stock WHERE itemId IN (${placeholders})`, ids);
    await db.query(`DELETE FROM transactions WHERE itemId IN (${placeholders})`, ids);
    await db.query(`DELETE FROM stock_ledger WHERE item_id IN (${placeholders})`, ids);
    await db.query(`DELETE FROM items WHERE id IN (${placeholders})`, ids);
    res.status(200).json({message: "Items deleted successfully"});
  } else if (req.method === "POST") {
    const {name, stock, price, unit, category, barcode} = req.body;
    const result = await db.query(
      "INSERT INTO items (name, category) VALUES ($1, $2) RETURNING id",
      [name, category]
    );
    const itemId = result.rows[0].id;
    await db.query(
      "INSERT INTO item_stock (itemId, stock, price, unit, barcode) VALUES ($1, $2, $3, $4, $5)",
      [itemId, stock, price, unit, barcode]
    );
    res.status(201).json({id: itemId, name, stock, price, unit, category, barcode});
  } else if (req.method === "PUT") {
    const {id, stock, category, unit} = req.body;
    if (stock) {
      await db.query("UPDATE item_stock SET stock = $1 WHERE itemId = $2", [stock, id]);
    }
    if (category) {
      await db.query("UPDATE items SET category = $1 WHERE id = $2", [category, id]);
    }
    if (unit) {
      await db.query("UPDATE item_stock SET unit = $1 WHERE itemId = $2", [unit, id]);
    }
    res.status(200).json({message: "Item updated successfully"});
  } else {
    res.setHeader("Allow", ["GET", "DELETE", "POST", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
