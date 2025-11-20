// pages/api/login.js
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method Not Allowed' })

  const { identifier, password } = req.body
  if (!identifier || !password)
    return res.status(400).json({ message: 'Missing fields' })

  const [rows] = await pool.query(
    'SELECT farm_id, farm_name, password, is_verified, email FROM farm_account WHERE (email = ? OR farm_name = ?)',
    [identifier, identifier]
  )
  if (!rows.length)
    return res.status(401).json({ message: 'User not found' })

  const user = rows[0]

  const valid = await bcrypt.compare(password, user.password)
  if (!valid)
    return res.status(401).json({ message: 'Invalid credentials' })

  if (user.is_verified === 0) {
    return res.status(403).json({
      message: 'Account not verified',
      notVerified: true,
      email: user.email
    })
  }

  const token = jwt.sign(
    { farm_id: user.farm_id, farm_name: user.farm_name },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  res.setHeader('Set-Cookie', [
    `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`
  ])
  res.status(200).json({ message: 'Logged in' })
}