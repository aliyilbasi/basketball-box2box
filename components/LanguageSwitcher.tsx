'use client';

import { useI18n, LOCALES } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const activeLocale = LOCALES.find(({ code }) => code === locale) ?? LOCALES[0];

  return (
    <div className="header-select-wrap">
      <label className="sr-only" htmlFor="header-language-switcher">
        Language
      </label>
      <span className="header-select-flag" aria-hidden="true">
        {activeLocale.flag}
      </span>
      <select
        id="header-language-switcher"
        value={locale}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
        aria-label="Language"
        className="header-select"
      >
        {LOCALES.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
