import { defineEventHandler } from "h3";
import pool from "../utils/db";

export default defineEventHandler(async (event) => {
  const auth = event.context.auth;

  console.log("=== [BACKEND DEBUG] USER AUTH CONTEXT ===");
  console.log(auth);

  if (!auth) {
    console.log("[BACKEND DEBUG] Akses ditolak: Auth tidak ditemukan.");
    return { success: false, message: "Unauthorized" };
  }

  try {
    const totalPegawai = (
      await pool.query("SELECT COUNT(*) as total FROM pegawai")
    )[0] as any[];

    const kontrakCount = (
      await pool.query(
        "SELECT COUNT(*) as total FROM pegawai WHERE status = 'PKWT'",
      )
    )[0] as any[];
    const tetapCount = (
      await pool.query(
        "SELECT COUNT(*) as total FROM pegawai WHERE status = 'PKWTT'",
      )
    )[0] as any[];
    const magangCount = (
      await pool.query(
        "SELECT COUNT(*) as total FROM pegawai WHERE status = 'Magang'",
      )
    )[0] as any[];

    const priaCount = (
      await pool.query(
        "SELECT COUNT(*) as total FROM pegawai WHERE jenis_kelamin = 'Laki-laki' OR jenis_kelamin = 'L'",
      )
    )[0] as any[];
    const wanitaCount = (
      await pool.query(
        "SELECT COUNT(*) as total FROM pegawai WHERE jenis_kelamin = 'Perempuan' OR jenis_kelamin = 'P'",
      )
    )[0] as any[];

    const perJabatan = (
      await pool.query(
        "SELECT mj.nama, COUNT(*) as total FROM pegawai p LEFT JOIN master_data mj ON p.id_jabatan = mj.id GROUP BY mj.nama",
      )
    )[0] as any[];

    const pegawaiTerbaru = (
      await pool.query(
        "SELECT p.id, p.nip, p.nama_pegawai as nama, p.tanggal_masuk, p.status, p.foto_pegawai as foto FROM pegawai p ORDER BY p.created_at DESC LIMIT 5",
      )
    )[0] as any[];

    const payloadResponse = {
      success: true,
      data: {
        role: auth.nama_role || "User",
        greeting: `Selamat Datang ${auth.nama}`,
        user: auth,
        statistik: {
          totalPegawai: totalPegawai[0]?.total || 0,
          kontrak: kontrakCount[0]?.total || 0,
          tetap: tetapCount[0]?.total || 0,
          magang: magangCount[0]?.total || 0,
          pria: priaCount[0]?.total || 0,
          wanita: wanitaCount[0]?.total || 0,
          perJabatan,
        },
        pegawaiTerbaru,
      },
    };

    console.log("=== [BACKEND DEBUG] FINAL RESPONSE PAYLOAD ===");
    console.log(JSON.stringify(payloadResponse, null, 2));

    return payloadResponse;
  } catch (error: any) {
    console.error("=== [BACKEND DEBUG] CRASH DI QUERY DATABASE ===");
    console.error(error.message);
    return { success: false, error: error.message };
  }
});
