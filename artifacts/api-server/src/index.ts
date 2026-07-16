import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        device_id TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL,
        is_banned BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      ALTER TABLE households ADD COLUMN IF NOT EXISTS creator_device_id TEXT;
    `);
    logger.info("Migrations applied");
  } catch (err) {
    logger.error({ err }, "Migration failed");
  } finally {
    client.release();
  }
}

const rawPort = process.env["PORT"];
const port = rawPort ? Number(rawPort) : 10000;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

runMigrations().then(() => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
});
