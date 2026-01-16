import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/i18n';
import { useData } from '../lib/DataContext';
import { useToast } from '../lib/ToastContext';
import { Project } from '../types';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { projects, addProject, deleteProject } = useData();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectPlatform, setNewProjectPlatform] = useState<'TikTok' | 'Reels' | 'Shorts'>('TikTok');

  // Check for incoming openModal state from Dashboard
  useEffect(() => {
    if (location.state && (location.state as any).openModal) {
        setIsModalOpen(true);
        window.history.replaceState({}, '');
    }
  }, [location]);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: user?.id || '',
      name: newProjectName,
      platform: newProjectPlatform,
      logline: '',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addProject(newProject);
    setIsModalOpen(false);
    toast(t('modal.create') + ' success!', 'success');
    navigate(`/project/${newProject.id}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation(); // Prevent card click
      if (window.confirm('Are you sure you want to delete this project?')) {
          deleteProject(id);
          toast('Project deleted successfully', 'info');
      }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('manage.projects.title')}</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition shadow-md"
        >
          <Plus size={20} /> {t('dashboard.newProject')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div 
            key={project.id} 
            onClick={() => navigate(`/project/${project.id}`)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-primary/50 dark:hover:border-primary/50 cursor-pointer transition group relative shadow-sm"
          >
            {/* Delete Button */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
              <button 
                onClick={(e) => handleDelete(e, project.id)}
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                title="Delete Project"
              >
                  <Trash2 size={16} />
              </button>
            </div>

            <div className="mb-4">
              <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wide`}>
                {project.platform}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition">{project.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4">
              {project.logline || t('projects.noDesc')}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(project.updated_at).toLocaleDateString()}</span>
              <span className={`capitalize ${project.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                {t(`status.${project.status}`)}
              </span>
            </div>
          </div>
        ))}
      </div>

       {/* Create Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('modal.createTitle')}</h2>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">{t('modal.projectName')}</label>
                <input 
                  type="text" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder={t('modal.placeholderName')}
                  required 
                />
              </div>
              <div className="mb-6">
                <label className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">{t('modal.platform')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['TikTok', 'Reels', 'Shorts'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewProjectPlatform(p)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                          newProjectPlatform === p 
                          ? 'bg-primary border-primary text-white' 
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                >
                  {t('modal.cancel')}
                </button>
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-bold"
                >
                  {t('modal.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}