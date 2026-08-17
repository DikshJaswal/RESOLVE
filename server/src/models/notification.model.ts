import pool from "../config/database";

export type NotificationType =
  | "TICKET_CREATED"
  | "TICKET_ASSIGNED"
  | "TICKET_REPLY"
  | "STATUS_CHANGED"
  | "PRIORITY_CHANGED";

export async function createNotification(input: {
  userId: number;
  ticketId?: number;
  type: NotificationType;
  message: string;
}) {
  await pool.execute(
    "INSERT INTO notifications (user_id, ticket_id, type, message) VALUES (?, ?, ?, ?)",
    [input.userId, input.ticketId ?? null, input.type, input.message],
  );
}

export async function listNotifications(userId: number) {
  const [rows] = await pool.execute(
    `SELECT n.id, n.ticket_id, n.type, n.message, n.is_read, n.created_at,
            t.title AS ticket_title
     FROM notifications n LEFT JOIN tickets t ON t.id = n.ticket_id
     WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 50`,
    [userId],
  );
  return rows;
}

export async function markNotificationRead(id: number, userId: number) {
  await pool.execute(
    "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
    [id, userId],
  );
}
