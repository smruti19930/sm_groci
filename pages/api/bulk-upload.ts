import { NextApiRequest, NextApiResponse } from 'next';
import { openDb } from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const db = await openDb();
    const {items} = req.body;

    try {
      for (const item of items) {
        // Check if item with the same name and unit already exists
        const itemResult = await db.query(
          "SELECT i.id, s.unit FROM items i JOIN item_stock s ON i.id = s.itemId WHERE i.name = $1 AND s.unit = $2",
          [item.name, item.unit]
        );

        if (itemResult.rows.length > 0) {
          // Update existing item
          const itemId = itemResult.rows[0].id;
          await db.query(
            "UPDATE item_stock SET stock = stock + $1, available_stock = available_stock + $1, price = $2 WHERE itemId = $3",
            [item.stock, item.price, itemId]
          );
        } else {
          // Insert new item
          const newItemResult = await db.query("INSERT INTO items (name, category) VALUES ($1, $2) RETURNING id", [item.name, item.category]);
          const itemId = newItemResult.rows[0].id;
          await db.query(
            "INSERT INTO item_stock (itemId, stock, available_stock, price, unit) VALUES ($1, $2, $3, $4, $5)",
            [itemId, item.stock, item.stock, item.price, item.unit]
          );
        }
      }
      res.status(200).json({message: "Bulk upload successful"});
    } catch (error) {
      console.error(error);
      res.status(500).json({message: "Bulk upload failed"});
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
