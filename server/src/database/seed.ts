import bcrypt from "bcrypt";
import pool from "../config/database";

const password = process.env.SEED_PASSWORD;

const users = [
  { name: "Test Customer", email: "customer@resolve.com", role: "CUSTOMER" },
  {
    name: "Aarav Mehta",
    email: "aarav.customer@resolve.com",
    role: "CUSTOMER",
  },
  {
    name: "Priya Sharma",
    email: "priya.customer@resolve.com",
    role: "CUSTOMER",
  },
  { name: "Test Agent", email: "agent@resolve.com", role: "AGENT" },
  { name: "Neha Kapoor", email: "neha.agent@resolve.com", role: "AGENT" },
  { name: "Test Admin", email: "admin@resolve.com", role: "ADMIN" },
] as const;

const categories = [
  {
    name: "Technical Support",
    description: "Application and technical issues",
  },
  { name: "Billing", description: "Payments, invoices, and subscriptions" },
  { name: "Account Access", description: "Login and account access issues" },
] as const;

async function userId(email: string) {
  const [rows] = await pool.execute(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email],
  );
  return Number((rows as Array<{ id: number }>)[0]?.id);
}

async function categoryId(name: string) {
  const [rows] = await pool.execute(
    "SELECT id FROM categories WHERE name = ? LIMIT 1",
    [name],
  );
  return Number((rows as Array<{ id: number }>)[0]?.id);
}

async function ticketId(title: string, customerId: number) {
  const [rows] = await pool.execute(
    "SELECT id FROM tickets WHERE title = ? AND customer_id = ? LIMIT 1",
    [title, customerId],
  );
  return Number((rows as Array<{ id: number }>)[0]?.id);
}

async function seed() {
  if (!password) {
    throw new Error(
      "SEED_PASSWORD must be set before running the seed command",
    );
  }
  const passwordHash = await bcrypt.hash(password, 12);
  for (const user of users) {
    await pool.execute(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = VALUES(role), is_active = TRUE`,
      [user.name, user.email, passwordHash, user.role],
    );
  }
  for (const category of categories) {
    await pool.execute(
      `INSERT INTO categories (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE description = VALUES(description)`,
      [category.name, category.description],
    );
  }

  const customer = await userId("customer@resolve.com");
  const aarav = await userId("aarav.customer@resolve.com");
  const priya = await userId("priya.customer@resolve.com");
  const agent = await userId("agent@resolve.com");
  const neha = await userId("neha.agent@resolve.com");
  const admin = await userId("admin@resolve.com");
  const technical = await categoryId("Technical Support");
  const billing = await categoryId("Billing");
  const account = await categoryId("Account Access");

  const demoTickets = [
    {
      title: "Cannot upload profile image",
      description:
        "The profile image upload stays on loading and never completes.",
      priority: "HIGH",
      status: "OPEN",
      customerId: customer,
      agentId: null,
      categoryId: technical,
    },
    {
      title: "Invoice shows an incorrect amount",
      description:
        "The latest invoice contains an extra charge that needs to be reviewed.",
      priority: "URGENT",
      status: "IN_PROGRESS",
      customerId: aarav,
      agentId: agent,
      categoryId: billing,
    },
    {
      title: "Password reset email not received",
      description:
        "I requested a password reset twice but no email arrived in my inbox.",
      priority: "MEDIUM",
      status: "WAITING_FOR_CUSTOMER",
      customerId: priya,
      agentId: neha,
      categoryId: account,
    },
    {
      title: "Subscription successfully resolved",
      description:
        "This sample ticket demonstrates a completed support conversation.",
      priority: "LOW",
      status: "RESOLVED",
      customerId: customer,
      agentId: agent,
      categoryId: billing,
    },
  ] as const;

  for (const item of demoTickets) {
    let id = await ticketId(item.title, item.customerId);
    if (!id) {
      const [result] = await pool.execute(
        "INSERT INTO tickets (title, description, priority, status, customer_id, agent_id, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          item.title,
          item.description,
          item.priority,
          item.status,
          item.customerId,
          item.agentId,
          item.categoryId,
        ],
      );
      id = Number((result as { insertId: number }).insertId);
    }
    await pool.execute(
      "INSERT INTO ticket_events (ticket_id, user_id, event_type, new_value) SELECT ?, ?, 'CREATED', 'OPEN' WHERE NOT EXISTS (SELECT 1 FROM ticket_events WHERE ticket_id = ? AND event_type = 'CREATED')",
      [id, item.customerId, id],
    );
  }

  const invoice = await ticketId("Invoice shows an incorrect amount", aarav);
  const passwordReset = await ticketId(
    "Password reset email not received",
    priya,
  );
  const resolved = await ticketId(
    "Subscription successfully resolved",
    customer,
  );
  await pool.execute(
    "INSERT INTO comments (ticket_id, user_id, content) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM comments WHERE ticket_id = ?)",
    [
      invoice,
      agent,
      "I am reviewing the invoice details and will update you shortly.",
      invoice,
    ],
  );
  await pool.execute(
    "INSERT INTO comments (ticket_id, user_id, content) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM comments WHERE ticket_id = ?)",
    [
      passwordReset,
      neha,
      "Please check your spam folder and confirm the email address on the account.",
      passwordReset,
    ],
  );
  await pool.execute(
    "INSERT INTO comments (ticket_id, user_id, content) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM comments WHERE ticket_id = ?)",
    [
      resolved,
      customer,
      "Thanks, the subscription issue is resolved now.",
      resolved,
    ],
  );
  await pool.execute(
    "INSERT INTO notifications (user_id, ticket_id, type, message) SELECT ?, ?, 'TICKET_REPLY', ? WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = ? AND ticket_id = ? AND type = 'TICKET_REPLY')",
    [aarav, invoice, `New reply on ticket #${invoice}`, aarav, invoice],
  );
  await pool.execute(
    "INSERT INTO notifications (user_id, ticket_id, type, message) SELECT ?, ?, 'STATUS_CHANGED', ? WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = ? AND ticket_id = ? AND type = 'STATUS_CHANGED')",
    [
      priya,
      passwordReset,
      `Ticket #${passwordReset} is waiting for your response`,
      priya,
      passwordReset,
    ],
  );
  await pool.execute(
    "INSERT INTO notifications (user_id, ticket_id, type, message) SELECT ?, ?, 'TICKET_ASSIGNED', ? WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = ? AND ticket_id = ? AND type = 'TICKET_ASSIGNED')",
    [admin, invoice, `Ticket #${invoice} needs attention`, admin, invoice],
  );

  console.log(
    "Demo users, categories, tickets, comments, and notifications seeded successfully.",
  );
  console.log(`Demo password for all seeded users: ${password}`);
}

seed()
  .catch((error) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
