import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';
import { projectService } from '../services/projectService';
import { Button } from '../components/common/Button';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import {
  FolderKanban,
  Activity,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  ListTodo,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [analyticsData, projectsData] = await Promise.all([
        analyticsService.getDashboardAnalytics(),
        projectService.getProjects({ limit: 4 }),
      ]);
      setAnalytics(analyticsData);
      setRecentProjects(projectsData.projects || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const metrics = analytics?.metrics || {
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    changes: {},
  };

  const statCards = [
    {
      label: 'Total Projects',
      value: metrics.totalProjects,
      change: metrics.changes?.projects || '+8.2%',
      isPositive: true,
      icon: FolderKanban,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400',
    },
    {
      label: 'Active Projects',
      value: metrics.activeProjects,
      change: metrics.changes?.active || '+12.5%',
      isPositive: true,
      icon: Activity,
      color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-400',
    },
    {
      label: 'Tasks Assigned',
      value: metrics.totalTasks,
      change: metrics.changes?.tasks || '+15.4%',
      isPositive: true,
      icon: ListTodo,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400',
    },
    {
      label: 'Completed Tasks',
      value: metrics.completedTasks,
      change: metrics.changes?.completed || '+23.1%',
      isPositive: true,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400',
    },
    {
      label: 'Overdue Tasks',
      value: metrics.overdueTasks,
      change: metrics.changes?.overdue || '-4.3%',
      isPositive: false,
      icon: AlertCircle,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400',
    },
  ];

  const statusData = analytics?.charts?.statusDistribution || [];
  const projectDistributionData = analytics?.charts?.projectDistribution || [];
  const productivityData = analytics?.charts?.productivityTrend || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Good morning, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateProjectOpen(true)}
          icon={Plus}
          className="shadow-md shadow-brand-500/20"
        >
          Create Project
        </Button>
      </div>

      {/* KPI Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
            className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {stat.label}
              </span>
              <div className={`p-2 rounded-xl ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isLoading ? '...' : stat.value}
              </div>
              <div className="flex items-center space-x-1.5 mt-1.5">
                <span
                  className={`inline-flex items-center text-[11px] font-semibold ${
                    stat.isPositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  {stat.change}
                </span>
                <span className="text-[11px] text-slate-400">from last month</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Status Donut Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Task Status Breakdown
              </h3>
              <p className="text-xs text-slate-400">Distribution across active sprint</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity Line Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Team Productivity
              </h3>
              <p className="text-xs text-slate-400">Tasks completed over past 7 days</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                  name="Created"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Distribution Bar Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Project Task Volume
              </h3>
              <p className="text-xs text-slate-400">Active tasks grouped by project</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectDistributionData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Tasks" />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Projects</h2>
            <p className="text-xs text-slate-400">High-priority initiatives in progress</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/projects')}
            icon={ArrowUpRight}
          >
            View All Projects
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : recentProjects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Create your first project to get started organizing tasks and sprint milestones."
            actionLabel="+ Create Project"
            onAction={() => setIsCreateProjectOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onProjectSaved={(newProject) => {
          fetchDashboardData();
        }}
      />
    </div>
  );
};
