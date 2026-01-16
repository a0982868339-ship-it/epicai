'use client';

import React, { useState } from 'react';
import { PlayCircle, Folder } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { useData } from '../../lib/DataContext';
import { useRouter } from 'next/navigation';
import { Video } from '../../types';
import { ProjectFilter } from '../../components/ProjectFilter';
import { Layout } from '../../components/Layout';

function VideosContent() {
  const { t } = useLanguage();
  const { videos, projects } = useData();
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  const filteredVideos = selectedProjectId === 'all'
    ? videos
    : videos.filter(v => v.project_id === selectedProjectId);

  const groupedVideos = filteredVideos.reduce((acc, video) => {
    const key = video.project_name || 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(video);
    return acc;
  }, {} as Record<string, Video[]>);

  return (
    <div>
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('manage.videos.title')}</h1>
        <ProjectFilter 
            projects={projects} 
            selectedId={selectedProjectId} 
            onChange={setSelectedProjectId} 
        />
      </div>

      <div className="space-y-10">
        {Object.entries(groupedVideos).map(([projectName, projectVideos]) => (
            <div key={projectName} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Folder className="text-secondary" size={20} />
                    {projectName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projectVideos.map((video) => (
                        <div key={video.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition">
                            <div className="aspect-[9/16] bg-black relative flex items-center justify-center">
                                <video src={video.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <PlayCircle size={48} className="text-white opacity-80 group-hover:scale-110 transition duration-300" />
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{video.project_name}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-green-600 dark:text-green-500 uppercase font-bold bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">{video.status}</span>
                                    <button 
                                        onClick={() => router.push(`/project/${video.project_id}`)}
                                        className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
                                    >
                                        Go to Project
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>
      
      {Object.keys(groupedVideos).length === 0 && (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
              <PlayCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>{t('manage.videos.empty')}</p>
          </div>
      )}
    </div>
  );
}

export default function VideosPage() {
    return <Layout><VideosContent /></Layout>;
}