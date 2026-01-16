import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/i18n';
import { ThemeToggle } from '../components/ThemeToggle';
import { Film } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(); // Mock sign in
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      
      {/* Absolute positioning for top right controls */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="mb-8 flex flex-col items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
         <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
            <Film className="w-7 h-7 text-white" />
         </div>
         <span className="text-2xl font-bold text-slate-900 dark:text-white">{t('app.name')}</span>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl transition-colors duration-300">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-2">
            {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-8">
            {isLogin ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('auth.email')}</label>
            <input 
                type="email" 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-colors" 
                placeholder={t('auth.emailPlaceholder')} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('auth.password')}</label>
            <input 
                type="password" 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-colors" 
                placeholder={t('auth.passwordPlaceholder')} 
            />
          </div>
          
          <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition mt-4 shadow-lg shadow-primary/20">
            {isLogin ? t('auth.signIn') : t('auth.signUp')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white underline transition-colors"
          >
            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
          </button>
        </div>
      </div>
    </div>
  );
}