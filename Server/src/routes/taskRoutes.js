const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  taskValidation,
  idValidation,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// All task routes require authentication
router.use(protect);

router.route('/').get(getTasks).post(taskValidation, createTask);
router.route('/:id').get(idValidation, getTask).put(idValidation, taskValidation, updateTask).delete(idValidation, deleteTask);

module.exports = router;
