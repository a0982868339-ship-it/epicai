'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Play, Square, Sparkles, Loader2, Upload, Clock, Film, Star, Copy, Trash2, Lock } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { useData } from '../../lib/DataContext';
import { useAuth } from '../../lib/AuthContext';
import { useToast } from '../../lib/ToastContext';
import { AudioClip } from '../../types';
import { ProjectFilter } from '../../components/ProjectFilter';
import { Layout } from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';

// 系统语音模板（OpenAI TTS）
const VOICE_TEMPLATES = [
  { id: 'sweet-female-a', name: '甜美女声 A', provider: 'openai', gender: 'female', style: 'Sweet & Warm' },
  { id: 'warm-female-b', name: '温暖女声 B', provider: 'openai', gender: 'female', style: 'Warm & Friendly' },
  { id: 'storyteller', name: '故事叙述者', provider: 'openai', gender: 'male', style: 'Storytelling' },
  { id: 'deep-male-a', name: '低沉男声 A', provider: 'openai', gender: 'male', style: 'Deep & Rich' },
  { id: 'neutral-male', name: '中性男声', provider: 'openai', gender: 'male', style: 'Neutral' },
  { id: 'energetic-male', name: '活力男声', provider: 'openai', gender: 'male', style: 'Energetic' },
  { id: 'ultra-female', name: '超真实女声', provider: 'elevenlabs', gender: 'female', style: 'Ultra Realistic', isPro: true },
  { id: 'deep-male-pro', name: '磁性男声', provider: 'elevenlabs', gender: 'male', style: 'Deep & Magnetic', isPro: true },
];

