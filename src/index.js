import express from "express";
import db from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  const result = await db.query(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
    [name, email]
  );
  res.status(201).json(result.rows[0]);
});

app.get("/users", async (req, res) => {
  const { active } = req.query;
  if (active === 'true') {
    const result = await db.query("SELECT * FROM users WHERE is_active = true ORDER BY created_at DESC");
    res.json(result.rows);
  } else {
    const result = await db.query("SELECT * FROM users");
    res.json(result.rows);
  }
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  res.json(result.rows[0]);
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM users WHERE id = $1", [id]);
  res.json({ message: "User deleted" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});