import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderKanban, CheckSquare, Users, X, ArrowRight, Loader2 } from 'lucide-react';
import { searchService } from '../../services/searchService';
import { StatusBadge, PriorityBadge } from './Badge';
import { getAvatarUrl } from '../../utils/avatar';

export const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ projects: [], tasks: [], people: [] });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose ? (isOpen ? onClose() : null) : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults({ projects: [], tasks: [], people: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ projects: [], tasks: [], people: [] });
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchService.search(query);
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  const hasResults =
    results.projects.length > 0 || results.tasks.length > 0 || results.people.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800 overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-gray-800">
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to search projects, tasks, or teammates... (Press Esc to exit)"
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-brand-500 mr-2" />}
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Results Display */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
              {!query.trim() && (
                <div className="py-8 text-center text-xs text-slate-400">
                  Search across your entire workspace: projects, tasks, and people.
                </div>
              )}

              {query.trim() && !isLoading && !hasResults && (
                <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No matching results found for "<span className="text-brand-500 font-medium">{query}</span>".
                </div>
              )}

              {/* Projects Category */}
              {results.projects.length > 0 && (
                <div>
                  <div className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <FolderKanban className="w-3.5 h-3.5 mr-1.5" />
                    Projects
                  </div>
                  <div className="space-y-1">
                    {results.projects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect(`/projects/${p.id}`)}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: p.color || '#6366f1' }}
                          />
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                            {p.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={p.status} />
                          <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Category */}
              {results.tasks.length > 0 && (
                <div>
                  <div className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                    Tasks
                  </div>
                  <div className="space-y-1">
                    {results.tasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleSelect(`/projects/${t.projectId}`)}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <CheckSquare className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="truncate">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                              {t.title}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              In {t.project?.name || 'Project'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0 ml-3">
                          <PriorityBadge priority={t.priority} />
                          <StatusBadge status={t.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* People Category */}
              {results.people.length > 0 && (
                <div>
                  <div className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    People
                  </div>
                  <div className="space-y-1">
                    {results.people.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleSelect('/team')}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={getAvatarUrl(u.avatar)}
                            alt={u.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                              {u.name}
                            </span>
                            <span className="text-xs text-slate-400 ml-2">({u.email})</span>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300">
                          {u.role ? u.role.replace('_', ' ') : 'Member'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard shortcut footer */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-gray-950 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center space-x-2">
                <span>Navigation:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
                  ↓
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
                  Enter
                </kbd>
              </div>
              <div>Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700">Esc</kbd> to close</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
