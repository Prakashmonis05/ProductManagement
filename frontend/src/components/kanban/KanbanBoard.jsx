import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { taskService } from '../../services/taskService';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'REVIEW', title: 'Review' },
  { id: 'COMPLETED', title: 'Completed' },
];

export const KanbanBoard = ({ tasks = [], onTasksChange, onCardClick, onAddTask }) => {
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;

    // Save previous state for rollback
    const previousTasks = [...tasks];

    // Optimistically update local state
    const movingTask = tasks.find((t) => t.id === draggableId);
    if (!movingTask) return;

    const updatedTask = { ...movingTask, status: destColumn };
    const remainingTasks = tasks.filter((t) => t.id !== draggableId);

    // Group tasks by destination column and insert at new index
    const destTasks = remainingTasks.filter((t) => t.status === destColumn);
    destTasks.splice(destination.index, 0, updatedTask);

    const otherTasks = remainingTasks.filter((t) => t.status !== destColumn);
    const newTasks = [...otherTasks, ...destTasks];

    onTasksChange(newTasks);

    // Persist to backend
    try {
      await taskService.updateTaskStatus(draggableId, destColumn, destination.index);
    } catch (err) {
      console.error('Failed to persist task movement:', err);
      toast.error('Failed to move task. Reverting...');
      onTasksChange(previousTasks);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-1 items-start">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <KanbanColumn
              key={col.id}
              columnId={col.id}
              title={col.title}
              tasks={colTasks}
              onCardClick={onCardClick}
              onAddTask={onAddTask}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
};
