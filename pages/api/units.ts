import { NextApiRequest, NextApiResponse } from 'next';
import { openDb } from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const db = await openDb();
    const units = await db.query("SELECT DISTINCT unit FROM item_stock");
    res.status(200).json(units.rows.map((row: any) => row.unit));
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
