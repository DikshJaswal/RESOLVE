import pool from "../config/database";

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function listCategories(): Promise<Category[]> {
  const [rows] = await pool.execute(
    "SELECT id, name, description, created_at, updated_at FROM categories ORDER BY name",
  );
  return rows as Category[];
}

export async function createCategory(name: string, description?: string) {
  const [result] = await pool.execute(
    "INSERT INTO categories (name, description) VALUES (?, ?)",
    [name, description ?? null],
  );
  return (result as { insertId: number }).insertId;
}
