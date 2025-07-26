import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const vendors = await db.query('SELECT vendor_name FROM vendor');
    res.status(200).json(vendors.rows.map((row: any) => row.vendor_name));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch vendors' });
  }
}
