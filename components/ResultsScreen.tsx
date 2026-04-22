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
  return cells
    .map(row => row.map(cell => (cell.correct ? '✅' : '❌')).join(''))
    .join('\n');
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
    `🏀 Basketball Box2Box — ${puzzle.date}`,
    '',
    emojiGrid,
    '',
    `Score: ${score} | ${correctCount}/9 correct`,
    isImmaculate ? '🎉 Immaculate Grid!' : '',
    '',
    'Play at: basketball-box2box.vercel.app',
  ]
    .filter(line => line !== undefined)
    .join('\n')
    .trim();

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="results-title"
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-gray-800 border border-gray-700 shadow-2xl p-7 flex flex-col items-center gap-6 text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label={t('closeResults')}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-xl leading-none"
        >
          ✕
        </button>

        {/* Heading */}
        <div className="flex flex-col items-center gap-1">
          {isImmaculate ? (
            <>
              <span className="text-4xl">🎉</span>
              <h2 id="results-title" className="text-2xl font-extrabold text-white">
                {t('immaculateGrid')}
              </h2>
              <p className="text-orange-400 text-sm font-medium">{t('immaculateSubtitle')}</p>
            </>
          ) : (
            <h2 id="results-title" className="text-2xl font-extrabold text-white">
              {t('gameOver')}
            </h2>
          )}
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-5xl font-black text-orange-500 tabular-nums">{score}</span>
          <span className="text-gray-400 text-sm">{t('points')}</span>
          <span className="text-gray-300 text-sm mt-1">
            {correctCount} / 9 correct
          </span>
        </div>

        {/* Emoji grid */}
        <div
          className="rounded-xl bg-gray-900 border border-gray-700 px-6 py-4"
          aria-label="Results grid"
        >
          {cells.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-2 justify-center">
              {row.map((cell, cIdx) => (
                <div key={cIdx} className="flex flex-col items-center gap-1 w-16">
                  {cell.correct && cell.playerImageUrl ? (
                    <img
                      src={cell.playerImageUrl}
                      alt={cell.playerName ?? ''}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-green-500"
                      onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
                      <span className="text-xl">{cell.correct ? '✅' : '❌'}</span>
                    </div>
                  )}
                  {cell.correct && (
                    <span className="text-xs text-gray-400 text-center leading-tight line-clamp-2">{cell.playerName}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onNewGame}
            className="w-full bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20"
          >
            {t('playAgain')}
          </button>
          <ShareButton text={shareText} />
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-300 border border-gray-600 hover:border-gray-400 hover:text-white transition-colors"
          >
            {t('viewGrid')}
          </button>
        </div>
      </div>
    </div>
  );
}
