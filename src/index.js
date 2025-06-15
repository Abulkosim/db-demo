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

app.get("/users/:id/with-profile", async (req, res) => {
  try {
    const { id } = req.params;
    const userResult = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    const profileResult = await db.query("SELECT * FROM user_profiles WHERE user_id = $1", [id]);
    const preferencesResult = await db.query("SELECT * FROM user_preferences WHERE user_id = $1", [id]);

    const user = userResult.rows[0];
    const profile = profileResult.rows[0];
    const preferences = preferencesResult.rows[0];
    res.json({ user, profile, preferences });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user with profile", details: error.message });
  }
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM users WHERE id = $1", [id]);
  res.json({ message: "User deleted" });
});

app.post("/users/complete", async (req, res) => {
  const { name, email, bio, theme, language = "en" } = req.body;

  try {
    await db.query("BEGIN");

    const userResult = await db.query("INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *", [name, email]);
    const user = userResult.rows[0];

    const profileResult = await db.query("INSERT INTO user_profiles (user_id, bio) VALUES ($1, $2) RETURNING *", [user.id, bio]);
    const profile = profileResult.rows[0];

    const preferencesResult = await db.query("INSERT INTO user_preferences (user_id, theme, language) VALUES ($1, $2, $3) RETURNING *", [user.id, theme, language]);
    const preferences = preferencesResult.rows[0];

    await db.query("COMMIT");

    res.status(201).json({
      user,
      profile,
      preferences,
      message: "User completed successfully"
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error completing user:", error);
    res.status(500).json({ error: "Failed to complete user", details: error.message });
  }
});

app.get("/debug/tables", async (req, res) => {
  try {
    const dbInfo = await db.query("SELECT current_database(), current_user");
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    res.json({
      database: dbInfo.rows[0],
      tables: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});