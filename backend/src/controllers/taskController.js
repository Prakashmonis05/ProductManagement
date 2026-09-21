import * as taskService from '../services/taskService.js';
import { successResponse } from '../utils/apiResponse.js';

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasks(req.user, req.query);
    return successResponse(res, 'Tasks retrieved successfully', tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    return successResponse(res, 'Task retrieved successfully', task);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.user, req.body);
    return successResponse(res, 'Task created successfully', task, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.user, req.body);
    return successResponse(res, 'Task updated successfully', task);
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await taskService.updateTaskStatus(req.params.id, req.user, req.body);
    return successResponse(res, 'Task status updated successfully', task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const result = await taskService.deleteTask(req.params.id, req.user);
    return successResponse(res, 'Task deleted successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    return successResponse(res, 'Comments retrieved successfully', task.comments);
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }
    const comment = await taskService.addComment(req.params.id, req.user, content.trim());
    return successResponse(res, 'Comment added successfully', comment, 201);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const result = await taskService.deleteComment(req.params.id, req.user);
    return successResponse(res, 'Comment deleted successfully', result);
  } catch (error) {
    next(error);
  }
};
