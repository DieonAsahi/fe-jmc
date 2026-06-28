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

  const pendList = (pendidikan as any[]).map(
    (pd: any) =>
      `${pd.tingkat_pendidikan || "-"} / ${pd.nama_sekolah || "-"} / ${pd.tahun_lulus || "-"}`,
  );

  const docDef: any = {
    content: [
      { text: "DETAIL PEGAWAI", style: "mainHeader" },
      {
        text: `Dicetak pada: ${new Date().toLocaleDateString("id-ID")}\n`,
        style: "metaText",
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 5,
            x2: 515,
            y2: 5,
            lineWidth: 1.5,
            lineColor: "#cbd5e1",
          },
        ],
      },
      { text: "\n" },

      {
        columns: [
          {
            width: "50%",
            stack: [
              { text: "DATA DIRI", style: "sectionHeader" },
              {
                margin: [0, 5, 0, 15],
                table: {
                  widths: [80, "*"],
                  body: [
                    [
                      { text: "NIP", style: "label" },
                      { text: `: ${p.nip || "-"}`, style: "value" },
                    ],
                    [
                      { text: "Nama Lengkap", style: "label" },
                      { text: `: ${p.nama || "-"}`, style: "value" },
                    ],
                    [
                      { text: "Email", style: "label" },
                      { text: `: ${p.email || "-"}`, style: "value" },
                    ],
                    [
                      { text: "No. HP", style: "label" },
                      { text: `: ${p.no_hp || "-"}`, style: "value" },
                    ],
                    [
                      { text: "Tempat Lahir", style: "label" },
                      { text: `: ${p.tempat_lahir || "-"}`, style: "value" },
                    ],
                    [
                      { text: "Tanggal Lahir", style: "label" },
                      { text: `: ${p.tanggal_lahir || "-"}`, style: "value" },
                    ],
                    [
                      { text: "Usia", style: "label" },
                      { text: `: ${p.usia || "-"} tahun`, style: "value" },
                    ],
                    [
                      { text: "Status Kawin", style: "label" },
                      {
                        text: `: ${p.status_pernikahan || "-"}`,
                        style: "value",
                      },
                    ],
                    [
                      { text: "Jumlah Anak", style: "label" },
                      { text: `: ${p.jumlah_anak ?? "-"}`, style: "value" },
                    ],
                  ],
                },
                layout: "noBorders",
              },

              { text: "ALAMAT LENGKAP", style: "subSectionHeader" },
              {
                margin: [0, 5, 0, 0],
                table: {
                  widths: [80, "*"],
                  body: [
                    [
                      { text: "Alamat", style: "label" },
                      { text: `: ${p.alamat || "-"}`, style: "value" },
                    ],
                    [
                      { text: "Kecamatan", style: "label" },
                      { text: `: ${p.kecamatan || "-"}`, style: "value" },
                    ],
                    [
                      { text: "Kabupaten", style: "label" },
                      { text: `: ${p.kabupaten || "-"}`, style: "value" },
                    ],
                    [
                      { text: "Provinsi", style: "label" },
                      { text: `: ${p.provinsi || "-"}`, style: "value" },
                    ],
                  ],
                },
                layout: "noBorders",
              },
            ],
          },

          {
            width: "50%",
            margin: [15, 0, 0, 0], 
            stack: [
              { text: "DATA KEPEGAWAIAN", style: "sectionHeader" },
              {
                margin: [0, 5, 0, 20],
                table: {
                  widths: [90, "*"],
                  body: [
                    [
                      { text: "Tanggal Masuk", style: "label" },
                      { text: `: ${p.tanggal_masuk || "-"}`, style: "value" },
                    ],
                    [
                      { text: "Jabatan", style: "label" },
                      { text: `: ${p.jabatan || "-"}`, style: "value" },
                    ],
                    [
                      { text: "Departemen", style: "label" },
                      { text: `: ${p.departemen || "-"}`, style: "value" },
                    ],
                    [
                      { text: "Jenis Kelamin", style: "label" },
                      { text: `: ${p.jenis_kelamin || "-"}`, style: "value" },
                    ],
                    [
                      { text: "Jarak Rumah", style: "label" },
                      { text: `: ${p.jarak_kantor || "-"} km`, style: "value" },
                    ],
                    [
                      { text: "Status", style: "label" },
                      { text: `: ${p.status || "-"}`, style: "value" },
                    ],
                  ],
                },
                layout: "noBorders",
              },

              { text: "RIWAYAT PENDIDIKAN", style: "sectionHeader" },
              {
                margin: [0, 5, 0, 0],
                ul: (p.pendidikan || "")
                  .split("\n")
                  .filter((l: string) => l.trim() !== "")
                  .map((line: string) => {
                    return {
                      text: line.replace(/^-\s*/, ""),
                      style: "value",
                      margin: [0, 2, 0, 2],
                    };
                  }),
              },
            ],
          },
        ],
      },
    ],

    styles: {
      mainHeader: {
        fontSize: 18,
        bold: true,
        color: "#1e3a8a",
        letterSpacing: 0.5,
      },
      metaText: { fontSize: 9, color: "#64748b" },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        color: "#1e3a8a",
        margin: [0, 0, 0, 5],
      },
      subSectionHeader: {
        fontSize: 11,
        bold: true,
        color: "#475569",
        margin: [0, 10, 0, 2],
      },
      label: { fontSize: 10, bold: true, color: "#475569" },
      value: { fontSize: 10, color: "#0f172a" },
    },
    defaultStyle: {
      columnGap: 20,
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
