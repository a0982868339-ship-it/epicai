-- 配音素材表（存储实际生成的配音片段）
create table if not exists public.audio_clips (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade,
  script_id uuid references public.scripts(id) on delete set null,
  
  -- 定位信息
  scene_number int, -- 第几个镜头
  episode_number int default 1, -- 第几集（未来扩展）
  start_time decimal, -- 开始时间（秒）
  end_time decimal, -- 结束时间（秒）
  
  -- 配音内容
  dialogue_text text not null, -- 对话文本
  character_name text, -- 角色名称
  
  -- 音频信息
  audio_url text not null, -- 音频文件 URL
  duration decimal, -- 时长（秒）
  provider text check (provider in ('openai', 'elevenlabs')), -- 使用的 TTS 引擎
  voice_id text, -- 使用的语音 ID
  voice_name text, -- 语音名称（方便显示）
  
  -- 元数据
  is_favorite boolean default false, -- 是否收藏（经典台词）
  reuse_count int default 0, -- 被复用次数
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 索引优化
create index audio_clips_project_idx on public.audio_clips(project_id);
create index audio_clips_user_idx on public.audio_clips(user_id);
create index audio_clips_scene_idx on public.audio_clips(project_id, scene_number);

-- RLS 策略
alter table public.audio_clips enable row level security;

create policy "Users can manage own audio clips" on public.audio_clips for all using (auth.uid() = user_id);


