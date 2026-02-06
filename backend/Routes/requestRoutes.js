const express = require("express");
const db = require("../model/db");

const router = express.Router();

/**
 * CREATE a request (admin)
 * POST /requests
 */
router.post("/", (req, res) => {
  const { title, description, priority, created_by } = req.body;

  if (!title || !created_by) {
    return res.status(400).json({ message: "title and created_by are required" });
  }

  const sql = `
    INSERT INTO requests (title, description, priority, created_by)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [title, description, priority || "mid", created_by], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      id: this.lastID,
      message: "Request created"
    });
  });
});

/**
 * VIEW requests
 * GET /requests
 * Filters, search, sorting
 */
router.get("/", (req, res) => {
  const { search, status, priority, sort } = req.query;

  let sql = `SELECT * FROM requests WHERE 1=1`;
  const params = [];

  if (search) {
    sql += ` AND (title LIKE ? OR description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (status) {
    sql += ` AND status = ?`;
    params.push(status);
  }

  if (priority) {
    sql += ` AND priority = ?`;
    params.push(priority);
  }

  if (sort === "priority") {
    sql += ` ORDER BY 
      CASE priority 
        WHEN 'high' THEN 1
        WHEN 'mid' THEN 2
        WHEN 'low' THEN 3
      END`;
  } else {
    sql += ` ORDER BY updated_at DESC`;
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * VIEW single request
 * GET /requests/:id
 */
router.get("/:id", (req, res) => {
  db.get(
    `SELECT * FROM requests WHERE id = ?`,
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ message: "Request not found" });
      res.json(row);
    }
  );
});

/**
 * ASSIGN or UNASSIGN agent
 * PATCH /requests/:id/assign
 */
router.patch("/:id/assign", (req, res) => {
  const { assigned_to } = req.body;

  const sql = `
    UPDATE requests
    SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [assigned_to || null, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ message: "Request not found" });

    res.json({ message: "Agent assignment updated" });
  });
});

/**
 * UPDATE status (agent)
 * PATCH /requests/:id/status
 */
router.patch("/:id/status", (req, res) => {
  const { status } = req.body;
  const allowed = ["open", "in_progress", "done"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const sql = `
    UPDATE requests
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ message: "Request not found" });

    res.json({ message: "Status updated" });
  });
});

module.exports = router;