const express = require("express");
const db = require("../model/db");
const router = express.Router();
const requireAuth = require("../middlewares/requireAuth");
const requireAdmin = require("../middlewares/requireAdmin");

/**
 * CREATE TASK (ADMIN ONLY)
 * POST /tasks
 */
router.post("/", requireAuth, requireAdmin, (req, res) => {
  const { title, description, priority, assigned_to } = req.body;

  if (!title || description || assigned_to) {
    return res.status(400).json({ message: "Title is required" });
  }

  const sql = `
    INSERT INTO tasks (title, description, priority, created_by, assigned_to)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [title, description || "", priority || "mid", req.user.id, assigned_to || null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: "Task created" });
    }
  );
});

/**
 * GET TASKS
 * Admin → all
 * Agent → assigned only
 * GET /tasks
 */
router.get("/", requireAuth, (req, res) => {
  let sql;
  let params = [];

  if (req.user.role === "admin") {
    sql = "SELECT * FROM tasks";
  } else {
    sql = "SELECT * FROM tasks WHERE assigned_to = ?";
    params = [req.user.id];
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * SEARCH TASKS
 * GET /tasks/search?q=keyword
 */
router.get("/search", requireAuth, (req, res) => {
  const { q } = req.query;

  if (!q) return res.status(400).json({ message: "Search query required" });

  const sql = `
    SELECT * FROM tasks
    WHERE title LIKE ? OR description LIKE ?
  `;

  db.all(sql, [`%${q}%`, `%${q}%`], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * FILTER TASKS
 * GET /tasks/filter?status=open&priority=high
 */
router.get("/filter", requireAuth, (req, res) => {
  const { status, priority } = req.query;

  let sql = "SELECT * FROM tasks WHERE 1=1";
  const params = [];

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  if (priority) {
    sql += " AND priority = ?";
    params.push(priority);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * SORT TASKS
 * GET /tasks/sort/:field
 */
router.get("/sort/:field", requireAuth, (req, res) => {
  const allowed = ["priority", "created_at", "updated_at"];

  if (!allowed.includes(req.params.field)) {
    return res.status(400).json({ message: "Invalid sort field" });
  }

  const sql = `SELECT * FROM tasks ORDER BY ${req.params.field} DESC`;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * GET SINGLE TASK
 * GET /tasks/:id
 */
router.get("/:id",  (req, res) => {
  db.get(
    "SELECT * FROM tasks WHERE id = ?",
    [req.params.id],
    (err, task) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json(task);
    }
  );
});

/**
 * UPDATE TASK STATUS (AGENT ONLY)
 * PUT /tasks/:id/status
 */
router.put("/:id/status",  (req, res) => {
  const { status } = req.body;

  if (!["open", "in_progress", "done"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const sql = `
    UPDATE tasks
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND assigned_to = ?
  `;

  db.run(sql, [status, req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(403).json({ message: "Not allowed" });
    }
    res.json({ message: "Status updated" });
  });
});

/**
 * ASSIGN / UNASSIGN AGENT (ADMIN ONLY)
 * PUT /tasks/:id/assign
 */
router.put("/:id/assign", requireAuth, requireAdmin, (req, res) => {
  const { assigned_to } = req.body;

  const sql = `
    UPDATE tasks
    SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [assigned_to || null, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Agent assignment updated" });
  });
});

module.exports = router;
