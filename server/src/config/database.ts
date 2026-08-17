import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl:
    process.env.DB_SSL === "true"
      ? {
          // Set DB_SSL_VERIFY=true in production with Aiven's CA certificate.
          rejectUnauthorized: process.env.DB_SSL_VERIFY !== "false",
        }
      : undefined,
});

export default pool;
