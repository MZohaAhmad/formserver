const express = require("express");
const cors = require("cors");
const { z } = require("zod");
const bcrypt = require("bcryptjs");
const { getDb } = require("./src/db");

const app = express();

app.use(cors());
app.use(express.json());

const RegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be at most 50 characters.")
    .regex(/^[A-Za-z \-']+$/, "Name contains invalid characters."),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .refine((v) => !v.includes(" "), "Password must not contain spaces.")
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/register", (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed.",
      errors: parsed.error.flatten().fieldErrors
    });
  }

  const { name, email, password } = parsed.data;
  const db = getDb();

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email.toLowerCase());

  if (existing) {
    return res.status(409).json({
      status: "error",
      code: "EMAIL_TAKEN",
      message: "This email is already in use."
    });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const info = db
    .prepare(
      "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)"
    )
    .run(name, email.toLowerCase(), passwordHash, new Date().toISOString());

  return res.status(201).json({
    status: "success",
    message: "Saved successfully!",
    user: { id: info.lastInsertRowid, name, email: email.toLowerCase() }
  });
});

const PORT = Number(process.env.PORT || 3002);
if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API running on http://localhost:${PORT}`);
  });
}

module.exports = { app };

