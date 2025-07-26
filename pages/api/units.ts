import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const units = await db.query("SELECT DISTINCT unit FROM item_stock");
      res.status(200).json(units.rows.map((row: any) => row.unit));
    } catch (error) {
      console.error('Error fetching units:', error);
      res.status(500).json({ message: 'Failed to fetch units' });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
