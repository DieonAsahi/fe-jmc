import { defineEventHandler, getQuery, createError } from "h3";
import pool from "../utils/db";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 15;
  const search = (query.search as string) || "";

  const offset = (page - 1) * limit;

  try {
    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];

    if (search) {
      whereClause +=
        " AND (u.username LIKE ? OR a.title LIKE ? OR a.content LIKE ? OR a.ip LIKE ?)";
      const searchPattern = `%${search}%`;
      queryParams.push(
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
      );
    }

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM activities a
      LEFT JOIN user u ON a.created_by = u.id
      ${whereClause}
    `;
    const [countRows]: any = await pool.query(countQuery, queryParams);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    const dataQuery = `
      SELECT a.*, u.username as user_name 
      FROM activities a
      LEFT JOIN user u ON a.created_by = u.id
      ${whereClause}
      ORDER BY a.created_at DESC 
      LIMIT ? OFFSET ?
    `;

    const finalParams = [...queryParams, limit, offset];
    const [rows]: any = await pool.query(dataQuery, finalParams);

    return {
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: "Gagal mengambil data log aktivitas: " + error.message,
    });
  }
});