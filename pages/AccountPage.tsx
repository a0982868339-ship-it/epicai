import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/i18n';
import { Check, CreditCard, Zap } from 'lucide-react';
import { PRICES } from '../types';

export default function AccountPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleBuyCredits = (amount: number, price: number) => {
    alert(`Redirecting to Stripe Checkout for $${price} (${amount} credits)...`);
    // Logic: Stripe checkout session creation -> redirect
  };

  const handleSubscribe = (plan: 'basic' | 'pro') => {
      alert(`Upgrading to ${plan.toUpperCase()} plan...`);
  }

  // Helper to get translated plan name
  const getPlanName = (plan: string | undefined) => {
    if (!plan) return '';
    return t(`pricing.${plan}.title`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{t('account.title')}</h1>

      {/* Current Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-10 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase mb-1">{t('account.currentPlan')}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
            {getPlanName(user?.subscription_plan)} <span className="text-xs bg-primary px-2 py-1 rounded-full text-white">{t('account.active')}</span>
          </p>
        </div>
        <div className="text-right">
             <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase mb-1">{t('account.creditsAvailable')}</p>
             <p className="text-3xl font-bold text-secondary">{user?.total_credits}</p>
        </div>
      </div>

      {/* Credit Packs */}
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('account.topUp')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Pack 10 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer shadow-sm" onClick={() => handleBuyCredits(10, PRICES.credit10)}>
            <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg text-slate-900 dark:text-white">10 {t('account.credits')}</span>
                <span className="text-primary font-bold">${PRICES.credit10}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('account.desc.10')}</p>
        </div>

        {/* Pack 30 (Featured) */}
        <div className="bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-800 border border-secondary/50 p-6 rounded-xl hover:border-secondary transition cursor-pointer relative overflow-hidden shadow-md" onClick={() => handleBuyCredits(30, PRICES.credit30)}>
            <div className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded-bl">+20% {t('account.free')}</div>
            <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg text-slate-900 dark:text-white">30 {t('account.credits')}</span>
                <span className="text-secondary font-bold">${PRICES.credit30}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t('account.desc.30')}</p>
        </div>

        {/* Pack 70 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer relative overflow-hidden shadow-sm" onClick={() => handleBuyCredits(70, PRICES.credit70)}>
            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-bl">+40% {t('account.free')}</div>
            <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg text-slate-900 dark:text-white">70 {t('account.credits')}</span>
                <span className="text-primary font-bold">${PRICES.credit70}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('account.desc.70')}</p>
        </div>
      </div>

      {/* Subscription Plans */}
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('account.upgrade')}</h2>
      <div className="grid md:grid-cols-2 gap-8">
          {/* Basic */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-8 bg-white dark:bg-slate-900/50 shadow-sm">
             <div className="flex justify-between items-baseline mb-4">
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('pricing.basic.title')}</h3>
                 <span className="text-xl text-slate-500 dark:text-slate-400">$39/mo</span>
             </div>
             <ul className="space-y-3 mb-8 text-slate-600 dark:text-slate-300">
                 <li className="flex gap-2"><Check className="text-primary" size={18}/> 20 {t('account.feature.monthlyCredits')}</li>
                 <li className="flex gap-2"><Check className="text-primary" size={18}/> {t('account.feature.stdSpeed')}</li>
             </ul>
             <button onClick={() => handleSubscribe('basic')} className="w-full py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition">{t('account.switchTo')} {t('pricing.basic.title')}</button>
          </div>

          {/* Pro */}
          <div className="border border-primary rounded-xl p-8 bg-white dark:bg-slate-900 shadow-xl shadow-primary/5 dark:shadow-none relative">
             <div className="flex justify-between items-baseline mb-4">
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('pricing.pro.title')}</h3>
                 <span className="text-xl text-slate-500 dark:text-slate-400">$99/mo</span>
             </div>
             <ul className="space-y-3 mb-8 text-slate-600 dark:text-slate-300">
                 <li className="flex gap-2"><Check className="text-primary" size={18}/> 60 {t('account.feature.monthlyCredits')}</li>
                 <li className="flex gap-2"><Check className="text-primary" size={18}/> {t('account.feature.priority')}</li>
                 <li className="flex gap-2"><Check className="text-primary" size={18}/> {t('account.feature.private')}</li>
             </ul>
             <button onClick={() => handleSubscribe('pro')} className="w-full py-2 bg-primary rounded-lg text-white hover:bg-primary/90 font-bold transition shadow-lg shadow-primary/20">{t('account.switchTo')} {t('pricing.pro.title')}</button>
          </div>
      </div>

    </div>
  );
}