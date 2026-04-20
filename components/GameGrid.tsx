'use client';

import { DailyPuzzle, GridCell, CriterionType } from '@/types/game';

const CRITERION_ICONS: Record<CriterionType, string> = {
  team: '🏀',
  award: '🏆',
  nationality: '🌍',
  draft: '📋',
  position: '📍',
  era: '📅',
};

interface GameGridProps {
  puzzle: DailyPuzzle;
  cells: GridCell[][];
  gameOver: boolean;
  onCellClick: (row: number, col: number) => void;
}

export default function GameGrid({ puzzle, cells, gameOver, onCellClick }: GameGridProps) {
  const { rowCriteria, colCriteria } = puzzle;

  return (
    <div
      className="grid gap-1.5"
      style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
      role="grid"
      aria-label="Basketball Box2Box puzzle grid"
    >
      {/* ── Row 0: top-left corner + 3 column headers ── */}

      {/* Top-left decorative corner */}
      <div className="flex items-center justify-center rounded-xl bg-gray-800/60 aspect-square min-h-[72px]">
        <span className="text-2xl" role="img" aria-label="basketball">🏀</span>
      </div>

      {/* Column criteria headers */}
      {colCriteria.map((criterion, colIdx) => (
        <div
          key={criterion.id}
          role="columnheader"
          aria-label={`Column ${colIdx + 1}: ${criterion.label}`}
          className="flex flex-col items-center justify-center gap-1 rounded-xl bg-gray-800 border border-gray-700 p-2 min-h-[72px] text-center"
        >
          <span className="text-xl" aria-hidden="true">
            {CRITERION_ICONS[criterion.type]}
          </span>
          <span className="text-xs text-gray-300 font-medium leading-tight">
            {criterion.label}
          </span>
        </div>
      ))}

      {/* ── Rows 1-3: row header + 3 grid cells ── */}
      {Array.from({ length: 3 }, (_, rowIdx) => (
        <>
          {/* Row criteria header */}
          <div
            key={`row-header-${rowIdx}`}
            role="rowheader"
            aria-label={`Row ${rowIdx + 1}: ${rowCriteria[rowIdx].label}`}
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-gray-800 border border-gray-700 p-2 min-h-[72px] text-center"
          >
            <span className="text-xl" aria-hidden="true">
              {CRITERION_ICONS[rowCriteria[rowIdx].type]}
            </span>
            <span className="text-xs text-gray-300 font-medium leading-tight">
              {rowCriteria[rowIdx].label}
            </span>
          </div>

          {/* 3 grid cells for this row */}
          {Array.from({ length: 3 }, (_, colIdx) => {
            const cell = cells[rowIdx]?.[colIdx];
            if (!cell) return null;

            const isCorrect = cell.correct === true;
            const isLocked = cell.locked;
            const isClickable = !isLocked && !isCorrect && !gameOver;
            const isEmpty = !cell.playerName;

            return (
              <button
                key={`cell-${rowIdx}-${colIdx}`}
                role="gridcell"
                aria-label={
                  isCorrect
                    ? `${cell.playerName} — correct`
                    : isLocked
                    ? 'Locked cell'
                    : `Row ${rowIdx + 1}, Column ${colIdx + 1} — click to answer`
                }
                disabled={!isClickable}
                onClick={() => isClickable && onCellClick(rowIdx, colIdx)}
                className={[
                  'flex flex-col items-center justify-center gap-1 rounded-xl min-h-[72px] p-2 text-center transition-all duration-200 select-none',
                  isCorrect
                    ? 'bg-green-500/20 border-2 border-green-500 cursor-default'
                    : isLocked
                    ? 'bg-gray-800/50 border border-gray-700 cursor-not-allowed opacity-60'
                    : 'bg-gray-800 border border-gray-700 hover:border-orange-500 hover:bg-gray-700 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500',
                ].join(' ')}
              >
                {isCorrect ? (
                  <>
                    {cell.playerImageUrl && (
                      <img
                        src={cell.playerImageUrl}
                        alt={cell.playerName ?? ''}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                      />
                    )}
                    <span className="text-green-400 text-xs font-semibold leading-tight line-clamp-2">
                      {cell.playerName}
                    </span>
                    <span className="text-green-500 text-sm">✓</span>
                  </>
                ) : isLocked && isEmpty ? (
                  <span className="text-gray-500 text-lg font-bold">—</span>
                ) : (
                  <span className="text-gray-400 text-2xl font-light">
                    {gameOver ? '—' : '?'}
                  </span>
                )}
              </button>
            );
          })}
        </>
      ))}
    </div>
  );
}
