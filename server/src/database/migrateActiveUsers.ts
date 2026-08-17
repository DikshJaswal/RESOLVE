import pool from "../config/database";

async function migrate() {
  try {
    const [columns] = await pool.query(
      `SELECT COUNT(*) AS count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'is_active'`,
    );
    const exists =
      Number((columns as Array<{ count: number }>)[0]?.count ?? 0) > 0;
    if (!exists)
      await pool.query(
        "ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER role",
      );
    console.log(
      exists ? "users.is_active already exists." : "Added users.is_active.",
    );
  } catch (error) {
    console.error("User status migration failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
