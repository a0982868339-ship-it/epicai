'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Profile {
  id: string;
  email: string;
  subscription_plan: string;
  total_credits: number;
}

interface Project {
  id: string;
  name: string;
  platform: string;
  status: string;
  created_at: string;
}

export default function TestDBPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在连接数据库...');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    try {
      setStatus('loading');
      setMessage('测试数据库连接...');

      // 测试 1: 获取 profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

      if (profilesError) throw profilesError;

      // 测试 2: 获取 projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .limit(5);

      if (projectsError) throw projectsError;

      setProfiles(profilesData || []);
      setProjects(projectsData || []);
      setStatus('success');
      setMessage('✅ 数据库连接成功！');
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
      setMessage('❌ 连接失败');
    }
  }

  async function createTestProfile() {
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      
      // 首先创建一个测试用户（通常这会通过 auth 完成）
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'test-password-123',
      });

      if (authError) throw authError;

      setMessage('✅ 测试用户创建成功！');
      testConnection(); // 刷新数据
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function createTestProject() {
    try {
      // 首先需要有一个用户
      if (profiles.length === 0) {
        setError('请先创建测试用户');
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            user_id: profiles[0].id,
            name: `测试项目 ${Date.now()}`,
            platform: 'TikTok',
            status: 'draft',
          },
        ])
        .select();

      if (error) throw error;

      setMessage('✅ 测试项目创建成功！');
      testConnection(); // 刷新数据
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          🧪 Supabase 本地数据库测试
        </h1>

        {/* 状态卡片 */}
        <div className={`p-6 rounded-lg mb-8 ${
          status === 'loading' ? 'bg-blue-100' :
          status === 'success' ? 'bg-green-100' :
          'bg-red-100'
        }`}>
          <p className={`text-lg font-semibold ${
            status === 'loading' ? 'text-blue-800' :
            status === 'success' ? 'text-green-800' :
            'text-red-800'
          }`}>
            {message}
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600">错误: {error}</p>
          )}
        </div>

        {/* 连接信息 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">📡 连接信息</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Supabase URL:</span> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p><span className="font-semibold">Anon Key:</span> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30)}...</p>
            <p><span className="font-semibold">Studio:</span> <a href="http://127.0.0.1:54323" target="_blank" className="text-blue-600 hover:underline">http://127.0.0.1:54323</a></p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">🎮 测试操作</h2>
          <div className="flex gap-4">
            <button
              onClick={testConnection}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              🔄 刷新数据
            </button>
            <button
              onClick={createTestProfile}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              ➕ 创建测试用户
            </button>
            <button
              onClick={createTestProject}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              disabled={profiles.length === 0}
            >
              ➕ 创建测试项目
            </button>
          </div>
        </div>

        {/* Profiles 数据 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            👤 Profiles 表 ({profiles.length} 条记录)
          </h2>
          {profiles.length === 0 ? (
            <p className="text-gray-500">暂无数据，点击"创建测试用户"添加数据</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Plan</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Credits</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {profiles.map((profile) => (
                    <tr key={profile.id}>
                      <td className="px-4 py-2 text-sm">{profile.email}</td>
                      <td className="px-4 py-2 text-sm">{profile.subscription_plan}</td>
                      <td className="px-4 py-2 text-sm">{profile.total_credits}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{profile.id.substring(0, 8)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Projects 数据 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            📁 Projects 表 ({projects.length} 条记录)
          </h2>
          {projects.length === 0 ? (
            <p className="text-gray-500">暂无数据，点击"创建测试项目"添加数据</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Platform</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td className="px-4 py-2 text-sm">{project.name}</td>
                      <td className="px-4 py-2 text-sm">{project.platform}</td>
                      <td className="px-4 py-2 text-sm">{project.status}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {new Date(project.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

