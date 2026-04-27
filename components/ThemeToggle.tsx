'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('hb-theme') as 'dark' | 'light' | null;
    const initial = saved ?? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', initial);
    const id = window.setTimeout(() => setTheme(initial), 0);
    return () => window.clearTimeout(id);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    // Brief transition class for smooth color swap
    document.documentElement.setAttribute('data-theme-transitioning', '');
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('hb-theme', next);
    setTheme(next);
    setTimeout(() => document.documentElement.removeAttribute('data-theme-transitioning'), 320);
  };

  return (
    <button
      onClick={toggle}
      className="btn-icon header-theme-toggle"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
