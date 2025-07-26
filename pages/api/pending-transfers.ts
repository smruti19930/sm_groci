import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const storeResult = await db.query('SELECT l.id FROM user_store_mappings usm JOIN store s ON usm.store_id = s.store_id JOIN locations l ON s.store_name = l.name WHERE usm.user_id = $1', [userId]);

    if (storeResult.rows.length === 0) {
      return res.status(200).json([]);
    }

    const to_location_id = storeResult.rows[0].id;

    const transfersResult = await db.query(
      `SELECT 
        t.id, 
        t.from_location_id, 
        t.to_location_id, 
        fl.name as from_location_name, 
        tl.name as to_location_name, 
        t.status, 
        t.created_at
      FROM transfers t
      JOIN locations fl ON t.from_location_id = fl.id
      JOIN locations tl ON t.to_location_id = tl.id
      WHERE t.to_location_id = $1 AND t.status = 'in_transit'`,
      [to_location_id]
    );

    const transfers = transfersResult.rows;

    for (const transfer of transfers) {
      const itemsResult = await db.query(
        `SELECT i.name as item_name, ti.quantity 
         FROM transfer_items ti
         JOIN items i ON ti.item_id = i.id
         WHERE ti.transfer_id = $1`,
        [transfer.id]
      );
      transfer.items = itemsResult.rows;
    }

    res.status(200).json(transfers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending transfers', error });
  }
}
