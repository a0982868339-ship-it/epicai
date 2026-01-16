<div align="center">

# EpicAI

**AI-Powered Short Drama Generator for TikTok & Reels**

Create viral series with consistent characters using AI. Built with Next.js, Supabase, and cutting-edge AI models. **Web3-native platform with EPIC token.**

[![Token](https://img.shields.io/badge/Token-EPIC-orange)](https://github.com/a0982868339-ship-it/epicai)

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

</div>

---

## ✨ Features

- 🎬 **AI Character Generation** - Create consistent characters using DALL-E 3 or Gemini 2.5
- 📝 **AI Script Generation** - Generate scene-by-scene scripts with GPT-4o
- 🎥 **AI Video Production** - Produce video clips using Kling AI or Google Veo
- 🎤 **Dual-Engine Voice Library** - Support OpenAI TTS and ElevenLabs for voice generation
- 🌍 **Multi-Language Support** - 9 languages (English, Chinese, Japanese, Korean, Thai, Spanish, Indonesian, German)
- 💳 **Credit System** - Flexible subscription plans (Free, Basic, Pro)
- 🎨 **Modern UI** - Beautiful, responsive design with dark mode support

---

## 🚀 Quickstart

### Prerequisites

- **Node.js** 20+ 
- **Docker Desktop** (for local Supabase)
- **npm** or **yarn**

### Step 1 – Install Dependencies

```bash
git clone https://github.com/yourusername/epicai.git
cd epicai
npm install
```

### Step 2 – Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase (auto-configured when running locally)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# OpenAI (for GPT-4o, DALL-E 3, and TTS)
OPENAI_API_KEY=sk-...

# Google Gemini (optional, for alternative models)
GEMINI_API_KEY=...

# ElevenLabs (optional, for premium voice generation)
ELEVENLABS_API_KEY=...

# Stripe (optional, for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
```

> **Note:** When running Supabase locally, the keys are automatically generated. Check `supabase status` after starting services.

### Step 3 – Start Supabase

```bash
# Start Docker Desktop first, then:
npm run db:start
```

This will start all Supabase services (database, auth, storage, etc.) in Docker containers.

> **Tip:** For quick local development, you can skip this step. The app will work without Supabase, but features like authentication and data persistence will be limited.

### Step 4 – Launch the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Database Options

Chat history, users, settings, projects, and all data live in Supabase (PostgreSQL). You can point EpicAI at any Supabase deployment.

### Local Supabase (Recommended for Development)

The project includes a complete Supabase setup that runs locally via Docker:

```bash
# Start services
npm run db:start

# Check status
npm run db:status

# Stop services
npm run db:stop

# Reset database
npm run db:reset
```

Local Supabase provides:
- **Studio UI**: http://127.0.0.1:54323
- **API URL**: http://127.0.0.1:54321
- **Auth URL**: http://127.0.0.1:54321/auth/v1

### Supabase Cloud (Production)

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Update `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 🎯 Core Workflow

EpicAI follows a **4-step creation workflow**:

1. **Project Setup** - Define name, platform (TikTok/Reels/Shorts), and story outline
2. **Character Generation** - Create consistent characters using AI image generation
3. **Script Generation** - Generate scene-by-scene scripts with dialogue
4. **Video Production** - Produce video clips with optional voiceover and music

### Example: Creating Your First Project

```bash
# 1. Start the app
npm run dev

# 2. Sign up / Login
# Visit http://localhost:3000/auth

# 3. Create a new project
# Click "New Project" in the dashboard

# 4. Follow the tab-based workflow:
#   - Step 1: Basic Info
#   - Step 2: Generate Characters
#   - Step 3: Generate Script
#   - Step 4: Produce Video
```

---

## 🎨 UI Features

- **Multi-Language Support**: Switch between 9 languages instantly
- **Dark Mode**: Beautiful dark theme with smooth transitions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Voice Library**: Manage and reuse voiceover materials across projects
- **Project Management**: Organize all your AI-generated content

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:start` | Start Supabase services |
| `npm run db:stop` | Stop Supabase services |
| `npm run db:status` | Check Supabase status |
| `npm run db:reset` | Reset database |

---

## 🏗️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Models**:
  - **Text**: GPT-4o (OpenAI), Gemini 2.5 (Google)
  - **Image**: DALL-E 3 (OpenAI), Gemini 2.5 (Google)
  - **Video**: Kling AI, Google Veo
  - **Voice**: OpenAI TTS, ElevenLabs
- **Icons**: [Lucide React](https://lucide.dev/)
- **Payments**: [Stripe](https://stripe.com/) (optional)

---

## 📁 Project Structure

```
epicai/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard
│   ├── project/           # Project workspace
│   └── voices/            # Voice library
├── components/            # React components
├── lib/                   # Utilities and contexts
│   ├── i18n.tsx          # Internationalization
│   ├── AuthContext.tsx    # Auth state
│   └── supabaseClient.ts  # Supabase client
├── supabase/              # Supabase config & migrations
│   ├── migrations/       # Database migrations
│   └── seed.sql          # Sample data
├── types.ts               # TypeScript types
└── public/                # Static assets
```

---

## 🌍 Internationalization

EpicAI supports **9 languages** out of the box:

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Complete |
| 简体中文 | `zh-CN` | ✅ Complete |
| 繁體中文 | `zh-TW` | ✅ Complete |
| 日本語 | `ja` | ✅ Complete |
| 한국어 | `ko` | ✅ Complete |
| ไทย | `th` | ✅ Complete |
| Español | `es` | ✅ Complete |
| Bahasa Indonesia | `id` | ✅ Complete |
| Deutsch | `de` | ✅ Complete |

Language selection persists across sessions via `localStorage`.

---

## 🎤 Voice Library

The **dual-engine voice library** supports:

- **OpenAI TTS**: 6 system voices (free tier)
- **ElevenLabs**: 3 premium voices (Pro users)
- **Voice Cloning**: Clone voices using ElevenLabs (Pro feature)

Generated audio clips are stored as "voiceover materials" with metadata:
- Project, episode, scene number
- Timestamp (start/end time)
- Character name and dialogue
- Voice provider and ID
- Favorite status and reuse count

---

## 🔐 Authentication

EpicAI uses Supabase Auth for authentication:

- **Email/Password**: Standard email authentication
- **Session Management**: Automatic session handling
- **Protected Routes**: Middleware-based route protection

### Test Accounts (Local Development)

After running `supabase start`, you can create test users via:
- Supabase Studio: http://127.0.0.1:54323
- Or use the sign-up form in the app

---

## 💳 Subscription Plans

| Plan | Price | Credits/Month | Features |
|------|-------|---------------|----------|
| **Free** | $0 | 10 | Basic features, standard speed |
| **Basic** | $39 | 20 | Standard speed, all features |
| **Pro** | $99 | 60 | Priority queue, private projects, voice cloning |

Additional credits: **10 credits for $10**

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Other Platforms

EpicAI can be deployed to any platform that supports Next.js:
- **Netlify**
- **Railway**
- **Render**
- **AWS Amplify**

> **Note:** For production, use Supabase Cloud instead of local Supabase.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/a0982868339-ship-it/epicai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/a0982868339-ship-it/epicai/discussions)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [OpenAI](https://openai.com/) for GPT-4o, DALL-E 3, and TTS
- [ElevenLabs](https://elevenlabs.io/) for premium voice generation
- [Kling AI](https://klingai.com/) for video generation
- [Lucide](https://lucide.dev/) for beautiful icons

---

<div align="center">

**Made with ❤️ for creators**

[⭐ Star us on GitHub](https://github.com/a0982868339-ship-it/epicai) • [📖 Documentation](#) • [🐛 Report Bug](https://github.com/a0982868339-ship-it/epicai/issues)

</div>
