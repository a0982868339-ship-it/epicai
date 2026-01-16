import React, { useState, useRef } from 'react';
import { Mic, Play, Square, Plus, Trash2, AudioLines, Music, Sparkles, Loader2, Upload, Briefcase, Globe } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { useData } from '../lib/DataContext';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../lib/ToastContext';
import { Voice } from '../types';
import { ProjectFilter } from '../components/ProjectFilter';

export default function VoicesPage() {
  const { t } = useLanguage();
  const { voices, projects, addVoice, deleteVoice } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [filter, setFilter] = useState<'all' | 'custom'>('all');
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  // Clone Modal
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneName, setCloneName] = useState('');
  const [cloneProjectId, setCloneProjectId] = useState('global');
  const [isCloning, setIsCloning] = useState(false);
  
  // Filter Logic
  const filteredVoices = voices.filter(voice => {
      // 1. Type Filter (All vs Custom)
      const matchesType = filter === 'all' ? true : voice.is_custom;
      
      // 2. Project Filter
      // If 'all' projects selected: Show everything matching type
      if (selectedProjectId === 'all') return matchesType;

      // If specific project selected:
      // Show voices assigned to this project
      // NOTE: We hide system voices/global custom voices when filtering by project
      // to allow the user to focus on "Assets for this project".
      if (selectedProjectId) {
         return matchesType && voice.project_id === selectedProjectId;
      }
      return matchesType;
  });

  const handlePlay = (id: string) => {
      if (playingId === id) {
          setPlayingId(null);
      } else {
          setPlayingId(id);
          // Simulate audio play duration
          toast('Playing voice preview...', 'info');
          setTimeout(() => setPlayingId(null), 3000);
      }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm('Delete this voice?')) {
          deleteVoice(id);
          toast('Voice deleted', 'info');
      }
  };

  const handleCloneVoice = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || user.total_credits < 5) {
          toast(t('workspace.alert.insufficient') + ' (Requires 5 Credits)', 'error');
          return;
      }
      setIsCloning(true);
      
      const selectedProject = projects.find(p => p.id === cloneProjectId);

      // Simulate Cloning Process (ElevenLabs Instant Voice Cloning)
      setTimeout(() => {
          const newVoice: Voice = {
              id: Math.random().toString(),
              name: cloneName,
              provider: 'cloned',
              gender: 'male', // Mock default
              style: 'Custom Clone',
              is_custom: true,
              project_id: cloneProjectId === 'global' ? undefined : cloneProjectId,
              project_name: selectedProject?.name,
              created_at: new Date().toISOString()
          };
          addVoice(newVoice);
          setIsCloning(false);
          setIsCloneModalOpen(false);
          setCloneName('');
          setCloneProjectId('global');
          toast('Voice cloned successfully!', 'success');
      }, 3000);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Mic className="text-secondary" /> {t('manage.voices.title')}
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <ProjectFilter 
                projects={projects} 
                selectedId={selectedProjectId} 
                onChange={setSelectedProjectId} 
                className="w-full sm:w-auto"
            />
            <button 
                onClick={() => setIsCloneModalOpen(true)}
                className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition shadow-md whitespace-nowrap justify-center"
            >
                <Sparkles size={18} /> {t('manage.voices.clone')}
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setFilter('all')}
          className={`pb-3 px-2 flex items-center gap-2 font-medium transition-all relative ${filter === 'all' ? 'text-primary' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          <Music size={18} /> {t('manage.voices.filter.all')}
          {filter === 'all' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setFilter('custom')}
          className={`pb-3 px-2 flex items-center gap-2 font-medium transition-all relative ${filter === 'custom' ? 'text-primary' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          <AudioLines size={18} /> {t('manage.voices.filter.custom')}
          {filter === 'custom' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>}
        </button>
      </div>

      {/* Voice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {filteredVoices.map(voice => (
              <div key={voice.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:border-primary/50 transition relative group">
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${playingId === voice.id ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                              {playingId === voice.id ? <AudioLines className="animate-pulse" size={20} /> : <Mic size={20} />}
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  {voice.name}
                              </h3>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{voice.gender === 'male' ? 'Male' : 'Female'} • {voice.style}</span>
                          </div>
                      </div>
                      
                      {/* Badges */}
                      <div className="flex flex-col items-end gap-1">
                          {voice.is_custom ? (
                            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                                {t('manage.voices.custom')}
                            </span>
                          ) : (
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                                {t('manage.voices.system')}
                            </span>
                          )}

                          {voice.project_id && (
                              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1 max-w-[100px] truncate">
                                  <Briefcase size={8} /> {voice.project_name || 'Project'}
                              </span>
                          )}
                          {!voice.project_id && voice.is_custom && (
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                                  <Globe size={8} /> Global
                              </span>
                          )}
                      </div>
                  </div>
                  
                  {/* Delete Button (Only for Custom) */}
                  {voice.is_custom && (
                      <button 
                        onClick={(e) => handleDelete(e, voice.id)} 
                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                        title="Delete Voice"
                      >
                          <Trash2 size={16} />
                      </button>
                  )}

                  <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-3 flex items-center gap-3">
                      <button 
                        onClick={() => handlePlay(voice.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${playingId === voice.id ? 'bg-red-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                      >
                          {playingId === voice.id ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                      </button>
                      <div className="flex-1 h-8 flex items-center gap-0.5 opacity-50">
                          {/* Fake Waveform */}
                          {Array.from({ length: 20 }).map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-1 rounded-full bg-slate-400 dark:bg-slate-600 transition-all duration-300 ${playingId === voice.id ? 'animate-pulse' : ''}`}
                                style={{ 
                                    height: playingId === voice.id ? `${Math.random() * 100}%` : `${20 + Math.random() * 40}%`,
                                    animationDelay: `${i * 0.05}s`
                                }}
                              ></div>
                          ))}
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {filteredVoices.length === 0 && (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
              <Mic size={48} className="mx-auto mb-4 opacity-50" />
              <p>No voices found matching your criteria.</p>
              {selectedProjectId !== 'all' && <p className="text-xs mt-2">Try clearing the project filter.</p>}
          </div>
      )}

      {/* Clone Modal */}
      {isCloneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Sparkles className="text-secondary" /> {t('manage.voices.clone')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Create a digital replica of a voice. Requires 5 Credits.</p>
            
            <form onSubmit={handleCloneVoice} className="space-y-5">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{t('manage.voices.nameLabel')}</label>
                <input 
                  type="text" 
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. My Narrator Voice"
                  required 
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{t('manage.voices.projectLabel')}</label>
                <select 
                  value={cloneProjectId}
                  onChange={(e) => setCloneProjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                >
                    <option value="global">{t('manage.voices.globalOption')}</option>
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{t('manage.voices.uploadLabel')}</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center bg-slate-50 dark:bg-slate-800/50 hover:border-primary/50 transition cursor-pointer">
                    <Upload className="mx-auto text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">Click to upload MP3/WAV</span>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsCloneModalOpen(false)}
                  disabled={isCloning}
                  className="px-4 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium disabled:opacity-50"
                >
                  {t('modal.cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={isCloning}
                  className="bg-secondary hover:bg-secondary/90 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {isCloning ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  {isCloning ? t('manage.voices.cloning') : t('manage.voices.clone')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}