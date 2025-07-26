import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function getStores(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const stores = await db.query('SELECT store_id as id, store_name as name FROM store');
    res.status(200).json(stores.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stores', error });
  }
}
