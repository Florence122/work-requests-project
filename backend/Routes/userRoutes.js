const request = require("supertest");
const express = require("express");
const usersRouter = require("../routes/users");

jest.mock("../db");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../middleware/auth", () => ({
  requireAdmin: (req, res, next) => next()
}));

const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use("/users", usersRouter);

describe("POST /users/register", () => {
    it("should register a new user", async () => {
        bcrypt.hash.mockResolvedValue("hashedPassword");
        
        db.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: 1 }, null);
    });

    const res = await request(app)
    .post("/users/register")
    .send({
        username: "admin",
        email: "admin@test.com",
        password: "123456",
        role: "admin"
    });
    
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User registered");
    expect(res.body.id).toBe(1);
    });

    it("should return 400 if fields are missing", async () => {
        const res = await request(app)
        .post("/users/register")
        .send({ email: "test@test.com" });
        
        expect(res.status).toBe(400);
        expect(res.body.message).toBe(
            "username, email, password and role are required"
        );
    });

    it("should return 400 if fields are missing", async () => {
        const res = await request(app)
        .post("/users/register")
        .send({ email: "test@test.com" });
        
        expect(res.status).toBe(400);
        expect(res.body.message).toBe(
            "username, email, password and role are required"
        );
    });
    it("should return 400 if username or email exists", async () => {
        bcrypt.hash.mockResolvedValue("hashedPassword");
        db.run.mockImplementation((sql, params, callback) => {
        callback({ message: "UNIQUE constraint failed" });
    });
        const res = await request(app)
        .post("/users/register")
        .send({
            username: "admin",
            email: "admin@test.com",
            password: "123456",
            role: "admin"
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Username or email already exists");
    });

    describe("POST /users/login", () => {
    it("should login successfully", async () => {
        db.get.mockImplementation((sql, params, callback) => {
        callback(null, {
            id: 1,
            username: "admin",
            role: "admin",
            password: "hashedPassword"
        });
    });

        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue("fake-jwt-token");

        const res = await request(app)
        .post("/users/login")
        .send({
            email: "admin@test.com",
            password: "123456"
        });

        expect(res.status).toBe(200);
        expect(res.body.token).toBe("fake-jwt-token");
        expect(res.body.user.username).toBe("admin");
    });

    describe("GET /users", () => {
    it("should return all users", async () => {
        db.all.mockImplementation((sql, params, callback) => {
        callback(null, [
            { id: 1, username: "admin", email: "admin@test.com", role: "admin" }
        ]);
    });
    
    const res = await request(app).get("/users");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].username).toBe("admin");
    });
    });
    });
});