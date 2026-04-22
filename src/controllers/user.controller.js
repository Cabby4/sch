const userModel = require("../model/user.model");
const Task = require("../model/task.model");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


// REGISTRATION
const registerUser = async (req, res, next) => {

  const registerSchema = joi.object({
    name: joi.string().min(2).required(),
    email: joi.string().email().required(),
    password: joi.string().required()
  });

  const { error } = registerSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { email, password, name } = req.body;

    // CHECK IF USER EXISTS FIRST ❗
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(password, salt);

    const user = new userModel({
      email,
      password: hashed,
      name
    });

    await user.save();

    return res.status(200).json({
      message: "User Registered Successfully"
    });

  } catch (error) {
    next(error);
  }
};


// LOGIN
const loginUser = async (req, res, next) => {

  const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
  });

  const { error } = loginSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Successfully Logged In",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });

  } catch (error) {
    next(error);
  }
};


// USER PROGRESS
const getUserProgress = async (req, res, next) => {

  try {
    const userId = req.user._id;

    const totalTasks = await Task.countDocuments({ user: userId });

    const completedTasks = await Task.countDocuments({
      user: userId,
      completed: true
    });

    const progressPercent =
      totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    const user = await userModel.findById(userId);

    return res.status(200).json({
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      progress_percent: progressPercent,
      last_active: user?.lastActive
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProgress
};