
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/i18n';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Film, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            router.push('/dashboard');
        } else {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;
            // For production, you might want to wait for email verification
            // Usually SignUp signs you in automatically if email confirm is off
            router.push('/dashboard'); 
        }
    } catch (error: any) {
        console.error(error);
        setErrorMsg(error.message || 'Authentication failed');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="mb-8 flex flex-col items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
         <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
            <Film className="w-7 h-7 text-white" />
         </div>
         <span className="text-2xl font-bold text-slate-900 dark:text-white">{t('app.name')}</span>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl transition-colors duration-300">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-2">
            {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
        </h2>
        <p className="text-center text-slate-500 mb-6 text-sm">
            {isLogin ? 'Enter your details to access your workspace' : 'Start your journey with free credits'}
        </p>

        {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle size={16} />
                {errorMsg}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
             <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Email</label>
             <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-colors" 
                placeholder="you@example.com" 
             />
          </div>
          <div>
             <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Password</label>
             <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-colors" 
                placeholder="••••••••" 
             />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition mt-4 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading && <Loader2 className="animate-spin" size={20} />}
            {isLogin ? t('auth.signIn') : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
            <button 
                onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
                className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white underline transition"
            >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
        </div>
      </div>
    </div>
  );
}
