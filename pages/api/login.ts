import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const {username, password} = req.body;
    try {
      const user = await db.query("SELECT * FROM users WHERE username = $1 AND password = $2", [username, password]);
      if (user.rows.length > 0) {
        res.status(200).json({message: "Login successful"});
      } else {
        res.status(401).json({message: "Invalid credentials"});
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({message: "Login failed"});
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
