import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { teamService } from '../../services/teamService';
import { projectService } from '../../services/projectService';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../../utils/avatar';

const PROJECT_COLORS = [
  '#6366f1', // Indigo
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
];

export const ProjectModal = ({ isOpen, onClose, onProjectSaved, projectToEdit = null }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    // Fetch teammates for assignment
    const loadTeam = async () => {
      try {
        const members = await teamService.getTeam();
        setTeamMembers(members);
      } catch (err) {
        console.error('Failed to load team members:', err);
      }
    };
    if (isOpen) {
      loadTeam();
    }
  }, [isOpen]);

  useEffect(() => {
    if (projectToEdit) {
      setValue('name', projectToEdit.name);
      setValue('description', projectToEdit.description || '');
      setValue('status', projectToEdit.status);
      setValue('priority', projectToEdit.priority);
      setValue(
        'startDate',
        projectToEdit.startDate ? new Date(projectToEdit.startDate).toISOString().split('T')[0] : ''
      );
      setValue(
        'dueDate',
        projectToEdit.dueDate ? new Date(projectToEdit.dueDate).toISOString().split('T')[0] : ''
      );
      setSelectedColor(projectToEdit.color || PROJECT_COLORS[0]);
      setSelectedMembers(projectToEdit.members?.map((m) => m.userId || m.user?.id) || []);
    } else {
      reset({
        name: '',
        description: '',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
      });
      setSelectedColor(PROJECT_COLORS[0]);
      setSelectedMembers([]);
    }
  }, [projectToEdit, isOpen, setValue, reset]);

  const toggleMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const onSubmit = async (formData) => {
    if (formData.startDate && formData.dueDate) {
      if (new Date(formData.dueDate) < new Date(formData.startDate)) {
        toast.error('Deadline cannot be earlier than start date');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description || '',
        status: formData.status || 'ACTIVE',
        priority: formData.priority || 'MEDIUM',
        color: selectedColor,
        startDate: formData.startDate || null,
        dueDate: formData.dueDate || null,
        memberIds: selectedMembers,
      };

      let savedProject;
      if (projectToEdit) {
        savedProject = await projectService.updateProject(projectToEdit.id, payload);
        toast.success('Project updated successfully');
      } else {
        savedProject = await projectService.createProject(payload);
        toast.success('Project created successfully');
      }

      onProjectSaved(savedProject);
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.errors?.join(', ') ||
        err.response?.data?.message ||
        'Failed to save project';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? 'Edit Project' : 'Create New Project'}
      description="Organize tasks, assign team members, and track delivery deadlines."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Project Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Project Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            {...register('name', { required: 'Project name is required', minLength: 2 })}
            placeholder="e.g. CloudScale Architecture Migration"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
          />
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            {...register('description')}
            placeholder="Provide core goals, key milestones, or architectural background..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
          />
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
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
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

        {/* Dates Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              Deadline Due Date
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            />
          </div>
        </div>

        {/* Project Color Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Color Theme
          </label>
          <div className="flex items-center space-x-2">
            {PROJECT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color }}
                className={`w-7 h-7 rounded-full transition-transform ${
                  selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-brand-500' : 'hover:scale-110'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Team Members Assignment */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Assign Team Members
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
            {teamMembers.map((member) => {
              const isSelected = selectedMembers.includes(member.id);
              return (
                <div
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className={`flex items-center space-x-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-medium'
                      : 'border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <img
                    src={getAvatarUrl(member.avatar)}
                    alt={member.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="truncate">{member.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {projectToEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
