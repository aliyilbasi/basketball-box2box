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
  team_hawks:        'https://a.espncdn.com/i/teamlogos/nba/500/atl.png',
  team_nets:         'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png',
  team_hornets:      'https://a.espncdn.com/i/teamlogos/nba/500/cha.png',
  team_pacers:       'https://a.espncdn.com/i/teamlogos/nba/500/ind.png',
  team_clippers:     'https://a.espncdn.com/i/teamlogos/nba/500/lac.png',
  team_grizzlies:    'https://a.espncdn.com/i/teamlogos/nba/500/mem.png',
  team_timberwolves: 'https://a.espncdn.com/i/teamlogos/nba/500/min.png',
  team_pelicans:     'https://a.espncdn.com/i/teamlogos/nba/500/no.png',
  team_magic:        'https://a.espncdn.com/i/teamlogos/nba/500/orl.png',
  team_suns:         'https://a.espncdn.com/i/teamlogos/nba/500/phx.png',
  team_blazers:      'https://a.espncdn.com/i/teamlogos/nba/500/por.png',
  team_kings:        'https://a.espncdn.com/i/teamlogos/nba/500/sac.png',
  team_raptors:      'https://a.espncdn.com/i/teamlogos/nba/500/tor.png',
  team_jazz:         'https://a.espncdn.com/i/teamlogos/nba/500/utah.png',
  team_wizards:      'https://a.espncdn.com/i/teamlogos/nba/500/was.png',
  //European teams
  team_real_madrid:  'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
  team_barcelona:    'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
  team_panathinaikos: 'https://a.espncdn.com/i/teamlogos/soccer/500/188.png',
  team_olympiacos:   'https://a.espncdn.com/i/teamlogos/soccer/500/194.png',
  team_fenerbahce:   'https://a.espncdn.com/i/teamlogos/soccer/500/474.png',
  team_anadolu_efes: 'https://a.espncdn.com/i/teamlogos/evl/500/anadolu-efes-istanbul.png',
  team_maccabi:      'https://a.espncdn.com/i/teamlogos/evl/500/maccabi-playtika-tel-aviv.png',
  team_monaco:       'https://a.espncdn.com/i/teamlogos/soccer/500/178.png',
  team_partizan:     'https://a.espncdn.com/i/teamlogos/evl/500/partizan-mozzart-bet-belgrade.png',
  team_zvezda:       'https://a.espncdn.com/i/teamlogos/evl/500/crvena-zvezda-meridianbet-belgrade.png',
  team_milano:       'https://a.espncdn.com/i/teamlogos/evl/500/ea7-emporio-armani-milan.png',
  team_zalgiris:     'https://a.espncdn.com/i/teamlogos/evl/500/zalgiris-kaunas.png',
  team_bayern:       'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
  team_virtus:       'https://a.espncdn.com/i/teamlogos/evl/500/virtus-segafredo-bologna.png',
  team_asvel:        'https://a.espncdn.com/i/teamlogos/evl/500/ldlc-asvel-villeurbanne.png',
  // Nationalities (using country flags)
  // NORTH AMERICA & CARIBBEAN
  nat_usa:           'https://flagcdn.com/w640/us.png',
  nat_canada:        'https://flagcdn.com/w640/ca.png',
  nat_mexico:        'https://flagcdn.com/w640/mx.png',
  nat_dominican_rep: 'https://flagcdn.com/w640/do.png',
  nat_puerto_rico:   'https://flagcdn.com/w640/pr.png',
  nat_bahamas:       'https://flagcdn.com/w640/bs.png',
  nat_jamaica:       'https://flagcdn.com/w640/jm.png',
  nat_panama:        'https://flagcdn.com/w640/pa.png',

  // EUROPE
  nat_france:        'https://flagcdn.com/w640/fr.png',
  nat_serbia:        'https://flagcdn.com/w640/rs.png',
  nat_slovenia:      'https://flagcdn.com/w640/si.png',
  nat_greece:        'https://flagcdn.com/w640/gr.png',
  nat_spain:         'https://flagcdn.com/w640/es.png',
  nat_germany:       'https://flagcdn.com/w640/de.png',
  nat_italy:         'https://flagcdn.com/w640/it.png',
  nat_lithuania:     'https://flagcdn.com/w640/lt.png',
  nat_latvia:        'https://flagcdn.com/w640/lv.png',
  nat_croatia:       'https://flagcdn.com/w640/hr.png',
  nat_turkey:        'https://flagcdn.com/w640/tr.png',
  nat_finland:       'https://flagcdn.com/w640/fi.png',
  nat_montenegro:    'https://flagcdn.com/w640/me.png',
  nat_georgia:       'https://flagcdn.com/w640/ge.png',
  nat_uk:            'https://flagcdn.com/w640/gb.png',
  nat_israel:        'https://flagcdn.com/w640/il.png',
  nat_poland:        'https://flagcdn.com/w640/pl.png',
  nat_belgium:       'https://flagcdn.com/w640/be.png',
  nat_czech_rep:     'https://flagcdn.com/w640/cz.png',
  nat_switzerland:   'https://flagcdn.com/w640/ch.png',
  nat_austria:       'https://flagcdn.com/w640/at.png',
  nat_ukraine:       'https://flagcdn.com/w640/ua.png',

  // AFRICA
  nat_nigeria:       'https://flagcdn.com/w640/ng.png',
  nat_south_sudan:   'https://flagcdn.com/w640/ss.png',
  nat_cameroon:      'https://flagcdn.com/w640/cm.png',
  nat_senegal:       'https://flagcdn.com/w640/sn.png',
  nat_angola:        'https://flagcdn.com/w640/ao.png',
  nat_ivory_coast:   'https://flagcdn.com/w640/ci.png',
  nat_egypt:         'https://flagcdn.com/w640/eg.png',
  nat_dr_congo:      'https://flagcdn.com/w640/cd.png',
  nat_cape_verde:    'https://flagcdn.com/w640/cv.png',

  // ASIA & OCEANIA
  nat_australia:     'https://flagcdn.com/w640/au.png',
  nat_new_zealand:   'https://flagcdn.com/w640/nz.png',
  nat_japan:         'https://flagcdn.com/w640/jp.png',
  nat_china:         'https://flagcdn.com/w640/cn.png',
  nat_philippines:   'https://flagcdn.com/w640/ph.png',
  nat_south_korea:   'https://flagcdn.com/w640/kr.png',
  nat_lebanon:       'https://flagcdn.com/w640/lb.png',
  nat_jordan:        'https://flagcdn.com/w640/jo.png',

  // SOUTH AMERICA
  nat_brazil:        'https://flagcdn.com/w640/br.png',
  nat_argentina:     'https://flagcdn.com/w640/ar.png',
  nat_venezuela:     'https://flagcdn.com/w640/ve.png',
  nat_colombia:      'https://flagcdn.com/w640/co.png',
  nat_chile:         'https://flagcdn.com/w640/cl.png',
  nat_uruguay:       'https://flagcdn.com/w640/uy.png',

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
