import { defineEventHandler, getQuery, setHeader } from "h3"
import pool from "../../utils/db"
import PdfPrinter from "pdfmake"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let sql = `
    SELECT p.nip, p.nama_pegawai as nama, mj.nama as jabatan, md.nama as departemen,
           p.tanggal_masuk, p.status
    FROM pegawai p
    LEFT JOIN master_data mj ON p.id_jabatan = mj.id
    LEFT JOIN master_data md ON p.id_departemen = md.id
    WHERE 1=1
  `
  const params: any[] = []

  if (query.ids) {
    const ids = String(query.ids).split(",").map(Number)
    sql += ` AND p.id IN (${ids.map(() => "?").join(",")})`
    params.push(...ids)
  }

  sql += " ORDER BY p.nama_pegawai"

  const [rows] = await pool.query(sql, params)
  const data = rows as any[]

  const printer = new PdfPrinter({
    Roboto: {
      normal: "node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff",
      bold: "node_modules/@fontsource/roboto/files/roboto-latin-700-normal.woff",
    },
  })

  const docDef: any = {
    content: [
      { text: "Daftar Pegawai", style: "header" },
      { text: `\nTanggal: ${new Date().toLocaleDateString("id-ID")}\n\n` },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "*", "auto", "auto", "auto", "auto"],
          body: [
            ["No", "NIP", "Nama", "Jabatan", "Departemen", "Status"],
            ...data.map((p: any, i: number) => [
              i + 1,
              p.nip || "-",
              p.nama || "-",
              p.jabatan || "-",
              p.departemen || "-",
              p.status || "-",
            ]),
          ],
        },
      },
    ],
    styles: {
      header: { fontSize: 16, bold: true },
    },
  }

  const pdfDoc = printer.createPdfKitDocument(docDef)
  const chunks: Buffer[] = []

  return new Promise((resolve) => {
    pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk))
    pdfDoc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks)
      setHeader(event, "Content-Type", "application/pdf")
      setHeader(event, "Content-Disposition", "attachment; filename=daftar-pegawai.pdf")
      resolve(pdfBuffer)
    })
    pdfDoc.end()
  })
})
