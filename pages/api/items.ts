import { NextApiRequest, NextApiResponse } from 'next';
import { openDb } from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await openDb();

  if (req.method === "GET") {
    const items = await db.query(`
      SELECT i.id, i.name, i.category, s.stock, s.available_stock, s.price, s.unit, s.barcode, (s.stock * s.price) as totalPrice
      FROM items i
      JOIN item_stock s ON i.id = s.itemId
    `);
    res.status(200).json(items.rows);
  } else if (req.method === "DELETE") {
    const {ids} = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({message: "Invalid request"});
    }
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
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
      "INSERT INTO item_stock (itemId, stock, available_stock, price, unit, barcode) VALUES ($1, $2, $3, $4, $5, $6)",
      [itemId, stock, stock, price, unit, barcode]
    );
    res.status(201).json({id: itemId, name, stock, price, unit, available_stock: stock, category, barcode});
  } else if (req.method === "PUT") {
    const {id, stock, category, unit} = req.body;
    if (stock) {
      await db.query("UPDATE item_stock SET stock = $1, available_stock = $2 WHERE itemId = $3", [stock, stock, id]);
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
