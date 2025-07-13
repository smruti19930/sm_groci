import { NextApiRequest, NextApiResponse } from 'next';
import { openDb } from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await openDb();

  if (req.method === "GET") {
    const categories = await db.query("SELECT DISTINCT category FROM items");
    res.status(200).json(categories.rows.map((row: any) => row.category));
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
