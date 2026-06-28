import { defineEventHandler, readMultipartFormData, createError } from "h3";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const UPLOAD_DIR = join(process.cwd(), "public", "images", "pegawai");

export default defineEventHandler(async (event) => {
  const body = await readMultipartFormData(event);
  if (!body || body.length === 0) {
    throw createError({
      statusCode: 400,
      message: "Tidak ada data yang diupload",
    });
  }

  const file = body.find((item: any) => item && item.filename);

  if (!file || !file.filename) {
    throw createError({
      statusCode: 400,
      message: "File gambar tidak ditemukan atau kosong",
    });
  }

  const ext = file.filename.split(".").pop()?.toLowerCase();
  if (!["png", "jpg", "jpeg"].includes(ext || "")) {
    throw createError({
      statusCode: 400,
      message: "Format file harus PNG/JPEG/JPG",
    });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const timestamp = Date.now();
  const cleanOriginalName = file.filename.replace(/[^a-zA-Z0-9.]/g, "_");
  const safeName = `${timestamp}-${cleanOriginalName}`;
  const filePath = join(UPLOAD_DIR, safeName);

  const fileBuffer = Buffer.isBuffer(file.data)
    ? file.data
    : Buffer.from(file.data);
  await writeFile(filePath, fileBuffer);

  return {
    success: true,
    data: {
      filename: safeName,
      url: `/images/pegawai/${safeName}`,
    },
  };
});
