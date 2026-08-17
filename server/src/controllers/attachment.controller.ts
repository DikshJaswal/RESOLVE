import { Request, Response } from "express";
import multer from "multer";
import { cloudinary, cloudinaryConfigured } from "../config/cloudinary";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  createAttachment,
  deleteAttachment,
  findAttachment,
  listAttachments,
} from "../models/attachment.model";
import { findTicket } from "../models/ticket.model";

export const attachmentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowed = [
      "image/",
      "application/pdf",
      "text/plain",
      "application/zip",
    ];
    callback(
      null,
      allowed.some((type) =>
        type.endsWith("/")
          ? file.mimetype.startsWith(type)
          : file.mimetype === type,
      ),
    );
  },
});

async function canAccess(req: AuthenticatedRequest, ticketId: number) {
  const ticket = await findTicket(ticketId);
  if (!ticket) return null;
  if (req.user!.role === "ADMIN") return ticket;
  if (req.user!.role === "CUSTOMER" && ticket.customer_id === req.user!.userId)
    return ticket;
  if (
    req.user!.role === "AGENT" &&
    (ticket.agent_id === null || ticket.agent_id === req.user!.userId)
  )
    return ticket;
  return false;
}

function uploadToCloudinary(file: Express.Multer.File, ticketId: number) {
  return new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: `resolve/tickets/${ticketId}` },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Upload failed"));
        else resolve({ secure_url: result.secure_url });
      },
    );
    stream.end(file.buffer);
  });
}

export async function uploadAttachment(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!cloudinaryConfigured)
    return res
      .status(503)
      .json({ success: false, message: "File storage is not configured" });
  const ticketId = Number(req.params.id);
  const access = await canAccess(req, ticketId);
  if (!access)
    return res
      .status(access === null ? 404 : 403)
      .json({
        success: false,
        message:
          access === null
            ? "Ticket not found"
            : "You do not have access to this ticket",
      });
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "A file is required" });
  const uploaded = await uploadToCloudinary(req.file, ticketId);
  const id = await createAttachment({
    ticketId,
    uploadedBy: req.user!.userId,
    fileUrl: uploaded.secure_url,
    fileName: req.file.originalname,
    fileSize: req.file.size,
  });
  res
    .status(201)
    .json({
      success: true,
      attachment: {
        id,
        fileUrl: uploaded.secure_url,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      },
    });
}

export async function getAttachments(req: AuthenticatedRequest, res: Response) {
  const ticketId = Number(req.params.id);
  const access = await canAccess(req, ticketId);
  if (!access)
    return res
      .status(access === null ? 404 : 403)
      .json({
        success: false,
        message:
          access === null
            ? "Ticket not found"
            : "You do not have access to this ticket",
      });
  res.json({ success: true, attachments: await listAttachments(ticketId) });
}

export async function removeAttachment(
  req: AuthenticatedRequest,
  res: Response,
) {
  const attachment = await findAttachment(Number(req.params.attachmentId));
  if (!attachment)
    return res
      .status(404)
      .json({ success: false, message: "Attachment not found" });
  const access = await canAccess(req, Number(attachment.ticket_id));
  if (!access)
    return res
      .status(access === null ? 404 : 403)
      .json({
        success: false,
        message:
          access === null
            ? "Ticket not found"
            : "You do not have access to this ticket",
      });
  if (req.user!.role !== "ADMIN" && attachment.uploaded_by !== req.user!.userId)
    return res
      .status(403)
      .json({ success: false, message: "You cannot delete this attachment" });
  await deleteAttachment(Number(req.params.attachmentId));
  res.json({ success: true, message: "Attachment deleted" });
}
