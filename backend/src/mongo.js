const { MongoClient } = require("mongodb");

async function connectMongo() {
  const url = process.env.MONGO_URL;
  if (!url) {
    throw new Error("MONGO_URL is required");
  }

  const client = new MongoClient(url, {
    serverSelectionTimeoutMS: 5000
  });
  await client.connect();

  // If the URL includes a database name, client.db() uses it. Otherwise it falls back to "test".
  const db = client.db();
  const notes = db.collection("notes");

  // Optional, but helps with predictable sorting as data grows.
  await notes.createIndex({ createdAt: -1 });

  return { client, notes };
}

module.exports = { connectMongo };

