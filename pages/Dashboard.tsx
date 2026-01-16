import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Film, Users, FileText, Plus } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/i18n';
import { useData } from '../lib/DataContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { projects, characters, scripts, videos } = useData();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('dashboard.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t('dashboard.welcome')} <span className="text-primary font-bold">{user?.total_credits}</span> {t('dashboard.remaining')}</p>
        </div>
        <button 
          onClick={() => navigate('/projects', { state: { openModal: true } })}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition shadow-md"
        >
          <Plus size={20} /> {t('dashboard.newProject')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: t('stats.activeProjects'), value: projects.length, icon: Film, color: 'text-blue-500 bg-blue-100 dark:bg-slate-800', link: '/projects' },
          { label: t('stats.totalCharacters'), value: characters.length, icon: Users, color: 'text-purple-500 bg-purple-100 dark:bg-slate-800', link: '/characters' },
          { label: t('stats.scriptsGenerated'), value: scripts.length, icon: FileText, color: 'text-pink-500 bg-pink-100 dark:bg-slate-800', link: '/scripts' },
          { label: t('stats.videosProduced'), value: videos.length, icon: Video, color: 'text-green-500 bg-green-100 dark:bg-slate-800', link: '/videos' },
        ].map((stat, i) => (
          <div key={i} onClick={() => navigate(stat.link)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition shadow-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity / Projects */}
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('projects.recent')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.slice(0, 3).map((project) => (
          <div 
            key={project.id} 
            onClick={() => navigate(`/project/${project.id}`)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-primary/50 dark:hover:border-primary/50 cursor-pointer transition group relative shadow-sm"
          >
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
              <span>{t('projects.lastEdited')} {new Date(project.updated_at).toLocaleDateString()}</span>
              <span className={`capitalize ${project.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                {t(`status.${project.status}`)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}