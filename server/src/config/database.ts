import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const parsedPort = Number(process.env.DB_PORT);
const port = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 3306;

const useSsl =
  process.env.DB_SSL === "true" ||
  process.env.DB_SSL === "1";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: useSsl
    ? {
        rejectUnauthorized: process.env.DB_SSL_VERIFY === "true",
      }
    : undefined,
});

export default pool;
