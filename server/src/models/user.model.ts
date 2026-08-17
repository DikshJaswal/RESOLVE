import pool from "../config/database";

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: "CUSTOMER" | "AGENT" | "ADMIN";
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email],
  );

  const users = rows as User[];

  return users.length > 0 ? users[0] : null;
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
): Promise<number> {
  const [result] = await pool.execute(
    `
      INSERT INTO users (name, email, password_hash)
      VALUES (?, ?, ?)
    `,
    [name, email, passwordHash],
  );

  const insertResult = result as { insertId: number };

  return insertResult.insertId;
}

export async function listUsers() {
  const [rows] = await pool.execute(
    "SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC",
  );
  return rows;
}

export async function createStaffUser(
  name: string,
  email: string,
  passwordHash: string,
  role: "AGENT" | "ADMIN",
) {
  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [name, email, passwordHash, role],
  );
  return (result as { insertId: number }).insertId;
}

export async function updateUserPassword(id: number, passwordHash: string) {
  await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [
    passwordHash,
    id,
  ]);
}

export async function setUserActive(id: number, isActive: boolean) {
  await pool.execute("UPDATE users SET is_active = ? WHERE id = ?", [
    isActive,
    id,
  ]);
}

export async function findUserById(id: number): Promise<User | null> {
  const [rows] = await pool.execute(
    `SELECT id, name, email, password_hash, role, is_active, created_at, updated_at
     FROM users WHERE id = ? LIMIT 1`,
    [id],
  );
  const users = rows as User[];
  return users.length > 0 ? users[0] : null;
}

export async function findUserIdsByRole(role: "AGENT" | "ADMIN") {
  const [rows] = await pool.execute(
    "SELECT id FROM users WHERE role = ? AND is_active = TRUE",
    [role],
  );
  return (rows as Array<{ id: number }>).map((user) => user.id);
}

export async function findActiveAgent(id: number) {
  const [rows] = await pool.execute(
    "SELECT id FROM users WHERE id = ? AND role IN ('AGENT', 'ADMIN') AND is_active = TRUE LIMIT 1",
    [id],
  );
  return (rows as Array<{ id: number }>)[0] ?? null;
}
