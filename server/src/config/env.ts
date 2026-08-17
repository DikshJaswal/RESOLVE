import dotenv from "dotenv";

dotenv.config();

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

export const clientOrigin = process.env.CLIENT_URL ?? "http://localhost:5173";
