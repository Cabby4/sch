const Task = require("../model/task.model");
const {
  completeTaskSchema,
  paginationSchema,
  createTaskSchema
} = require("../validators/task.validator");


// GET /tasks (with pagination + user-specific)
const getTasks = async (req, res) => {
  try {
    const { error, value } = paginationSchema.validate(req.query);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { page, limit } = value;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ user: req.user.id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Task.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      page,
      total_pages: Math.ceil(total / limit),
      total_tasks: total,
      data: tasks
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// POST /task/complete
const completeTask = async (req, res) => {
  try {
    const { error } = completeTaskSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { task_id } = req.body;

    const task = await Task.findOne({
      _id: task_id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Prevent re-completion
    if (task.completed) {
      return res.status(400).json({
        message: "Task already completed"
      });
    }

    task.completed = true;
    task.completedAt = new Date();

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task marked as completed",
      data: task
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET /user/progress
const getUserProgress = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ user: req.user.id });
    const completedTasks = await Task.countDocuments({
      user: req.user.id,
      completed: true
    });

    const progressPercent =
      totalTasks === 0 ? 0 : ((completedTasks / totalTasks) * 100).toFixed(2);

    const lastCompletedTask = await Task.findOne({
      user: req.user.id,
      completed: true
    }).sort({ completedAt: -1 });

    res.status(200).json({
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      progress_percent: Number(progressPercent),
      last_active: lastCompletedTask ? lastCompletedTask.completedAt : null
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//POST /task/create
const createTask = async (req, res) => {
  try {
    const { error } = createTaskSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const { title } = req.body;

    const newTask = await Task.create({
      title,
      user: req.user.id, // 🔐 user-specific
      completed: false
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: newTask
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET /dashboard/analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Basic stats
    const totalTasks = await Task.countDocuments({ user: userId });

    const completedTasks = await Task.countDocuments({
      user: userId,
      completed: true,
    });

    const pendingTasks = totalTasks - completedTasks;

    const completionRate =
      totalTasks === 0
        ? 0
        : ((completedTasks / totalTasks) * 100).toFixed(2);

    // Last activity
    const lastTask = await Task.findOne({ user: userId })
      .sort({ updatedAt: -1 });

    // Tasks created per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const dailyTasks = await Task.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        pending_tasks: pendingTasks,
        completion_rate: Number(completionRate),
        last_active: lastTask ? lastTask.updatedAt : null,
        tasks_last_7_days: dailyTasks,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = {
  getTasks,
  completeTask,
  getUserProgress,
  createTask,
  getDashboardAnalytics
};