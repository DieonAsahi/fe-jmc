import { defineEventHandler, readMultipartFormData, createError } from "h3"
import { writeFile, mkdir } from "node:fs/promises"
import { join } from "node:path"

const UPLOAD_DIR = join(process.cwd(), "public", "images", "pegawai")

export default defineEventHandler(async (event) => {
  const body = await readMultipartFormData(event)
  if (!body || body.length === 0) {
    throw createError({ statusCode: 400, message: "Tidak ada file yang diupload" })
  }

  const file = body[0]
  if (!file.filename) {
    throw createError({ statusCode: 400, message: "Nama file tidak ditemukan" })
  }

  const ext = file.filename.split(".").pop()?.toLowerCase()
  if (!["png", "jpg", "jpeg"].includes(ext || "")) {
    throw createError({ statusCode: 400, message: "Format file harus PNG/JPEG/JPG" })
  }

  await mkdir(UPLOAD_DIR, { recursive: true })

  const timestamp = Date.now()
  const safeName = `${timestamp}-${file.filename}`
  const filePath = join(UPLOAD_DIR, safeName)
  await writeFile(filePath, file.data)

  return { success: true, data: { filename: safeName, url: `/images/pegawai/${safeName}` } }
})
