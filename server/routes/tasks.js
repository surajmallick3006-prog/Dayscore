const express = require('express');
const Task = require('../models/Task');
const { authenticateToken } = require('../middleware/auth');
const { validateTask } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get user's tasks with filtering and pagination
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      category, 
      page = 1, 
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build filter object
    const filter = { userId: req.user._id };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const tasks = await Task.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Task.countDocuments(filter);

    res.json({
      tasks,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      message: 'Failed to fetch tasks',
      error: 'FETCH_TASKS_ERROR'
    });
  }
});

// @route   GET /api/tasks/stats
// @desc    Get task statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let startDate, endDate;
    const now = new Date();
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
    }

    const stats = await Task.getCompletionStats(req.user._id, startDate, endDate);

    res.json({
      period,
      stats,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch task statistics',
      error: 'STATS_ERROR'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', authenticateToken, validateTask, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      userId: req.user._id
    };

    const task = new Task(taskData);
    await task.save();

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      message: 'Failed to create task',
      error: 'CREATE_TASK_ERROR'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a specific task
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
        error: 'TASK_NOT_FOUND'
      });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      message: 'Failed to fetch task',
      error: 'FETCH_TASK_ERROR'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', authenticateToken, validateTask, async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // If marking as done, set completion time
    if (updateData.status === 'done' && req.body.status !== 'done') {
      updateData.completedAt = new Date();
    }
    
    // If unmarking as done, remove completion time
    if (updateData.status !== 'done') {
      updateData.completedAt = null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
        error: 'TASK_NOT_FOUND'
      });
    }

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      message: 'Failed to update task',
      error: 'UPDATE_TASK_ERROR'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
        error: 'TASK_NOT_FOUND'
      });
    }

    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      message: 'Failed to delete task',
      error: 'DELETE_TASK_ERROR'
    });
  }
});

// @route   POST /api/tasks/:id/complete
// @desc    Mark task as complete
// @access  Private
router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { actualTime } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { 
        status: 'done',
        completedAt: new Date(),
        ...(actualTime && { actualTime })
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
        error: 'TASK_NOT_FOUND'
      });
    }

    res.json({
      message: 'Task marked as complete',
      task
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      message: 'Failed to complete task',
      error: 'COMPLETE_TASK_ERROR'
    });
  }
});

// @route   POST /api/tasks/bulk-update
// @desc    Update multiple tasks
// @access  Private
router.post('/bulk-update', authenticateToken, async (req, res) => {
  try {
    const { taskIds, updateData } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        message: 'Task IDs array is required'
      });
    }

    const result = await Task.updateMany(
      { 
        _id: { $in: taskIds },
        userId: req.user._id
      },
      updateData
    );

    res.json({
      message: `${result.modifiedCount} tasks updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      message: 'Failed to update tasks',
      error: 'BULK_UPDATE_ERROR'
    });
  }
});

module.exports = router;