'use client';

import { useEffect, useRef } from 'react';
import { Criterion, Player } from '@/types/game';
import PlayerSearch from './PlayerSearch';
import { useI18n } from '@/lib/i18n';

const CRITERION_ICONS: Record<string, string> = {
  team: '🏀',
  award: '🏆',
  nationality: '🌍',
  draft: '📋',
  position: '📍',
  era: '📅',
};

interface CellModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowCriterion: Criterion;
  colCriterion: Criterion;
  onAnswer: (player: Player) => void;
  isCorrect?: boolean;
  validCount?: number;
  firstLetter?: string;
  hintRevealed?: boolean;
  onRevealHint?: () => void;
}

export default function CellModal({
  isOpen,
  onClose,
  rowCriterion,
  colCriterion,
  onAnswer,
  isCorrect,
  validCount,
  firstLetter,
  hintRevealed,
  onRevealHint,
}: CellModalProps) {
  const { t } = useI18n();
  const backdropRef = useRef<HTMLDivElement>(null);
  // Track whether feedback (isCorrect) has been set so we can show it
  const hasFeedback = isCorrect !== undefined;

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === backdropRef.current) onClose();
  }

  const rowIcon = CRITERION_ICONS[rowCriterion.type] ?? '•';
  const colIcon = CRITERION_ICONS[colCriterion.type] ?? '•';

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cell-modal-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-gray-800 border border-gray-700 shadow-2xl p-6 flex flex-col gap-5">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label={t('closeModal')}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-xl leading-none"
        >
          ✕
        </button>

        {/* Title */}
        <h2 id="cell-modal-title" className="text-lg font-bold text-white pr-8">
          {t('nameAPlayer')}
        </h2>

        {/* Criteria requirement */}
        <div className="flex flex-col gap-2 rounded-xl bg-gray-900 border border-gray-700 p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">{t('mustSatisfy')}</p>
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center gap-2">
              <span className="text-base" aria-hidden="true">{rowIcon}</span>
              <span className="text-white font-medium">{rowCriterion.label}</span>
              <span className="ml-auto text-xs text-gray-500 capitalize">{rowCriterion.type}</span>
            </div>
            <div className="h-px bg-gray-700" />
            <div className="flex items-center gap-2">
              <span className="text-base" aria-hidden="true">{colIcon}</span>
              <span className="text-white font-medium">{colCriterion.label}</span>
              <span className="ml-auto text-xs text-gray-500 capitalize">{colCriterion.type}</span>
            </div>
          </div>
        </div>

        {/* Feedback banner */}
        {hasFeedback && (
          <div
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
              isCorrect
                ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                : 'bg-red-500/20 border border-red-500/40 text-red-400'
            }`}
            role="status"
            aria-live="polite"
          >
            <span className="text-lg">{isCorrect ? '✅' : '❌'}</span>
            {isCorrect
              ? t('correctFeedback')
              : t('wrongFeedback')}
          </div>
        )}

        {/* Hint section */}
        {isCorrect === false && validCount !== undefined && (
          <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
            <span>💡 {t('hintCount', { count: validCount })}</span>
            {!hintRevealed && onRevealHint && (
              <button
                onClick={onRevealHint}
                className="text-orange-400 hover:text-orange-300 underline transition-colors"
              >
                {t('revealHint')}
              </button>
            )}
            {hintRevealed && firstLetter && (
              <span className="text-orange-300">
                {t('firstLetter')} <strong className="text-white">{firstLetter}</strong>
              </span>
            )}
          </div>
        )}

        {/* Search */}
        {!isCorrect && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('searchLabel')}</label>
            <PlayerSearch
              onSelect={onAnswer}
              placeholder={t('searchPlaceholder')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
