const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
const { connectMongo } = require("./mongo");

const PORT = Number(process.env.PORT || 8080);

async function main() {
  const { client, notes } = await connectMongo();

  const app = express();

  // For practice: allow cross-origin requests (frontend and backend are on different ports).
  const corsOrigin = process.env.CORS_ORIGIN || "*";
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/notes", async (_req, res) => {
    const docs = await notes
      .find({}, { projection: { text: 1, createdAt: 1 } })
      .sort({ createdAt: -1, _id: -1 })
      .limit(200)
      .toArray();

    res.json(
      docs.map((d) => ({
        id: d._id.toString(),
        text: d.text,
        created_at: d.createdAt
      }))
    );
  });

  app.post("/notes", async (req, res) => {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!text) {
      return res.status(400).json({ error: "text is required" });
    }
    if (text.length > 5000) {
      return res.status(400).json({ error: "text is too long" });
    }

    const doc = { text, createdAt: new Date() };
    const result = await notes.insertOne(doc);

    res.status(201).json({
      id: result.insertedId instanceof ObjectId ? result.insertedId.toString() : String(result.insertedId),
      text: doc.text,
      created_at: doc.createdAt
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://0.0.0.0:${PORT}`);
  });

  // Best-effort shutdown for local dev / EC2 updates.
  process.on("SIGTERM", async () => {
    try {
      await client.close();
    } finally {
      process.exit(0);
    }
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
