'use client';

import React from 'react';
import { AuthProvider } from '../lib/AuthContext';
import { ThemeProvider } from '../lib/ThemeContext';
import { LanguageProvider } from '../lib/i18n';
import { DataProvider } from '../lib/DataContext';
import { ToastProvider } from '../lib/ToastContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <DataProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </DataProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}