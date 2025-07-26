import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const purchaseData = await db.query(`
        SELECT
          v.vendor_name,
          SUM(sl.stock_in_qty) as total_items,
          SUM(sl.stock_in_qty * s.price) as total_cost
        FROM stock_ledger sl
        JOIN vendor v ON sl.vendor_id = v.vendor_id
        JOIN item_stock s ON sl.item_id = s.itemId AND sl.batch_code = s.batch_code
        WHERE sl.transaction_type = 'PURCHASE FROM VENDOR'
        GROUP BY v.vendor_name
        ORDER BY total_cost DESC
      `);

      const overallTotals = await db.query(`
        SELECT
          SUM(sl.stock_in_qty) as total_items,
          SUM(sl.stock_in_qty * s.price) as total_cost
        FROM stock_ledger sl
        JOIN item_stock s ON sl.item_id = s.itemId AND sl.batch_code = s.batch_code
        WHERE sl.transaction_type = 'PURCHASE FROM VENDOR'
      `);

      res.status(200).json({
        byVendor: purchaseData.rows,
        overall: overallTotals.rows[0],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch purchase data' });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
