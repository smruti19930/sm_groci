import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const transfers = await db.query('SELECT * FROM transfers');
    const transferItems = await db.query('SELECT * FROM transfer_items');
    const inventory = await db.query('SELECT * FROM inventory');

    res.status(200).json({
      transfers: transfers.rows,
      transferItems: transferItems.rows,
      inventory: inventory.rows,
    });
  } catch (error) {
    console.error('Error fetching transfer data:', error);
    res.status(500).json({ message: 'Failed to fetch transfer data' });
  }
}
