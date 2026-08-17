import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { createCategory, listCategories } from "../models/category.model";
import {
  createTicket,
  listTickets,
  findTicket,
  assignTicket,
  updateTicketStatus,
  updateTicketPriority,
  createComment,
  listComments,
} from "../models/ticket.model";
import { createNotification } from "../models/notification.model";
import {
  listTicketEvents,
  recordTicketEvent,
} from "../models/ticketEvent.model";
import { findActiveAgent, findUserIdsByRole } from "../models/user.model";

function ticketId(req: Request) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function canAccessTicket(
  user: NonNullable<AuthenticatedRequest["user"]>,
  ticket: Record<string, any>,
) {
  if (user.role === "ADMIN") return true;
  if (user.role === "CUSTOMER") return ticket.customer_id === user.userId;
  return ticket.agent_id === null || ticket.agent_id === user.userId;
}

export async function getCategories(_req: Request, res: Response) {
  res.json({ success: true, categories: await listCategories() });
}

export async function addCategory(req: Request, res: Response) {
  const id = await createCategory(req.body.name, req.body.description);
  res.status(201).json({ success: true, category: { id, ...req.body } });
}

export async function addTicket(req: AuthenticatedRequest, res: Response) {
  const id = await createTicket({ ...req.body, customerId: req.user!.userId });
  await recordTicketEvent({
    ticketId: id,
    userId: req.user!.userId,
    eventType: "CREATED",
    newValue: "OPEN",
  });
  await createNotification({
    userId: req.user!.userId,
    ticketId: id,
    type: "TICKET_CREATED",
    message: `Ticket #${id} was created successfully`,
  });
  const staffIds = [
    ...(await findUserIdsByRole("AGENT")),
    ...(await findUserIdsByRole("ADMIN")),
  ];
  for (const staffId of staffIds) {
    await createNotification({
      userId: staffId,
      ticketId: id,
      type: "TICKET_ASSIGNED",
      message: `New ticket #${id} needs attention`,
    });
  }
  res.status(201).json({ success: true, ticket: await findTicket(id) });
}

export async function getTickets(req: AuthenticatedRequest, res: Response) {
  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;
  const priority =
    typeof req.query.priority === "string" ? req.query.priority : undefined;
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : undefined;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const result = await listTickets(req.user!.userId, req.user!.role, {
    status,
    priority,
    search,
    page,
    limit,
  });
  res.json({
    success: true,
    tickets: result.rows,
    pagination: result.pagination,
  });
}

export async function getTicket(req: AuthenticatedRequest, res: Response) {
  const id = ticketId(req);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid ticket id" });
  const ticket = await findTicket(id);
  if (!ticket)
    return res
      .status(404)
      .json({ success: false, message: "Ticket not found" });
  if (!canAccessTicket(req.user!, ticket)) {
    return res
      .status(403)
      .json({
        success: false,
        message: "You do not have access to this ticket",
      });
  }
  res.json({
    success: true,
    ticket,
    comments: await listComments(id),
    events: await listTicketEvents(id),
  });
}

export async function assign(req: AuthenticatedRequest, res: Response) {
  const id = ticketId(req);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid ticket id" });
  const ticket = await findTicket(id);
  if (!ticket)
    return res
      .status(404)
      .json({ success: false, message: "Ticket not found" });
  if (
    req.user!.role === "AGENT" &&
    (req.body.agentId !== req.user!.userId ||
      (ticket.agent_id !== null &&
        Number(ticket.agent_id) !== req.user!.userId))
  ) {
    return res
      .status(403)
      .json({
        success: false,
        message: "Agents can only claim tickets for themselves",
      });
  }
  if (
    req.user!.role === "ADMIN" &&
    !(await findActiveAgent(Number(req.body.agentId)))
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Tickets can only be assigned to active agents",
      });
  }
  await assignTicket(id, req.body.agentId);
  await recordTicketEvent({
    ticketId: id,
    userId: req.user!.userId,
    eventType: "ASSIGNED",
    newValue: String(req.body.agentId),
  });
  await createNotification({
    userId: req.body.agentId,
    ticketId: id,
    type: "TICKET_ASSIGNED",
    message: `You were assigned ticket #${id}`,
  });
  res.json({ success: true, ticket: await findTicket(id) });
}

