'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';

interface TimerProps {
  timeLeft: number;
  onExpire: () => void;
}

export default function Timer({ timeLeft: initialTimeLeft, onExpire }: TimerProps) {
  const { t } = useI18n();
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  // Keep ref current so the interval closure always calls the latest onExpire
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Reset internal timer when the prop changes (e.g. new game starts)
  useEffect(() => {
    expiredRef.current = false;
    setTimeLeft(initialTimeLeft);
  }, [initialTimeLeft]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
      }
      return;
    }

    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = timeLeft < 60;

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700">
      <span className="text-lg" role="img" aria-label="basketball">
        🏀
      </span>
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400 uppercase tracking-wider leading-none mb-0.5">
          {t('timeLeft')}
        </span>
        <span
          className={`text-xl font-mono font-bold tabular-nums transition-colors duration-300 ${
            isUrgent ? 'text-red-500' : 'text-white'
          }`}
          aria-live="polite"
          aria-atomic="true"
        >
          {display}
        </span>
      </div>
    </div>
  );
}
