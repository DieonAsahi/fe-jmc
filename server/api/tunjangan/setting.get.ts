import { defineEventHandler } from "h3";
import pool from "../../utils/db";

export default defineEventHandler(async () => {
  const [rows] = await pool.query(
    "SELECT * FROM tunjangan_setting ORDER BY id DESC LIMIT 1",
  );
  return { success: true, data: (rows as any[])[0] || null };
});
