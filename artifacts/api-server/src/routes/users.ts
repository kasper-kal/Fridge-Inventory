import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /users — list all
router.get("/", async (_req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
    res.json(users);
  } catch {
    res.status(500).json({ error: "Ophalen mislukt" });
  }
});

// POST /users — register or get existing
router.post("/", async (req, res) => {
  try {
    const { deviceId, username } = req.body ?? {};
    if (!deviceId || typeof deviceId !== "string" || deviceId.length > 128) {
      res.status(400).json({ error: "Ongeldige invoer" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.deviceId, deviceId)).limit(1);
    if (existing.length > 0) {
      res.json(existing[0]);
      return;
    }

    if (!username || typeof username !== "string" || !username.trim()) {
      res.status(400).json({ error: "Gebruikersnaam vereist" });
      return;
    }

    const [user] = await db
      .insert(usersTable)
      .values({ deviceId: deviceId.trim(), username: username.trim().slice(0, 32) })
      .returning();

    res.status(201).json(user);
  } catch {
    res.status(500).json({ error: "Registratie mislukt" });
  }
});

// POST /users/:id/ban — toggle ban
router.post("/:id/ban", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) { res.status(400).json({ error: "Ongeldig id" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!user) { res.status(404).json({ error: "Gebruiker niet gevonden" }); return; }

    const [updated] = await db
      .update(usersTable)
      .set({ isBanned: !user.isBanned })
      .where(eq(usersTable.id, id))
      .returning();

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Bijwerken mislukt" });
  }
});

export default router;
