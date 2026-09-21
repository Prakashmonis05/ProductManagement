import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { projectService } from '../../services/projectService';
import { teamService } from '../../services/teamService';
import { taskService } from '../../services/taskService';
import toast from 'react-hot-toast';

export const TaskModal = ({
  isOpen,
  onClose,
  onTaskSaved,
  taskToEdit = null,
  defaultProjectId = null,
}) => {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projRes, teamRes] = await Promise.all([
          projectService.getProjects(),
          teamService.getTeam(),
        ]);
        setProjects(projRes.projects || []);
        setTeamMembers(teamRes || []);
      } catch (err) {
        console.error('Failed to load modal data:', err);
      }
    };
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (taskToEdit) {
      setValue('title', taskToEdit.title);
      setValue('description', taskToEdit.description || '');
      setValue('projectId', taskToEdit.projectId);
      setValue('assignedToId', taskToEdit.assignedToId || '');
      setValue('status', taskToEdit.status);
      setValue('priority', taskToEdit.priority);
      setValue(
        'startDate',
        taskToEdit.startDate ? new Date(taskToEdit.startDate).toISOString().split('T')[0] : ''
      );
      setValue(
        'dueDate',
        taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : ''
      );
      setValue('estimatedHours', taskToEdit.estimatedHours || 0);
      setTags(taskToEdit.tags || []);
    } else {
      reset({
        title: '',
        description: '',
        projectId: defaultProjectId || '',
        assignedToId: '',
        status: 'TODO',
        priority: 'MEDIUM',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        estimatedHours: 0,
      });
      setTags([]);
    }
  }, [taskToEdit, defaultProjectId, isOpen, setValue, reset]);

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const onSubmit = async (data) => {
    if (!data.projectId && !defaultProjectId) {
      toast.error('Please select a project');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        projectId: data.projectId || defaultProjectId,
        startDate: data.startDate || null,
        dueDate: data.dueDate || null,
        assignedToId: data.assignedToId || null,
        estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : 0,
        actualHours: data.actualHours ? Number(data.actualHours) : 0,
        tags,
      };

      let savedTask;
      if (taskToEdit) {
        savedTask = await taskService.updateTask(taskToEdit.id, payload);
        toast.success('Task updated successfully');
      } else {
        savedTask = await taskService.createTask(payload);
        toast.success('Task created successfully');
      }

      onTaskSaved(savedTask);
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.errors?.join(', ') ||
        err.response?.data?.message ||
        'Failed to save task';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Task' : 'Create New Task'}
      description="Fill in task parameters, estimates, and assign team responsibility."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Task Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Task Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            {...register('title', { required: 'Task title is required', minLength: 2 })}
            placeholder="e.g. Implement Redis distributed rate-limiter"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
          />
          {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>}
        </div>

        {/* Project & Assignee Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Project <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('projectId', { required: !defaultProjectId ? 'Project is required' : false })}
              defaultValue={defaultProjectId || ''}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Assignee
            </label>
            <select
              {...register('assignedToId')}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.email ? `(${m.email})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status & Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              {...register('priority')}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Dates & Estimated Hours Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              {...register('startDate')}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Estimated Hours
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              {...register('estimatedHours')}
              placeholder="e.g. 16"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            {...register('description')}
            placeholder="Detailed specifications, acceptance criteria, or context..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Tags (Press Enter to add)
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center text-xs px-2.5 py-1 rounded-md bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1.5 text-brand-500 hover:text-brand-700 dark:hover:text-brand-200"
                >
                  &times;
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={tags.length === 0 ? 'Type tag and press Enter...' : ''}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none px-1 py-0.5 flex-1 min-w-[120px]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {taskToEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
