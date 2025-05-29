// pages/api/register.js
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { google } from 'googleapis'

// OAuth2 client setup
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })

// Helper: send verification email using OAuth2
async function sendVerificationEmail(email, token) {
  // Generate access token
  const accessToken = await oAuth2Client.getAccessToken()

  // create Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: accessToken.token || accessToken,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
  const verifyUrl = `${baseUrl}/verify?token=${token}`

  await transporter.sendMail({
    from: `"AquaLeaf" <noreply@aqualeaf.com>`,
    to: email,
    subject: 'Please verify your email',
    text: `Welcome to AquaLeaf!\nVerify your email here: ${verifyUrl}`,
    html: `<p>…click <a href="${verifyUrl}">here</a>.</p>`,
    })
}

export default async function registerHandler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { farmName, location, email, password } = req.body
  if (!farmName || !location || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' })
  }

  // Check for existing user
  const [exists] = await pool.query(
    'SELECT id FROM users WHERE email = ? OR farm_name = ?',
    [email, farmName]
  )
  if (exists.length) {
    return res.status(400).json({ message: 'Already registered' })
  }

  // Hash password and create verification token
  const hash = await bcrypt.hash(password, 10)
  const token = crypto.randomBytes(32).toString('hex')

  // Insert new user
  await pool.query(
    'INSERT INTO users (farm_name, location, email, password, is_verified, verification_token) VALUES (?, ?, ?, ?, 0, ?)',
    [farmName, location, email, hash, token]
  )

  // Send verification email
  try {
    await sendVerificationEmail(email, token)
    return res.status(201).json({ message: 'Registered. Verification email sent.' })
  } catch (err) {
    console.error('Error sending verification email:', err)
    return res.status(500).json({ message: 'Error sending email. Please try again later.' })
  }
}