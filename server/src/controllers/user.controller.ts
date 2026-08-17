import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  createStaffUser,
  listUsers,
  setUserActive,
} from "../models/user.model";

export async function getUsers(_req: Request, res: Response) {
  res.json({ success: true, users: await listUsers() });
}

export async function addStaff(req: Request, res: Response) {
  try {
    const email = req.body.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const id = await createStaffUser(
      req.body.name,
      email,
      passwordHash,
      req.body.role,
    );
    res
      .status(201)
      .json({
        success: true,
        user: { id, name: req.body.name, email, role: req.body.role },
      });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
      res
        .status(409)
        .json({ success: false, message: "Email already registered" });
      return;
    }
    throw error;
  }
}

export async function updateUserStatus(
  req: AuthenticatedRequest,
  res: Response,
) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1)
    return res.status(400).json({ success: false, message: "Invalid user id" });
  if (id === req.user!.userId)
    return res
      .status(400)
      .json({
        success: false,
        message: "You cannot deactivate your own account",
      });
  await setUserActive(id, req.body.isActive);
  res.json({
    success: true,
    message: req.body.isActive ? "User activated" : "User deactivated",
  });
}
