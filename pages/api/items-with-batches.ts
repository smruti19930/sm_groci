import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, itemId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  if (!itemId) {
    return res.status(400).json({ message: 'Item ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const storeResult = await db.query('SELECT store_id FROM user_store_mappings WHERE user_id = $1', [userId]);

      if (storeResult.rows.length === 0) {
        return res.status(404).json({ message: 'Store not found for this user' });
      }
      const storeId = storeResult.rows[0].store_id;

      const query = `
        WITH latest_stock AS (
          SELECT
            batch_code,
            closing_stock,
            ROW_NUMBER() OVER(PARTITION BY batch_code ORDER BY ref_doc_date DESC, id DESC) as rn
          FROM stock_ledger
          WHERE item_id = $1 AND store_id = $2
        )
        SELECT
          ls.batch_code,
          ist.price,
          ls.closing_stock as stock
        FROM latest_stock ls
        JOIN item_stock ist ON ls.batch_code = ist.batch_code AND ist.itemid = $1
        WHERE ls.rn = 1 AND ls.closing_stock > 0
      `;
      const { rows } = await db.query(query, [itemId, storeId]);
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching items with batches:', error);
      res.status(500).json({ message: 'Failed to fetch items with batches' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
