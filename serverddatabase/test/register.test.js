const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

process.env.DB_PATH = ":memory:";

const { app } = require("../index");
const { resetDb } = require("../src/db");

test.beforeEach(() => {
  resetDb();
});

test("POST /register saves a new user", async () => {
  const res = await request(app).post("/register").send({
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "StrongP@ssw0rd!"
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.status, "success");
  assert.match(res.body.message, /saved/i);
  assert.equal(res.body.user.email, "ada@example.com");
  assert.ok(res.body.user.id);
});

test("POST /register rejects duplicate email", async () => {
  await request(app).post("/register").send({
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "StrongP@ssw0rd!"
  });

  const res = await request(app).post("/register").send({
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "StrongP@ssw0rd!"
  });

  assert.equal(res.status, 409);
  assert.equal(res.body.code, "EMAIL_TAKEN");
});

test("POST /register returns 400 for invalid payload", async () => {
  const res = await request(app).post("/register").send({
    name: "A",
    email: "not-an-email",
    password: "short"
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.status, "error");
  assert.equal(res.body.message, "Validation failed.");
  assert.ok(res.body.errors);
});

