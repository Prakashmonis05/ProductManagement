import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { PriorityBadge } from '../common/Badge';
import { Calendar, MessageSquare, Paperclip, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { getAvatarUrl } from '../../utils/avatar';

export const KanbanCard = ({ task, index, onClick }) => {
  const formattedDueDate = task.dueDate ? format(new Date(task.dueDate), 'MMM d') : null;
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`p-3.5 rounded-xl border bg-white dark:bg-gray-900 shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer select-none space-y-2.5 ${
            snapshot.isDragging
              ? 'ring-2 ring-brand-500 shadow-xl border-transparent opacity-95 scale-[1.02]'
              : 'border-slate-200/80 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700'
          }`}
        >
          {/* Top meta: Project Color/Name & Priority */}
          <div className="flex items-center justify-between gap-2">
            {task.project && (
              <div className="flex items-center space-x-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: task.project.color || '#6366f1' }}
                />
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                  {task.project.name}
                </span>
              </div>
            )}
            <PriorityBadge priority={task.priority} />
          </div>

          {/* Title */}
          <h4 className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white leading-snug line-clamp-2">
            {task.title}
          </h4>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-400"
                >
                  #{tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="text-[10px] text-slate-400 px-1">+{task.tags.length - 2}</span>
              )}
            </div>
          )}

          {/* Card Footer: Due Date, Comments, Assignee */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-gray-800/80 text-[11px]">
            <div className="flex items-center space-x-2 text-slate-400">
              {formattedDueDate && (
                <span
                  className={`flex items-center space-x-1 ${
                    isOverdue ? 'text-rose-500 font-semibold' : ''
                  }`}
                  title={isOverdue ? 'Overdue' : 'Due date'}
                >
                  <Clock className="w-3 h-3" />
                  <span>{formattedDueDate}</span>
                </span>
              )}

              {task._count?.comments > 0 && (
                <span className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{task._count.comments}</span>
                </span>
              )}
            </div>

            {/* Assignee Avatar */}
            {task.assignedTo ? (
              <img
                src={getAvatarUrl(task.assignedTo.avatar)}
                alt={task.assignedTo.name}
                title={task.assignedTo.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-gray-700"
              />
            ) : (
              <span className="w-5 h-5 rounded-full border border-dashed border-slate-300 dark:border-gray-700 flex items-center justify-center text-[10px] text-slate-400">
                ?
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
