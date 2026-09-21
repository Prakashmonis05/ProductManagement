import * as authService from '../services/authService.js';
import { successResponse } from '../utils/apiResponse.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.registerUser({ name, email, password, role });
    return successResponse(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    return successResponse(res, 'Login successful', result, 200);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  return successResponse(res, 'Logout successful');
};

export const getMe = async (req, res) => {
  return successResponse(res, 'User profile fetched successfully', req.user);
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await authService.updateProfile(req.user.id, req.body);
    return successResponse(res, 'Profile updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  // SaaS simulation response
  return successResponse(res, `If an account with ${email} exists, password reset instructions have been sent.`);
};

export const resetPassword = async (req, res) => {
  return successResponse(res, 'Password has been reset successfully. Please login with your new password.');
};
