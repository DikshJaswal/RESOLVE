import { Request, Response } from "express";
import { getHealthStatus } from "../services/health.service";

export async function getHealth(_req: Request, res: Response) {
  const health = await getHealthStatus();

  res.status(200).json(health);
}
