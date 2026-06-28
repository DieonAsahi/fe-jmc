import { defineEventHandler, getCookie, getHeader, createError } from "h3";
import jwt from "jsonwebtoken";
import process from "node:process";

export default defineEventHandler((event) => {
  const routerPath = event.node.req.url || "";

  const isPublicRoute =
    routerPath.startsWith("/api/auth") ||
    routerPath.includes("login") ||
    routerPath.includes("captcha") ||
    routerPath.includes("recaptcha") ||
    routerPath.includes("verify");

  if (!routerPath.startsWith("/api") || isPublicRoute) {
    return;
  }

  let token = getCookie(event, "auth_session");

  if (!token) {
    const authHeader = getHeader(event, "authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    throw createError({
      statusCode: 401,
      message: "Akses ditolak. Silakan login terlebih dahulu.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "rahasia_superadmin_fwdjmc",
    );

    event.context.user = decoded;
    event.context.auth = decoded;
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: "Sesi Anda telah berakhir. Silakan login kembali.",
    });
  }
});
