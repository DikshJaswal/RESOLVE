import pool from "../config/database";

export async function getHealthStatus() {
  const [rows] = await pool.query("SELECT 1 AS database_connected");

  return {
    success: true,
    message: "RESOLVE API is running",
    database: rows,
  };
}
