import React, { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { getAvatarUrl } from '../utils/avatar';
import {
  Users,
  Search,
  UserPlus,
  Mail,
  FolderKanban,
  CheckCircle2,
  Clock,
  Shield,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Team = () => {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const data = await teamService.getTeam({
        search: search || undefined,
      });
      setMembers(data || []);
    } catch (err) {
      console.error('Failed to load team:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchTeam, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await teamService.updateRole(userId, newRole);
      toast.success('Member role updated');
      fetchTeam();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    toast.success(`Invite sent to ${newMemberEmail}`);
    setIsAddModalOpen(false);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Workspace Teammates
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Collaborative teammates across all projects in this workspace
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} icon={UserPlus}>
          Invite Teammate
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teammates by name or email..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
          />
        </div>
      </div>

      {/* Team Member Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teammates found"
          description="No teammates match the selected search criteria."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member) => {
            const workloadColor =
              member.workloadPercentage > 80
                ? 'bg-rose-500'
                : member.workloadPercentage > 50
                ? 'bg-amber-500'
                : 'bg-emerald-500';

            return (
              <div
                key={member.id}
                className="bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                {/* Top Info */}
                <div className="flex items-start space-x-3.5">
                  <img
                    src={getAvatarUrl(member.avatar)}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-gray-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {member.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate flex items-center mt-0.5">
                      <Mail className="w-3 h-3 mr-1 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </p>

                    {/* Project Roles Pill */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {member.managedProjectsCount > 0 && (
                        <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          Manager ({member.managedProjectsCount})
                        </span>
                      )}
                      <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-gray-700">
                        Member ({member.memberProjectsCount || 0})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Workload Indicator */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Current Workload
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {member.workloadPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${workloadColor}`}
                      style={{ width: `${member.workloadPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Statistics Row */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-gray-800 text-center text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Projects</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {member.activeProjectsCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Tasks</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {member.assignedTasksCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Completed</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {member.completedTasksCount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Invite Team Member"
        description="Send an invitation to join this workspace with custom role permissions."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Work Email
            </label>
            <input
              type="email"
              required
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="maya.lin@pulseflow.io"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            />
          </div>



          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-gray-800">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Send Invitation</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
