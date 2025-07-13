import { NextApiRequest, NextApiResponse } from 'next';
import { openDb } from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const db = await openDb();
    const {username, password} = req.body;
    try {
      await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, password]);
      res.status(201).json({message: "User created successfully"});
    } catch (error) {
      res.status(409).json({message: "User already exists"});
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
