import { describe, expect, it } from "vitest";
import {
  assignTicketSchema,
  createTicketSchema,
  statusSchema,
} from "./ticket.validator";

describe("ticket validators", () => {
  it("coerces category and agent ids", () => {
    expect(
      createTicketSchema.parse({
        title: "Cannot sign in",
        description: "The account login screen is failing.",
        categoryId: "2",
      }).categoryId,
    ).toBe(2);
    expect(assignTicketSchema.parse({ agentId: "4" }).agentId).toBe(4);
  });

  it("only accepts supported ticket statuses", () => {
    expect(statusSchema.safeParse({ status: "IN_PROGRESS" }).success).toBe(
      true,
    );
    expect(statusSchema.safeParse({ status: "INVALID" }).success).toBe(false);
  });
});
