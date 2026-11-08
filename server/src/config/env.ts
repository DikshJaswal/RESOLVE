import dotenv from "dotenv";

dotenv.config();

// In test environment, provide mock fallback values if not explicitly set
if (process.env.NODE_ENV === "test") {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-at-least-32-chars-long";
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-jwt-refresh-secret-at-least-32-chars";
  process.env.DB_HOST = process.env.DB_HOST || "localhost";
  process.env.DB_USER = process.env.DB_USER || "test";
  process.env.DB_PASSWORD = process.env.DB_PASSWORD || "test";
  process.env.DB_NAME = process.env.DB_NAME || "test_db";
}

const required = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}`,
  );
}

export const clientOrigin = (
  process.env.CLIENT_URL ?? "http://localhost:5173"
).replace(/\/+$/, "");
