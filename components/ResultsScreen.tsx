'use client';

import { useEffect } from 'react';
import { DailyPuzzle, GridCell } from '@/types/game';
import ShareButton from './ShareButton';

interface ResultsScreenProps {
  score: number;
  cells: GridCell[][];
  puzzle: DailyPuzzle;
  onClose: () => void;
}

function buildEmojiGrid(cells: GridCell[][]): string {
  return cells
    .map(row => row.map(cell => (cell.correct ? '✅' : '❌')).join(''))
    .join('\n');
}

function countCorrect(cells: GridCell[][]): number {
  return cells.flat().filter(c => c.correct).length;
}

export default function ResultsScreen({ score, cells, puzzle, onClose }: ResultsScreenProps) {
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
          aria-label="Close results"
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
                Immaculate Grid!
              </h2>
              <p className="text-orange-400 text-sm font-medium">Perfect score — all 9 cells!</p>
            </>
          ) : (
            <h2 id="results-title" className="text-2xl font-extrabold text-white">
              Game Over
            </h2>
          )}
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-5xl font-black text-orange-500 tabular-nums">{score}</span>
          <span className="text-gray-400 text-sm">points</span>
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
            <div key={rIdx} className="flex gap-1 justify-center">
              {row.map((cell, cIdx) => (
                <span key={cIdx} className="text-2xl" role="img" aria-label={cell.correct ? 'correct' : 'incorrect'}>
                  {cell.correct ? '✅' : '❌'}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Come back tomorrow */}
        <p className="text-gray-400 text-sm">
          Come back tomorrow for a new puzzle! 📅
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <ShareButton text={shareText} />
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-300 border border-gray-600 hover:border-gray-400 hover:text-white transition-colors"
          >
            View Grid
          </button>
        </div>
      </div>
    </div>
  );
}
