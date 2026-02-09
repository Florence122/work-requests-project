// all-tests.test.js
const request = require('supertest');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ===== TASK ENDPOINTS =====
describe('Task API Endpoints', () => {
  let taskApp;
  let taskDb;
  
  beforeAll(() => {
    // Create Express app for tasks
    taskApp = express();
    taskApp.use(express.json());
    
    // Create in-memory database
    taskDb = new sqlite3.Database(':memory:');
    
    // Setup database
    taskDb.serialize(() => {
      taskDb.run(`
        CREATE TABLE tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
          status TEXT NOT NULL CHECK(status IN ('open', 'in_progress', 'done')),
          assigned_to INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insert test data
      const stmt = taskDb.prepare(`
        INSERT INTO tasks (title, priority, status, assigned_to) 
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run('High Task 1', 'high', 'open', 1);
      stmt.run('Medium Task', 'medium', 'in_progress', 1);
      stmt.run('Low Task', 'low', 'done', 1);
      stmt.run('High Task 2', 'high', 'open', 1);
      
      stmt.finalize();
    });
    
    // Mock authentication middleware
    const requireAuth = (req, res, next) => {
      req.user = { id: 1, role: 'agent' };
      next();
    };
    
    // TASK FILTER ENDPOINT
    taskApp.get('/tasks/filter', requireAuth, (req, res) => {
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
      
      taskDb.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      });
    });
    
    // TASK SORT ENDPOINT
    taskApp.get('/tasks/sort/:field', requireAuth, (req, res) => {
      const allowed = ["priority", "created_at", "updated_at"];
      if (!allowed.includes(req.params.field)) {
        return res.status(400).json({ message: "Invalid sort field" });
      }
      const sql = `SELECT * FROM tasks ORDER BY ${req.params.field} DESC`;
      taskDb.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      });
    });
  });
  
  afterAll((done) => {
    taskDb.close(done);
  });
  
  test('GET /tasks/filter should filter by status', async () => {
    const response = await request(taskApp)
      .get('/tasks/filter?status=open')
      .expect(200);
    
    expect(response.body).toHaveLength(2);
    expect(response.body.every(task => task.status === 'open')).toBe(true);
  });
});

// ===== AUTH ENDPOINTS =====
describe('Auth API Endpoints', () => {
  let authApp;
  let authDb;
  
  beforeAll(async () => {
    // Create Express app for auth
    authApp = express();
    authApp.use(express.json());
    
    // Create in-memory database
    authDb = new sqlite3.Database(':memory:');
    
    // Setup database
    authDb.serialize(async () => {
      authDb.run(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('admin', 'agent'))
        )
      `);
      
      // Insert admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      authDb.run(
        `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
        ['admin', 'admin@test.com', hashedPassword, 'admin']
      );
    });
    
    // Mock admin middleware
    const requireAdmin = (req, res, next) => {
      req.user = { id: 1, role: 'admin' };
      next();
    };
    
    // USER REGISTRATION ENDPOINT
    authApp.post('/users/register', requireAdmin, async (req, res) => {
      const { username, email, role, password } = req.body;
      if (!username || !email || !role || !password) {
        return res.status(400).json({ 
          message: "username, email, password and role are required" 
        });
      }
      
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;
        authDb.run(sql, [username, email, hashedPassword, role], function(err) {
          if (err) {
            if (err.message.includes("UNIQUE")) {
              return res.status(400).json({ 
                message: "Username or email already exists" 
              });
            }
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({ id: this.lastID, message: "User registered" });
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // USER LOGIN ENDPOINT
    authApp.post('/users/login', async (req, res) => {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ 
          message: "Email and password are required" 
        });
      }
      
      authDb.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });
        
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });
        
        const token = jwt.sign(
          { id: user.id, role: user.role, username: user.username },
          'test-secret',
          { expiresIn: "8h" }
        );
        
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            username: user.username, 
            role: user.role 
          } 
        });
      });
    });
  });
  
  afterAll((done) => {
    authDb.close(done);
  });
  
  test('POST /users/register should create new user', async () => {
    const response = await request(authApp)
      .post('/users/register')
      .send({
        username: 'newagent',
        email: 'newagent@test.com',
        role: 'agent',
        password: 'password123'
      })
      .expect(201);
    
    expect(response.body).toHaveProperty('message', 'User registered');
  });
  
  test('POST /users/login should authenticate user', async () => {
    const response = await request(authApp)
      .post('/users/login')
      .send({
        email: 'admin@test.com',
        password: 'admin123'
      })
      .expect(200);
    
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.username).toBe('admin');
  });
});