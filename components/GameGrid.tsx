'use client';

import { DailyPuzzle, GridCell, CriterionType } from '@/types/game';
import { useI18n } from '@/lib/i18n';
import { getCriterionLabel } from '@/lib/criterionI18n';

const CRITERION_ICONS: Record<CriterionType, string> = {
  team: '🏀', award: '🏆', nationality: '🌍', draft: '📋', position: '📍', era: '📅',
};

const CRITERION_LOGOS: Record<string, string> = {
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
  team_realmadrid:   'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
  team_barcelona:    'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
  team_panathinaikos:'https://a.espncdn.com/i/teamlogos/soccer/500/188.png',
  team_olympiacos:   'https://a.espncdn.com/i/teamlogos/soccer/500/194.png',
  team_fenerbahce:   'https://a.espncdn.com/i/teamlogos/evl/500/fenerbahce-beko-istanbul.png',
  team_efes:         'https://a.espncdn.com/i/teamlogos/evl/500/anadolu-efes-istanbul.png',
  team_cska:         'https://a.espncdn.com/i/teamlogos/evl/500/cska-moscow.png',
  team_maccabi:      'https://a.espncdn.com/i/teamlogos/evl/500/maccabi-playtika-tel-aviv.png',
  team_partizan:     'https://a.espncdn.com/i/teamlogos/evl/500/partizan-mozzart-bet-belgrade.png',
  team_zalgiris:     'https://a.espncdn.com/i/teamlogos/evl/500/zalgiris-kaunas.png',
  team_virtus:       'https://a.espncdn.com/i/teamlogos/evl/500/virtus-segafredo-bologna.png',
  team_olimpia:      'https://a.espncdn.com/i/teamlogos/evl/500/ea7-emporio-armani-milan.png',
  nat_french:        'https://flagcdn.com/w640/fr.png',
  nat_serbian:       'https://flagcdn.com/w640/rs.png',
  nat_slovenian:     'https://flagcdn.com/w640/si.png',
  nat_greek:         'https://flagcdn.com/w640/gr.png',
  nat_spanish:       'https://flagcdn.com/w640/es.png',
  nat_german:        'https://flagcdn.com/w640/de.png',
  nat_italian:       'https://flagcdn.com/w640/it.png',
  nat_lithuanian:    'https://flagcdn.com/w640/lt.png',
  nat_latvian:       'https://flagcdn.com/w640/lv.png',
  nat_croatian:      'https://flagcdn.com/w640/hr.png',
  nat_turkish:       'https://flagcdn.com/w640/tr.png',
  nat_australian:    'https://flagcdn.com/w640/au.png',
  nat_nigerian:      'https://flagcdn.com/w640/ng.png',
  nat_argentinian:   'https://flagcdn.com/w640/ar.png',
  nat_canadian:      'https://flagcdn.com/w640/ca.png',
  nat_american:      'https://flagcdn.com/w640/us.png',
  award_allstar:     'https://a.espncdn.com/i/teamlogos/nba/500/allstar.png',
  award_olympic:     'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Olympic_rings_without_rims.svg/480px-Olympic_rings_without_rims.svg.png',
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

function CriterionCell({ id, type, label, role }: { id: string; type: CriterionType; label: string; role: string }) {
  const logo = CRITERION_LOGOS[id];
  return (
    <div className="criterion-cell" role={role} aria-label={label}>
      {logo ? (
        <img
          src={logo}
          alt={label}
          style={{ width: 32, height: 32, objectFit: 'contain' }}
          onError={e => {
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
            img.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <span className={`text-xl ${logo ? 'hidden' : ''}`} aria-hidden="true">
        {CRITERION_ICONS[type]}
      </span>
      <span className="criterion-label">{label}</span>
    </div>
  );
}

export default function GameGrid({ puzzle, cells, gameOver, onCellClick }: GameGridProps) {
  const { t } = useI18n();
  const { rowCriteria, colCriteria } = puzzle;

  return (
    <div
      className="grid gap-1.5"
      style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
      role="grid"
      aria-label="Basketball Box2Box puzzle grid"
    >
      {/* Corner */}
      <div className="criterion-cell" style={{ background: 'transparent', border: 'none' }}>
        <span style={{ fontSize: '1.5rem' }}>🏀</span>
      </div>

      {/* Column headers */}
      {colCriteria.map((c) => (
        <CriterionCell key={c.id} id={c.id} type={c.type} label={getCriterionLabel(c, t)} role={`columnheader`} />
      ))}

      {/* Rows */}
      {Array.from({ length: 3 }, (_, rowIdx) => (
        <>
          <CriterionCell
            key={`rh-${rowIdx}`}
            id={rowCriteria[rowIdx].id}
            type={rowCriteria[rowIdx].type}
            label={getCriterionLabel(rowCriteria[rowIdx], t)}
            role="rowheader"
          />
          {Array.from({ length: 3 }, (_, colIdx) => {
            const cell = cells[rowIdx]?.[colIdx];
            if (!cell) return null;
            const isCorrect = cell.correct === true;
            const isLocked = cell.locked && !isCorrect;
            const isClickable = !cell.locked && !isCorrect && !gameOver;

            return (
              <button
                key={`cell-${rowIdx}-${colIdx}`}
                role="gridcell"
                aria-label={
                  isCorrect
                    ? `${cell.playerName} — correct`
                    : isLocked ? 'Locked' : `Row ${rowIdx + 1}, Column ${colIdx + 1}`
                }
                disabled={!isClickable}
                onClick={() => isClickable && onCellClick(rowIdx, colIdx)}
                className={[
                  'grid-cell',
                  isCorrect ? 'grid-cell--correct cell-flip' : '',
                  isLocked ? 'grid-cell--locked' : '',
                ].join(' ')}
              >
                {isCorrect ? (
                  <>
                    <div style={{ position: 'relative', width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-mid)' }}>
                        {playerInitials(cell.playerName ?? '')}
                      </div>
                      {cell.playerImageUrl && (
                        <img
                          src={cell.playerImageUrl}
                          alt={cell.playerName ?? ''}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--correct)', lineHeight: 1.2, textAlign: 'center', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {cell.playerName}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: '1.3rem', fontWeight: 300, color: 'var(--border-hi)' }}>
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
