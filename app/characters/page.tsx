'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Globe, FolderOpen, Layers, Trash2, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { useData } from '../../lib/DataContext';
import { useToast } from '../../lib/ToastContext';
import { Character } from '../../types';
import { ProjectFilter } from '../../components/ProjectFilter';
import { useAuth } from '../../lib/AuthContext';
import { Layout } from '../../components/Layout';

export default function CharactersPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { characters, projects, deleteCharacter, addCharacter } = useData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'global' | 'project'>('global');
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharDesc, setNewCharDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter Logic
  const globalCharacters = characters.filter(c => !c.project_id);
  const filteredProjects = selectedProjectId === 'all'
    ? projects
    : projects.filter(p => p.id === selectedProjectId);

  const projectGroups = filteredProjects.map(p => ({
    project: p,
    characters: characters.filter(c => c.project_id === p.id)
  })).filter(group => {
      if (selectedProjectId !== 'all') return true;
      return group.characters.length > 0;
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(window.confirm('Delete this character?')) {
          deleteCharacter(id);
          toast('Character deleted', 'info');
      }
  };

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.total_credits < 1) {
        toast(t('workspace.alert.insufficient'), 'error');
        return;
    }
    if (!newCharName || !newCharDesc) return;

    setIsGenerating(true);
    try {
        // CALL REAL AI API
        const response = await fetch('/api/generate/character-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: `${newCharDesc} (Name: ${newCharName})` }),
        });
        
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const newCharacter: Character = {
            id: Math.random().toString(),
            user_id: user.id,
            project_id: undefined, // GLOBAL
            name: newCharName,
            description: newCharDesc,
            image_urls: [data.imageUrl],
            created_at: new Date().toISOString()
        };
        addCharacter(newCharacter);
        toast('Global character created successfully!', 'success');
        setIsCreateModalOpen(false);
        setNewCharName('');
        setNewCharDesc('');
        setActiveTab('global'); 
    } catch(e) {
        console.error(e);
        toast('Failed to create character', 'error');
    } finally {
        setIsGenerating(false);
    }
  };

  const renderCharacterCard = (char: Character) => (
    <div key={char.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden group hover:border-primary/50 transition shadow-sm relative">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
           {!char.project_id && (
            <div className="bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
              <Globe size={10} /> Global
            </div>
          )}
      </div>
      
      <button 
        onClick={(e) => handleDelete(e, char.id)}
        className="absolute top-2 left-2 z-20 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
      >
        <Trash2 size={14} />
      </button>

      <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative">
          {char.image_urls[0] ? (
              <img src={char.image_urls[0]} alt={char.name} className="w-full h-full object-cover transition transform group-hover:scale-105"/>
          ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
          )}
      </div>
      <div className="p-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate">{char.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{char.description}</p>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('manage.characters.title')}</h1>
        <div className="flex gap-3">
            {activeTab === 'project' && (
                <ProjectFilter 
                    projects={projects} 
                    selectedId={selectedProjectId} 
                    onChange={setSelectedProjectId} 
                />
            )}
            <button 
                onClick={() => setIsCreateModalOpen(true)} 
                className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition shadow-md"
            >
                <Plus size={18} /> {t('manage.characters.create')}
            </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('global')}
          className={`pb-3 px-2 flex items-center gap-2 font-medium transition-all relative ${activeTab === 'global' ? 'text-primary' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          <Globe size={18} /> {t('manage.characters.tabs.global')}
          {activeTab === 'global' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('project')}
          className={`pb-3 px-2 flex items-center gap-2 font-medium transition-all relative ${activeTab === 'project' ? 'text-primary' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          <Layers size={18} /> {t('manage.characters.tabs.project')}
          {activeTab === 'project' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'global' && (
        <div className="animate-in fade-in duration-300">
           {globalCharacters.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {globalCharacters.map(renderCharacterCard)}
             </div>
           ) : (
             <div className="text-center py-20 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                <Globe size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t('manage.characters.empty.global')}</p>
                <button onClick={() => setIsCreateModalOpen(true)} className="text-primary hover:underline mt-2 text-sm">{t('manage.characters.empty.create')}</button>
             </div>
           )}
        </div>
      )}

      {activeTab === 'project' && (
        <div className="animate-in fade-in duration-300 space-y-10">
          {projectGroups.length > 0 ? (
            projectGroups.map((group) => (
              <div key={group.project.id}>
                <div className="flex items-center gap-2 mb-4">
                  <FolderOpen className="text-primary" size={20} />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{group.project.name}</h2>
                  <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">{group.characters.length}</span>
                </div>
                {group.characters.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {group.characters.map(renderCharacterCard)}
                    </div>
                ) : (
                     <div className="text-slate-400 text-sm italic ml-8 mb-4">{t('manage.characters.empty.project')}</div>
                )}
              </div>
            ))
          ) : (
             <div className="text-center py-20 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                <Layers size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t('manage.characters.empty.project')}</p>
             </div>
          )}
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Globe className="text-secondary" /> {t('manage.characters.create')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t('manage.characters.empty.global')}</p>
            
            <form onSubmit={handleCreateCharacter} className="space-y-5">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{t('workspace.roles.nameLabel')}</label>
                <input 
                  type="text" 
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder={t('workspace.roles.namePlaceholder')}
                  required 
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{t('workspace.roles.descLabel')}</label>
                <textarea 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white h-32 resize-none focus:outline-none focus:border-primary transition-colors"
                    value={newCharDesc}
                    onChange={(e) => setNewCharDesc(e.target.value)}
                    placeholder={t('workspace.roles.descPlaceholder')}
                    required
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium disabled:opacity-50"
                >
                  {t('modal.cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={isGenerating}
                  className="bg-secondary hover:bg-secondary/90 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <ImageIcon size={18} />}
                  {isGenerating ? t('workspace.roles.generating') : t('workspace.roles.generateBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}