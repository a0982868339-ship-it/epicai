'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type Language = 'en' | 'zh-CN' | 'zh-TW' | 'ja' | 'ko' | 'th' | 'es' | 'id' | 'de';

export const LANGUAGES: { [key in Language]: string } = {
  'en': 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'ja': '日本語',
  'ko': '한국어',
  'th': 'ไทย',
  'es': 'Español',
  'id': 'Bahasa Indonesia',
  'de': 'Deutsch'
};

// 完整的翻译矩阵：[en, zh-CN, zh-TW, ja, ko, th, es, id, de]
const translationMatrix: Record<string, string[]> = {
  // App & Nav
  'app.name': ['EpicAI', 'EpicAI', 'EpicAI', 'EpicAI', 'EpicAI', 'EpicAI', 'EpicAI', 'EpicAI', 'EpicAI'],
  'nav.login': ['Login', '登录', '登錄', 'ログイン', '로그인', 'เข้าสู่ระบบ', 'Entrar', 'Masuk', 'Anmelden'],
  'nav.getStarted': ['Get Started', '立即开始', '立即開始', '開始する', '시작하기', 'เริ่มต้น', 'Empezar', 'Mulai', 'Loslegen'],
  'nav.dashboard': ['Dashboard', '仪表盘', '儀表盤', 'ダッシュボード', '대시보드', 'แดชบอร์ด', 'Panel', 'Dasbor', 'Dashboard'],
  'nav.projects': ['Projects', '项目管理', '項目管理', 'プロジェクト', '프로젝트', 'โปรเจกต์', 'Proyectos', 'Proyek', 'Projekte'],
  'nav.characters': ['Characters', '角色管理', '角色管理', 'キャラクター', '캐릭터', 'ตัวละคร', 'Personajes', 'Karakter', 'Charaktere'],
  'nav.scripts': ['Scripts', '剧本管理', '劇本管理', '台本', '스크립트', 'บท', 'Guiones', 'Skrip', 'Skripte'],
  'nav.videos': ['Videos', '视频管理', '視頻管理', '動画', '비디오', 'วิดีโอ', 'Videos', 'Video', 'Videos'],
  'nav.voices': ['Voices', '配音库', '配音庫', '音声', '음성', 'เสียง', 'Voces', 'Suara', 'Stimmen'],
  'nav.subscription': ['Subscription', '订阅', '訂閱', '購読', '구독', 'การสมัคร', 'Suscripción', 'Langganan', 'Abo'],
  'nav.settings': ['Settings', '设置', '設置', '設定', '설정', 'การตั้งค่า', 'Ajustes', 'Setelan', 'Einstellungen'],
  'nav.signOut': ['Sign Out', '退出', '退出', 'ログアウト', '로그아웃', 'ออกจากระบบ', 'Salir', 'Keluar', 'Abmelden'],
  'nav.creditsLabel': ['CREDITS', '额度', '額度', 'クレジット', '크레딧', 'เครดิต', 'CRÉDITOS', 'KREDIT', 'CREDITS'],
  'nav.credits_available': ['available', '可用', '可用', '利用可能', '사용 가능', 'ใช้งานได้', 'disponibles', 'tersedia', 'verfügbar'],
  
  // Auth & Dashboard
  'auth.welcomeBack': ['Welcome Back', '欢迎回来', '歡迎回來', 'おかえり', '환영합니다', 'ยินดีต้อนรับ', 'Bienvenido', 'Selamat Datang', 'Willkommen'],
  'auth.signIn': ['Sign In', '登录', '登錄', 'ログイン', '로그인', 'เข้าสู่ระบบ', 'Entrar', 'Masuk', 'Anmelden'],
  'dashboard.title': ['Dashboard', '仪表盘', '儀表盤', 'ダッシュボード', '대시보드', 'แดชบอร์ด', 'Panel', 'Dasbor', 'Dashboard'],
  'dashboard.newProject': ['New Project', '新建项目', '新建項目', '新規プロジェクト', '새 프로젝트', 'โปรเจกต์ใหม่', 'Nuevo Proyecto', 'Proyek Baru', 'Neues Projekt'],
  
  // Hero
  'hero.title': ['Consistent AI Short Dramas in Minutes.', '几分钟内生成角色一致的 AI 短剧', '幾分鐘內生成角色一致的 AI 短劇', 'AIで短編ドラマを制作', 'AI 숏폼 드라마', 'ละครสั้น AI', 'Dramas cortos de IA', 'Drama Pendek AI', 'KI-Kurzdramen'],
  'hero.subtitle': ['Create viral TikTok & Reels series with consistent characters.', '制作爆款系列剧。', '製作爆款系列劇。', 'バズる動画を作成', '인기 시리즈 제작', 'สร้างซีรีส์ยอดฮิต', 'Crea series virales', 'Buat seri viral', 'Virale Serien'],
  'hero.startFree': ['Start Creating Free', '免费开始', '免費開始', '無料で開始', '무료로 시작', 'เริ่มฟรี', 'Empezar Gratis', 'Mulai Gratis', 'Kostenlos starten'],
  
  // Pricing
  'pricing.basic.title': ['Basic', '基础版', '基礎版', 'ベーシック', '베이직', 'พื้นฐาน', 'Básico', 'Dasar', 'Basis'],
  'pricing.basic.desc': ['Perfect for individuals', '适合个人', '適合個人', '個人向け', '개인용', 'เหมาะสำหรับบุคคล', 'Para individuos', 'Untuk individu', 'Für Einzelpersonen'],
  'pricing.basic.price': ['$39', '$39', '$39', '$39', '$39', '$39', '$39', '$39', '$39'],
  'pricing.basic.unit': ['/mo', '/月', '/月', '/月', '/월', '/เดือน', '/mes', '/bulan', '/Monat'],
  'pricing.basic.feat1': ['20 Credits Monthly', '每月 20 额度', '每月 20 額度', '月間20クレジット', '월 20 크레딧', 'เครดิต 20/เดือน', '20 Créditos/mes', '20 Kredit/bulan', '20 Credits/Monat'],
  'pricing.basic.feat2': ['Standard Speed', '标准速度', '標準速度', '標準速度', '표준 속도', 'ความเร็วมาตรฐาน', 'Velocidad Estándar', 'Kecepatan Standar', 'Standardgeschwindigkeit'],
  'pricing.pro.title': ['Pro', '专业版', '專業版', 'プロ', '프로', 'โปร', 'Pro', 'Pro', 'Pro'],
  'pricing.pro.desc': ['For power creators', '高频创作者', '高頻創作者', 'パワークリエイター', '파워 크리에이터', 'ครีเอเตอร์มืออาชีพ', 'Para pros', 'Untuk pro', 'Für Profis'],
  'pricing.pro.price': ['$99', '$99', '$99', '$99', '$99', '$99', '$99', '$99', '$99'],
  'pricing.pro.unit': ['/mo', '/月', '/月', '/月', '/월', '/เดือน', '/mes', '/bulan', '/Monat'],
  'pricing.pro.feat1': ['60 Credits Monthly', '每月 60 额度', '每月 60 額度', '月間60クレジット', '월 60 크레딧', 'เครดิต 60/เดือน', '60 Créditos/mes', '60 Kredit/bulan', '60 Credits/Monat'],
  'pricing.pro.feat2': ['Priority Queue', '优先队列', '優先隊列', '優先キュー', '우선 대기열', 'คิวพิเศษ', 'Cola Prioritaria', 'Antrean Prioritas', 'Prioritätswarteschlange'],
  'pricing.pro.feat3': ['Private Projects', '私有项目', '私有項目', 'プライベート', '비공개 프로젝트', 'โปรเจกต์ส่วนตัว', 'Proyectos Privados', 'Proyek Pribadi', 'Private Projekte'],
  'pricing.pro.popular': ['MOST POPULAR', '最受欢迎', '最受歡迎', '一番人気', '가장 인기', 'ยอดนิยม', 'MÁS POPULAR', 'PALING POPULER', 'BELIEBTESTE'],
  'pricing.extra.title': ['More Credits?', '更多额度？', '更多額度？', 'もっと必要？', '크레딧 추가?', 'ต้องการเพิ่ม?', '¿Más Créditos?', 'Lebih Banyak?', 'Mehr Credits?'],
  'pricing.extra.desc': ['Buy packs anytime. 10 credits for $10.', '10 积分仅需 $10', '10 積分僅需 $10', '10クレジット$10', '10 크레딧 $10', '10 เครดิต $10', '10 créditos $10', '10 kredit $10', '10 Credits $10'],
  
  // Manage Pages
  'manage.projects.title': ['Project Management', '项目管理', '項目管理', 'プロジェクト管理', '프로젝트 관리', 'การจัดการโปรเจกต์', 'Gestión de Proyectos', 'Manajemen Proyek', 'Projektverwaltung'],
  'manage.projects.allProjects': ['All Projects', '所有项目', '所有項目', '全プロジェクト', '모든 프로젝트', 'ทุกโปรเจกต์', 'Todos', 'Semua Proyek', 'Alle Projekte'],
  'manage.characters.title': ['Character Management', '角色管理', '角色管理', 'キャラクター管理', '캐릭터 관리', 'การจัดการตัวละคร', 'Gestión de Personajes', 'Manajemen Karakter', 'Charakterverwaltung'],
  'manage.characters.create': ['Create Global Character', '创建全局角色', '創建全局角色', 'グローバルキャラクター作成', '전역 캐릭터 생성', 'สร้างตัวละครส่วนกลาง', 'Crear Personaje Global', 'Buat Karakter Global', 'Globalen Charakter erstellen'],
  'manage.characters.tabs.global': ['Global Library', '全局库', '全局庫', 'グローバル', '전역', 'ส่วนกลาง', 'Global', 'Global', 'Global'],
  'manage.characters.tabs.project': ['By Project', '按项目', '按項目', 'プロジェクト別', '프로젝트별', 'ตามโปรเจกต์', 'Por Proyecto', 'Per Proyek', 'Nach Projekt'],
  'manage.characters.empty.global': ['No global characters yet.', '暂无全局角色。', '暫無全局角色。', 'グローバルキャラクターなし', '전역 캐릭터 없음', 'ไม่มีตัวละครส่วนกลาง', 'Sin personajes globales', 'Belum ada karakter global', 'Keine globalen Charaktere'],
  'manage.characters.empty.project': ['No characters in this project.', '此项目无角色。', '此項目無角色。', 'キャラクターなし', '캐릭터 없음', 'ไม่มีตัวละคร', 'Sin personajes', 'Tidak ada karakter', 'Keine Charaktere'],
  'manage.characters.empty.create': ['Create your first one', '创建第一个', '創建第一個', '最初の1つを作成', '첫 번째 생성', 'สร้างตัวแรก', 'Crea el primero', 'Buat yang pertama', 'Ersten erstellen'],
  'manage.scripts.title': ['Script Management', '剧本管理', '劇本管理', '台本管理', '스크립트 관리', 'การจัดการบท', 'Gestión de Guiones', 'Manajemen Skrip', 'Skriptverwaltung'],
  'manage.scripts.empty': ['No scripts found.', '暂无剧本。', '暫無劇本。', '台本なし', '스크립트 없음', 'ไม่พบบท', 'Sin guiones', 'Skrip tidak ditemukan', 'Keine Skripte'],
  'manage.videos.title': ['Video Management', '视频管理', '視頻管理', '動画管理', '비디오 관리', 'การจัดการวิดีโอ', 'Gestión de Videos', 'Manajemen Video', 'Videoverwaltung'],
  'manage.videos.empty': ['No videos produced yet.', '暂无视频。', '暫無視頻。', '動画なし', '비디오 없음', 'ยังไม่มีวิดีโอ', 'Sin videos', 'Belum ada video', 'Keine Videos'],
  'manage.voices.title': ['Voice Library', '配音库', '配音庫', '音声ライブラリ', '음성 라이브러리', 'คลังเสียง', 'Biblioteca de Voces', 'Perpustakaan Suara', 'Stimmenbibliothek'],
  'manage.voices.clone': ['Clone Voice', '克隆语音', '克隆語音', '音声クローン', '음성 복제', 'คลอนเสียง', 'Clonar Voz', 'Kloning Suara', 'Stimme klonen'],
  'manage.voices.filter.all': ['All Voices', '所有语音', '所有語音', 'すべての音声', '모든 음성', 'เสียงทั้งหมด', 'Todas las Voces', 'Semua Suara', 'Alle Stimmen'],
  'manage.voices.filter.custom': ['My Voices', '我的语音', '我的語音', 'マイボイス', '내 음성', 'เสียงของฉัน', 'Mis Voces', 'Suara Saya', 'Meine Stimmen'],
  'manage.voices.custom': ['CUSTOM', '自定义', '自定義', 'カスタム', '사용자 정의', 'กำหนดเอง', 'PERSONALIZADA', 'KUSTOM', 'EIGENE'],
  'manage.voices.system': ['SYSTEM', '系统', '系統', 'システム', '시스템', 'ระบบ', 'SISTEMA', 'SISTEM', 'SYSTEM'],
  'manage.voices.nameLabel': ['Voice Name', '语音名称', '語音名稱', '音声名', '음성 이름', 'ชื่อเสียง', 'Nombre de Voz', 'Nama Suara', 'Stimmenname'],
  'manage.voices.projectLabel': ['Assign to Project', '分配到项目', '分配到項目', 'プロジェクトに割り当て', '프로젝트에 할당', 'กำหนดให้โปรเจกต์', 'Asignar a Proyecto', 'Tetapkan ke Proyek', 'Zu Projekt zuweisen'],
  'manage.voices.globalOption': ['Global (All Projects)', '全局（所有项目）', '全局（所有項目）', 'グローバル（全プロジェクト）', '전역 (모든 프로젝트)', 'ส่วนกลาง (ทุกโปรเจกต์)', 'Global (Todos)', 'Global (Semua Proyek)', 'Global (Alle Projekte)'],
  'manage.voices.uploadLabel': ['Upload Voice Sample', '上传语音样本', '上傳語音樣本', '音声サンプルをアップロード', '음성 샘플 업로드', 'อัปโหลดตัวอย่างเสียง', 'Subir Muestra de Voz', 'Unggah Sampel Suara', 'Stimmprobe hochladen'],
  'manage.voices.cloning': ['Cloning...', '克隆中...', '克隆中...', 'クローン中...', '복제 중...', 'กำลังคลอน...', 'Clonando...', 'Mengkloning...', 'Wird geklont...'],
  
  // Workspace
  'workspace.tabs.roles': ['Characters', '角色管理', '角色管理', 'キャラクター', '캐릭터', 'ตัวละคร', 'Personajes', 'Karakter', 'Charaktere'],
  'workspace.tabs.script': ['Script', '剧本创作', '劇本創作', '台本作成', '스크립트 작성', 'เขียนบท', 'Guion', 'Skrip', 'Skript'],
  'workspace.tabs.video': ['Video', '视频制作', '視頻製作', '動画制作', '비디오 제작', 'สร้างวิดีโอ', 'Video', 'Video', 'Video'],
  'workspace.roles.title': ['Character Creator', '生成角色', '生成角色', 'キャラクター作成', '캐릭터 생성', 'สร้างตัวละคร', 'Crear Personaje', 'Buat Karakter', 'Charakter erstellen'],
  'workspace.roles.projectTitle': ['Project Characters', '项目角色', '項目角色', 'プロジェクトキャラクター', '프로젝트 캐릭터', 'ตัวละครโปรเจกต์', 'Personajes del Proyecto', 'Karakter Proyek', 'Projekt-Charaktere'],
  'workspace.roles.globalTitle': ['Global Library', '全局库', '全局庫', 'グローバルライブラリ', '전역 라이브러리', 'คลังส่วนกลาง', 'Biblioteca Global', 'Perpustakaan Global', 'Globale Bibliothek'],
  'workspace.roles.noCharacters': ['No characters.', '暂无角色。', '暫無角色。', 'キャラクターなし', '캐릭터 없음', 'ไม่มีตัวละคร', 'Sin personajes', 'Tidak ada karakter', 'Keine Charaktere'],
  'workspace.roles.noGlobal': ['No global characters.', '暂无全局角色。', '暫無全局角色。', 'グローバルキャラクターなし', '전역 캐릭터 없음', 'ไม่มีตัวละครส่วนกลาง', 'Sin personajes globales', 'Tidak ada karakter global', 'Keine globalen Charaktere'],
  'workspace.roles.nameLabel': ['Character Name', '角色名称', '角色名稱', 'キャラクター名', '캐릭터 이름', 'ชื่อตัวละคร', 'Nombre', 'Nama Karakter', 'Name'],
  'workspace.roles.namePlaceholder': ['e.g. Cyberpunk Hero', '例如：赛博英雄', '例如：賽博英雄', '例: サイバーヒーロー', '예: 사이버 히어로', 'เช่น: ฮีโร่ไซเบอร์', 'ej. Héroe', 'mis. Pahlawan', 'z.B. Held'],
  'workspace.roles.descLabel': ['Character Description', '角色描述', '角色描述', 'キャラクター説明', '캐릭터 설명', 'คำอธิบายตัวละคร', 'Descripción', 'Deskripsi', 'Beschreibung'],
  'workspace.roles.descPlaceholder': ['Describe visuals...', '描述细节...', '描述細節...', 'ビジュアル説明...', '세부 사항 설명...', 'อธิบายภาพ...', 'Describe lo visual...', 'Deskripsikan...', 'Beschreiben...'],
  'workspace.roles.generateBtn': ['Generate (DALL-E 3)', '生成角色 (DALL-E 3)', '生成角色 (DALL-E 3)', '生成 (DALL-E 3)', '생성 (DALL-E 3)', 'สร้าง (DALL-E 3)', 'Generar (DALL-E 3)', 'Hasilkan (DALL-E 3)', 'Generieren (DALL-E 3)'],
  'workspace.roles.generating': ['Generating...', '生成中...', '生成中...', '生成中...', '생성 중...', 'กำลังสร้าง...', 'Generando...', 'Menghasilkan...', 'Wird generiert...'],
  'workspace.roles.model.image': ['Image Model', '图像模型', '圖像模型', '画像モデル', '이미지 모델', 'โมเดลภาพ', 'Modelo de Imagen', 'Model Gambar', 'Bildmodell'],
  'workspace.roles.model.dalle': ['DALL-E 3', 'DALL-E 3', 'DALL-E 3', 'DALL-E 3', 'DALL-E 3', 'DALL-E 3', 'DALL-E 3', 'DALL-E 3', 'DALL-E 3'],
  'workspace.roles.model.gemini': ['Gemini 2.5', 'Gemini 2.5', 'Gemini 2.5', 'Gemini 2.5', 'Gemini 2.5', 'Gemini 2.5', 'Gemini 2.5', 'Gemini 2.5', 'Gemini 2.5'],
  'workspace.script.storyOutline': ['Story Outline', '故事大纲', '故事大綱', 'ストーリー概要', '스토리 개요', 'เค้าโครงเรื่อง', 'Esquema', 'Garis Besar', 'Handlungsskizze'],
  'workspace.script.generateBtn': ['Generate with GPT-4o', '使用 GPT-4o 生成', '使用 GPT-4o 生成', 'GPT-4oで生成', 'GPT-4o로 생성', 'สร้างด้วย GPT-4o', 'Generar con GPT-4o', 'Hasilkan dengan GPT-4o', 'Mit GPT-4o generieren'],
  'workspace.script.empty': ['No script yet.', '暂无剧本。', '暫無劇本。', '台本なし', '스크립트 없음', 'ยังไม่มีบท', 'Sin guion', 'Belum ada skrip', 'Kein Skript'],
  'workspace.script.previewTitle': ['Script Preview', '剧本预览', '劇本預覽', '台本プレビュー', '스크립트 미리보기', 'ตัวอย่างบท', 'Vista Previa', 'Pratinjau Skrip', 'Skriptvorschau'],
  'workspace.script.scene': ['Scene', '场景', '場景', 'シーン', '장면', 'ฉาก', 'Escena', 'Adegan', 'Szene'],
  'workspace.script.injected': ['Characters injected:', '已注入角色:', '已注入角色:', '注入されたキャラクター:', '주입된 캐릭터:', 'ตัวละครที่ใส่:', 'Personajes inyectados:', 'Karakter yang diinjeksi:', 'Injizierte Charaktere:'],
  'workspace.script.placeholder': ['Enter your story logline...', '请输入故事创意...', '請輸入故事創意...', 'ストーリーを入力...', '스토리 입력...', 'ใส่เรื่องราว...', 'Ingrese su historia...', 'Masukkan cerita...', 'Geben Sie Ihre Story ein...'],
  'workspace.video.productionTitle': ['Video Production', '视频生产', '視頻生產', '動画制作', '비디오 제작', 'การผลิตวิดีโอ', 'Producción', 'Produksi Video', 'Videoproduktion'],
  'workspace.video.requiredScript': ['Script Required', '需要剧本', '需要劇本', '台本が必要', '스크립트 필요', 'ต้องการบท', 'Se Requiere Guion', 'Skrip Diperlukan', 'Skript erforderlich'],
  'workspace.video.goToScript': ['Go to Scripting', '前往剧本编写', '前往劇本編寫', '台本作成へ', '스크립트로 이동', 'ไปที่การเขียนบท', 'Ir a Guionización', 'Ke Penulisan Skrip', 'Zum Skript'],
  'workspace.video.oneClick': ['One-Click Production', '一键生成', '一鍵生成', 'ワンクリック制作', '원클릭 제작', 'สร้างคลิกเดียว', 'Producción de 1 Clic', 'Produksi 1 Klik', 'Ein-Klick-Produktion'],
  'workspace.video.engine': ['Engine', '引擎', '引擎', 'エンジン', '엔진', 'เครื่องมือ', 'Motor', 'Mesin', 'Engine'],
  'workspace.video.auto': ['Auto', '自动', '自動', '自動', '자동', 'อัตโนมัติ', 'Auto', 'Otomatis', 'Auto'],
  'workspace.video.pro': ['Pro', '专业', '專業', 'プロ', '프로', 'มืออาชีพ', 'Pro', 'Pro', 'Pro'],
  'workspace.video.kling': ['Kling AI', '可灵', '可靈', 'Kling AI', 'Kling AI', 'Kling AI', 'Kling AI', 'Kling AI', 'Kling AI'],
  'workspace.video.veo': ['Google Veo', 'Google Veo', 'Google Veo', 'Google Veo', 'Google Veo', 'Google Veo', 'Google Veo', 'Google Veo', 'Google Veo'],
  'workspace.video.generateWith': ['Generate with', '生成引擎', '生成引擎', '生成エンジン', '생성 엔진', 'สร้างด้วย', 'Generar con', 'Hasilkan dengan', 'Generieren mit'],
  'workspace.video.generating': ['Generating...', '生成中...', '生成中...', '生成中...', '생성 중...', 'กำลังสร้าง...', 'Generando...', 'Menghasilkan...', 'Wird generiert...'],
  'workspace.video.ready': ['Ready to Produce', '准备就绪', '準備就緒', '制作準備完了', '제작 준비 완료', 'พร้อมผลิต', 'Listo para Producir', 'Siap Memproduksi', 'Bereit'],
  'workspace.video.complete': ['Video ready!', '视频就绪！', '視頻就緒！', '動画完成！', '비디오 완료!', 'วิดีโอพร้อม!', '¡Video listo!', 'Video siap!', 'Video bereit!'],
  'workspace.video.preview': ['Preview', '预览', '預覽', 'プレビュー', '미리보기', 'ตัวอย่าง', 'Vista Previa', 'Pratinjau', 'Vorschau'],
  'workspace.alert.insufficient': ['Insufficient credits', '额度不足', '額度不足', 'クレジット不足', '크레딧 부족', 'เครดิตไม่พอ', 'Créditos insuficientes', 'Kredit tidak cukup', 'Unzureichende Credits'],
  
  // Account
  'account.title': ['Account', '账户', '賬戶', 'アカウント', '계정', 'บัญชี', 'Cuenta', 'Akun', 'Konto'],
  'account.currentPlan': ['Current Plan', '当前套餐', '當前套餐', '現在のプラン', '현재 요금제', 'แผนปัจจุบัน', 'Plan Actual', 'Paket Saat Ini', 'Aktueller Plan'],
  'account.active': ['Active', '活跃', '活躍', '有効', '활성', 'เปิดใช้งาน', 'Activo', 'Aktif', 'Aktiv'],
  'account.creditsAvailable': ['Credits Available', '可用额度', '可用額度', '利用可能クレジット', '사용 가능 크레딧', 'เครดิตที่ใช้ได้', 'Créditos Disponibles', 'Kredit Tersedia', 'Verfügbare Credits'],
  'account.topUp': ['Top Up Credits', '充值额度', '充值額度', 'クレジット補充', '크레딧 충전', 'เติมเครดิต', 'Recargar', 'Isi Ulang Kredit', 'Credits aufladen'],
  'account.credits': ['credits', '额度', '額度', 'クレジット', '크레딧', 'เครดิต', 'créditos', 'kredit', 'Credits'],
  'account.desc.10': ['Perfect for trying out', '适合试用', '適合試用', 'お試し用', '체험용', 'เหมาะสำหรับทดลอง', 'Perfecto para probar', 'Sempurna untuk mencoba', 'Perfekt zum Ausprobieren'],
  'account.desc.30': ['Best value', '最佳选择', '最佳選擇', '最適', '최적', 'คุ้มค่าที่สุด', 'Mejor valor', 'Nilai terbaik', 'Bester Wert'],
  'account.desc.70': ['Maximum savings', '最大优惠', '最大優惠', '最大割引', '최대 절약', 'ประหยัดสูงสุด', 'Ahorro máximo', 'Hemat maksimal', 'Maximale Ersparnis'],
  'account.free': ['free', '赠送', '贈送', '無料', '무료', 'ฟรี', 'gratis', 'gratis', 'gratis'],
  'account.upgrade': ['Subscription Plans', '订阅套餐', '訂閱套餐', 'サブスクリプション', '구독 요금제', 'แผนการสมัคร', 'Planes', 'Paket Langganan', 'Abonnement-Pläne'],
  'account.feature.monthlyCredits': ['monthly credits', '每月额度', '每月額度', '月間クレジット', '월간 크레딧', 'เครดิตรายเดือน', 'créditos mensuales', 'kredit bulanan', 'monatliche Credits'],
  'account.feature.stdSpeed': ['Standard speed', '标准速度', '標準速度', '標準速度', '표준 속도', 'ความเร็วมาตรฐาน', 'velocidad estándar', 'kecepatan standar', 'Standardgeschwindigkeit'],
  'account.feature.priority': ['Priority generation', '优先生成', '優先生成', '優先生成', '우선 생성', 'สร้างเร็วกว่า', 'generación prioritaria', 'generasi prioritas', 'Priorisiert'],
  'account.feature.private': ['Private projects', '私有项目', '私有項目', 'プライベート', '비공개 프로젝트', 'โปรเจกต์ส่วนตัว', 'proyectos privados', 'proyek pribadi', 'Private Projekte'],
  'account.switchTo': ['Switch to', '切换至', '切換至', 'に切替', '으로 전환', 'สลับไป', 'Cambiar a', 'Ganti ke', 'Wechseln zu'],
  
  // Settings
  'settings.title': ['Settings', '设置', '設置', '設定', '설정', 'การตั้งค่า', 'Ajustes', 'Setelan', 'Einstellungen'],
  'settings.profile.title': ['Profile Information', '个人信息', '個人信息', 'プロフィール情報', '프로필 정보', 'ข้อมูลโปรไฟล์', 'Información del Perfil', 'Informasi Profil', 'Profilinformationen'],
  'settings.profile.name': ['Name', '姓名', '姓名', '名前', '이름', 'ชื่อ', 'Nombre', 'Nama', 'Name'],
  'settings.profile.email': ['Email', '邮箱', '郵箱', 'メール', '이메일', 'อีเมล', 'Email', 'Email', 'E-Mail'],
  'settings.profile.save': ['Save Changes', '保存更改', '保存更改', '変更を保存', '변경사항 저장', 'บันทึกการเปลี่ยนแปลง', 'Guardar Cambios', 'Simpan Perubahan', 'Änderungen speichern'],
  'settings.security.title': ['Security', '安全设置', '安全設置', 'セキュリティ', '보안', 'ความปลอดภัย', 'Seguridad', 'Keamanan', 'Sicherheit'],
  'settings.security.success': ['Password updated!', '密码已更新！', '密碼已更新！', 'パスワード更新完了！', '비밀번호 업데이트 완료!', 'รหัสผ่านอัปเดตแล้ว!', '¡Contraseña actualizada!', 'Kata sandi diperbarui!', 'Passwort aktualisiert!'],
  'settings.security.changePassword': ['Change Password', '修改密码', '修改密碼', 'パスワード変更', '비밀번호 변경', 'เปลี่ยนรหัสผ่าน', 'Cambiar Contraseña', 'Ganti Kata Sandi', 'Passwort ändern'],
  'settings.security.verifyDesc': ['Verify identity', '验证身份', '驗證身份', '本人確認', '본인 인증', 'ยืนยันตัวตน', 'Verificar identidad', 'Verifikasi identitas', 'Identität bestätigen'],
  'settings.security.sendCode': ['Send Code', '发送验证码', '發送驗證碼', 'コード送信', '코드 전송', 'ส่งรหัส', 'Enviar Código', 'Kirim Kode', 'Code senden'],
  'settings.security.enterCode': ['Enter Verification Code', '输入验证码', '輸入驗證碼', '認証コード入力', '인증 코드 입력', 'ใส่รหัสยืนยัน', 'Introducir Código', 'Masukkan Kode', 'Code eingeben'],
  'settings.security.sent': ['Code sent to', '验证码已发送至', '驗證碼已發送至', 'コード送信先:', '코드 전송:', 'ส่งรหัสไปที่', 'Código enviado a', 'Kode terkirim ke', 'Code gesendet an'],
  'settings.security.codePlaceholder': ['000000', '000000', '000000', '000000', '000000', '000000', '000000', '000000', '000000'],
  'settings.security.verify': ['Verify', '验证', '驗證', '認証', '인증', 'ยืนยัน', 'Verificar', 'Verifikasi', 'Verifizieren'],
  'settings.security.newPassword': ['New Password', '新密码', '新密碼', '新しいパスワード', '새 비밀번호', 'รหัสผ่านใหม่', 'Nueva Contraseña', 'Kata Sandi Baru', 'Neues Passwort'],
  'settings.security.confirmPassword': ['Confirm Password', '确认密码', '確認密碼', 'パスワード確認', '비밀번호 확인', 'ยืนยันรหัสผ่าน', 'Confirmar Contraseña', 'Konfirmasi Kata Sandi', 'Passwort bestätigen'],
  'settings.security.updatePassword': ['Update Password', '更新密码', '更新密碼', 'パスワード更新', '비밀번호 업데이트', 'อัปเดตรหัสผ่าน', 'Actualizar Contraseña', 'Perbarui Kata Sandi', 'Passwort aktualisieren'],
  'settings.integrations.title': ['Platform Integrations', '平台集成', '平台集成', 'プラットフォーム連携', '플랫폼 통합', 'การเชื่อมต่อแพลตฟอร์ม', 'Integraciones de Plataforma', 'Integrasi Platform', 'Plattform-Integrationen'],
  'settings.integrations.desc': ['Connect your social accounts', '连接社交媒体账号', '連接社交媒體賬號', 'SNSアカウント連携', '소셜 미디어 연결', 'เชื่อมต่อบัญชีโซเชียล', 'Conecta tus cuentas sociales', 'Hubungkan akun sosial', 'Soziale Konten verbinden'],
  'settings.integrations.connected': ['Connected', '已连接', '已連接', '連携済み', '연결됨', 'เชื่อมต่อแล้ว', 'Conectado', 'Terhubung', 'Verbunden'],
  'settings.integrations.disconnect': ['Disconnect', '断开连接', '斷開連接', '連携解除', '연결 해제', 'ยกเลิกการเชื่อมต่อ', 'Desconectar', 'Putuskan', 'Trennen'],
  'settings.integrations.connect': ['Connect', '连接', '連接', '連携する', '연결', 'เชื่อมต่อ', 'Conectar', 'Hubungkan', 'Verbinden'],
  
  // Modal
  'modal.cancel': ['Cancel', '取消', '取消', 'キャンセル', '취소', 'ยกเลิก', 'Cancelar', 'Batal', 'Abbrechen'],
  'modal.create': ['Create', '创建', '創建', '作成', '생성', 'สร้าง', 'Crear', 'Buat', 'Erstellen'],
  'modal.save': ['Save', '保存', '保存', '保存', '저장', 'บันทึก', 'Guardar', 'Simpan', 'Speichern'],
};

// 自动生成翻译对象
const generateTranslations = () => {
  const langs: Language[] = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'th', 'es', 'id', 'de'];
  const result: Record<string, Record<string, string>> = {};
  
  langs.forEach((lang, langIndex) => {
    result[lang] = {};
    Object.keys(translationMatrix).forEach(key => {
      result[lang][key] = translationMatrix[key][langIndex];
    });
  });
  
  return result;
};

const translations = generateTranslations();

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
        const savedLang = localStorage.getItem('miniepic_lang') as Language;
        if (savedLang && LANGUAGES[savedLang]) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('miniepic_lang', lang);
  }, []);

  const t = useCallback((key: string) => {
    const dict = translations[language] || translations['en'];
    return dict[key] || translations['en'][key] || key;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
