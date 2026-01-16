'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Film, Zap } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';

export default function LandingPage() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-primary/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              {t('app.name')}
            </span>
          </div>

          <div className="flex gap-6 items-center">
            <ThemeToggle />
            <LanguageSelector className="w-40 hidden md:block" />
            <div className="h-6 w-px bg-white/10 hidden md:block" />
            <button 
              onClick={() => router.push('/auth')} 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              {t('nav.login')}
            </button>
            <button 
              onClick={() => router.push('/auth')} 
              className="bg-white text-slate-950 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
            >
              {t('nav.getStarted')}
            </button>
        </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-6 pt-40 pb-20">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 flex flex-col items-center">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
          {t('hero.title')}
            </span>
        </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>

          <div className="pt-4 flex justify-center w-full">
            <button 
              onClick={() => router.push('/auth')} 
              className="bg-primary hover:bg-primary/90 text-white px-10 py-5 rounded-full font-bold text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-primary/25 btn-glow"
            >
              <Zap size={24} fill="currentColor" /> 
              {t('hero.startFree')}
          </button>
          </div>

          {/* Pricing / Features Brief */}
          <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl border-t border-white/5 mt-20">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left transition-colors hover:bg-white/10">
              <h3 className="font-bold text-lg mb-2 text-white">{t('pricing.basic.title')}</h3>
              <p className="text-slate-400 text-sm mb-4">{t('pricing.basic.desc')}</p>
              <div className="text-3xl font-bold text-white mb-4">{t('pricing.basic.price')}<span className="text-sm font-normal text-slate-500">{t('pricing.basic.unit')}</span></div>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>• {t('pricing.basic.feat1')}</li>
                <li>• {t('pricing.basic.feat2')}</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 text-left relative overflow-hidden transition-all hover:bg-primary/20 group">
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">
                {t('pricing.pro.popular')}
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">{t('pricing.pro.title')}</h3>
              <p className="text-slate-400 text-sm mb-4">{t('pricing.pro.desc')}</p>
              <div className="text-3xl font-bold text-white mb-4 group-hover:scale-110 transition-transform origin-left">{t('pricing.pro.price')}<span className="text-sm font-normal text-slate-500">{t('pricing.pro.unit')}</span></div>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>• {t('pricing.pro.feat1')}</li>
                <li>• {t('pricing.pro.feat2')}</li>
                <li>• {t('pricing.pro.feat3')}</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left flex flex-col justify-center items-center text-center transition-colors hover:bg-white/10">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary">
                <Film className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">{t('pricing.extra.title')}</h3>
              <p className="text-slate-400 text-sm">
                {t('pricing.extra.desc')}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative background element */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
    </div>
  );
}
