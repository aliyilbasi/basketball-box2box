'use client';

import { useEffect } from 'react';
import { DailyPuzzle, GridCell } from '@/types/game';
import ShareButton from './ShareButton';
import { useI18n } from '@/lib/i18n';

interface ResultsScreenProps {
  score: number;
  cells: GridCell[][];
  puzzle: DailyPuzzle;
  onClose: () => void;
  onNewGame: () => void;
}

function buildEmojiGrid(cells: GridCell[][]): string {
  return cells.map(row => row.map(c => c.correct ? '✅' : '❌').join('')).join('\n');
}

function countCorrect(cells: GridCell[][]): number {
  return cells.flat().filter(c => c.correct).length;
}

export default function ResultsScreen({ score, cells, puzzle, onClose, onNewGame }: ResultsScreenProps) {
  const { t } = useI18n();
  const correctCount = countCorrect(cells);
  const isImmaculate = correctCount === 9;
  const emojiGrid = buildEmojiGrid(cells);

  const shareText = [
    `🏀 HoopsBox — ${puzzle.date}`,
    '',
    emojiGrid,
    '',
    `Score: ${score} | ${correctCount}/9 correct`,
    isImmaculate ? '🎉 Immaculate Grid!' : '',
    '',
    'Play at: basketball-box2box.vercel.app',
  ].filter(l => l !== undefined).join('\n').trim();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="results-title">
      <div className="modal-panel" style={{ maxWidth: 400, alignItems: 'center', textAlign: 'center' }}>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label={t('closeResults')}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-lo)', fontSize: '1.1rem', padding: 4 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-hi)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-lo)')}
        >✕</button>

        {/* Heading */}
        {isImmaculate ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '2.5rem' }}>🎉</span>
            <h2 id="results-title" className="font-display" style={{ fontSize: '2rem', color: 'var(--text-hi)' }}>
              {t('immaculateGrid')}
            </h2>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)' }}>{t('immaculateSubtitle')}</p>
          </div>
        ) : (
          <h2 id="results-title" className="font-display" style={{ fontSize: '2rem', color: 'var(--text-hi)' }}>
            {t('gameOver')}
          </h2>
        )}

        {/* Score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span className="score-big">{score}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{t('points')}</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-mid)', marginTop: 4 }}>{correctCount} / 9 correct</span>
        </div>

        {/* Result grid */}
        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 12, padding: '16px 20px', width: '100%' }}>
          {cells.map((row, rIdx) => (
            <div key={rIdx} style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: rIdx < 2 ? 10 : 0 }}>
              {row.map((cell, cIdx) => (
                <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, width: 56 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', border: `2px solid ${cell.correct ? 'var(--correct-bdr)' : 'var(--border-dim)'}`, background: cell.correct ? 'var(--correct-bg)' : 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {cell.correct && cell.playerImageUrl ? (
                      <img src={cell.playerImageUrl} alt={cell.playerName ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <span style={{ fontSize: '1.2rem' }}>{cell.correct ? '✅' : '❌'}</span>
                    )}
                  </div>
                  {cell.correct && (
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-mid)', lineHeight: 1.2, textAlign: 'center', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', width: '100%' }}>
                      {cell.playerName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <button onClick={onNewGame} className="btn-accent">{t('playAgain')}</button>
          <ShareButton text={shareText} />
          <button onClick={onClose} className="btn-ghost">{t('viewGrid')}</button>
        </div>
      </div>
    </div>
  );
}
