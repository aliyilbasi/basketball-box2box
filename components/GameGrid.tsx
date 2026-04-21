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

const CRITERION_LOGOS: Record<string, string> = {
  // NBA teams
  team_lakers:       'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
  team_bulls:        'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
  team_celtics:      'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
  team_warriors:     'https://a.espncdn.com/i/teamlogos/nba/500/gs.png',
  team_spurs:        'https://a.espncdn.com/i/teamlogos/nba/500/sa.png',
  team_heat:         'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
  team_cavs:         'https://a.espncdn.com/i/teamlogos/nba/500/cle.png',
  team_thunder:      'https://a.espncdn.com/i/teamlogos/nba/500/okc.png',
  team_sixers:       'https://a.espncdn.com/i/teamlogos/nba/500/phi.png',
  team_rockets:      'https://a.espncdn.com/i/teamlogos/nba/500/hou.png',
  team_knicks:       'https://a.espncdn.com/i/teamlogos/nba/500/ny.png',
  team_mavs:         'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
  team_nuggets:      'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
  team_bucks:        'https://a.espncdn.com/i/teamlogos/nba/500/mil.png',
  team_pistons:      'https://a.espncdn.com/i/teamlogos/nba/500/det.png',
  // Awards
  award_allstar:     'https://a.espncdn.com/i/teamlogos/nba/500/allstar.png',
  // Eras
  era_2000s:         'https://upload.wikimedia.org/wikipedia/en/thumb/0/03/Nba_logo.svg/240px-Nba_logo.svg.png',
};

function playerInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

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
      {colCriteria.map((criterion, colIdx) => {
        const logo = CRITERION_LOGOS[criterion.id];
        return (
          <div
            key={criterion.id}
            role="columnheader"
            aria-label={`Column ${colIdx + 1}: ${criterion.label}`}
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-gray-800 border border-gray-700 p-2 min-h-[72px] text-center"
          >
            {logo ? (
              <img
                src={logo}
                alt={criterion.label}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  img.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <span className={`text-xl ${logo ? 'hidden' : ''}`} aria-hidden="true">
              {CRITERION_ICONS[criterion.type]}
            </span>
            <span className="text-xs text-gray-300 font-medium leading-tight">
              {criterion.label}
            </span>
          </div>
        );
      })}

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
            {CRITERION_LOGOS[rowCriteria[rowIdx].id] ? (
              <img
                src={CRITERION_LOGOS[rowCriteria[rowIdx].id]}
                alt={rowCriteria[rowIdx].label}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  img.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <span className={`text-xl ${CRITERION_LOGOS[rowCriteria[rowIdx].id] ? 'hidden' : ''}`} aria-hidden="true">
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
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                        {playerInitials(cell.playerName ?? '')}
                      </div>
                      {cell.playerImageUrl && (
                        <img
                          src={cell.playerImageUrl}
                          alt={cell.playerName ?? ''}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                    </div>
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
