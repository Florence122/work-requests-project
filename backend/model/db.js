const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error("DB Error:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

db.run("PRAGMA foreign_keys = ON");

// Create User table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('user','admin')) NOT NULL
  )
`, (err) => {
  if (err) {
    console.error("Users table error:", err.message);
  } else {
    console.log("Users table ready");
  }
});

//Create Task Table
db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('open', 'in_progress', 'done')) DEFAULT 'open',
  priority TEXT CHECK(priority IN ('low', 'mid', 'high')) DEFAULT 'mid',
  assigned_to INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
  )
`, (err) => {
  if (err) {
    console.error("Tasks table error:", err.message);
  } else {
    console.log("Tasks table ready");
  }
});

module.exports = db;
