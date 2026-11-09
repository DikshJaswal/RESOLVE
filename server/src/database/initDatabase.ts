import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function initDatabase() {
  let conn: mysql.Connection | null = null;
  try {
    const parsedPort = Number(process.env.DB_PORT);
    const port = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 3306;
    const useSsl = process.env.DB_SSL === "true" || process.env.DB_SSL === "1";

    // 1. Ensure the database exists on the cluster
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: useSsl ? { rejectUnauthorized: process.env.DB_SSL_VERIFY === "true" } : undefined,
    });

    const dbName = process.env.DB_NAME || "resolve";
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await conn.query(`USE \`${dbName}\`;`);
    console.log(`Database '${dbName}' ready.`);

    // 2. Execute schema.sql statements
    const schemaPath = path.join(process.cwd(), "database", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    const statements = schema
      .split(";")
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await conn.query(statement);
    }

    console.log("Database schema created successfully.");
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
}

initDatabase();
