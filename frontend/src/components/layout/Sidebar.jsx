import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  CalendarDays,
  Users,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Layers,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { getAvatarUrl } from '../../utils/avatar';

const navigationItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Calendar', path: '/calendar', icon: CalendarDays },
  { name: 'Team', path: '/team', icon: Users },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ isMobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight leading-none">
              Pulse<span className="text-brand-600 dark:text-brand-400">Flow</span>
            </h1>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Project Hub
            </span>
          </div>
        </div>
        {isMobileOpen && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspace
        </div>
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => isMobileOpen && onMobileClose()}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-gray-800/60'
              )
            }
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-5 h-5 shrink-0 transition-colors group-hover:scale-105 duration-150" />
              <span>{item.name}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
          </NavLink>
        ))}
      </div>

      {/* User Profile & Logout Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800/60 transition-colors">
          <div
            className="flex items-center space-x-3 cursor-pointer min-w-0 flex-1 mr-2"
            onClick={() => {
              navigate('/settings');
              if (isMobileOpen) onMobileClose();
            }}
          >
            <img
              src={getAvatarUrl(user?.avatar)}
              alt={user?.name || 'User'}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-gray-700 shrink-0"
            />
            <div className="truncate">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {user?.name || 'Loading...'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                Workspace Member
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 z-30">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
