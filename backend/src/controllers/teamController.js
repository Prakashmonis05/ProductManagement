import * as teamService from '../services/teamService.js';
import { successResponse } from '../utils/apiResponse.js';

export const getTeam = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const members = await teamService.getTeamMembers(search, role);
    return successResponse(res, 'Team members retrieved successfully', members);
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const updated = await teamService.updateMemberRole(req.params.id, role);
    return successResponse(res, 'Member role updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const result = await teamService.deleteUser(req.params.id);
    return successResponse(res, 'User deleted successfully', result);
  } catch (error) {
    next(error);
  }
};
