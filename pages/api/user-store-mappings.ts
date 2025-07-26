import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const mappingsQuery = await db.query('SELECT * FROM user_store_mappings');
    res.status(200).json(mappingsQuery.rows);
  } catch (error) {
    console.error('Error fetching user-store mappings:', error);
    res.status(500).json({ message: 'Failed to fetch user-store mappings' });
  }
}
