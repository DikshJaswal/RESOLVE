import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from "../validators/auth.validator";
import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/refresh-token", validate(refreshTokenSchema), refreshToken);

router.post("/logout", validate(logoutSchema), logout);

export default router;
