const express = require("express");
const app = express();
app.use(express.json());
require('dotenv').config();

const userRoutes = require("./Routes/userRoutes")
app.use("/users", userRoutes);
const taskRoutes = require("./Routes/taskRoutes")
app.use("/tasks", taskRoutes);

const PORT = 3001;
app.listen(PORT, (err) => {
  console.log(`Server running on http://localhost:${PORT}`);
});
module.exports = app; // Export app for testing
