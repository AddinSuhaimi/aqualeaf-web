// pages/api/seaweed-species.js
import pool from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const [rows] = await pool.query(`SELECT species_id, species_name FROM Seaweed_Species ORDER BY species_name ASC`)
    res.status(200).json(rows)
  } catch (err) {
    console.error('[Species API] Error:', err)
    res.status(500).json({ error: 'Failed to fetch species list' })
  }
}
