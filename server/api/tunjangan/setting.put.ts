import { defineEventHandler, readBody, createError } from "h3"
import pool from "../../utils/db"
import { logActivity } from "../../utils/activity"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const auth = event.context.auth

  if (!body.base_fare || !body.berlaku_mulai) {
    throw createError({ statusCode: 400, message: "Base fare dan berlaku mulai wajib diisi" })
  }

  await pool.execute(
    "INSERT INTO tunjangan_setting (base_fare, berlaku_mulai, min_km, max_km) VALUES (?, ?, ?, ?)",
    [body.base_fare, body.berlaku_mulai, body.min_km || 5, body.max_km || 25],
  )

  await logActivity(event, "Setting Tunjangan", "Mengupdate setting tunjangan transport", auth?.id)

  return { success: true, message: "Setting tunjangan berhasil disimpan" }
})
