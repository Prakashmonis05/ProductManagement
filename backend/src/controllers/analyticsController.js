import * as analyticsService from '../services/analyticsService.js';
import { successResponse } from '../utils/apiResponse.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getDashboardAnalytics(req.user);
    return successResponse(res, 'Dashboard analytics retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getProjectAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getProjectAnalytics(req.params.id);
    return successResponse(res, 'Project analytics retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};
