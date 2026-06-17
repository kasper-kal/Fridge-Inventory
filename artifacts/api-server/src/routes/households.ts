import { Router } from "express";
import { db } from "@workspace/db";
import { householdsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { createHash } from "crypto";
import { z } from "zod/v4";

const router = Router();

function hashPin(pin: string) {
  return createHash("sha256").update(pin.trim()).digest("hex");
}

const Body = z.object({
  name: z.string().min(1).max(64),
  pin: z.string().min(1).max(32),
});

// POST /households — create
router.post("/", async (req, res) => {
  try {
    const body = Body.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Ongeldige invoer" });
      return;
    }

    const existing = await db
      .select()
      .from(householdsTable)
      .where(eq(householdsTable.name, body.data.name.trim()))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Er bestaat al een huishouden met deze naam" });
      return;
    }

    const [household] = await db
      .insert(householdsTable)
      .values({ name: body.data.name.trim(), pinHash: hashPin(body.data.pin) })
      .returning();

    res.status(201).json({ id: household.id, name: household.name });
  } catch {
    res.status(500).json({ error: "Aanmaken mislukt" });
  }
});

// POST /households/join — join by name + pin
router.post("/join", async (req, res) => {
  try {
    const body = Body.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Ongeldige invoer" });
      return;
    }

    const [household] = await db
      .select()
      .from(householdsTable)
      .where(
        and(
          eq(householdsTable.name, body.data.name.trim()),
          eq(householdsTable.pinHash, hashPin(body.data.pin))
        )
      )
      .limit(1);

    if (!household) {
      res.status(404).json({ error: "Naam of pincode onjuist" });
      return;
    }

    res.json({ id: household.id, name: household.name });
  } catch {
    res.status(500).json({ error: "Inloggen mislukt" });
  }
});

export default router;
