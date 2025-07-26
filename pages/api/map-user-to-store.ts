import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, storeIds } = req.body;

    if (!userId || !storeIds || !Array.isArray(storeIds) || storeIds.length === 0) {
      return res.status(400).json({ message: 'User ID and at least one Store ID are required' });
    }

    try {
      await db.query('BEGIN');
      for (const storeId of storeIds) {
        await db.query(
          'INSERT INTO user_store_mappings (user_id, store_id) VALUES ($1, $2) ON CONFLICT (user_id, store_id) DO NOTHING',
          [userId, storeId]
        );
      }
      await db.query('COMMIT');
      res.status(200).json({ message: 'User mapped to store(s) successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error mapping user to store:', error);
      res.status(500).json({ message: 'Failed to map user to store' });
    }
  } else if (req.method === 'DELETE') {
    const { userId, storeId } = req.body;

    if (!userId || !storeId) {
      return res.status(400).json({ message: 'User ID and Store ID are required' });
    }

    try {
      await db.query('DELETE FROM user_store_mappings WHERE user_id = $1 AND store_id = $2', [userId, storeId]);
      res.status(200).json({ message: 'User mapping removed successfully' });
    } catch (error) {
      console.error('Error removing user mapping:', error);
      res.status(500).json({ message: 'Failed to remove user mapping' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
