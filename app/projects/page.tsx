'use client';

import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useData } from '../../lib/DataContext';
import { Layout } from '../../components/Layout';
import { useLanguage } from '../../lib/i18n';

function ProjectsContent() {
  const { t } = useLanguage();
  const { projects } = useData();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{t('manage.projects.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{project.name}</h3>
            <p className="text-sm text-slate-500 mt-2">{project.platform}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
    const { user, loading } = useAuth();
    if (loading || !user) return null;
    return <Layout><ProjectsContent /></Layout>;
}