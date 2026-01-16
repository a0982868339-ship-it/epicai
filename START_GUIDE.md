# 🚀 MiniEpic 快速启动指南

## ⚡ 一键启动（完整流程）

### 步骤 1: 启动 Docker Desktop
```bash
# 方式 1: 通过命令行启动（macOS）
open -a Docker

# 方式 2: 手动启动
# 在"应用程序"中找到 Docker，双击启动
# 等待 Docker 菜单栏图标变为绿色（约 10-30 秒）
```

### 步骤 2: 启动 Supabase
```bash
cd /Users/yangtianjun/miniepic
npm run db:start

# 等待约 30-60 秒，直到看到：
# ✓ Started supabase local development setup.
# API URL: http://127.0.0.1:54321
# Studio URL: http://127.0.0.1:54323
```

### 步骤 3: 启动开发服务器（如果未运行）
```bash
npm run dev

# 应该显示：
# ✓ Ready in 3.2s
# Local: http://localhost:3000
```

### 步骤 4: 访问应用
打开浏览器访问：http://localhost:3000

---

## 🔍 常见问题排查

### 问题 1: "Cannot connect to Docker daemon"
**原因**：Docker Desktop 未启动  
**解决**：启动 Docker Desktop 应用

### 问题 2: "ERR_CONNECTION_REFUSED" (端口 54321)
**原因**：Supabase 未启动  
**解决**：运行 `npm run db:start`

### 问题 3: 端口被占用
**原因**：之前的进程未关闭  
**解决**：
```bash
# 关闭端口 3000
lsof -ti:3000 | xargs kill -9

# 关闭 Supabase
npm run db:stop
npm run db:start
```

---

## 📊 服务状态检查

### 检查 Docker 状态
```bash
docker --version
docker ps
```

### 检查 Supabase 状态
```bash
docker ps | grep supabase
# 应该看到 13 个容器在运行
```

### 检查开发服务器
```bash
curl http://localhost:3000
# 应该返回 HTML
```

---

## 🎯 测试账号

登录后可以体验所有功能：

| 邮箱 | 密码 | 套餐 | 额度 |
|------|------|------|------|
| alice@example.com | password123 | Pro | 100 |
| bob@example.com | password123 | Free | 10 |

---

## 📚 主要功能

### ✅ 已实现的功能
- 🌍 9 种语言支持（实时切换）
- 👤 用户认证和会话管理
- 📁 项目管理（创建、查看、编辑）
- 🎭 角色管理（DALL-E 3 / Gemini 2.5）
- 📝 剧本创作（GPT-4o / Gemini）
- 🎬 视频制作（Kling AI / Google Veo）
- 🎤 双引擎配音库（OpenAI TTS + ElevenLabs）
- 💳 订阅和积分系统
- ⚙️ 设置和平台集成

### 🎙️ 配音库特色
- 配音素材追溯（项目、集数、镜头、时间戳）
- 6 个系统语音（OpenAI TTS）- 所有用户可用
- 3 个 Pro 语音（ElevenLabs）- Pro 专属
- 语音克隆功能 - Pro 专属
- 7 条样本数据已插入

---

## 🌐 重要链接

- **应用首页**: http://localhost:3000
- **登录页面**: http://localhost:3000/auth
- **仪表盘**: http://localhost:3000/dashboard
- **配音库**: http://localhost:3000/voices
- **Supabase Studio**: http://127.0.0.1:54323

---

## ⚙️ 环境变量（可选）

如果需要启用 AI 功能，在 `.env.local` 中配置：

```bash
# Supabase (已配置)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# OpenAI API (可选)
OPENAI_API_KEY=sk-proj-xxx

# ElevenLabs API (可选，Pro 功能)
ELEVENLABS_API_KEY=xxx

# Kling AI API (可选)
KLING_API_KEY=xxx
```

---

## 🎉 启动成功后

访问 http://localhost:3000 您将看到：
- 精美的深色主题首页
- 9 种语言切换器
- 完整的 AI 短剧创作工作流
- 配音素材管理系统

**祝您使用愉快！** 🚀


