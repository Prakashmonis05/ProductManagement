import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { teamService } from '../services/teamService';
import { analyticsService } from '../services/analyticsService';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskModal } from '../components/tasks/TaskModal';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { ProjectModal } from '../components/projects/ProjectModal';
import { Modal } from '../components/common/Modal';
import { getAvatarUrl } from '../utils/avatar';
import {
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  ListTodo,
  Kanban,
  CalendarDays,
  Activity as ActivityIcon,
  BarChart2,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';

export const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projectAnalytics, setProjectAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, tasks, board, calendar, team, activity, analytics
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedNewMember, setSelectedNewMember] = useState('');

  const fetchProjectData = async () => {
    setIsLoading(true);
    try {
      const [projData, analyticsData] = await Promise.all([
        projectService.getProjectById(projectId),
        analyticsService.getProjectAnalytics(projectId),
      ]);
      setProject(projData);
      setTasks(projData.tasks || []);
      setProjectAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load project details:', err);
      toast.error('Project not found');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) return;
    try {
      await projectService.deleteProject(projectId);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const handleOpenAddMember = async () => {
    try {
      const allUsers = await teamService.getTeam();
      const existingUserIds = project.members?.map((m) => m.userId || m.user?.id) || [];
      const filtered = allUsers.filter((u) => !existingUserIds.includes(u.id));
      setAvailableUsers(filtered);
      setIsAddMemberOpen(true);
    } catch (err) {
      toast.error('Could not fetch members');
    }
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!selectedNewMember) return;
    try {
      await projectService.addMember(projectId, selectedNewMember, 'MEMBER');
      toast.success('Member added to project');
      setIsAddMemberOpen(false);
      setSelectedNewMember('');
      fetchProjectData();
    } catch (err) {
      toast.error('Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await projectService.removeMember(projectId, userId);
      toast.success('Member removed');
      fetchProjectData();
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-sm text-slate-400">Loading project workspace...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: CheckCircle2 },
    { id: 'tasks', label: `Tasks (${tasks.length})`, icon: ListTodo },
    { id: 'board', label: 'Board', icon: Kanban },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'team', label: `Team (${project.members?.length || 0})`, icon: Users },
    { id: 'activity', label: 'Activity', icon: ActivityIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
        <button
          onClick={() => navigate('/projects')}
          className="hover:text-slate-900 dark:hover:text-white flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Projects
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-medium truncate">{project.name}</span>
      </div>

      {/* Project Header Card */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <span
                className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: project.color || '#6366f1' }}
              />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
              {project.isManager ? (
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                  ⭐ Manager (You)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                  Member
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              {project.description || 'No description provided.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              onClick={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              size="sm"
              icon={Plus}
            >
              Add Task
            </Button>
            {project.isManager && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={UserPlus}
                  onClick={handleOpenAddMember}
                >
                  Add Member
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Edit2}
                  onClick={() => setIsEditProjectOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteProject}
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Project Meta Details Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-gray-800 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Project Lead</span>
            <div className="flex items-center space-x-2 font-medium text-slate-800 dark:text-slate-200">
              <img
                src={getAvatarUrl(project.owner?.avatar)}
                alt={project.owner?.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="truncate">{project.owner?.name || 'Unassigned'}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Deadline Due Date</span>
            <div className="flex items-center space-x-1.5 font-medium text-slate-800 dark:text-slate-200">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                {project.dueDate ? format(new Date(project.dueDate), 'MMM dd, yyyy') : 'No deadline'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Total Tasks</span>
            <div className="font-semibold text-slate-900 dark:text-white">
              {project.completedTasks || 0} / {project.totalTasks || 0} completed
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Progress</span>
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${project.progress || 0}%`,
                    backgroundColor: project.color || '#6366f1',
                  }}
                />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{project.progress || 0}%</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-t border-slate-100 dark:border-gray-800 pt-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-800/60'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress & Upcoming Milestones */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Project Overview & Execution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This project contains {tasks.length} tracked items. The current delivery velocity is
                tracking at {project.progress || 0}% completion against planned milestones.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-100 dark:border-gray-800">
                  <span className="text-[11px] text-slate-400 block">To Do</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {tasks.filter((t) => t.status === 'TODO').length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-100 dark:border-gray-800">
                  <span className="text-[11px] text-slate-400 block">In Progress</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {tasks.filter((t) => t.status === 'IN_PROGRESS').length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-100 dark:border-gray-800">
                  <span className="text-[11px] text-slate-400 block">Review</span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {tasks.filter((t) => t.status === 'REVIEW').length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-100 dark:border-gray-800">
                  <span className="text-[11px] text-slate-400 block">Completed</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {tasks.filter((t) => t.status === 'COMPLETED').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Upcoming Task Deadlines
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-gray-800">
                {tasks
                  .filter((t) => t.dueDate && t.status !== 'COMPLETED')
                  .slice(0, 5)
                  .map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-800/40 px-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <StatusBadge status={t.status} />
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                          {t.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{format(new Date(t.dueDate), 'MMM dd')}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Stream */}
          <div className="bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Project Activity
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {project.activities?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No recent actions logged</p>
              ) : (
                project.activities?.map((act) => (
                  <div key={act.id} className="flex items-start space-x-2.5 text-xs">
                    <img
                      src={getAvatarUrl(act.user?.avatar)}
                      alt={act.user?.name}
                      className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {act.user?.name}
                      </span>{' '}
                      <span className="text-slate-500 dark:text-slate-400 lowercase">
                        {act.action.replace('_', ' ')}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tasks Table */}
      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-gray-800/60 border-b border-slate-200 dark:border-gray-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800 text-slate-700 dark:text-slate-300">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {task.title}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="py-3 px-4">
                      {task.assignedTo ? (
                        <div className="flex items-center space-x-2">
                          <img
                            src={getAvatarUrl(task.assignedTo.avatar)}
                            alt={task.assignedTo.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span>{task.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No date'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {task.tags?.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-400"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Board (Kanban) */}
      {activeTab === 'board' && (
        <KanbanBoard
          tasks={tasks}
          onTasksChange={(newTasks) => setTasks(newTasks)}
          onCardClick={(t) => setSelectedTaskId(t.id)}
          onAddTask={() => {
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
        />
      )}

      {/* Tab 4: Calendar view for project */}
      {activeTab === 'calendar' && (
        <div className="bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Project Deadlines Timeline
          </h3>
          <div className="space-y-3">
            {tasks
              .filter((t) => t.dueDate)
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTaskId(t.id)}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-brand-500" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Due: {format(new Date(t.dueDate), 'EEEE, MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 5: Team Members */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Project Members ({project.members?.length || 0})
            </h3>
            {project.isManager && (
              <Button size="sm" icon={UserPlus} onClick={handleOpenAddMember}>
                Add Team Member
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.members?.map((member) => (
              <div
                key={member.id}
                className="bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl p-4 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={getAvatarUrl(member.user?.avatar)}
                    alt={member.user?.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {member.user?.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{member.user?.email}</p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 mt-0.5 rounded text-[10px] font-semibold ${
                        member.role === 'MANAGER'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {member.role === 'MANAGER' ? 'Project Manager' : 'Project Member'}
                    </span>
                  </div>
                </div>

                {project.isManager && member.userId !== project.ownerId && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                    title="Remove member from project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Activity History */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Audit Activity Trail
          </h3>
          <div className="space-y-4">
            {project.activities?.map((act) => (
              <div key={act.id} className="flex items-start space-x-3 text-xs pb-3 border-b border-slate-100 dark:border-gray-800 last:border-0">
                <img
                  src={getAvatarUrl(act.user?.avatar)}
                  alt={act.user?.name}
                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-slate-800 dark:text-slate-200">
                    <span className="font-semibold">{act.user?.name}</span> performed{' '}
                    <span className="font-medium text-brand-600 dark:text-brand-400">
                      {act.action}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Project Analytics */}
      {activeTab === 'analytics' && projectAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Status Breakdown
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectAnalytics.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {projectAnalytics.statusBreakdown.map((entry, index) => (
                      <Cell key={`pcell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Task Priority Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectAnalytics.priorityBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        defaultProjectId={projectId}
        taskToEdit={taskToEdit}
        onTaskSaved={() => fetchProjectData()}
      />

      {/* Task Details Modal */}
      <TaskDetailModal
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        taskId={selectedTaskId}
        onTaskUpdated={() => fetchProjectData()}
        onEditTask={(t) => {
          setSelectedTaskId(null);
          setTaskToEdit(t);
          setIsTaskModalOpen(true);
        }}
      />

      {/* Project Edit Modal */}
      <ProjectModal
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        projectToEdit={project}
        onProjectSaved={() => fetchProjectData()}
      />

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        title="Add Member to Project"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddMemberSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Team Member
            </label>
            <select
              value={selectedNewMember}
              onChange={(e) => setSelectedNewMember(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            >
              <option value="">Choose a team member...</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.email ? `(${u.email})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-gray-800">
            <Button type="button" variant="secondary" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedNewMember}>
              Add to Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
