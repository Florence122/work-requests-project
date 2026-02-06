const express = require("express");
const db = require("../model/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const requireAdmin =require('../middlewares/requireAuth')
require('dotenv').config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

/**
 * CREATE user/admin
 * POST /users/register
 * Admin-only
 */

router.post("/register", requireAdmin, async (req, res) => {
    const { username, email, role, password } = req.body;

    if (!username || !email || !role || !password) {
        return res.status(400).json({ message: "username, email, password and role are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const sql = `INSERT INTO users (username, email, password, role)
            VALUES (?, ?, ?, ?)`;
            
            db.run(sql, [username, email, hashedPassword, role], function (err) {
                if (err) {
                    if (err.message.includes("UNIQUE")) {
                        return res.status(400).json({ message: "Username or email already exists" });
                    }
                return res.status(500).json({ error: err.message });
                }    
                res.status(201).json({ id: this.lastID, message: "User registered" });
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
});

/**
 * LOGIN user/admin
 * POST /users/login
 * Public
 */
router.post("/login",  (req, res) => {
    sql = `SELECT * FROM users WHERE email = ?`;
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Email and password are required" });

        db.get(sql, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });

        // Create JWT payload
        const tokenPayload = { id: user.id, role: user.role, username: user.username };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "8h" });

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    });
});

/**
 * GET all users/admins
 * GET /users
 * Admin-only
 */
router.get("/", requireAdmin,  (req, res) => {
    const sql = "SELECT id, username, email, role FROM users"; // Never send password hashes
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

/**
 * GET single user/admin by ID
 * GET /users/byId/:id
 * Admin-only
 */
router.get("/byID/:id", requireAdmin, (req, res) => {
    const sql = "SELECT id, username, email, role FROM users WHERE id = ?";
    
    db.get(sql, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: "User not found" });
        res.json(row);
    });
});

/**
 * UPDATE user/admin
 * PUT /users/update/:id
 * Admin-only
 */
router.put("/update/:id", requireAdmin, async (req, res) => {
    const { username, email, role } = req.body;

    if (!username || !email || !role) {
        return res.status(400).json({ message: "username, email and role are required" });
    }

    try {
        const sql =  `UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?`;
        const params = [username, email, role, req.params.id];
        
        db.run(sql, params, function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ message: "User not found" });
            res.json({ message: "User updated successfully" });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE user/admin
 * DELETE /users/:id
 * Admin-only
 */
router.delete("/delete/:id", (req, res) => {
    const sql = "DELETE FROM users WHERE id = ?";
    db.run(sql, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted successfully" });
    });
});

module.exports = router;
