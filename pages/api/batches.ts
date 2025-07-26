import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { itemId } = req.query;

  if (!itemId) {
    return res.status(400).json({ message: 'itemId is required' });
  }

  try {
    const query = `
      SELECT
        ist.batch_code,
        ist.price,
        sl.closing_stock as stock
      FROM item_stock ist
      LEFT JOIN (
        SELECT
          item_id,
          batch_code,
          closing_stock,
          ROW_NUMBER() OVER(PARTITION BY item_id, batch_code ORDER BY id DESC) as rn
        FROM stock_ledger
      ) sl ON ist.itemId = sl.item_id AND ist.batch_code = sl.batch_code AND sl.rn = 1
      WHERE ist.itemId = $1 AND ist.stock > 0
    `;
    const batches = await db.query(query, [itemId]);
    res.status(200).json(batches.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch batches' });
  }
}
