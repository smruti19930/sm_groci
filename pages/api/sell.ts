import { NextApiRequest, NextApiResponse } from 'next';
import { openDb } from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const db = await openDb();
    const {items, invoiceNumber} = req.body;

    try {
      for (const item of items) {
        await db.query(
          "INSERT INTO transactions (invoiceNumber, itemId, quantity) VALUES ($1, $2, $3)",
          [invoiceNumber, item.id, item.quantity]
        );
        await db.query(
          "UPDATE item_stock SET stock = stock - $1, available_stock = available_stock - $1 WHERE itemId = $2",
          [item.quantity, item.id]
        );
      }
      res.status(200).json({message: "Sale successful"});
    } catch (error) {
      console.error(error);
      res.status(500).json({message: "Sale failed"});
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
