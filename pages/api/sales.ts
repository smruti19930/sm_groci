import { NextApiRequest, NextApiResponse } from 'next';
import { openDb } from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const db = await openDb();
    const sales = await db.query(
      `SELECT t.invoiceNumber, i.name, t.quantity, s.price, (t.quantity * s.price) as total, t.created_at
       FROM transactions t
       JOIN items i ON t.itemId = i.id
       JOIN item_stock s ON t.itemId = s.itemId
       ORDER BY t.created_at DESC`
    );
    res.status(200).json(sales.rows);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
