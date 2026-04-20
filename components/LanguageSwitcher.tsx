'use client';

import { useI18n, LOCALES } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-1">
      {LOCALES.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          title={label}
          className={[
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all',
            locale === code
              ? 'bg-orange-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700',
          ].join(' ')}
        >
          <span>{flag}</span>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
