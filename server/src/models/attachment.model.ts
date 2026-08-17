import pool from "../config/database";

export async function createAttachment(input: {
  ticketId: number;
  uploadedBy: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
}) {
  const [result] = await pool.execute(
    `INSERT INTO attachments (ticket_id, uploaded_by, file_url, file_name, file_size)
     VALUES (?, ?, ?, ?, ?)`,
    [
      input.ticketId,
      input.uploadedBy,
      input.fileUrl,
      input.fileName,
      input.fileSize,
    ],
  );
  return (result as { insertId: number }).insertId;
}

export async function listAttachments(ticketId: number) {
  const [rows] = await pool.execute(
    `SELECT a.id, a.ticket_id, a.uploaded_by, a.file_url, a.file_name, a.file_size, a.created_at, u.name AS uploaded_by_name
     FROM attachments a JOIN users u ON u.id = a.uploaded_by
     WHERE a.ticket_id = ? ORDER BY a.created_at DESC`,
    [ticketId],
  );
  return rows;
}

export async function findAttachment(id: number) {
  const [rows] = await pool.execute(
    "SELECT id, ticket_id, uploaded_by, file_url, file_name FROM attachments WHERE id = ? LIMIT 1",
    [id],
  );
  return (rows as Array<Record<string, unknown>>)[0] ?? null;
}

export async function deleteAttachment(id: number) {
  await pool.execute("DELETE FROM attachments WHERE id = ?", [id]);
}