export async function changeStatus(req: Request, res: Response) {
  const id = ticketId(req);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid ticket id" });
  const ticket = await findTicket(id);
  if (!ticket)
    return res
      .status(404)
      .json({ success: false, message: "Ticket not found" });
  if (!canAccessTicket((req as AuthenticatedRequest).user!, ticket))
    return res
      .status(403)
      .json({
        success: false,
        message: "You do not have access to this ticket",
      });
  await updateTicketStatus(id, req.body.status);
  await recordTicketEvent({
    ticketId: id,
    userId: (req as AuthenticatedRequest).user!.userId,
    eventType: "STATUS_CHANGED",
    oldValue: String(ticket.status),
    newValue: req.body.status,
  });
  await createNotification({
    userId: Number(ticket.customer_id),
    ticketId: id,
    type: "STATUS_CHANGED",
    message: `Ticket #${id} status changed to ${req.body.status}`,
  });
  if (ticket.agent_id)
    await createNotification({
      userId: Number(ticket.agent_id),
      ticketId: id,
      type: "STATUS_CHANGED",
      message: `Ticket #${id} status changed to ${req.body.status}`,
    });
  res.json({ success: true, ticket: await findTicket(id) });
}

export async function changePriority(req: AuthenticatedRequest, res: Response) {
  const id = ticketId(req);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid ticket id" });
  const ticket = await findTicket(id);
  if (!ticket)
    return res
      .status(404)
      .json({ success: false, message: "Ticket not found" });
  if (!canAccessTicket(req.user!, ticket))
    return res
      .status(403)
      .json({
        success: false,
        message: "You do not have access to this ticket",
      });
  await updateTicketPriority(id, req.body.priority);
  await recordTicketEvent({
    ticketId: id,
    userId: req.user!.userId,
    eventType: "PRIORITY_CHANGED",
    oldValue: String(ticket.priority),
    newValue: req.body.priority,
  });
  await createNotification({
    userId: Number(ticket.customer_id),
    ticketId: id,
    type: "PRIORITY_CHANGED",
    message: `Ticket #${id} priority changed to ${req.body.priority}`,
  });
  res.json({ success: true, ticket: await findTicket(id) });
}

export async function addComment(req: AuthenticatedRequest, res: Response) {
  const id = ticketId(req);
  const ticket = id ? await findTicket(id) : null;
  if (!id || !ticket)
    return res
      .status(404)
      .json({ success: false, message: "Ticket not found" });
  if (!canAccessTicket(req.user!, ticket)) {
    return res
      .status(403)
      .json({
        success: false,
        message: "You do not have access to this ticket",
      });
  }
  await createComment(id, req.user!.userId, req.body.content);
  await recordTicketEvent({
    ticketId: id,
    userId: req.user!.userId,
    eventType: "COMMENT_ADDED",
  });
  const recipients = [
    Number(ticket.customer_id),
    ticket.agent_id ? Number(ticket.agent_id) : null,
  ].filter(
    (recipient): recipient is number =>
      recipient !== null && recipient !== req.user!.userId,
  );
  for (const recipient of recipients) {
    await createNotification({
      userId: recipient,
      ticketId: id,
      type: "TICKET_REPLY",
      message: `New reply on ticket #${id}`,
    });
  }
  for (const adminId of await findUserIdsByRole("ADMIN")) {
    if (adminId !== req.user!.userId && !recipients.includes(adminId)) {
      await createNotification({
        userId: adminId,
        ticketId: id,
        type: "TICKET_REPLY",
        message: `New reply on ticket #${id}`,
      });
    }
  }
  res.status(201).json({ success: true, comments: await listComments(id) });
}
