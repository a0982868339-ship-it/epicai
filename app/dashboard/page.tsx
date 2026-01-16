'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Film, Plus, Wand2 } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/i18n';
import { useData } from '../../lib/DataContext';
import { Layout } from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { projects, addProject } = useData();
  
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [logline, setLogline] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async () => {
    if (!projectName || !logline) {
      alert('请填写项目名称和故事大纲');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          user_id: user?.id,
          name: projectName,
          platform: platform,
          logline: logline,
          status: 'draft'
        }])
        .select()
        .single();

      if (error) throw error;

      addProject(data);
      setShowModal(false);
      setProjectName('');
      setLogline('');
      setPlatform('TikTok');
      
      // 跳转到项目详情页
      router.push(`/project/${data.id}`);
    } catch (error: any) {
      alert('创建失败: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('dashboard.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t('auth.welcomeBack')}, {user?.email}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
        >
          <Plus size={20} /> {t('dashboard.newProject')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.length > 0 ? projects.map((project) => (
          <div 
            key={project.id} 
            onClick={() => router.push(`/project/${project.id}`)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Film size={20} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                project.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {project.status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{project.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">{project.logline}</p>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Wand2 size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-500 dark:text-slate-400">还没有项目，点击右上角开始创作！</p>
          </div>
        )}
      </div>

      {/* 简化的新建项目弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">🎬 创建新项目</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition text-2xl">✕</button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">项目名称</label>
                  <input 
                    type="text" 
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition"
                    placeholder="例如：霸总的秘密新娘"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">发布平台</label>
                  <select 
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition"
                  >
                    <option>TikTok</option>
                    <option>Reels</option>
                    <option>Shorts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">故事大纲</label>
                  <textarea 
                    value={logline}
                    onChange={(e) => setLogline(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white h-32 resize-none focus:ring-2 focus:ring-primary outline-none transition"
                    placeholder="用一两句话描述你的故事..."
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition"
                >
                  取消
                </button>
                <button 
                  onClick={handleCreateProject}
                  disabled={!projectName || !logline || isCreating}
                  className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  {isCreating ? '创建中...' : '创建项目并开始创作'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth');
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex items-center justify-center h-screen bg-slate-950 text-white">Loading...</div>;

  return <Layout><DashboardContent /></Layout>;
}
