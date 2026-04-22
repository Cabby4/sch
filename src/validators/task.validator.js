const Joi = require("joi");

// Validate task completion
const completeTaskSchema = Joi.object({
  task_id: Joi.string().hex().length(24).required()
});

// Validate pagination
const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10)
});

// Create task validation
const createTaskSchema = Joi.object({
  title: Joi.string().min(2).max(200).required()
});

module.exports = {
  completeTaskSchema,
  paginationSchema,
  createTaskSchema
};