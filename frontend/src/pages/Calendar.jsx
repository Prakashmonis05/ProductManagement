import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { Button } from '../components/common/Button';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const [taskData, projData] = await Promise.all([
          taskService.getTasks(),
          projectService.getProjects(),
        ]);
        setTasks(taskData || []);
        setProjects(projData.projects || []);
      } catch (err) {
        console.error('Failed to load calendar events:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadEvents();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="space-y-6">
      {/* Calendar Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Schedule & Milestones
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deliverables, sprint milestones, and upcoming team deadlines
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center border border-slate-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 p-0.5">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Month Grid */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/40 text-center py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-gray-800">
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isDayToday = isToday(day);

            // Filter tasks due on this day
            const dayTasks = tasks.filter(
              (t) => t.dueDate && isSameDay(new Date(t.dueDate), day)
            );

            // Filter projects due on this day
            const dayProjects = projects.filter(
              (p) => p.dueDate && isSameDay(new Date(p.dueDate), day)
            );

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[110px] p-2 transition-colors flex flex-col justify-between ${
                  !isCurrentMonth ? 'bg-slate-50/50 dark:bg-gray-950/40 text-slate-400' : ''
                } ${isDayToday ? 'bg-brand-50/20 dark:bg-brand-950/20' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center text-xs font-semibold rounded-full w-6 h-6 ${
                      isDayToday
                        ? 'bg-brand-600 text-white shadow-xs'
                        : isCurrentMonth
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {(dayTasks.length > 0 || dayProjects.length > 0) && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {dayTasks.length + dayProjects.length}
                    </span>
                  )}
                </div>

                {/* Events list */}
                <div className="mt-1 space-y-1 overflow-y-auto max-h-20">
                  {dayProjects.map((p) => (
                    <div
                      key={p.id}
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold truncate bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shadow-xs"
                      title={`Project Deadline: ${p.name}`}
                    >
                      🚀 {p.name}
                    </div>
                  ))}

                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium truncate bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      title={t.title}
                    >
                      • {t.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Details Modal */}
      <TaskDetailModal
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        taskId={selectedTaskId}
      />
    </div>
  );
};
