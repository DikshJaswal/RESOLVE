import { Request, Response } from "express";
import { getHealthStatus } from "../services/health.service";

export async function getHealth(_req: Request, res: Response) {
  try {
    const health = await getHealthStatus();
    res.status(200).json(health);
  } catch (error) {
    console.error("Health check database failure:", error);
    res.status(503).json({
      success: false,
      message: "RESOLVE API is running, but database connection failed",
      error: error instanceof Error ? error.message : String(error),
      code: (error as { code?: string })?.code,
    });
  }
}
