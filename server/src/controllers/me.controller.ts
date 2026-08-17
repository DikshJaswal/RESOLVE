import bcrypt from "bcrypt";
import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { findUserById, updateUserPassword } from "../models/user.model";
import { deleteUserRefreshTokens } from "../models/refreshToken.model";

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  const user = await findUserById(req.user!.userId);
  if (
    !user ||
    !(await bcrypt.compare(req.body.currentPassword, user.password_hash))
  ) {
    res
      .status(400)
      .json({ success: false, message: "Current password is incorrect" });
    return;
  }
  await updateUserPassword(
    user.id,
    await bcrypt.hash(req.body.newPassword, 12),
  );
  await deleteUserRefreshTokens(user.id);
  res.json({
    success: true,
    message: "Password changed successfully. Please sign in again.",
  });
}
