import { defineEventHandler, getRouterParam, setHeader, createError } from "h3";
import pool from "../../../utils/db";
import pdfmake from "pdfmake";

export default defineEventHandler(async (event) => {
  const path = event.path || "";
  const id = getRouterParam(event, "id") || path.match(/\/(\d+)\.pdf$/)?.[1];

  const [pegawai] = await pool.query(
    `SELECT p.*, mj.nama as jabatan, md.nama as departemen,
            wk.kecamatan, wk.kabupaten, wk.provinsi
     FROM pegawai p
     LEFT JOIN master_data mj ON p.id_jabatan = mj.id
     LEFT JOIN master_data md ON p.id_departemen = md.id
     LEFT JOIN master_wilayah wk ON p.id_kecamatan = wk.id
     WHERE p.id = ?`,
    [id],
  );

  const rows = pegawai as any[];
  if (rows.length === 0) {
    throw createError({ statusCode: 404, message: "Pegawai tidak ditemukan" });
  }

  const p = rows[0];

  const [pendidikan] = await pool.query(
    "SELECT tingkat_pendidikan, nama_sekolah, tahun_lulus FROM pegawai_pendidikan WHERE id_pegawai = ? ORDER BY tahun_lulus DESC",
    [id],
  );

  // Memetakan riwayat pendidikan langsung menjadi baris tabel pdfmake yang aman
  const pendRows = (pendidikan as any[]).map((pd: any) => [
    { text: pd.tingkat_pendidikan || "-", style: "tableValue" },
    { text: pd.nama_sekolah || "-", style: "tableValue" },
    { text: pd.tahun_lulus || "-", style: "tableValue" },
  ]);

  const docDef: any = {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
    content: [
      // HEADER UTAMA
      { text: "DETAIL DATA PEGAWAI", style: "header" },
      { text: "Laporan Biodata Lengkap Karyawan", style: "subHeader" },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1.5,
            lineColor: "#1e3a8a",
          },
        ],
        margin: [0, 5, 0, 15],
      },

      // SEKSI 1: DATA KEPEGAWAIAN
      { text: "I. Informasi Pekerjaan", style: "sectionTitle" },
      {
        table: {
          widths: ["25%", "25%", "25%", "25%"],
          body: [
            [
              { text: "NIP", style: "tableLabel" },
              { text: p.nip || "-", style: "tableValue" },
              { text: "Tanggal Masuk", style: "tableLabel" },
              {
                text: p.tanggal_masuk
                  ? new Date(p.tanggal_masuk).toLocaleDateString("id-ID")
                  : "-",
                style: "tableValue",
              },
            ],
            [
              { text: "Jabatan", style: "tableLabel" },
              { text: p.jabatan || "-", style: "tableValue" },
              { text: "Departemen", style: "tableLabel" },
              { text: p.departemen || "-", style: "tableValue" },
            ],
            [
              { text: "Status Kerja", style: "tableLabel" },
              { text: p.status || "-", style: "tableValue" },
              { text: "Jarak Kantor", style: "tableLabel" },
              {
                text: `${p.jarak_rumah_kantor || "-"} km`,
                style: "tableValue",
              },
            ],
          ],
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 15],
      },

      // SEKSI 2: DATA PRIBADI
      { text: "II. Informasi Pribadi", style: "sectionTitle" },
      {
        table: {
          widths: ["25%", "75%"],
          body: [
            [
              { text: "Nama Lengkap", style: "tableLabel" },
              { text: p.nama_pegawai || "-", style: "tableValue" },
            ],
            [
              { text: "Email", style: "tableLabel" },
              { text: p.email || "-", style: "tableValue" },
            ],
            [
              { text: "No. Handphone", style: "tableLabel" },
              { text: p.nomor_hp || "-", style: "tableValue" },
            ],
            [
              { text: "Tempat, Tgl Lahir", style: "tableLabel" },
              {
                text: `${p.tempat_lahir || "-"}, ${p.tanggal_lahir ? new Date(p.tanggal_lahir).toLocaleDateString("id-ID") : "-"}`,
                style: "tableValue",
              },
            ],
            [
              { text: "Karakteristik", style: "tableLabel" },
              {
                text: `Usia: ${p.usia || "-"} Tahun  |  Jenis Kelamin: ${p.jenis_kelamin || "-"}`,
                style: "tableValue",
              },
            ],
            [
              { text: "Status Pernikahan", style: "tableLabel" },
              {
                text: `${p.status_kawin || "-"} (Jumlah Anak: ${p.jumlah_anak || 0})`,
                style: "tableValue",
              },
            ],
            [
              { text: "Alamat Lengkap", style: "tableLabel" },
              {
                text: `${p.alamat_lengkap || "-"}, Kec. ${p.kecamatan || "-"}, Kab/Kota. ${p.kabupaten || "-"}, Prov. ${p.provinsi || "-"}`,
                style: "tableValue",
              },
            ],
          ],
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 15],
      },

      // SEKSI 3: DATA PENDIDIKAN
      { text: "III. Riwayat Pendidikan", style: "sectionTitle" },
      {
        table: {
          widths: ["30%", "50%", "20%"],
          body: [
            [
              { text: "Tingkat", style: "tableLabel", bold: true },
              {
                text: "Nama Sekolah / Kampus",
                style: "tableLabel",
                bold: true,
              },
              { text: "Tahun Lulus", style: "tableLabel", bold: true },
            ],
            ...pendRows,
          ],
        },
        layout: "lightHorizontalLines",
      },
    ],
    styles: {
      header: { fontSize: 18, bold: true, color: "#1e3a8a" },
      subHeader: { fontSize: 10, color: "#6b7280", margin: [0, 2, 0, 0] },
      sectionTitle: {
        fontSize: 12,
        bold: true,
        color: "#1e3a8a",
        margin: [0, 10, 0, 5],
      },
      tableLabel: {
        fontSize: 9,
        bold: true,
        color: "#374151",
        fillColor: "#f3f4f6",
        margin: [4, 4, 4, 4],
      },
      tableValue: { fontSize: 9, color: "#1f2937", margin: [4, 4, 4, 4] },
    },
    defaultStyle: {
      font: "Roboto",
    },
  };

  pdfmake.fonts = {
    Roboto: {
      normal: "node_modules/pdfmake/fonts/Roboto/Roboto-Regular.ttf",
      bold: "node_modules/pdfmake/fonts/Roboto/Roboto-Medium.ttf",
    },
  };

  const doc = pdfmake.createPdf(docDef);
  const pdfBuffer = await doc.getBuffer();

  setHeader(event, "Content-Type", "application/pdf");
  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename=pegawai-${p.nip || id}.pdf`,
  );
  return pdfBuffer;
});
