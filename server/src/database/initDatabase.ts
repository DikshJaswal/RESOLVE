import fs from "fs";
import path from "path";
import pool from "../config/database";

async function initDatabase() {
  try {
    const schemaPath = path.join(process.cwd(), "database", "schema.sql");

    const schema = fs.readFileSync(schemaPath, "utf-8");

    const statements = schema
      .split(";")
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await pool.query(statement);
    }

    console.log("Database schema created successfully.");
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

initDatabase();
