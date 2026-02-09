// tests/setup.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Test configuration
const TEST_CONFIG = {
  JWT_SECRET: 'test-secret-key',
  SALT_ROUNDS: 10
};

// Create in-memory test database
const createTestDatabase = () => {
  const db = new sqlite3.Database(':memory:');

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('admin', 'agent')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create tasks table
      db.run(`
        CREATE TABLE tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
          status TEXT NOT NULL CHECK(status IN ('open', 'in_progress', 'done')),
          assigned_to INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (assigned_to) REFERENCES users(id)
        )
      `);

      // Create indexes
      db.run('CREATE INDEX idx_tasks_status ON tasks(status)');
      db.run('CREATE INDEX idx_tasks_priority ON tasks(priority)');
      db.run('CREATE INDEX idx_tasks_assigned ON tasks(assigned_to)');

      console.log('Test database created successfully');
      resolve(db);
    });
  });
};

// Seed test data
const seedTestData = async (db) => {
  // Create test admin user
  const adminPassword = await bcrypt.hash('admin123', TEST_CONFIG.SALT_ROUNDS);
  const agentPassword = await bcrypt.hash('agent123', TEST_CONFIG.SALT_ROUNDS);
  const anotherAgentPassword = await bcrypt.hash('agent456', TEST_CONFIG.SALT_ROUNDS);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Insert users
      db.run(
        `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
        ['admin', 'admin@test.com', adminPassword, 'admin']
      );

      db.run(
        `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
        ['agent1', 'agent1@test.com', agentPassword, 'agent']
      );

      db.run(
        `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
        ['agent2', 'agent2@test.com', anotherAgentPassword, 'agent']
      );

      // Get user IDs
      db.get('SELECT id FROM users WHERE username = ?', ['agent1'], (err, agent1) => {
        if (err) return reject(err);

        // Insert test tasks
        const stmt = db.prepare(`
          INSERT INTO tasks (title, description, priority, status, assigned_to, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        // Tasks with different statuses and priorities
        const tasks = [
          ['Fix Login Bug', 'User cannot login on mobile', 'high', 'open', agent1.id, '2024-01-01 10:00:00'],
          ['Update Documentation', 'Update API docs', 'medium', 'in_progress', agent1.id, '2024-01-02 11:00:00'],
          ['Performance Optimization', 'Optimize database queries', 'high', 'done', agent1.id, '2024-01-03 12:00:00'],
          ['Add New Feature', 'Implement search functionality', 'low', 'open', agent1.id, '2024-01-04 13:00:00'],
          ['Fix UI Issue', 'Button alignment problem', 'medium', 'in_progress', agent1.id, '2024-01-05 14:00:00'],
          ['Security Audit', 'Conduct security review', 'high', 'open', null, '2024-01-06 15:00:00']
        ];

        tasks.forEach(task => {
          stmt.run(...task);
        });

        stmt.finalize();
        console.log('Test data seeded successfully');
        resolve();
      });
    });
  });
};

// Generate JWT token for testing
const generateTestToken = (userId, role = 'agent') => {
  return jwt.sign(
    { id: userId, role: role, username: 'testuser' },
    TEST_CONFIG.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Clean up database
const cleanupDatabase = (db) => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      console.log('Database connection closed');
      resolve();
    });
  });
};

module.exports = {
  createTestDatabase,
  seedTestData,
  generateTestToken,
  cleanupDatabase,
  TEST_CONFIG
};