import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { KanbanCard } from './KanbanCard';
import { Plus } from 'lucide-react';

const COLUMN_COLORS = {
  TODO: 'bg-slate-400',
  IN_PROGRESS: 'bg-blue-500',
  REVIEW: 'bg-amber-500',
  COMPLETED: 'bg-emerald-500',
};

export const KanbanColumn = ({
  columnId,
  title,
  tasks = [],
  onCardClick,
  onAddTask,
}) => {
  return (
    <div className="flex flex-col w-72 sm:w-80 shrink-0 bg-slate-100/70 dark:bg-gray-900/60 rounded-2xl border border-slate-200/70 dark:border-gray-800/80 p-3 max-h-[calc(100vh-210px)]">
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-1.5 mb-2">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${COLUMN_COLORS[columnId] || 'bg-slate-400'}`} />
          <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {title}
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-gray-800 text-[11px] font-bold text-slate-600 dark:text-slate-400">
            {tasks.length}
          </span>
        </div>

        {onAddTask && (
          <button
            onClick={() => onAddTask(columnId)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-gray-800 transition-colors"
            title={`Add task to ${title}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto space-y-2.5 p-1 rounded-xl transition-colors duration-150 ${
              snapshot.isDraggingOver ? 'bg-slate-200/50 dark:bg-gray-800/40' : ''
            }`}
            style={{ minHeight: '150px' }}
          >
            {tasks.map((task, index) => (
              <KanbanCard
                key={task.id}
                task={task}
                index={index}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-28 flex items-center justify-center border border-dashed border-slate-200 dark:border-gray-800 rounded-xl text-xs text-slate-400">
                Empty column
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
