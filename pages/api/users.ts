import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function getUsers(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const users = await db.query('SELECT id, username FROM users');
    res.status(200).json(users.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
}
