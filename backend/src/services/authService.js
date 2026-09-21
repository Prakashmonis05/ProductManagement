import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { generateToken } from '../config/jwt.js';

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    const error = new Error('User with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'USER',
      avatar: '/default-avatar.svg',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  // Create welcome notification
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'PROJECT_UPDATE',
      title: 'Welcome to PulseFlow!',
      message: 'Explore your projects, manage tasks, and collaborate with your team.',
    },
  });

  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };

  return { user: safeUser, token };
};

export const updateProfile = async (userId, data) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};
  if (data.name) updateData.name = data.name;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;

  if (data.newPassword) {
    if (!data.currentPassword) {
      const error = new Error('Current password is required to change password');
      error.statusCode = 400;
      throw error;
    }
    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
      const error = new Error('Current password does not match');
      error.statusCode = 400;
      throw error;
    }
    updateData.password = await bcrypt.hash(data.newPassword, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};
