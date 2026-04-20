'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';

interface ShareButtonProps {
  text: string;
}

export default function ShareButton({ text }: ShareButtonProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments where clipboard API is unavailable
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Silent fail
      }
      document.body.removeChild(ta);
    }
  }

  return (
    <button
      onClick={handleShare}
      className={[
        'flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95',
        copied
          ? 'bg-green-500 text-white cursor-default'
          : 'bg-orange-500 hover:bg-orange-400 text-white',
      ].join(' ')}
      disabled={copied}
      aria-live="polite"
    >
      {copied ? (
        <>
          <span>✓</span>
          <span>{t('copied')}</span>
        </>
      ) : (
        <>
          <span>📤</span>
          <span>{t('shareResult')}</span>
        </>
      )}
    </button>
  );
}
