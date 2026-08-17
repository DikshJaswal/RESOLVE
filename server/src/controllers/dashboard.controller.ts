import { Response } from "express";
import pool from "../config/database";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export async function getDashboardStats(
  req: AuthenticatedRequest,
  res: Response,
) {
  const user = req.user!;
  const conditions: string[] = [];
  const params: number[] = [];

  if (user.role === "CUSTOMER") {
    conditions.push("customer_id = ?");
    params.push(user.userId);
  } else if (user.role === "AGENT") {
    conditions.push("(agent_id = ? OR (agent_id IS NULL AND status = 'OPEN'))");
    params.push(user.userId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [rows] = await pool.execute(
    `SELECT
      SUM(status = 'OPEN') AS open,
      SUM(status = 'IN_PROGRESS') AS in_progress,
      SUM(status = 'RESOLVED') AS resolved,
      SUM(priority = 'URGENT' AND status NOT IN ('RESOLVED', 'CLOSED')) AS urgent,
      COUNT(*) AS total
     FROM tickets ${where}`,
    params,
  );

  const stats = (rows as Array<Record<string, number>>)[0];
  res.json({
    success: true,
    stats: {
      total: Number(stats.total ?? 0),
      open: Number(stats.open ?? 0),
      inProgress: Number(stats.in_progress ?? 0),
      resolved: Number(stats.resolved ?? 0),
      urgent: Number(stats.urgent ?? 0),
    },
  });
}
