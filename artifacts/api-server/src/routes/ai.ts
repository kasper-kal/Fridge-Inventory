import { Router } from "express";
import OpenAI from "openai";
import { ParseReceiptBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /ai/parse-receipt
router.post("/parse-receipt", async (req, res) => {
  try {
    const body = ParseReceiptBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Invalid input", details: body.error.issues });
      return;
    }

    const { text } = body.data;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are a receipt parser. Extract food/grocery items from receipt text and return ONLY a valid JSON array.
Each item must have: "name" (string), "quantity" (number or null), "unit" (string or null).
Rules:
- Extract only food and grocery product names
- Ignore prices, totals, store names, dates, tax lines
- Normalize units (e.g. "ltr" -> "L", "grams" -> "g", "pieces" -> "pcs")
- If quantity/unit are unclear, set them to null
- Return ONLY the JSON array, no markdown, no explanation`,
        },
        {
          role: "user",
          content: `Parse this receipt text into structured grocery items:\n\n${text}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "[]";

    let items: { name: string; quantity: number | null; unit: string | null }[];
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      items = JSON.parse(cleaned);
      if (!Array.isArray(items)) items = [];
    } catch {
      items = [];
    }

    res.json(items);
  } catch (err) {
    logger.error({ err }, "AI parse-receipt failed");
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to parse receipt", detail: message });
  }
});

export default router;
