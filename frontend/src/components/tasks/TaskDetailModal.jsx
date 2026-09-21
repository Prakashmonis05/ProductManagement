import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  User,
  MessageSquare,
  Tag,
  Paperclip,
  Trash2,
  Send,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../../utils/avatar';

export const TaskDetailModal = ({ isOpen, onClose, taskId, onTaskUpdated, onEditTask }) => {
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const data = await taskService.getTaskById(taskId);
      setTask(data);
      setComments(data.comments || []);
    } catch (err) {
      console.error('Failed to fetch task:', err);
      toast.error('Could not load task details');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
    }
  }, [isOpen, taskId]);

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await taskService.updateTaskStatus(task.id, newStatus);
      setTask((prev) => ({ ...prev, status: newStatus }));
      onTaskUpdated && onTaskUpdated(updated);
      toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      const updated = await taskService.updateTask(task.id, { priority: newPriority });
      setTask((prev) => ({ ...prev, priority: newPriority }));
      onTaskUpdated && onTaskUpdated(updated);
      toast.success('Priority updated');
    } catch (err) {
      toast.error('Failed to update priority');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setIsSubmittingComment(true);
    try {
      const newComment = await taskService.addComment(task.id, commentInput.trim());
      setComments([newComment, ...comments]);
      setCommentInput('');
      toast.success('Comment posted');
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await taskService.deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(task.id);
      toast.success('Task deleted successfully');
      onTaskUpdated && onTaskUpdated({ id: task.id, _deleted: true });
      onClose();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      {isLoading || !task ? (
        <div className="p-8 text-center text-sm text-slate-400">Loading task details...</div>
      ) : (
        <div className="space-y-6">
          {/* Header & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-gray-800">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: task.project?.color || '#6366f1' }}
                />
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  {task.project?.name || 'Project'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {task.title}
              </h2>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                icon={Edit2}
                onClick={() => {
                  onClose();
                  onEditTask && onEditTask(task);
                }}
              >
                Edit
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDeleteTask} title="Delete Task">
                <Trash2 className="w-4 h-4 text-rose-500" />
              </Button>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200/60 dark:border-gray-800 text-xs">
            {/* Status Dropdown */}
            <div>
              <span className="text-slate-400 block mb-1">Status</span>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg px-2 py-1 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Priority Dropdown */}
            <div>
              <span className="text-slate-400 block mb-1">Priority</span>
              <select
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg px-2 py-1 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <span className="text-slate-400 block mb-1">Assignee</span>
              <div className="flex items-center space-x-2 py-1">
                {task.assignedTo ? (
                  <>
                    <img
                      src={getAvatarUrl(task.assignedTo.avatar)}
                      alt={task.assignedTo.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {task.assignedTo.name}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 italic">Unassigned</span>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <span className="text-slate-400 block mb-1">Due Date</span>
              <div className="flex items-center space-x-1.5 py-1 text-slate-800 dark:text-slate-200 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No deadline'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Description
            </h4>
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {task.description || 'No description provided for this task.'}
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                Comments ({comments.length})
              </h4>
            </div>

            {/* Add Comment Input Form */}
            <form onSubmit={handleAddComment} className="flex items-start space-x-3">
              <img
                src={getAvatarUrl(user?.avatar)}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
              />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Add a comment or update..."
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                />
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSubmittingComment}
                  disabled={!commentInput.trim()}
                  icon={Send}
                >
                  Post
                </Button>
              </div>
            </form>

            {/* Comments Stream */}
            <div className="space-y-3 pt-2 max-h-56 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No comments yet. Start the conversation!
                </p>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50/50 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800/80 group"
                  >
                    <img
                      src={getAvatarUrl(c.user?.avatar)}
                      alt={c.user?.name || 'User'}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {c.user?.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {c.userId === user?.id && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity p-1"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
