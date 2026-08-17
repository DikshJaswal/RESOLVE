import pool from "../config/database";

export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_FOR_CUSTOMER"
  | "RESOLVED"
  | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export async function createTicket(input: {
  title: string;
  description: string;
  priority: TicketPriority;
  customerId: number;
  categoryId: number;
}) {
  const [result] = await pool.execute(
    `INSERT INTO tickets (title, description, priority, customer_id, category_id)
     VALUES (?, ?, ?, ?, ?)`,
    [
      input.title,
      input.description,
      input.priority,
      input.customerId,
      input.categoryId,
    ],
  );
  return (result as { insertId: number }).insertId;
}

export async function listTickets(
  userId: number,
  role: string,
  filters: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  const conditions: string[] = [];
  const params: Array<string | number> = [];
  if (role === "CUSTOMER") {
    conditions.push("t.customer_id = ?");
    params.push(userId);
  } else if (role === "AGENT") {
    conditions.push(
      "(t.agent_id = ? OR (t.agent_id IS NULL AND t.status = 'OPEN'))",
    );
    params.push(userId);
  }
  if (filters.status) {
    conditions.push("t.status = ?");
    params.push(filters.status);
  }
  if (filters.priority) {
    conditions.push("t.priority = ?");
    params.push(filters.priority);
  }
  if (filters.search) {
    conditions.push("(t.title LIKE ? OR t.description LIKE ?)");
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const offset = (page - 1) * limit;
  const [rows] = await pool.execute(
    `SELECT t.*, c.name AS category_name, cu.name AS customer_name, a.name AS agent_name
     FROM tickets t
     JOIN categories c ON c.id = t.category_id
     JOIN users cu ON cu.id = t.customer_id
     LEFT JOIN users a ON a.id = t.agent_id
     ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
     ORDER BY t.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    params,
  );
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM tickets t ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}`,
    params,
  );
  const total = Number((countRows as Array<{ total: number }>)[0]?.total ?? 0);
  return {
    rows,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function findTicket(id: number) {
  const [rows] = await pool.execute(
    `SELECT t.*, c.name AS category_name, cu.name AS customer_name, a.name AS agent_name
     FROM tickets t JOIN categories c ON c.id = t.category_id
     JOIN users cu ON cu.id = t.customer_id LEFT JOIN users a ON a.id = t.agent_id
     WHERE t.id = ? LIMIT 1`,
    [id],
  );
  const tickets = rows as Array<Record<string, unknown>>;
  return tickets[0] ?? null;
}

export async function assignTicket(id: number, agentId: number) {
  await pool.execute(
    "UPDATE tickets SET agent_id = ?, status = 'IN_PROGRESS' WHERE id = ?",
    [agentId, id],
  );
}

export async function updateTicketStatus(id: number, status: TicketStatus) {
  await pool.execute("UPDATE tickets SET status = ? WHERE id = ?", [
    status,
    id,
  ]);
}

export async function updateTicketPriority(
  id: number,
  priority: TicketPriority,
) {
  await pool.execute("UPDATE tickets SET priority = ? WHERE id = ?", [
    priority,
    id,
  ]);
}

export async function createComment(
  ticketId: number,
  userId: number,
  content: string,
) {
  const [result] = await pool.execute(
    "INSERT INTO comments (ticket_id, user_id, content) VALUES (?, ?, ?)",
    [ticketId, userId, content],
  );
  return (result as { insertId: number }).insertId;
}

export async function listComments(ticketId: number) {
  const [rows] = await pool.execute(
    `SELECT c.id, c.content, c.created_at, c.user_id, u.name AS user_name, u.role
     FROM comments c JOIN users u ON u.id = c.user_id
     WHERE c.ticket_id = ? ORDER BY c.created_at ASC`,
    [ticketId],
  );
  return rows;
}
