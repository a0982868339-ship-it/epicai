import React from 'react';
import { Filter } from 'lucide-react';
import { Project } from '../types';
import { useLanguage } from '../lib/i18n';

interface ProjectFilterProps {
  projects: Project[];
  selectedId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const ProjectFilter = ({ projects, selectedId, onChange, className = '' }: ProjectFilterProps) => {
  const { t } = useLanguage();
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Filter size={20} className="text-slate-400 dark:text-slate-500" />
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none transition-colors min-w-[150px] shadow-sm"
      >
        <option value="all">{t('manage.projects.allProjects')}</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
};