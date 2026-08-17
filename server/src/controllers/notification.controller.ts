import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  listNotifications,
  markNotificationRead,
} from "../models/notification.model";

export async function getNotifications(
  req: AuthenticatedRequest,
  res: Response,
) {
  res.json({
    success: true,
    notifications: await listNotifications(req.user!.userId),
  });
}

export async function readNotification(
  req: AuthenticatedRequest,
  res: Response,
) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1)
    return res
      .status(400)
      .json({ success: false, message: "Invalid notification id" });
  await markNotificationRead(id, req.user!.userId);
  res.json({ success: true });
}
