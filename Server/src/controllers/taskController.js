const { body, param } = require('express-validator');
const Task = require('../models/Task');
const { handleValidationErrors } = require('../middleware/validate');

// ─── Validation Rules ────────────────────────────────────────────────────────
const taskValidation = [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1–100 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Status must be todo, in-progress, or done'),
  handleValidationErrors,
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  handleValidationErrors,
];

// ─── Controllers ─────────────────────────────────────────────────────────────

/** POST /api/tasks */
const createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const task = await Task.create({ title, description, status, userId: req.user.id });
    res.status(201).json({ success: true, message: 'Task created.', task });
  } catch (err) {
    next(err);
  }
};

/** GET /api/tasks?page=1&limit=10&status=todo&search=keyword */
const getTasks = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { userId: req.user.id };
    if (req.query.status && ['todo', 'in-progress', 'done'].includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.search && req.query.search.trim()) {
      filter.title = { $regex: req.query.search.trim(), $options: 'i' };
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/tasks/:id */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.status(200).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/tasks/:id */
const updateTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, description, status },
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.status(200).json({ success: true, message: 'Task updated.', task });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/tasks/:id */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.status(200).json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  taskValidation,
  idValidation,
};
