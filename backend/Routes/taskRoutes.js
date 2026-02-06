const express = require("express");
const router = express.Router();
const db = require("../db");
const requireAdmin = require('../middlewares/requireAuth')

const validTransitions = {
  open: ["in_progress"],
  in_progress: ["done"],
  done: []
};

/*Create a new request (Admin only)
POST /tasks/
*/
router.post("/", requireAdmin, (req, res) => {
  const { title, description, priority } = req.body;
  const allowedPriorities = ["low", "mid", "high"];
  const taskPriority = allowedPriorities.includes(priority) ? priority : "mid";

  if (!title) return res.status(400).json({ message: "Title is required" });

  const sql = `
    INSERT INTO requests (title, description, priority, created_by, status)
    VALUES (?, ?, ?, ?, 'open')
  `;

  db.run(sql, [title, description, taskPriority, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

/* View Task filtered by Role(Agent or User)
GET /tasks/
*/
router.get("/", (req, res) => {
  if (req.user.role === "admin") {
    db.all(
      `SELECT * FROM requests WHERE created_by = ?`,
      [req.user.id],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  } else if (req.user.role === "agent") {
    db.all(
      `SELECT * FROM requests WHERE agent_id = ?`,
      [req.user.id],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  } else {
    return res.status(403).json({ message: "Access denied" });
  }
});

