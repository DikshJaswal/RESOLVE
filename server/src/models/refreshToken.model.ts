import pool from "../config/database";

export async function saveRefreshToken(
  userId: number,
  tokenHash: string,
  expiresAt: Date,
) {
  await pool.execute(
    `
      INSERT INTO refresh_tokens
        (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `,
    [userId, tokenHash, expiresAt],
  );
}

export async function findRefreshToken(tokenHash: string) {
  const [rows] = await pool.execute(
    `
      SELECT id, user_id, token_hash, expires_at
      FROM refresh_tokens
      WHERE token_hash = ?
      LIMIT 1
    `,
    [tokenHash],
  );

  const tokens = rows as Array<{
    id: number;
    user_id: number;
    token_hash: string;
    expires_at: Date;
  }>;

  return tokens.length > 0 ? tokens[0] : null;
}

export async function deleteRefreshToken(tokenHash: string) {
  await pool.execute(
    `
      DELETE FROM refresh_tokens
      WHERE token_hash = ?
    `,
    [tokenHash],
  );
}

export async function deleteUserRefreshTokens(userId: number) {
  await pool.execute("DELETE FROM refresh_tokens WHERE user_id = ?", [userId]);
}
