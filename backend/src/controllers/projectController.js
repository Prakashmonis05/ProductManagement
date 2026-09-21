import * as projectService from '../services/projectService.js';
import { successResponse } from '../utils/apiResponse.js';

export const getProjects = async (req, res, next) => {
  try {
    const result = await projectService.getProjects(req.user, req.query);
    return successResponse(res, 'Projects retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user);
    return successResponse(res, 'Project retrieved successfully', project);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.user, req.body);
    return successResponse(res, 'Project created successfully', project, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.user, req.body);
    return successResponse(res, 'Project updated successfully', project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user);
    return successResponse(res, 'Project deleted successfully', result);
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const member = await projectService.addProjectMember(req.params.id, userId, role, req.user);
    return successResponse(res, 'Member added to project successfully', member, 201);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const result = await projectService.removeProjectMember(req.params.id, req.params.userId, req.user);
    return successResponse(res, 'Member removed from project successfully', result);
  } catch (error) {
    next(error);
  }
};
