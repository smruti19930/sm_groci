import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    try {
      const storeResult = await db.query('SELECT store_id FROM user_store_mappings WHERE user_id = $1', [userId]);

      if (storeResult.rows.length === 0) {
        return res.status(200).json({ totalRevenue: 0, totalSales: 0, monthlyData: [] });
      }

      const storeId = storeResult.rows[0].store_id;

      const totalRevenueResult = await db.query('SELECT SUM(t.quantity * t.price) as total FROM transactions t JOIN item_stock ist ON t.itemid = ist.itemid::uuid WHERE ist.store_id = $1', [storeId]);
      const totalRevenue = totalRevenueResult.rows[0].total || 0;

      const totalSalesResult = await db.query('SELECT COUNT(DISTINCT t.invoiceNumber) as total FROM transactions t JOIN item_stock ist ON t.itemid = ist.itemid::uuid WHERE ist.store_id = $1', [storeId]);
      const totalSales = totalSalesResult.rows[0].total || 0;

      const monthlySalesResult = await db.query(`
        SELECT 
          TO_CHAR(t.created_at, 'YYYY-MM') as month,
          SUM(t.quantity * t.price) as revenue,
          COUNT(DISTINCT t.invoiceNumber) as sales
        FROM transactions t
        JOIN item_stock ist ON t.itemid = ist.itemid::uuid
        WHERE ist.store_id = $1
        GROUP BY month
        ORDER BY month
      `, [storeId]);
      const monthlyData = monthlySalesResult.rows;

      res.status(200).json({
        totalRevenue,
        totalSales,
        monthlyData,
      });
    } catch (error) {
      console.error('Error fetching sales data:', error);
      res.status(500).json({ message: 'Failed to fetch sales data' });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
