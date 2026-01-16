
'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Users, FileText, Video, Sparkles, RefreshCw, Image as ImageIcon, PlayCircle, Globe, Briefcase, CheckCircle, Play, Loader2, Zap, AlertTriangle, Mic, Music, Volume2, Bot, Lock } from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import { Character, ScriptScene, Script, Video as VideoType } from '../../../types';
import { useLanguage } from '../../../lib/i18n';
import { useData } from '../../../lib/DataContext';
import { useToast } from '../../../lib/ToastContext';
import { Layout } from '../../../components/Layout';

const generateAudio = async (text: string, voiceId: string): Promise<string> => {
    return new Promise(resolve => setTimeout(() => resolve("mock_audio_url.mp3"), 1500));
};

const syncLipSync = async (videoUrl: string, audioUrl: string): Promise<string> => {
    return new Promise(resolve => setTimeout(() => resolve(videoUrl), 2000));
}

const MUSIC_STYLES = [
    { id: 'suspense', label: 'Suspense / Thriller' },
    { id: 'romantic', label: 'Romantic / Emotional' },
    { id: 'upbeat', label: 'Upbeat / Comedy' },
    { id: 'dramatic', label: 'Dramatic / Intense' },
    { id: 'corporate', label: 'Corporate / Documentary' }
];

