// pages/api/test-db.js
import { db } from '@/lib/db';

export default async function handler(req, res) {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.status(200).json({ message: 'Database connected ✅', result: rows[0].result });
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed ❌', error: error.message });
  }
}
