// jest.config.js
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/tests/*.test.js'
  ],
  setupFilesAfterEnv: ['./setup.js'],
  testTimeout: 30000, // 30 seconds for API tests
  forceExit: true,
  detectOpenHandles: true
};