function ProjectWorkspaceContent() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { getProjectCharacters, addCharacter, addScript, addVideo, projects, voices } = useData();

  const [activeTab, setActiveTab] = useState<'roles' | 'script' | 'video'>('roles');
  
  const allAvailableRoles = getProjectCharacters(id || '');
  const projectSpecificRoles = allAvailableRoles.filter(c => c.project_id === id);
  const globalRoles = allAvailableRoles.filter(c => !c.project_id);

  // --- MODEL SELECTION STATE ---
  const [scriptModel, setScriptModel] = useState<'google' | 'openai'>('openai');
  const [imageModel, setImageModel] = useState<'google' | 'openai'>('openai'); // Google = Gemini 2.5, OpenAI = DALL-E 3
  const [videoModel, setVideoModel] = useState<'google' | 'kling'>('kling');   // Google = Veo, Kling = Kling AI

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [isGeneratingRole, setIsGeneratingRole] = useState(false);

  const [storyLogline, setStoryLogline] = useState('');
  const [scriptContent, setScriptContent] = useState<ScriptScene[]>([]);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const [videoMode, setVideoMode] = useState<'auto' | 'pro'>('auto');
  const [useAudio, setUseAudio] = useState(true); // 默认启用配音
  const [selectedVoice, setSelectedVoice] = useState('sweet-female-a'); // 默认使用甜美女声
  const [audioProvider, setAudioProvider] = useState<'openai' | 'elevenlabs'>('openai'); // 配音引擎
  const [musicStyle, setMusicStyle] = useState<string>('');
  const [enableLipSync, setEnableLipSync] = useState(true); // 口型同步

  const [generatedClips, setGeneratedClips] = useState<Record<number, string>>({});
  const [isGeneratingClip, setIsGeneratingClip] = useState<Record<number, boolean>>({});
  
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [isStitching, setIsStitching] = useState(false);
  const [generationStep, setGenerationStep] = useState<'idle' | 'video' | 'audio' | 'sync' | 'mixing'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const currentProject = projects.find(p => p.id === id);
  const totalScriptDuration = useMemo(() => scriptContent.reduce((acc, scene) => acc + scene.duration, 0), [scriptContent]);
  const isOverDurationLimit = totalScriptDuration > 60;

  const handleGenerateRole = async () => {
    if (!user || user.total_credits < 1) {
        toast(t('workspace.alert.insufficient'), 'error');
        return;
    }
    setIsGeneratingRole(true);
    try {
        const response = await fetch('/api/generate/character-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt: `${newRoleDesc} (Character Name: ${newRoleName})`,
                provider: imageModel 
            }),
        });
        
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const newCharacter: Character = {
            id: Math.random().toString(),
            user_id: user.id,
            project_id: id,
            name: newRoleName,
            description: newRoleDesc,
            image_urls: [data.imageUrl],
            created_at: new Date().toISOString()
        };
        addCharacter(newCharacter);
        setNewRoleName('');
        setNewRoleDesc('');
        toast(`Character generated with ${imageModel === 'openai' ? 'DALL-E 3' : 'Gemini'}!`, 'success');
    } catch (error) {
        console.error(error);
        toast('Failed to generate character.', 'error');
    } finally {
        setIsGeneratingRole(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!user || user.total_credits < 1) {
        toast(t('workspace.alert.insufficient'), 'error');
        return;
    }
    setIsGeneratingScript(true);
    try {
        const response = await fetch('/api/generate/script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                story: storyLogline,
                characters: allAvailableRoles.map(c => ({ name: c.name, description: c.description })),
                provider: scriptModel
            }),
        });

        const scenes = await response.json();
        if (!Array.isArray(scenes)) throw new Error("Invalid script format");

        setScriptContent(scenes);
        setGeneratedClips({});
        setFinalVideoUrl(null);

        const newScript: Script = {
            id: Math.random().toString(),
            project_id: id || '',
            project_name: currentProject?.name,
            content: scenes,
            version: 1,
            created_at: new Date().toISOString()
        };
        addScript(newScript);
        setActiveTab('script');
        toast(`Script generated with ${scriptModel === 'openai' ? 'GPT-4o' : 'Gemini'}!`, 'success');
    } catch (error) {
        console.error(error);
        toast('Failed to generate script.', 'error');
    } finally {
        setIsGeneratingScript(false);
    }
  };

  const handleGenerateClip = async (sceneIndex: number, description: string, duration: number, characterName?: string) => {
    if (!user || user.total_credits < 1) {
        toast(t('workspace.alert.insufficient'), 'error');
        return;
    }

    setIsGeneratingClip(prev => ({ ...prev, [sceneIndex]: true }));
    
    try {
        // Find the character image if a character is assigned to this scene
        const assignedChar = characterName ? allAvailableRoles.find(c => c.name === characterName) : null;
        const charImageUrl = assignedChar?.image_urls[0];

        const response = await fetch('/api/generate/video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt: description, 
                imageUrl: charImageUrl, // Pass character image for consistency
                provider: videoModel 
            }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        setGeneratedClips(prev => ({ ...prev, [sceneIndex]: data.videoUrl }));
        toast(`Clip ${sceneIndex + 1} generated with Kling AI (consistent character: ${characterName || 'None'})!`, 'success');
    } catch (error) {
        toast('Failed to generate clip', 'error');
    } finally {
        setIsGeneratingClip(prev => ({ ...prev, [sceneIndex]: false }));
    }
  };

  const handleGenerateFullVideo = async () => {
    if (!user || user.total_credits < 5) { 
        toast(t('workspace.alert.insufficient'), 'error');
        return;
    }
    setIsStitching(true);
    setFinalVideoUrl(null);

    try {
        // Step 1: 生成视频画面
        setGenerationStep('video');
        setStatusMessage('🎬 正在使用 ' + (videoModel === 'kling' ? 'Kling AI' : 'Google Veo') + ' 生成视频画面...');
        
        const videoResponse = await fetch('/api/generate/video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt: storyLogline + " cinematic style", 
                provider: videoModel 
            }),
        });
        const videoData = await videoResponse.json();
        let currentUrl = videoData.videoUrl;
        
        // Step 2: 生成配音（如果启用）
        if (useAudio) {
            setGenerationStep('audio');
            setStatusMessage('🎤 正在使用 ' + (audioProvider === 'openai' ? 'OpenAI TTS' : 'ElevenLabs') + ' 生成配音...');
            
            // 为每个镜头生成配音并保存到数据库
            let cumulativeTime = 0;
            for (let i = 0; i < scriptContent.length; i++) {
                const scene = scriptContent[i];
                if (!scene.dialogue) continue;

                const audioResponse = await fetch('/api/generate/audio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: scene.dialogue,
                        voiceId: selectedVoice,
                        provider: audioProvider
                    })
                });
                
                const audioData = await audioResponse.json();
                if (!audioData.error) {
                    // 保存配音素材到数据库
                    const startTime = cumulativeTime;
                    const endTime = cumulativeTime + audioData.duration;
                    
                    await supabase.from('audio_clips').insert([{
                        user_id: user.id,
                        project_id: id,
                        scene_number: scene.scene_number,
                        episode_number: 1,
                        start_time: startTime,
                        end_time: endTime,
                        dialogue_text: scene.dialogue,
                        character_name: scene.character_name,
                        audio_url: audioData.audioUrl,
                        duration: audioData.duration,
                        provider: audioProvider,
                        voice_id: selectedVoice,
                        voice_name: selectedVoice // TODO: 改为实际的语音名称
                    }]);

                    cumulativeTime = endTime;
                }
            }

            // Step 3: 音视频同步（模拟）
            if (enableLipSync) {
            setGenerationStep('sync');
                setStatusMessage('👄 正在同步口型...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Step 4: 添加背景音乐（如果选择）
        if (musicStyle) {
            setGenerationStep('mixing');
            setStatusMessage('🎵 正在添加背景音乐...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        setStatusMessage('✅ 视频生成完成！');
        setFinalVideoUrl(currentUrl);
        toast(t('workspace.video.complete'), 'success');
    } catch (e: any) {
        toast('生成失败: ' + e.message, 'error');
        console.error(e);
    } finally {
        setIsStitching(false);
        setGenerationStep('idle');
    }
  };

  // ... (Keep handleGenerateAllClips, handleStitchVideo, CharacterGrid same as before but ensure they use state)
  const handleGenerateAllClips = async () => {
      const indicesToGenerate = scriptContent.map((_, idx) => idx).filter(idx => !generatedClips[idx]);
      if (indicesToGenerate.length === 0) return;
      for (const idx of indicesToGenerate) {
          await handleGenerateClip(idx, scriptContent[idx].description, scriptContent[idx].duration);
      }
  };

  const handleStitchVideo = async () => {
     setIsStitching(true);
     if (musicStyle) setGenerationStep('mixing');
     setTimeout(() => {
        setFinalVideoUrl(Object.values(generatedClips)[0] || "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4");
        setIsStitching(false);
        setGenerationStep('idle');
        toast(t('workspace.video.complete'), 'success');
     }, 2000);
  }

  const CharacterGrid = ({ roles }: { roles: Character[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {roles.map(role => (
        <div key={role.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
               {role.name}
               {!role.project_id && <Globe size={12} className="text-secondary" />}
            </h4>
          </div>
          <div className="bg-slate-200 dark:bg-slate-800 relative">
            {role.image_urls[0] ? (
              <img src={role.image_urls[0]} className="w-full h-48 object-cover" alt={role.name} />
            ) : (
                <div className="h-48 flex items-center justify-center text-slate-400">No Image</div>
            )}
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{role.description}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 transition-colors">
        <button 
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${activeTab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400'}`}
        >
          <Users size={18} /> {t('workspace.tabs.roles')}
        </button>
        <button 
          onClick={() => setActiveTab('script')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${activeTab === 'script' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400'}`}
        >
          <FileText size={18} /> {t('workspace.tabs.script')}
        </button>
        <button 
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${activeTab === 'video' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400'}`}
        >
          <Video size={18} /> {t('workspace.tabs.video')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm transition-colors sticky top-0">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles className="text-primary" size={18}/> {t('workspace.roles.title')}
                </h3>
                
                {/* Model Selector */}
                <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1 block">{t('workspace.roles.model.image')}</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button onClick={() => setImageModel('openai')} className={`flex-1 py-1 text-xs rounded-md transition ${imageModel === 'openai' ? 'bg-white dark:bg-slate-700 shadow text-primary font-bold' : 'text-slate-500'}`}>{t('workspace.roles.model.dalle')}</button>
                        <button onClick={() => setImageModel('google')} className={`flex-1 py-1 text-xs rounded-md transition ${imageModel === 'google' ? 'bg-white dark:bg-slate-700 shadow text-primary font-bold' : 'text-slate-500'}`}>{t('workspace.roles.model.gemini')}</button>
                    </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400 block mb-1">{t('workspace.roles.nameLabel')}</label>
                    <input 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder={t('workspace.roles.namePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400 block mb-1">{t('workspace.roles.descLabel')}</label>
                    <textarea 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white h-32 resize-none focus:outline-none focus:border-primary transition-colors"
                      value={newRoleDesc}
                      onChange={(e) => setNewRoleDesc(e.target.value)}
                      placeholder={t('workspace.roles.descPlaceholder')}
                    />
                  </div>
                  <button 
                    onClick={handleGenerateRole}
                    disabled={isGeneratingRole || !newRoleName || !newRoleDesc}
                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                  >
                    {isGeneratingRole ? <RefreshCw className="animate-spin" /> : <ImageIcon size={18} />}
                    {isGeneratingRole ? t('workspace.roles.generating') : t('workspace.roles.generateBtn')}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Briefcase size={16} /> {t('workspace.roles.projectTitle')}
                  </h3>
                  {projectSpecificRoles.length > 0 ? <CharacterGrid roles={projectSpecificRoles} /> : <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500">{t('workspace.roles.noCharacters')}</div>}
              </div>
              <div>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Globe size={16} /> {t('workspace.roles.globalTitle')}
                  </h3>
                  {globalRoles.length > 0 ? <CharacterGrid roles={globalRoles} /> : <div className="text-center py-4 text-slate-500 text-sm">{t('workspace.roles.noGlobal')}</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'script' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="flex flex-col h-full">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex-1 flex flex-col shadow-sm transition-colors">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('workspace.script.storyOutline')}</h3>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button onClick={() => setScriptModel('openai')} className={`px-3 py-1 text-xs rounded-md transition ${scriptModel === 'openai' ? 'bg-white dark:bg-slate-700 shadow text-primary font-bold' : 'text-slate-500'}`}>GPT-4o</button>
                        <button onClick={() => setScriptModel('google')} className={`px-3 py-1 text-xs rounded-md transition ${scriptModel === 'google' ? 'bg-white dark:bg-slate-700 shadow text-primary font-bold' : 'text-slate-500'}`}>Gemini</button>
                    </div>
                </div>
                
                <textarea 
                  className="w-full flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-4 text-slate-900 dark:text-white resize-none focus:outline-none focus:border-primary transition-colors"
                  placeholder={t('workspace.script.placeholder')}
                  value={storyLogline}
                  onChange={(e) => setStoryLogline(e.target.value)}
                />
                <div className="mt-4 flex justify-between items-center">
                   <span className="text-sm text-slate-500 dark:text-slate-400">{t('workspace.script.injected')} <span className="text-slate-900 dark:text-white font-semibold">{allAvailableRoles.length}</span></span>
                   <button 
                    onClick={handleGenerateScript}
                    disabled={isGeneratingScript || !storyLogline}
                    className="bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                   >
                     {isGeneratingScript ? <RefreshCw className="animate-spin" /> : <Bot size={18} />}
                     {isGeneratingScript ? t('workspace.roles.generating') : t('workspace.script.generateBtn')}
                   </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-sm transition-colors">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white">{t('workspace.script.previewTitle')}</h3>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
                {scriptContent.length === 0 ? <div className="text-center text-slate-500 py-20">{t('workspace.script.empty')}</div> : 
                    scriptContent.map((scene, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex justify-between mb-2">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-primary uppercase">{t('workspace.script.scene')} {scene.scene_number}</span>
                                    {scene.character_name && <span className="text-[10px] font-semibold text-secondary flex items-center gap-1"><Users size={10}/> {scene.character_name}</span>}
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{scene.duration}s</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 italic">{scene.description}</p>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-2 rounded text-sm text-slate-900 dark:text-white border-l-2 border-secondary">{scene.dialogue}</div>
                        </div>
                    ))
                }
              </div>
            </div>
          </div>
        )}

        {activeTab === 'video' && (
            <div className="h-full">
                {scriptContent.length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                        <Video size={48} className="mx-auto text-slate-300 dark:text-slate-700" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('workspace.video.requiredScript')}</h2>
                        <button onClick={() => setActiveTab('script')} className="text-primary hover:underline">{t('workspace.video.goToScript')}</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
                             <div className="p-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10 space-y-4">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t('workspace.video.productionTitle')}</h3>
                                    
                                    {/* Video Model Selector */}
                                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mb-3">
                                        <button onClick={() => setVideoMode('auto')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${videoMode === 'auto' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}>{t('workspace.video.auto')}</button>
                                        <button onClick={() => setVideoMode('pro')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${videoMode === 'pro' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}>{t('workspace.video.pro')}</button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold uppercase text-slate-500">{t('workspace.video.engine')}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setVideoModel('kling')} className={`px-2 py-1 text-xs border rounded ${videoModel === 'kling' ? 'border-secondary text-secondary bg-secondary/10' : 'border-slate-300 text-slate-500'}`}>{t('workspace.video.kling')}</button>
                                            <button onClick={() => setVideoModel('google')} className={`px-2 py-1 text-xs border rounded ${videoModel === 'google' ? 'border-primary text-primary bg-primary/10' : 'border-slate-300 text-slate-500'}`}>{t('workspace.video.veo')}</button>
                                        </div>
                                    </div>
                                </div>
                             </div>

                             {videoMode === 'auto' && (
                                 <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
                                     {/* 配音设置 */}
                                     <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                                         <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                             <Volume2 size={16} className="text-secondary" /> 🎤 配音设置
                                         </h4>
                                         
                                         <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                             <input 
                                                 type="checkbox" 
                                                 checked={useAudio}
                                                 onChange={(e) => setUseAudio(e.target.checked)}
                                                 className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                                             />
                                             启用配音（为对话生成语音）
                                         </label>

                                         {useAudio && (
                                             <>
                                                 <div>
                                                     <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">配音引擎</label>
                                                     <div className="flex gap-2">
                                                         <button 
                                                             onClick={() => setAudioProvider('openai')}
                                                             className={`flex-1 py-1.5 px-2 text-xs rounded-md transition ${audioProvider === 'openai' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                                                         >
                                                             OpenAI TTS
                                                         </button>
                                                         <button 
                                                             onClick={() => setAudioProvider('elevenlabs')}
                                                             className={`flex-1 py-1.5 px-2 text-xs rounded-md transition ${audioProvider === 'elevenlabs' ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'} relative`}
                                                         >
                                                             ElevenLabs {user?.subscription_plan !== 'pro' && <Lock size={10} className="absolute -top-1 -right-1" />}
                                                         </button>
                                                     </div>
                                                 </div>

                                                 <div>
                                                     <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">选择语音</label>
                                                     <select 
                                                         value={selectedVoice}
                                                         onChange={(e) => setSelectedVoice(e.target.value)}
                                                         className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-xs text-slate-900 dark:text-white"
                                                     >
                                                         <optgroup label="系统语音 (OpenAI)">
                                                             <option value="sweet-female-a">甜美女声 A</option>
                                                             <option value="warm-female-b">温暖女声 B</option>
                                                             <option value="deep-male-a">低沉男声 A</option>
                                                             <option value="neutral-male">中性男声</option>
                                                             <option value="energetic-male">活力男声</option>
                                                             <option value="storyteller">故事叙述者</option>
                                                         </optgroup>
                                                         {user?.subscription_plan === 'pro' && (
                                                             <optgroup label="Pro 语音 (ElevenLabs)">
                                                                 <option value="ultra-female">🌟 超真实女声</option>
                                                                 <option value="deep-male">🌟 磁性男声</option>
                                                             </optgroup>
                                                         )}
                                                         {voices.filter(v => v.is_custom).length > 0 && (
                                                             <optgroup label="我的克隆语音">
                                                                 {voices.filter(v => v.is_custom).map(v => (
                                                                     <option key={v.id} value={v.id}>✨ {v.name}</option>
                                                                 ))}
                                                             </optgroup>
                                                         )}
                                                     </select>
                                                 </div>

                                                 <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                                     <input 
                                                         type="checkbox" 
                                                         checked={enableLipSync}
                                                         onChange={(e) => setEnableLipSync(e.target.checked)}
                                                         className="w-4 h-4 text-primary rounded"
                                                     />
                                                     口型同步（实验性功能）
                                                 </label>
                                             </>
                                         )}

                                         {musicStyle && (
                                             <div>
                                                 <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">🎵 背景音乐</label>
                                                 <select 
                                                     value={musicStyle}
                                                     onChange={(e) => setMusicStyle(e.target.value)}
                                                     className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-xs"
                                                 >
                                                     <option value="">无</option>
                                                     <option value="suspense">悬疑 / 紧张</option>
                                                     <option value="romantic">浪漫 / 温情</option>
                                                     <option value="upbeat">欢快 / 喜剧</option>
                                                     <option value="dramatic">戏剧性 / 激烈</option>
                                                 </select>
                                             </div>
                                         )}
                                     </div>

                                     {/* 一键生成按钮 */}
                                     <div className="flex flex-col items-center justify-center text-center space-y-4 p-4">
                                         <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-full text-purple-600 dark:text-purple-400">
                                             <Zap size={32} />
                                         </div>
                                         <h4 className="font-bold text-slate-900 dark:text-white">{t('workspace.video.oneClick')}</h4>
                                         <p className="text-xs text-slate-500">AI 将自动完成：视频画面 + 配音 + 音视频合成</p>
                                         <button 
                                            onClick={handleGenerateFullVideo}
                                            disabled={isOverDurationLimit || isStitching}
                                            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                                         >
                                            {isStitching ? <RefreshCw className="animate-spin" /> : <PlayCircle size={18} />}
                                           {isStitching ? t('workspace.video.generating') : '🚀 一键生成完整视频'}
                                         </button>
                                     </div>
                                 </div>
                             )}

                             {videoMode === 'pro' && (
                                <div className="overflow-y-auto flex-1 p-3 space-y-3">
                                    {scriptContent.map((scene, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg border ${generatedClips[idx] ? 'border-green-500/30 bg-green-50 dark:bg-green-900/10' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t('workspace.script.scene')} {scene.scene_number}</span>
                                                {generatedClips[idx] ? <CheckCircle size={14} className="text-green-500"/> : null}
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">{scene.description}</p>
                                            <div className="flex justify-end">
                                                {generatedClips[idx] ? (
                                                    <button onClick={() => setFinalVideoUrl(generatedClips[idx])} className="text-xs flex items-center gap-1 text-primary"><PlayCircle size={14} /> {t('workspace.video.preview')}</button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleGenerateClip(idx, scene.description, scene.duration, scene.character_name)}
                                                        disabled={isGeneratingClip[idx]}
                                                        className="w-full py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-semibold hover:bg-slate-50"
                                                    >
                                                        {isGeneratingClip[idx] ? <Loader2 className="animate-spin mx-auto" size={12} /> : `Generate (Kling)`}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             )}
                        </div>

                        <div className="lg:col-span-2 flex flex-col items-center justify-center bg-black/5 dark:bg-black/20 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
                             {finalVideoUrl ? (
                                <div className="w-full max-w-sm space-y-6">
                                    <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl mx-auto border border-slate-800">
                                        <video src={finalVideoUrl} controls className="w-full h-full object-cover"></video>
                                    </div>
                                </div>
                             ) : (
                                <div className="text-center text-slate-400 dark:text-slate-600">
                                    {isStitching ? <Loader2 className="animate-spin mx-auto mb-4" size={48} /> : <PlayCircle size={64} className="mx-auto mb-4 opacity-50" />}
                                    <p className="text-lg font-medium">{isStitching ? t('workspace.video.generating') : t('workspace.video.ready')}</p>
                                </div>
                             )}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectWorkspace() {
    return <Layout><ProjectWorkspaceContent /></Layout>;
}
