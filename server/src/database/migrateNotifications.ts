import pool from "../config/database";

async function migrateNotifications() {
  try {
    await pool.query(
      `ALTER TABLE notifications MODIFY COLUMN type ENUM('TICKET_CREATED','TICKET_ASSIGNED','TICKET_REPLY','STATUS_CHANGED','PRIORITY_CHANGED') NOT NULL`,
    );
    await pool.query(
      `ALTER TABLE ticket_events MODIFY COLUMN event_type ENUM('CREATED','ASSIGNED','STATUS_CHANGED','PRIORITY_CHANGED','COMMENT_ADDED') NOT NULL`,
    );
    console.log("Notification types updated successfully.");
  } catch (error) {
    console.error("Notification migration failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void migrateNotifications();
