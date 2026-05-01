
const express = require("express");
const cors = require ("cors");
const connectDB = require("../src/database/db");
const errorHandler = require("./middlewares/error.handler");
const logger = require ("./middlewares/logger");
const taskRoutes = require ("./routes/task.routes");
const userRoutes = require ("./routes/user.routes");

const app = express();

connectDB();
app.use (cors());

app.use (express.json());
app.use (logger);

app.get("/", (req,res) => {
    res.send("API is running");
})

app.use("/api", taskRoutes);
app.use("/api", userRoutes);
app.use("/api/user", userRoutes);

app.use (errorHandler);

module.exports = app;