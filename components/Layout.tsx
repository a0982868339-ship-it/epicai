'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Film, CreditCard, LogOut, FileText, Users, Video, FolderOpen, Settings, Mic } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/i18n';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  const navItems = [
    { to: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'nav.projects', icon: FolderOpen },
    { to: '/characters', label: 'nav.characters', icon: Users },
    { to: '/scripts', label: 'nav.scripts', icon: FileText },
    { to: '/videos', label: 'nav.videos', icon: Video },
    { to: '/voices', label: 'nav.voices', icon: Mic },
    { to: '/account', label: 'nav.subscription', icon: CreditCard },
    { to: '/settings', label: 'nav.settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans transition-colors duration-200">
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex transition-colors duration-200">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-md">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            {t('app.name')}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                href={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
                  isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <item.icon size={20} />
                {t(item.label)}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex gap-2">
            <LanguageSelector className="flex-1" />
            <ThemeToggle />
          </div>
          <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">{t('nav.creditsLabel')}</p>
            <div className="flex justify-between items-end">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{user?.total_credits || 0}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('nav.credits_available')}</span>
            </div>
            <div className="w-full bg-slate-300 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                <div className="bg-secondary h-1.5 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <LogOut size={18} /> {t('nav.signOut')}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto relative">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};