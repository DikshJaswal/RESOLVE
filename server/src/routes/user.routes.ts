import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validate";
import {
  addStaff,
  getUsers,
  updateUserStatus,
} from "../controllers/user.controller";
import {
  createStaffSchema,
  userStatusSchema,
} from "../validators/user.validator";

const router = Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/", getUsers);
router.post("/", validate(createStaffSchema), addStaff);
router.patch("/:id/status", validate(userStatusSchema), updateUserStatus);

export default router;