function VoicesContent() {
  const { t } = useLanguage();
  const { projects } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'templates' | 'clips'>('clips'); // 默认显示配音素材
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioClips, setAudioClips] = useState<AudioClip[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneName, setCloneName] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  
  const userIsPro = user?.subscription_plan === 'pro';

  // 加载配音素材
  useEffect(() => {
    if (!user) return;
    
    const fetchAudioClips = async () => {
      try {
        const { data, error } = await supabase
          .from('audio_clips')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to load audio clips:', error);
          setAudioClips([]);
        } else {
          // 手动填充 project_name
          const clipsWithProjectNames = await Promise.all((data || []).map(async (clip: any) => {
            if (clip.project_id) {
              const { data: project } = await supabase
                .from('projects')
                .select('name')
                .eq('id', clip.project_id)
                .single();
              return { ...clip, project_name: project?.name };
            }
            return clip;
          }));
          setAudioClips(clipsWithProjectNames);
      }
      } catch (err) {
        console.error('Error fetching audio clips:', err);
        setAudioClips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioClips();
  }, [user]);

  const handlePlayClip = (audioUrl: string, id: string) => {
      if (playingId === id) {
          setPlayingId(null);
      return;
    }

          setPlayingId(id);
    const audio = new Audio(audioUrl);
    audio.play();
    audio.onended = () => setPlayingId(null);
  };

  const handleFavorite = async (clipId: string, currentFavorite: boolean) => {
    const { error } = await supabase
      .from('audio_clips')
      .update({ is_favorite: !currentFavorite })
      .eq('id', clipId);

    if (!error) {
      setAudioClips(prev => prev.map(clip => 
        clip.id === clipId ? { ...clip, is_favorite: !currentFavorite } : clip
      ));
      toast(currentFavorite ? '已取消收藏' : '已收藏', 'success');
      }
  };

  const handleDeleteClip = async (clipId: string) => {
    if (!window.confirm('确定删除此配音素材？')) return;

    const { error } = await supabase
      .from('audio_clips')
      .delete()
      .eq('id', clipId);

    if (!error) {
      setAudioClips(prev => prev.filter(clip => clip.id !== clipId));
      toast('配音已删除', 'info');
    }
  };

  const filteredClips = selectedProjectId === 'all' 
    ? audioClips 
    : audioClips.filter(clip => clip.project_id === selectedProjectId);

  // 按项目分组
  const groupedClips = filteredClips.reduce((acc, clip) => {
    const key = clip.project_name || '未分配项目';
    if (!acc[key]) acc[key] = [];
    acc[key].push(clip);
    return acc;
  }, {} as Record<string, AudioClip[]>);

  return (
    <Layout>
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Mic className="text-secondary" /> {t('manage.voices.title')}
        </h1>
        
          <div className="flex gap-3">
            <ProjectFilter 
                projects={projects} 
                selectedId={selectedProjectId} 
                onChange={setSelectedProjectId} 
            />
            <button 
                onClick={() => setIsCloneModalOpen(true)}
              className={`bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition shadow-md relative`}
            >
              {!userIsPro && <Lock size={14} className="absolute -top-1 -right-1 bg-yellow-500 p-0.5 rounded-full" />}
              <Sparkles size={18} /> {t('manage.voices.clone')} {!userIsPro && '(Pro)'}
            </button>
        </div>
      </div>

        {/* 标签页切换 */}
      <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800">
        <button 
            onClick={() => setActiveTab('clips')}
            className={`pb-3 px-2 flex items-center gap-2 font-medium transition-all relative ${activeTab === 'clips' ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}
        >
            <Film size={18} /> 配音素材库
            {activeTab === 'clips' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>}
        </button>
        <button 
            onClick={() => setActiveTab('templates')}
            className={`pb-3 px-2 flex items-center gap-2 font-medium transition-all relative ${activeTab === 'templates' ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}
        >
            <Mic size={18} /> 语音模板
            {activeTab === 'templates' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>}
        </button>
      </div>

        {/* 配音素材库 */}
        {activeTab === 'clips' && (
          <div className="space-y-8">
            {Object.entries(groupedClips).map(([projectName, clips]) => (
              <div key={projectName}>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Film size={20} className="text-primary" /> {projectName}
                  <span className="text-sm text-slate-500">({clips.length} 条配音)</span>
                </h2>

                <div className="space-y-3">
                  {clips.map(clip => (
                    <div key={clip.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-primary/30 transition group">
                      <div className="flex items-start gap-4">
                        {/* 播放按钮 */}
                        <button 
                          onClick={() => handlePlayClip(clip.audio_url, clip.id)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition ${
                            playingId === clip.id 
                              ? 'bg-red-500 text-white' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white'
                          }`}
                        >
                          {playingId === clip.id ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                        </button>

                        {/* 配音信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {clip.scene_number && (
                              <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                                第 {clip.scene_number} 镜
                              </span>
                            )}
                            {clip.episode_number && clip.episode_number > 1 && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                                第 {clip.episode_number} 集
                              </span>
                            )}
                            {clip.start_time !== undefined && clip.end_time !== undefined && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock size={12} /> {clip.start_time.toFixed(1)}s - {clip.end_time.toFixed(1)}s
                              </span>
                            )}
                            <span className="text-xs text-slate-400">|</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {clip.duration.toFixed(1)}s
                            </span>
                          </div>

                          {/* 对话文本 */}
                          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 line-clamp-2">
                            {clip.character_name && <strong className="text-secondary">{clip.character_name}:</strong>} {clip.dialogue_text}
                          </p>

                          {/* 语音信息 */}
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Mic size={12} /> {clip.voice_name}
                            </span>
                            <span className={`px-2 py-0.5 rounded ${clip.provider === 'elevenlabs' ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800'}`}>
                              {clip.provider === 'openai' ? 'OpenAI TTS' : 'ElevenLabs'}
                            </span>
                            {clip.reuse_count && clip.reuse_count > 0 && (
                              <span className="text-green-600 dark:text-green-400">
                                复用 {clip.reuse_count} 次
                              </span>
                          )}
                      </div>
                  </div>
                  
                        {/* 操作按钮 */}
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button 
                            onClick={() => handleFavorite(clip.id, clip.is_favorite || false)}
                            className={`p-2 rounded-lg transition ${clip.is_favorite ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-yellow-100 hover:text-yellow-600'}`}
                            title={clip.is_favorite ? '取消收藏' : '收藏'}
                          >
                            <Star size={16} fill={clip.is_favorite ? 'currentColor' : 'none'} />
                          </button>
                          <button 
                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition"
                            title="复用到其他项目"
                          >
                            <Copy size={16} />
                          </button>
                      <button 
                            onClick={() => handleDeleteClip(clip.id)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition"
                            title="删除"
                      >
                          <Trash2 size={16} />
                      </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredClips.length === 0 && (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                <Mic size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                <p className="text-slate-500 dark:text-slate-400">
                  {loading ? '加载中...' : '暂无配音素材。在项目中生成视频时，配音会自动保存到这里。'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 语音模板 */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VOICE_TEMPLATES.map(voice => {
              const needsProAccess = voice.isPro && !userIsPro;
              
              return (
                <div 
                  key={voice.id} 
                  className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:border-primary/50 transition relative ${needsProAccess ? 'opacity-60' : ''}`}
                      >
                  {needsProAccess && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                      <div className="text-center text-white">
                        <Lock size={32} className="mx-auto mb-2" />
                        <p className="font-bold text-sm">Pro 专属</p>
                        <a href="/account" className="text-xs underline mt-1 block">立即升级</a>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Mic size={20} className="text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{voice.name}</h3>
                        <span className="text-xs text-slate-500">{voice.gender === 'male' ? '男性' : '女性'} • {voice.style}</span>
                      </div>
                    </div>
                    
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      voice.isPro 
                        ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {voice.isPro ? '🌟 PRO' : 'FREE'}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-mono uppercase">{voice.provider}</span>
                    <button 
                      onClick={() => toast('语音模板预览功能开发中...', 'info')}
                      disabled={needsProAccess}
                      className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition disabled:opacity-50"
                    >
                      <Play size={12} className="inline mr-1" fill="currentColor" /> 试听
                    </button>
                  </div>
              </div>
              );
            })}
      </div>
        )}

        {/* 语音克隆模态框（Pro 功能）*/}
      {isCloneModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Sparkles className="text-secondary" /> {t('manage.voices.clone')}
                {!userIsPro && <span className="text-xs bg-gradient-to-r from-primary to-secondary text-white px-2 py-1 rounded-full">Pro 专属</span>}
            </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                上传 1-3 分钟的清晰音频样本，AI 将克隆出您的专属语音。需要 5 额度。
              </p>
            
              <div className="space-y-5">
              <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">语音名称</label>
                <input 
                  type="text" 
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white"
                    placeholder="例如：我的旁白声音"
                    disabled={!userIsPro}
                />
              </div>

              <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">上传音频样本</label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition ${!userIsPro ? 'border-slate-300 dark:border-slate-700 cursor-not-allowed' : 'border-primary/30 hover:border-primary cursor-pointer'}`}
                    onClick={() => userIsPro && document.getElementById('audio-upload')?.click()}
                  >
                    <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                    <span className="text-sm text-slate-500 dark:text-slate-400 block">
                      {audioFile ? `✅ ${audioFile.name}` : '点击上传 MP3/WAV（1-3 分钟）'}
                    </span>
                    <input 
                      id="audio-upload"
                      type="file" 
                      accept="audio/*"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      className="hidden"
                      disabled={!userIsPro}
                    />
                </div>
              </div>
              
                <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsCloneModalOpen(false)}
                    className="px-6 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('modal.cancel')}
                </button>
                <button 
                    disabled={!userIsPro || !audioFile || !cloneName || isCloning}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {isCloning ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    {isCloning ? '克隆中...' : '开始克隆（需 5 额度）'}
                </button>
                </div>

                {!userIsPro && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-300">
                    💡 语音克隆功能仅限 Pro 用户使用。<a href="/account" className="underline ml-1 font-semibold">立即升级</a>
                  </div>
                )}
              </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}

export default function VoicesPage() {
  return <VoicesContent />;
}
