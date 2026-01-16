-- 测试数据种子文件
-- 运行 npm run db:reset 会自动加载这些数据

-- 清空现有数据（可选）
-- TRUNCATE public.profiles, public.projects, public.characters, public.scripts, public.videos, public.voices CASCADE;

-- 首先在 auth.users 中创建测试用户
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001',
    '00000000-0000-0000-0000-000000000000',
    'alice@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '',
    '',
    '',
    '',
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    '00000000-0000-0000-0000-000000000000',
    'bob@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '',
    '',
    '',
    '',
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    '00000000-0000-0000-0000-000000000000',
    'carol@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '',
    '',
    '',
    '',
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- 插入测试用户配置
INSERT INTO public.profiles (id, email, subscription_plan, total_credits, monthly_generations_used)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'alice@example.com', 'pro', 100, 5),
  ('550e8400-e29b-41d4-a716-446655440002', 'bob@example.com', 'free', 10, 2),
  ('550e8400-e29b-41d4-a716-446655440003', 'carol@example.com', 'basic', 50, 8)
ON CONFLICT (id) DO NOTHING;

-- 插入测试项目
INSERT INTO public.projects (id, user_id, name, platform, logline, status)
VALUES 
  (
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    '美食探店系列 - 第一集',
    'TikTok',
    '探访城市里最受欢迎的网红餐厅',
    'draft'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    '健身教程 - 新手入门',
    'Reels',
    '适合初学者的 10 分钟全身训练',
    'scripted'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440002',
    '旅行 Vlog - 日本之旅',
    'Shorts',
    '记录在东京的美好时光',
    'producing'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440003',
    '科技评测 - 最新手机',
    'TikTok',
    '深度评测 2024 年度旗舰手机',
    'completed'
  )
ON CONFLICT (id) DO NOTHING;

-- 插入测试角色
INSERT INTO public.characters (id, user_id, project_id, name, description, image_urls)
VALUES 
  (
    '770e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    '美食博主小李',
    '一位热爱美食的年轻博主，擅长发现隐藏的美食宝藏',
    ARRAY['https://example.com/avatar1.jpg']
  ),
  (
    '770e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440002',
    '健身教练 Mike',
    '专业健身教练，致力于帮助新手建立健康的运动习惯',
    ARRAY['https://example.com/avatar2.jpg']
  ),
  (
    '770e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440003',
    '旅行者 Sarah',
    '环球旅行者，用镜头记录世界各地的美景',
    ARRAY['https://example.com/avatar3.jpg']
  )
ON CONFLICT (id) DO NOTHING;

-- 插入测试脚本
INSERT INTO public.scripts (id, project_id, content, version)
VALUES 
  (
    '880e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    '[
      {
        "scene_number": 1,
        "description": "餐厅外景",
        "dialogue": "大家好！今天我要带大家探访这家超火的网红餐厅",
        "duration": 3,
        "camera_angle": "wide"
      },
      {
        "scene_number": 2,
        "description": "餐厅内部",
        "dialogue": "哇！装修真的太有特色了",
        "duration": 4,
        "camera_angle": "medium"
      },
      {
        "scene_number": 3,
        "description": "特色菜品特写",
        "dialogue": "这是他们的招牌菜，看起来就很好吃",
        "duration": 5,
        "camera_angle": "close-up"
      }
    ]'::jsonb,
    1
  ),
  (
    '880e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440002',
    '[
      {
        "scene_number": 1,
        "description": "健身房场景",
        "dialogue": "欢迎来到新手健身教程",
        "duration": 2,
        "camera_angle": "wide"
      },
      {
        "scene_number": 2,
        "description": "深蹲动作演示",
        "dialogue": "第一个动作是深蹲，注意保持背部挺直",
        "duration": 8,
        "camera_angle": "side"
      }
    ]'::jsonb,
    1
  )
ON CONFLICT (id) DO NOTHING;

-- 插入测试语音
INSERT INTO public.voices (id, name, provider, gender, style, preview_url, is_custom, user_id)
VALUES 
  (
    '990e8400-e29b-41d4-a716-446655440001',
    '甜美女声',
    'elevenlabs',
    'female',
    'cheerful',
    'https://example.com/voice1.mp3',
    false,
    '550e8400-e29b-41d4-a716-446655440001'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440002',
    '磁性男声',
    'elevenlabs',
    'male',
    'professional',
    'https://example.com/voice2.mp3',
    false,
    '550e8400-e29b-41d4-a716-446655440001'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440003',
    '活力青年',
    'kling',
    'male',
    'energetic',
    'https://example.com/voice3.mp3',
    false,
    '550e8400-e29b-41d4-a716-446655440002'
  )
ON CONFLICT (id) DO NOTHING;

-- 插入测试视频
INSERT INTO public.videos (id, project_id, script_id, url, thumbnail_url, status, has_audio, voice_id)
VALUES 
  (
    'aa0e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440004',
    '880e8400-e29b-41d4-a716-446655440001',
    'https://example.com/video1.mp4',
    'https://example.com/thumb1.jpg',
    'completed',
    true,
    '990e8400-e29b-41d4-a716-446655440001'
  ),
  (
    'aa0e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440003',
    '880e8400-e29b-41d4-a716-446655440002',
    'https://example.com/video2.mp4',
    'https://example.com/thumb2.jpg',
    'processing',
    false,
    null
  )
ON CONFLICT (id) DO NOTHING;

-- 验证数据
SELECT 'Profiles:' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'Projects:', COUNT(*) FROM public.projects
UNION ALL
SELECT 'Characters:', COUNT(*) FROM public.characters
UNION ALL
SELECT 'Scripts:', COUNT(*) FROM public.scripts
UNION ALL
SELECT 'Videos:', COUNT(*) FROM public.videos
UNION ALL
SELECT 'Voices:', COUNT(*) FROM public.voices;

