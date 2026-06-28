import { defineEventHandler, readBody, createError } from "h3";
import bcrypt from "bcryptjs";
import pool from "../../utils/db";
import { signToken } from "../../utils/jwt";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: "Username dan password wajib diisi",
    });
  }

  const [rows]: any = await pool.query(
    `SELECT u.*, p.nama_pegawai, p.nomor_hp FROM user u 
     LEFT JOIN pegawai p ON u.id_pegawai = p.id 
     WHERE (u.username = ? OR u.email = ? OR p.nomor_hp = ?) AND u.disabled = 0`,
    [username, username, username],
  );

  console.log("=== DATA USER DARI DB ===");
  console.log(rows[0]);

  if (rows.length === 0) {
    throw createError({ statusCode: 401, message: "Pengguna tidak ditemukan" });
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw createError({ statusCode: 401, message: "Password salah" });
  }

  const token = signToken({
    id: user.id,
    id_role: user.id_role,
    id_pegawai: user.id_pegawai,
    username: user.username,
    nama: user.nama || user.nama_pegawai,
  });

  return {
    success: true,
    token,
    user: {
      id: user.id,
      nama: user.nama || user.nama_pegawai,
      username: user.username,
    },
  };
});
