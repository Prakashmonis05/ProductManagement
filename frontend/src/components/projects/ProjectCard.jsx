import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, MoreVertical } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { format } from 'date-fns';
import { getAvatarUrl } from '../../utils/avatar';

export const ProjectCard = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const formattedDueDate = project.dueDate
    ? format(new Date(project.dueDate), 'MMM dd, yyyy')
    : 'No deadline';

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group relative bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-gray-700 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Card Header: Color Indicator, Name, Status */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: project.color || '#6366f1' }}
            />
            <h3 className="font-semibold text-base text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {project.name}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {project.isManager && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Manager
              </span>
            )}
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {project.description || 'No description provided.'}
        </p>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Progress</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {project.progress || 0}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${project.progress || 0}%`,
                backgroundColor: project.color || '#6366f1',
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer: Tasks count, Deadline, Avatars */}
      <div className="pt-3 border-t border-slate-100 dark:border-gray-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {project.completedTasks || 0} / {project.totalTasks || 0} tasks
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDueDate}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <PriorityBadge priority={project.priority} />

          {/* Members Avatars Stack */}
          <div className="flex items-center -space-x-2 overflow-hidden">
            {project.members?.slice(0, 4).map((m, idx) => (
              <img
                key={m.id || idx}
                src={getAvatarUrl(m.user?.avatar)}
                alt={m.user?.name || 'Member'}
                title={m.user?.name}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-900 object-cover"
              />
            ))}
            {(project.members?.length || 0) > 4 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-gray-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-gray-900">
                +{(project.members?.length || 0) - 4}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
