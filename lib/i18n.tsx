'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Locale = 'en' | 'tr' | 'es' | 'fr' | 'de';

export const LOCALES: { code: Locale; flag: string; label: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'tr', flag: '🇹🇷', label: 'TR' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'de', flag: '🇩🇪', label: 'DE' },
];

type Messages = Record<string, string>;

// Import all message files
import en from '@/messages/en.json';
import tr from '@/messages/tr.json';
import es from '@/messages/es.json';
import fr from '@/messages/fr.json';
import de from '@/messages/de.json';

const ALL_MESSAGES: Record<Locale, Messages> = { en, tr, es, fr, de };

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('hoopsbox-locale') as Locale | null;
    if (!saved || !ALL_MESSAGES[saved]) return;
    const id = window.setTimeout(() => setLocaleState(saved), 0);
    return () => window.clearTimeout(id);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('hoopsbox-locale', l);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let msg = ALL_MESSAGES[locale][key] ?? ALL_MESSAGES['en'][key] ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        msg = msg.replace(`{${k}}`, String(v));
      });
    }
    return msg;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
