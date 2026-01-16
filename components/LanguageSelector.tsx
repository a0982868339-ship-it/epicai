'use client';

import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage, LANGUAGES, Language } from '../lib/i18n';

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none">
        <Globe size={16} />
      </div>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className={`w-full appearance-none bg-white dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full py-2 pl-9 pr-8 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer transition-all`}
      >
        {Object.entries(LANGUAGES).map(([code, name]) => (
          <option key={code} value={code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
            {name}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none">
         <ChevronDown size={14} />
      </div>
    </div>
  );
};