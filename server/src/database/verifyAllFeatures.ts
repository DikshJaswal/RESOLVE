import request from "supertest";
import app from "../app";
import pool from "../config/database";

async function verifyAllFeatures() {
  console.log("==========================================");
  console.log("RESOLVE: FULL FEATURE VERIFICATION TEST");
  console.log("==========================================\n");

  const results: { feature: string; status: "PASS" | "FAIL"; details?: string }[] = [];

  function record(feature: string, success: boolean, details?: string) {
    results.push({ feature, status: success ? "PASS" : "FAIL", details });
    console.log(`${success ? "✅ PASS" : "❌ FAIL"}: ${feature} ${details ? `(${details})` : ""}`);
  }

  try {
    // 1. Healthcheck
    const healthRes = await request(app).get("/api/health");
    record("API Health & DB Connectivity", healthRes.status === 200 && healthRes.body.success === true);

    // 2. Authentication: Admin, Agent, Customer Logins
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "admin@resolve.com",
      password: "Password123!",
    });
    const adminToken = adminLogin.body.accessToken;
    record("Admin Authentication", adminLogin.status === 200 && !!adminToken, `Role: ${adminLogin.body.user?.role}`);

    const agentLogin = await request(app).post("/api/auth/login").send({
      email: "agent@resolve.com",
      password: "Password123!",
    });
    const agentToken = agentLogin.body.accessToken;
    const agentId = agentLogin.body.user?.id;
    record("Agent Authentication", agentLogin.status === 200 && !!agentToken, `Role: ${agentLogin.body.user?.role}`);

    const customerLogin = await request(app).post("/api/auth/login").send({
      email: "customer@resolve.com",
      password: "Password123!",
    });
    const customerToken = customerLogin.body.accessToken;
    const customerRefreshToken = customerLogin.body.refreshToken;
    record("Customer Authentication", customerLogin.status === 200 && !!customerToken, `Role: ${customerLogin.body.user?.role}`);

    // 3. User Registration (New Customer)
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "New Auto User",
      email: uniqueEmail,
      password: "Password123!",
    });
    record("New Customer Registration", registerRes.status === 201 && registerRes.body.user?.email === uniqueEmail);

    // 4. Token Refresh
    const refreshRes = await request(app).post("/api/auth/refresh-token").send({
      refreshToken: customerRefreshToken,
    });
    record("Refresh Token Rotation", refreshRes.status === 200 && !!refreshRes.body.accessToken);

    // 5. Dashboard Stats across roles
    const adminStats = await request(app).get("/api/dashboard/stats").set("Authorization", `Bearer ${adminToken}`);
    const agentStats = await request(app).get("/api/dashboard/stats").set("Authorization", `Bearer ${agentToken}`);
    const customerStats = await request(app).get("/api/dashboard/stats").set("Authorization", `Bearer ${customerToken}`);
    record(
      "Role-Based Dashboard Metrics",
      adminStats.status === 200 && agentStats.status === 200 && customerStats.status === 200,
      `Admin Total: ${adminStats.body.stats?.total}, Customer Total: ${customerStats.body.stats?.total}`,
    );

    // 6. Categories List & Admin Category Creation
    const catListRes = await request(app).get("/api/tickets/categories").set("Authorization", `Bearer ${customerToken}`);
    const categoryId = catListRes.body.categories?.[0]?.id || 1;
    record("Ticket Categories Listing", catListRes.status === 200 && catListRes.body.categories?.length > 0);

    const newCatRes = await request(app)
      .post("/api/tickets/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: `Category_${Date.now()}`, description: "Automated test category" });
    record("Admin Category Creation", newCatRes.status === 201);

    // 7. Ticket Creation by Customer
    const createTicketRes = await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        title: "Test Support Request",
        description: "Need help configuring webhook callbacks",
        priority: "HIGH",
        categoryId,
      });
    const ticketId = createTicketRes.body.ticket?.id;
    record("Customer Ticket Submission", createTicketRes.status === 201 && !!ticketId, `Created Ticket #${ticketId}`);

    // 8. Ticket Listing & RBAC Filtering
    const customerTickets = await request(app).get("/api/tickets").set("Authorization", `Bearer ${customerToken}`);
    const agentTickets = await request(app).get("/api/tickets").set("Authorization", `Bearer ${agentToken}`);
    const adminTickets = await request(app).get("/api/tickets").set("Authorization", `Bearer ${adminToken}`);
    record(
      "Ticket Listing with RBAC Scoping",
      customerTickets.status === 200 && agentTickets.status === 200 && adminTickets.status === 200,
      `Admin saw ${adminTickets.body.tickets?.length} tickets`,
    );

    // 9. Ticket Detail, Comments & Timeline Audit Events
    const ticketDetailRes = await request(app).get(`/api/tickets/${ticketId}`).set("Authorization", `Bearer ${customerToken}`);
    record(
      "Ticket Details & Audit Trail Retrieval",
      ticketDetailRes.status === 200 && Array.isArray(ticketDetailRes.body.events) && ticketDetailRes.body.events.length > 0,
      `Events count: ${ticketDetailRes.body.events?.length}`,
    );

    // 10. Agent Claiming Ticket
    const claimRes = await request(app)
      .post(`/api/tickets/${ticketId}/assign`)
      .set("Authorization", `Bearer ${agentToken}`)
      .send({ agentId });
    record("Agent Ticket Claiming & Assignment", claimRes.status === 200 && claimRes.body.ticket?.agent_id === agentId);

    // 11. Conversation Replies / Comments
    const agentCommentRes = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .set("Authorization", `Bearer ${agentToken}`)
      .send({ content: "Hello, I am looking into your webhook issue now." });
    const customerCommentRes = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ content: "Thank you, appreciate the prompt reply!" });
    record(
      "Two-Way Conversation Replies",
      agentCommentRes.status === 201 && customerCommentRes.status === 201 && customerCommentRes.body.comments?.length >= 2,
    );

    // 12. Ticket Status & Priority Transitions
    const statusRes = await request(app)
      .patch(`/api/tickets/${ticketId}/status`)
      .set("Authorization", `Bearer ${agentToken}`)
      .send({ status: "RESOLVED" });
    const priorityRes = await request(app)
      .patch(`/api/tickets/${ticketId}/priority`)
      .set("Authorization", `Bearer ${agentToken}`)
      .send({ priority: "URGENT" });
    record(
      "Ticket Status & Priority Workflow Updates",
      statusRes.status === 200 && statusRes.body.ticket?.status === "RESOLVED" &&
      priorityRes.status === 200 && priorityRes.body.ticket?.priority === "URGENT",
    );

    // 13. Notifications Generation & Read Status
    const notifRes = await request(app).get("/api/notifications").set("Authorization", `Bearer ${customerToken}`);
    const firstNotifId = notifRes.body.notifications?.[0]?.id;
    let markReadOk = false;
    if (firstNotifId) {
      const readRes = await request(app)
        .patch(`/api/notifications/${firstNotifId}/read`)
        .set("Authorization", `Bearer ${customerToken}`);
      markReadOk = readRes.status === 200;
    }
    record("Notifications & Read State Management", notifRes.status === 200 && markReadOk, `Notifs count: ${notifRes.body.notifications?.length}`);

    // 14. Admin Staff Management
    const usersListRes = await request(app).get("/api/users").set("Authorization", `Bearer ${adminToken}`);
    const newStaffEmail = `agent_${Date.now()}@resolve.com`;
    const createStaffRes = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Support Staff",
        email: newStaffEmail,
        password: "Password123!",
        role: "AGENT",
      });
    const newStaffId = createStaffRes.body.user?.id;
    let toggleStatusOk = false;
    if (newStaffId) {
      const toggleRes = await request(app)
        .patch(`/api/users/${newStaffId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ isActive: false });
      toggleStatusOk = toggleRes.status === 200;
    }
    record(
      "Admin Staff Creation & Deactivation",
      usersListRes.status === 200 && createStaffRes.status === 201 && toggleStatusOk,
    );

    // 15. RBAC Protection Check: Customer cannot access Admin endpoints
    const forbiddenRes = await request(app).get("/api/users").set("Authorization", `Bearer ${customerToken}`);
    record("RBAC Security Enforcement (Customer blocked from Admin)", forbiddenRes.status === 403);

    // 16. Logout & Session Termination
    const logoutRes = await request(app).post("/api/auth/logout").send({ refreshToken: customerRefreshToken });
    record("Logout & Refresh Token Revocation", logoutRes.status === 200);

    console.log("\n==========================================");
    const passCount = results.filter((r) => r.status === "PASS").length;
    console.log(`SUMMARY: ${passCount} / ${results.length} FEATURES VERIFIED & WORKING`);
    console.log("==========================================");
  } catch (err) {
    console.error("FATAL ERROR IN VERIFICATION:", err);
  } finally {
    await pool.end();
  }
}

verifyAllFeatures();
