// pages/api/scan-report/pdf-report.js
import pool from '@/lib/db'
import PDFDocumentWithTables from 'pdfkit-table'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const token = req.cookies.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const farmId = decoded.farm_id

    const { dateFrom, dateTo, species, quality } = req.body

    let query = `
      SELECT sr.*, ss.species_name, ss.phylum
      FROM scan_report sr
      JOIN seaweed_species ss ON sr.species_id = ss.species_id
      WHERE sr.farm_id = ?`
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

    const total = rows.length || 1
    const goodCount = rows.filter(r => r.quality_status === 'Good').length
    const avgImpurity = (
      rows.reduce((sum, r) => sum + parseFloat(r.impurity_status), 0) / total
    ).toFixed(2)
    const avgDiscoloration = (
      rows.reduce((sum, r) => sum + parseFloat(r.discoloration_level), 0) / total
    ).toFixed(2)

    const doc = new PDFDocumentWithTables({ margin: 40, size: 'A4' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=seaweed_report.pdf')
    doc.pipe(res)

    doc.fontSize(18).text('Seaweed Quality Report', { align: 'center' }).moveDown()
    doc.fontSize(12).text(`Farm: ${decoded.farm_name || 'Your Farm'}`)
    doc.text(`Date Range: ${dateFrom || 'N/A'} to ${dateTo || 'N/A'}`).moveDown()

    doc.fontSize(14).text('Summary', { underline: true }).moveDown(0.5)
    doc.fontSize(12).text(`Total Records: ${rows.length}`)
    doc.text(`Good Quality: ${goodCount} (${((goodCount / total) * 100).toFixed(1)}%)`)
    doc.text(`Avg. Impurity: ${avgImpurity}%`)
    doc.text(`Avg. Discoloration: ${avgDiscoloration}%`).moveDown(1.5)

    doc.fontSize(14).text('Filters Used', { underline: true }).moveDown(0.5)
    doc.fontSize(12)

    doc.text(`Date Range: ${dateFrom || 'All Time'} to ${dateTo || 'All Time'}`)
    doc.text(`Species Filter: ${species ? rows.find(r => r.species_id == species)?.species_name || species : 'All Species'}`)
    doc.text(`Quality Filter: ${quality || 'All Qualities'}`)

    doc.moveDown(1.5)

    await doc.table(
      {
        title: 'Seaweed Quality Scan Records',
        subtitle: `Generated on ${new Date().toLocaleDateString('en-MY')}`,
        headers: [
          { label: 'Timestamp', property: 'timestamp', width: 130, renderer: null },
          { label: 'Species', property: 'species', width: 80 },
          { label: 'Quality', property: 'quality', width: 60 },
          { label: 'Impurity %', property: 'impurity', width: 80 },
          { label: 'Discoloration %', property: 'discoloration', width: 100 }
        ],
        datas: rows.slice(0, 10).map(row => ({
          timestamp: new Date(row.timestamp).toLocaleString('en-MY', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Kuala_Lumpur'
          }),
          species: row.species_name,
          quality: row.quality_status,
          impurity: `${parseFloat(row.impurity_status)}%`,
          discoloration: `${parseFloat(row.discoloration_level)}%`
        }))
      },
      {
        padding: 5,
        columnSpacing: 8,
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
        prepareRow: (row, indexColumn, indexRow) =>
          doc.font('Helvetica').fontSize(10)
      }
    )


    doc.end()
  } catch (err) {
    console.error('[PDF Report] Error:', err)
    res.status(500).json({ error: 'Failed to generate report' })
  }
}