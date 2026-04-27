'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';

interface TimerProps {
  timeLeft: number;
  onExpire: () => void;
  paused?: boolean;
  compact?: boolean;
}

export default function Timer({ timeLeft: initialTimeLeft, onExpire, paused = false, compact = false }: TimerProps) {
  const { t } = useI18n();
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    expiredRef.current = false;
    const id = window.setTimeout(() => setTimeLeft(initialTimeLeft), 0);
    return () => window.clearTimeout(id);
  }, [initialTimeLeft]);

  useEffect(() => {
    if (paused) return;
    if (timeLeft <= 0) {
      if (!expiredRef.current) { expiredRef.current = true; onExpireRef.current(); }
      return;
    }
    const id = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { clearInterval(id); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [timeLeft, paused]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = timeLeft < 60 && !paused;

  return (
    <div
      className={`timer-wrap ${compact ? 'timer-wrap--compact' : ''} ${paused ? 'timer-wrap--paused' : ''} ${isUrgent ? 'timer-wrap--urgent' : ''}`}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${paused ? t('timerPaused') : t('timeLeft')}: ${display}`}
    >
      <div className="flex flex-col items-center" style={{ minWidth: '52px' }}>
        {!compact && (
          <span className="timer-label">
            {paused ? t('timerPaused') : t('timeLeft')}
          </span>
        )}
        <span className={`timer-digits ${isUrgent ? 'timer-digits--urgent' : ''} ${paused ? 'timer-digits--paused' : ''}`}>
          {display}
        </span>
      </div>
    </div>
  );
}
