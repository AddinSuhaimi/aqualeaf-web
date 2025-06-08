import jwt from 'jsonwebtoken'
import pool from '@/lib/db'
import PDFDocument from 'pdfkit'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const token = req.cookies.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const farmId = decoded.farm_id

    const { species, quality, dateFrom, dateTo } = req.body

    let query = `
      SELECT sr.timestamp, sr.impurity_status, sr.discoloration_level,
             sr.quality_status, ss.species_name, ss.phylum_name
      FROM scan_report sr
      JOIN seaweed_species ss ON sr.species_id = ss.species_id
      WHERE sr.farm_id = ?
    `
    const params = [farmId]

    if (species) {
      query += ` AND sr.species_id = ?`
      params.push(species)
    }
    if (quality) {
      query += ` AND sr.quality_status = ?`
      params.push(quality)
    }
    if (dateFrom && dateTo) {
      query += ` AND sr.timestamp BETWEEN ? AND ?`
      params.push(dateFrom, dateTo)
    }

    query += ` ORDER BY sr.timestamp DESC`

    const [rows] = await pool.query(query, params)

    // Start PDF generation
    const doc = new PDFDocument({ size: 'A4', margin: 50 })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=seaweed_report.pdf')
    doc.pipe(res)

    doc.fontSize(18).text('Seaweed Scan Report', { align: 'center' }).moveDown(1)

    rows.forEach((row, i) => {
      doc.fontSize(10)
      doc.text(`Scan #${i + 1}`)
      doc.text(`- Species       : ${row.species_name} (${row.phylum_name})`)
      doc.text(`- Quality       : ${row.quality_status}`)
      doc.text(`- Impurity      : ${row.impurity_status}%`)
      doc.text(`- Discoloration : ${row.discoloration_level}%`)
      doc.text(`- Timestamp     : ${row.timestamp}`)
      doc.moveDown()
    })

    doc.end()
  } catch (err) {
    console.error('[Export PDF] Error:', err)
    res.status(500).json({ error: 'Failed to generate report' })
  }
}
