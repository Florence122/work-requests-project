const express = require("express");
const router = express.Router();
const db = require("../model/db");

/**
 * CREATE user/admin
 * POST /users
 */
router.post("/", (req, res) => {
    const { username, email, role } = req.body;

    if (!username || !email || !role) {
        return res.status(400).json({ message: "username, email and role are required" });
    }

    const sql = `
        INSERT INTO users (username, email, role)
        VALUES (?, ?, ?)
    `;

    db.run(sql, [username, email, role], function (err) {
        if (err) {
        return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
        id: this.lastID,
        username,
        email,
        role
    });
  });
});

/**
 * GET all users/admins
 * GET /users
 */
router.get("/", (req, res) => {
    sql = "SELECT * FROM users"; 
    db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

/**
 * GET single user/admin by ID
 * GET /users/:id
 */
router.get("/:id", (req, res) => {
    sql = "SELECT * FROM users WHERE id = ?";
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(row);
    }
  );
});

/**
 * UPDATE user/admin
 * PUT /users/:id
 */
router.put("/:id", (req, res) => {
    const { username, email, role } = req.body;

    if (!username || !email || !role) {
        return res.status(400).json({ message: "username, email and role are required" });
    }

    const sql = `
        UPDATE users
        SET username = ?, email = ?, role = ?
        WHERE id = ?
    `;

    db.run(sql, [username, email, role, req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User updated successfully" });
    });
});

/**
 * DELETE user/admin
 * DELETE /users/:id
 */
router.delete("/:id", (req, res) => {
    sql = "DELETE FROM users WHERE id = ?"
    db.run(sql, [req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    }
  );
});

module.exports = router;
