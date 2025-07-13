import { NextApiRequest, NextApiResponse } from 'next';
import { openDb } from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const db = await openDb();
    const {username, password} = req.body;
    const user = await db.query("SELECT * FROM users WHERE username = $1 AND password = $2", [username, password]);
    if (user.rows.length > 0) {
      res.status(200).json({message: "Login successful"});
    } else {
      res.status(401).json({message: "Invalid credentials"});
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
