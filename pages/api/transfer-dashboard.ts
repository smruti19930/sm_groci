import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const totalTransfersQuery = await db.query(`SELECT COUNT(*) FROM transfers`);
    const inTransitQuery = await db.query(`SELECT COUNT(*) FROM transfers WHERE status = 'in_transit'`);
    const completedTransfersQuery = await db.query(`SELECT COUNT(*) FROM transfers WHERE status = 'received'`);
    const itemsMovedQuery = await db.query(`SELECT SUM(quantity) FROM transfer_items`);
    const totalValueQuery = await db.query(`SELECT SUM(ti.quantity * ist.price) FROM transfer_items ti JOIN item_stock ist ON ti.item_id = ist.itemid AND ti.batch_code = ist.batch_code`);
    const recentTransfersQuery = await db.query(`
      SELECT t.id, fl.name as from_location_name, tl.name as to_location_name, SUM(ti.quantity) as items, t.status, t.created_at::DATE as date
      FROM transfers t
      JOIN locations fl ON t.from_location_id = fl.id
      JOIN locations tl ON t.to_location_id = tl.id
      JOIN transfer_items ti ON t.id = ti.transfer_id
      GROUP BY t.id, fl.name, tl.name, t.status, t.created_at
      ORDER BY t.created_at DESC
      LIMIT 5
    `);
    const transfersByTypeQuery = await db.query(`SELECT transfer_type as name, COUNT(*) as value FROM transfers GROUP BY transfer_type`);
    const itemTransferReportQuery = await db.query(`
      SELECT i.name, SUM(ti.quantity) as qty, COUNT(DISTINCT t.from_location_id) as "from", COUNT(DISTINCT t.to_location_id) as "to", SUM(ti.quantity * ist.price) as value
      FROM transfer_items ti
      JOIN items i ON ti.item_id = i.id
      JOIN item_stock ist ON ti.item_id = ist.itemid AND ti.batch_code = ist.batch_code
      JOIN transfers t ON ti.transfer_id = t.id
      GROUP BY i.name
    `);

    const data = {
      totalTransfers: parseInt(totalTransfersQuery.rows[0].count, 10),
      inTransit: parseInt(inTransitQuery.rows[0].count, 10),
      completedTransfers: parseInt(completedTransfersQuery.rows[0].count, 10),
      itemsMoved: parseInt(itemsMovedQuery.rows[0].sum, 10) || 0,
      totalValue: parseFloat(totalValueQuery.rows[0].sum).toFixed(2),
      recentTransfers: recentTransfersQuery.rows,
      transfersByType: transfersByTypeQuery.rows.map((row: any) => ({ ...row, value: parseInt(row.value, 10) })),
      transfersPerDay: [],
      itemTransferReport: itemTransferReportQuery.rows.map((row: any) => ({
        ...row,
        qty: parseInt(row.qty, 10),
        from: parseInt(row.from, 10),
        to: parseInt(row.to, 10),
        value: parseFloat(row.value).toFixed(2),
      })),
    };
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching transfer dashboard data:', error);
    res.status(500).json({ message: 'Failed to fetch transfer dashboard data' });
  }
}
