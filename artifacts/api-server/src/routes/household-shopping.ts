import { Request, Router } from "express";
import { pool } from "@workspace/db";

const router = Router({ mergeParams: true });

function getHouseholdId(req: Request) {
  return parseInt((req.params as { householdId?: string }).householdId ?? "");
}

router.get("/", async (req, res) => {
  const hid = getHouseholdId(req);
  if (isNaN(hid)) return void res.status(400).json({ error: "Ongeldig ID" });
  try {
    const { rows } = await pool.query(
      "SELECT * FROM household_shopping_items WHERE household_id = $1 ORDER BY created_at ASC",
      [hid]
    );
    res.json({ items: rows.map(r => ({ id: String(r.id), name: r.name, checked: r.checked, createdAt: r.created_at })) });
  } catch {
    res.status(500).json({ error: "Ophalen mislukt" });
  }
});

router.post("/", async (req, res) => {
  const hid = getHouseholdId(req);
  if (isNaN(hid)) return void res.status(400).json({ error: "Ongeldig ID" });
  const { name } = req.body ?? {};
  if (!name?.trim()) return void res.status(400).json({ error: "Naam verplicht" });
  try {
    const { rows } = await pool.query(
      "INSERT INTO household_shopping_items (household_id, name, checked) VALUES ($1, $2, false) RETURNING *",
      [hid, name.trim()]
    );
    const r = rows[0];
    res.json({ item: { id: String(r.id), name: r.name, checked: r.checked, createdAt: r.created_at } });
  } catch {
    res.status(500).json({ error: "Toevoegen mislukt" });
  }
});

router.patch("/:itemId", async (req, res) => {
  const hid = getHouseholdId(req);
  const iid = parseInt(req.params.itemId ?? "");
  if (isNaN(hid) || isNaN(iid)) return void res.status(400).json({ error: "Ongeldig ID" });
  const { checked } = req.body ?? {};
  if (typeof checked !== "boolean") return void res.status(400).json({ error: "checked verplicht" });
  try {
    const { rows } = await pool.query(
      "UPDATE household_shopping_items SET checked = $1 WHERE id = $2 AND household_id = $3 RETURNING *",
      [checked, iid, hid]
    );
    if (!rows.length) return void res.status(404).json({ error: "Niet gevonden" });
    const r = rows[0];
    res.json({ item: { id: String(r.id), name: r.name, checked: r.checked, createdAt: r.created_at } });
  } catch {
    res.status(500).json({ error: "Bijwerken mislukt" });
  }
});

router.delete("/:itemId", async (req, res) => {
  const hid = getHouseholdId(req);
  const iid = parseInt(req.params.itemId ?? "");
  if (isNaN(hid) || isNaN(iid)) return void res.status(400).json({ error: "Ongeldig ID" });
  try {
    await pool.query("DELETE FROM household_shopping_items WHERE id = $1 AND household_id = $2", [iid, hid]);
    res.json({});
  } catch {
    res.status(500).json({ error: "Verwijderen mislukt" });
  }
});

router.delete("/", async (req, res) => {
  const hid = getHouseholdId(req);
  if (isNaN(hid)) return void res.status(400).json({ error: "Ongeldig ID" });
  try {
    if (req.query.checked === "true") {
      await pool.query("DELETE FROM household_shopping_items WHERE household_id = $1 AND checked = true", [hid]);
    } else {
      await pool.query("DELETE FROM household_shopping_items WHERE household_id = $1", [hid]);
    }
    res.json({});
  } catch {
    res.status(500).json({ error: "Wissen mislukt" });
  }
});

export default router;
