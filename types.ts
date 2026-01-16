export type SubscriptionPlan = 'free' | 'basic' | 'pro';

export interface UserProfile {
  id: string;
  email: string;
  subscription_plan: SubscriptionPlan;
  monthly_generations_used: number;
  total_credits: number; // Purchased extra credits
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  platform: 'TikTok' | 'Reels' | 'Shorts';
  logline: string;
  status: 'draft' | 'scripted' | 'producing' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  user_id: string;
  project_id?: string; // Optional: if created inside a project, but can be global
  name: string;
  description: string;
  image_urls: string[]; // 4-6 generated images
  created_at: string;
}

export interface ScriptScene {
  scene_number: number;
  description: string; // Visuals, Action, Expression
  dialogue: string;
  character_name?: string; // New: To link with a character
  duration: number; // Estimated seconds
}

export interface Script {
  id: string;
  project_id: string;
  project_name?: string; // For display in management list
  content: ScriptScene[]; // JSON stored in DB
  version: number;
  created_at: string;
}

export interface Video {
  id: string;
  project_id: string;
  project_name?: string; // For display in management list
  script_id: string;
  url: string; // Storage URL
  status: 'processing' | 'completed' | 'failed';
  thumbnail_url?: string;
  has_audio?: boolean; // New: Supports audio
  voice_id?: string;   // New: Which voice was used
  created_at: string;
}

export interface Voice {
  id: string;
  name: string;
  provider: 'elevenlabs' | 'kling' | 'cloned' | 'openai'; // 添加 openai
  gender: 'male' | 'female';
  style: string; // e.g., "Deep & Narrative", "Soft & Young"
  preview_url?: string;
  is_custom?: boolean; // True if created by user via cloning
  project_id?: string; // Optional: Belong to a specific project
  project_name?: string; // Optional: Display name
  created_at?: string;
}

// 新增：配音素材（实际生成的音频片段）
export interface AudioClip {
  id: string;
  user_id: string;
  project_id?: string;
  project_name?: string; // 项目名称（用于显示）
  script_id?: string;
  
  // 定位信息
  scene_number?: number; // 第几个镜头
  episode_number?: number; // 第几集（默认 1）
  start_time?: number; // 开始时间（秒）
  end_time?: number; // 结束时间（秒）
  
  // 配音内容
  dialogue_text: string; // 对话文本
  character_name?: string; // 角色名称
  
  // 音频信息
  audio_url: string; // 音频文件 URL
  duration: number; // 时长（秒）
  provider: 'openai' | 'elevenlabs'; // TTS 引擎
  voice_id: string; // 使用的语音 ID
  voice_name: string; // 语音名称（方便显示）
  
  // 元数据
  is_favorite?: boolean; // 是否收藏
  reuse_count?: number; // 被复用次数
  created_at: string;
}

export const PLAN_LIMITS = {
  free: 3,
  basic: 20,
  pro: 60
};

export const PRICES = {
  basic: 39,
  pro: 99,
  credit10: 10,
  credit30: 25,
  credit70: 50
};