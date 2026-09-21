import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import {
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  Check,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../utils/avatar';

export const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeSection, setActiveSection] = useState('account');
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Notification toggles
  const [notifyTaskAssigned, setNotifyTaskAssigned] = useState(true);
  const [notifyDeadlines, setNotifyDeadlines] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ name, avatar });
    } catch (err) {
      // toast in AuthContext
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both current and new password');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      // toast in AuthContext
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { id: 'account', label: 'Account Profile', icon: User },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Workspace Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal profile, security credentials, and application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          {sections.map((s) => {
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800/60'
                }`}
              >
                <s.icon className="w-4 h-4" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Box */}
        <div className="md:col-span-3 bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
          {/* Account Profile Section */}
          {activeSection === 'account' && (
            <form onSubmit={handleSaveAccount} className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Personal Information
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update your display name, email, and avatar
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <img
                  src={getAvatarUrl(avatar)}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-brand-500/20"
                />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Email is locked for this workspace session.
                </p>
              </div>

              <div className="pt-2">
                <Button type="submit" isLoading={isSaving}>
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* Security & Password Section */}
          {activeSection === 'security' && (
            <form onSubmit={handleSaveSecurity} className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Password & Authentication
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Keep your account safe by updating your password
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" isLoading={isSaving}>
                  Update Password
                </Button>
              </div>
            </form>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Notification Preferences
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose which alerts you want to receive in your workspace
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Task Assignments
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Receive alerts when assigned to a task or project
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyTaskAssigned}
                    onChange={(e) => setNotifyTaskAssigned(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Upcoming Deadlines
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Get reminders 24 hours prior to scheduled due dates
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyDeadlines}
                    onChange={(e) => setNotifyDeadlines(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Comment Mentions
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Notify when a team member adds a comment on your task
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyComments}
                    onChange={(e) => setNotifyComments(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                </div>
              </div>

              <Button
                onClick={() => toast.success('Notification preferences saved')}
                size="sm"
              >
                Save Preferences
              </Button>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Theme & Visual Appearance
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your preferred color theme
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => theme !== 'light' && toggleTheme()}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    theme === 'light'
                      ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/20'
                      : 'border-slate-200 dark:border-gray-700 hover:border-slate-300'
                  }`}
                >
                  <Sun className="w-5 h-5 text-amber-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Light Mode</p>
                  <p className="text-[11px] text-slate-400">Crisp, clean high-contrast daytime interface</p>
                </div>

                <div
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-950/20'
                      : 'border-slate-200 dark:border-gray-700 hover:border-slate-300'
                  }`}
                >
                  <Moon className="w-5 h-5 text-indigo-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Dark Mode</p>
                  <p className="text-[11px] text-slate-400">Sleek, low-strain nighttime interface</p>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Localization & Regional Settings
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure timezones, languages, and date formats
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Timezone
                  </label>
                  <select className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white">
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="EST">Eastern Standard Time (EST)</option>
                    <option value="PST">Pacific Standard Time (PST)</option>
                    <option value="IST">India Standard Time (IST)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Date Format
                  </label>
                  <select className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white">
                    <option value="MMM dd, yyyy">MMM dd, yyyy (e.g. Sep 21, 2026)</option>
                    <option value="yyyy-MM-dd">yyyy-MM-dd (ISO 8601)</option>
                    <option value="dd/MM/yyyy">dd/MM/yyyy (UK/EU)</option>
                  </select>
                </div>
              </div>

              <Button onClick={() => toast.success('Preferences saved')} size="sm">
                Save Preferences
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
