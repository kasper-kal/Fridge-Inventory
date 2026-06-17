import { Router } from "express";
import { db } from "@workspace/db";
import { householdsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { createHash } from "crypto";
const router = Router();

function hashPin(pin: string) {
  return createHash("sha256").update(pin.trim()).digest("hex");
}

function parseBody(body: unknown): { name: string; pin: string } | null {
  if (!body || typeof body !== "object") return null;
  const { name, pin } = body as Record<string, unknown>;
  if (typeof name !== "string" || !name.trim()) return null;
  if (typeof pin !== "string" || !pin.trim()) return null;
  if (name.length > 64 || pin.length > 32) return null;
  return { name: name.trim(), pin: pin.trim() };
}

// POST /households — create
router.post("/", async (req, res) => {
  try {
    const body = parseBody(req.body);
    if (!body) { res.status(400).json({ error: "Ongeldige invoer" }); return; }

    const existing = await db
      .select()
      .from(householdsTable)
      .where(eq(householdsTable.name, body.name))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Er bestaat al een huishouden met deze naam" });
      return;
    }

    const [household] = await db
      .insert(householdsTable)
      .values({ name: body.name, pinHash: hashPin(body.pin) })
      .returning();

    res.status(201).json({ id: household.id, name: household.name });
  } catch {
    res.status(500).json({ error: "Aanmaken mislukt" });
  }
});

// POST /households/join — join by name + pin
router.post("/join", async (req, res) => {
  try {
    const body = parseBody(req.body);
    if (!body) { res.status(400).json({ error: "Ongeldige invoer" }); return; }

    const [household] = await db
      .select()
      .from(householdsTable)
      .where(and(eq(householdsTable.name, body.name), eq(householdsTable.pinHash, hashPin(body.pin))))
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
