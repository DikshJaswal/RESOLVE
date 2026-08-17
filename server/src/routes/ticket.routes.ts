import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validate";
import {
  getCategories,
  addCategory,
  addTicket,
  getTickets,
  getTicket,
  assign,
  changeStatus,
  changePriority,
  addComment,
} from "../controllers/ticket.controller";
import {
  categorySchema,
  createTicketSchema,
  assignTicketSchema,
  statusSchema,
  prioritySchema,
  commentSchema,
} from "../validators/ticket.validator";
import {
  attachmentUpload,
  getAttachments,
  removeAttachment,
  uploadAttachment,
} from "../controllers/attachment.controller";

const router = Router();
router.use(authenticate);
router.get("/categories", getCategories);
router.post(
  "/categories",
  authorize("ADMIN"),
  validate(categorySchema),
  addCategory,
);
router.post(
  "/",
  authorize("CUSTOMER"),
  validate(createTicketSchema),
  addTicket,
);
router.get("/", getTickets);
router.get("/:id", getTicket);
router.post(
  "/:id/assign",
  authorize("AGENT", "ADMIN"),
  validate(assignTicketSchema),
  assign,
);
router.patch(
  "/:id/status",
  authorize("AGENT", "ADMIN"),
  validate(statusSchema),
  changeStatus,
);
router.patch(
  "/:id/priority",
  authorize("AGENT", "ADMIN"),
  validate(prioritySchema),
  changePriority,
);
router.post("/:id/comments", validate(commentSchema), addComment);
router.get("/:id/attachments", getAttachments);
router.post(
  "/:id/attachments",
  attachmentUpload.single("file"),
  uploadAttachment,
);
router.delete("/:id/attachments/:attachmentId", removeAttachment);

export default router;
