import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const locations = await db.query('SELECT id, name FROM locations');
      res.status(200).json(locations.rows);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch locations' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
