'use client';

import { useEffect, useRef } from 'react';
import { Criterion, Player } from '@/types/game';
import PlayerSearch from './PlayerSearch';
import { useI18n } from '@/lib/i18n';
import { getCriterionLabel, getCriterionTypeLabel } from '@/lib/criterionI18n';

const CRITERION_ICONS: Record<string, string> = {
  team: '🏀', award: '🏆', nationality: '🌍', draft: '📋', position: '📍', era: '📅',
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

export default function CellModal({ isOpen, onClose, rowCriterion, colCriterion, onAnswer, isCorrect, validCount, firstLetter, hintRevealed, onRevealHint }: CellModalProps) {
  const { t } = useI18n();
  const backdropRef = useRef<HTMLDivElement>(null);
  const hasFeedback = isCorrect !== undefined;
  const rowLabel = getCriterionLabel(rowCriterion, t);
  const colLabel = getCriterionLabel(colCriterion, t);
  const rowTypeLabel = getCriterionTypeLabel(rowCriterion.type, t);
  const colTypeLabel = getCriterionTypeLabel(colCriterion.type, t);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) onClose(); }}
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cell-modal-title"
    >
      <div className="modal-panel">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label={t('closeModal')}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-lo)', fontSize: '1.1rem', lineHeight: 1, padding: 4 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-hi)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-lo)')}
        >
          ✕
        </button>

        {/* Title */}
        <h2 id="cell-modal-title" className="font-display" style={{ fontSize: '1.4rem', color: 'var(--text-hi)', paddingRight: 32 }}>
          {t('nameAPlayer')}
        </h2>

        {/* Criteria */}
        <div className="criteria-block">
          <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-lo)', marginBottom: 2 }}>
            {t('mustSatisfy')}
          </div>
          <div className="criteria-row">
            <span style={{ fontSize: '1rem' }}>{CRITERION_ICONS[rowCriterion.type] ?? '•'}</span>
            <span style={{ fontWeight: 600, color: 'var(--text-hi)', fontSize: '0.9375rem' }}>{rowLabel}</span>
            <span className="criteria-type-badge">{rowTypeLabel}</span>
          </div>
          <div className="criteria-divider" />
          <div className="criteria-row">
            <span style={{ fontSize: '1rem' }}>{CRITERION_ICONS[colCriterion.type] ?? '•'}</span>
            <span style={{ fontWeight: 600, color: 'var(--text-hi)', fontSize: '0.9375rem' }}>{colLabel}</span>
            <span className="criteria-type-badge">{colTypeLabel}</span>
          </div>
        </div>

        {/* Feedback */}
        {hasFeedback && (
          <div className={isCorrect ? 'feedback-correct' : 'feedback-wrong'} role="status" aria-live="polite">
            <span style={{ fontSize: '1.1rem' }}>{isCorrect ? '✅' : '❌'}</span>
            {isCorrect ? t('correctFeedback') : t('wrongFeedback')}
          </div>
        )}

        {/* Hint */}
        {isCorrect === false && validCount !== undefined && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-mid)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span>💡 {t('hintCount', { count: validCount })}</span>
            {!hintRevealed && onRevealHint && (
              <button
                onClick={onRevealHint}
                style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
              >
                {t('revealHint')}
              </button>
            )}
            {hintRevealed && firstLetter && (
              <span style={{ color: 'var(--accent)' }}>
                {t('firstLetter')} <strong style={{ color: 'var(--text-hi)' }}>{firstLetter}</strong>
              </span>
            )}
          </div>
        )}

        {/* Search */}
        {!isCorrect && (
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-lo)', marginBottom: 8 }}>
              {t('searchLabel')}
            </label>
            <PlayerSearch onSelect={onAnswer} placeholder={t('searchPlaceholder')} />
          </div>
        )}
      </div>
    </div>
  );
}
