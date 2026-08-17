import { Router } from "express";
import {
  authenticate,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validate";
import { changePasswordSchema } from "../validators/user.validator";
import { changePassword } from "../controllers/me.controller";

const router = Router();

router.patch(
  "/password",
  authenticate,
  validate(changePasswordSchema),
  changePassword,
);

router.get("/", authenticate, (req: AuthenticatedRequest, res) => {
  res.status(200).json({
    success: true,
    message: "You are authenticated",
    user: req.user,
  });
});

router.get(
  "/admin-test",
  authenticate,
  authorize("ADMIN"),
  (_req: AuthenticatedRequest, res) => {
    res.status(200).json({
      success: true,
      message: "You have ADMIN access",
    });
  },
);

router.get(
  "/agent-test",
  authenticate,
  authorize("AGENT", "ADMIN"),
  (_req: AuthenticatedRequest, res) => {
    res.status(200).json({
      success: true,
      message: "You have AGENT access",
    });
  },
);

export default router;
