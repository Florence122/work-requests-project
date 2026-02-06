const express = require("express");
const userRoutes = require("./Routes/userRoutes")
const taskRoutes = require("./Routes/taskRoutes")

const app = express();
app.use(express.json());


app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);

const PORT = 3001;
app.listen(PORT, (err) => {
  if (err) {
    console.error("Failed to start server:", err);
  } else {
    console.log(`Server running on http://localhost:${PORT}`);
  }
});

