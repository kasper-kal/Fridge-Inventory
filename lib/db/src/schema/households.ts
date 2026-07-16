import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const householdsTable = pgTable("households", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  pinHash: text("pin_hash").notNull(),
  creatorDeviceId: text("creator_device_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Household = typeof householdsTable.$inferSelect;
