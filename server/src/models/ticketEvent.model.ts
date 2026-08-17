import pool from "../config/database";

export type TicketEventType =
  | "CREATED"
  | "ASSIGNED"
  | "STATUS_CHANGED"
  | "PRIORITY_CHANGED"
  | "COMMENT_ADDED";

export async function recordTicketEvent(input: {
  ticketId: number;
  userId: number;
  eventType: TicketEventType;
  oldValue?: string;
  newValue?: string;
}) {
  await pool.execute(
    `INSERT INTO ticket_events (ticket_id, user_id, event_type, old_value, new_value)
     VALUES (?, ?, ?, ?, ?)`,
    [
      input.ticketId,
      input.userId,
      input.eventType,
      input.oldValue ?? null,
      input.newValue ?? null,
    ],
  );
}

export async function listTicketEvents(ticketId: number) {
  const [rows] = await pool.execute(
    `SELECT e.id, e.event_type, e.old_value, e.new_value, e.created_at,
            u.name AS user_name, u.role
     FROM ticket_events e JOIN users u ON u.id = e.user_id
     WHERE e.ticket_id = ? ORDER BY e.created_at ASC`,
    [ticketId],
  );
  return rows;
}
