import React, { useState } from 'react';
import { FileText, Calendar, Folder } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { useData } from '../lib/DataContext';
import { useNavigate } from 'react-router-dom';
import { Script } from '../types';
import { ProjectFilter } from '../components/ProjectFilter';

export default function ScriptsPage() {
  const { t } = useLanguage();
  const { scripts, projects } = useData();
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  // Filter scripts based on selection
  const filteredScripts = selectedProjectId === 'all'
    ? scripts
    : scripts.filter(s => s.project_id === selectedProjectId);

  // Group filtered scripts by project name
  const groupedScripts = filteredScripts.reduce((acc, script) => {
    const key = script.project_name || 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(script);
    return acc;
  }, {} as Record<string, Script[]>);

  return (
    <div>
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('manage.scripts.title')}</h1>
        <ProjectFilter 
            projects={projects} 
            selectedId={selectedProjectId} 
            onChange={setSelectedProjectId} 
        />
      </div>

      <div className="space-y-8">
        {Object.entries(groupedScripts).map(([projectName, projectScripts]) => (
          <div key={projectName} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Folder className="text-primary" size={20} />
              {projectName}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {projectScripts.map((script) => (
                  <div key={script.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm">
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-primary border border-slate-200 dark:border-slate-700">
                              <FileText size={24} />
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-900 dark:text-white text-lg">{script.project_name || 'Untitled Project'}</h3>
                              <p className="text-slate-500 dark:text-slate-400 text-sm">{script.content.length} Scenes • Version {script.version}</p>
                          </div>
                      </div>
                      <div className="text-right w-full md:w-auto">
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-end mb-2">
                              <Calendar size={12}/> {new Date(script.created_at).toLocaleDateString()}
                          </p>
                          <button 
                              onClick={() => navigate(`/project/${script.project_id}`)}
                              className="text-primary hover:text-primary/80 dark:hover:text-white text-sm font-semibold transition"
                          >
                              View Project
                          </button>
                      </div>
                  </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedScripts).length === 0 && (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t('workspace.script.empty')}</p>
                {selectedProjectId !== 'all' && <p className="text-xs mt-2">Try selecting a different project.</p>}
            </div>
        )}
      </div>
    </div>
  );
}