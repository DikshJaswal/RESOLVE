import pool from "../config/database";

async function checkDatabase() {
  try {
    const [rows] = await pool.query("SHOW TABLES");

    console.log("Tables in defaultdb:");
    console.table(rows);
  } catch (error) {
    console.error("Database check failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

checkDatabase();
