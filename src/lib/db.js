// lib/db.js
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const caPath = path.join(process.cwd(), 'certs', 'ca.pem');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(caPath)
  },
  connectTimeout: 20000,
});

export default pool;
