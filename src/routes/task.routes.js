const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");

const {
  getTasks,
  completeTask,
  getUserProgress,
  createTask,
  getDashboardAnalytics
} = require("../controllers/task.controller");

// GET all tasks
router.get("/tasks", auth, getTasks);

// Complete a task
router.post("/task/complete", auth, completeTask);

// User progress
router.get("/user/progress", auth,  getUserProgress);

// Create task
router.post("/task/create", auth, createTask);

 //Dashboard analytics 
 router.get("/dashboard/analytics", auth, getDashboardAnalytics)

module.exports = router;