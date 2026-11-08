import { describe, expect, it } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";

describe("API Security & Routing Integration Tests", () => {
  describe("404 Route handling", () => {
    it("returns 404 for non-existent route", async () => {
      const res = await request(app).get("/api/non-existent-route");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Route not found");
    });
  });

  describe("Authentication & RBAC Enforcement", () => {
    it("rejects ticket listing without bearer token with 401", async () => {
      const res = await request(app).get("/api/tickets");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Authentication required");
    });

    it("rejects invalid/malformed token with 401", async () => {
      const res = await request(app)
        .get("/api/tickets")
        .set("Authorization", "Bearer invalid.token.payload");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("rejects category creation by CUSTOMER role with 403 Forbidden", async () => {
      const secret = process.env.JWT_SECRET || "test-jwt-secret-at-least-32-chars-long";
      const customerToken = jwt.sign(
        { userId: 10, role: "CUSTOMER" },
        secret,
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .post("/api/tickets/categories")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ name: "New Category", description: "Test" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("You do not have permission to access this resource");
    });

    it("rejects ticket creation by AGENT role with 403 Forbidden (customer only)", async () => {
      const secret = process.env.JWT_SECRET || "test-jwt-secret-at-least-32-chars-long";
      const agentToken = jwt.sign(
        { userId: 5, role: "AGENT" },
        secret,
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${agentToken}`)
        .send({
          title: "Cannot access portal",
          description: "Details here",
          categoryId: 1,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("rejects staff creation by CUSTOMER role with 403", async () => {
      const secret = process.env.JWT_SECRET || "test-jwt-secret-at-least-32-chars-long";
      const customerToken = jwt.sign(
        { userId: 10, role: "CUSTOMER" },
        secret,
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          name: "Unauthorized Staff",
          email: "unauth@test.com",
          password: "Password123!",
          role: "AGENT",
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Request Validation", () => {
    it("returns 400 when logging in with invalid email format", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "not-an-email", password: "short" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it("returns 400 when registering with short password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Test", email: "test@resolve.com", password: "123" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });
});
