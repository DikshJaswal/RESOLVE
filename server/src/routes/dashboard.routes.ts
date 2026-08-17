import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getDashboardStats } from "../controllers/dashboard.controller";

const router = Router();
router.get("/stats", authenticate, getDashboardStats);

export default router;
