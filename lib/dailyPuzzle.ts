import { Criterion, DailyPuzzle } from '@/types/game';
import { getValidPlayers, satisfiesCriterion } from './gameLogic';
import playersData from '@/data/players.json';
import { Player } from '@/types/game';

// Seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function dateToSeed(dateStr: string): number {
  return parseInt(dateStr.replace(/-/g, ''), 10);
}

// Full curated pool of criteria
const CRITERIA_POOL: Criterion[] = [
  // Teams
  { id: 'team_lakers', type: 'team', label: 'Lakers', value: 'Los Angeles Lakers' },
  { id: 'team_bulls', type: 'team', label: 'Bulls', value: 'Chicago Bulls' },
  { id: 'team_celtics', type: 'team', label: 'Celtics', value: 'Boston Celtics' },
  { id: 'team_warriors', type: 'team', label: 'Warriors', value: 'Golden State Warriors' },
  { id: 'team_spurs', type: 'team', label: 'Spurs', value: 'San Antonio Spurs' },
  { id: 'team_heat', type: 'team', label: 'Heat', value: 'Miami Heat' },
  { id: 'team_cavs', type: 'team', label: 'Cavaliers', value: 'Cleveland Cavaliers' },
  { id: 'team_thunder', type: 'team', label: 'Thunder', value: 'Oklahoma City Thunder' },
  { id: 'team_sixers', type: 'team', label: '76ers', value: 'Philadelphia 76ers' },
  { id: 'team_rockets', type: 'team', label: 'Rockets', value: 'Houston Rockets' },
  { id: 'team_knicks', type: 'team', label: 'Knicks', value: 'New York Knicks' },
  { id: 'team_mavs', type: 'team', label: 'Mavericks', value: 'Dallas Mavericks' },
  { id: 'team_nuggets', type: 'team', label: 'Nuggets', value: 'Denver Nuggets' },
  { id: 'team_bucks', type: 'team', label: 'Bucks', value: 'Milwaukee Bucks' },
  { id: 'team_pistons', type: 'team', label: 'Pistons', value: 'Detroit Pistons' },
  { id: 'team_barcelona', type: 'team', label: 'FC Barcelona', value: 'FC Barcelona' },
  { id: 'team_realmadrid', type: 'team', label: 'Real Madrid B.', value: 'Real Madrid Baloncesto' },
  { id: 'team_efes', type: 'team', label: 'Anadolu Efes', value: 'Anadolu Efes' },
  { id: 'team_fenerbahce', type: 'team', label: 'Fenerbahce', value: 'Fenerbahce Beko' },
  { id: 'team_cska', type: 'team', label: 'CSKA Moscow', value: 'CSKA Moscow' },
  { id: 'team_olympiacos', type: 'team', label: 'Olympiacos', value: 'Olympiacos' },
  { id: 'team_panathinaikos', type: 'team', label: 'Panathinaikos', value: 'Panathinaikos' },
  { id: 'team_maccabi', type: 'team', label: 'Maccabi', value: 'Maccabi Tel Aviv' },
  { id: 'team_virtus', type: 'team', label: 'Virtus Bologna', value: 'Virtus Bologna' },
  { id: 'team_zalgiris', type: 'team', label: 'Zalgiris', value: 'Zalgiris Kaunas' },
  { id: 'team_partizan', type: 'team', label: 'Partizan', value: 'Partizan Belgrade' },
  { id: 'team_olimpia', type: 'team', label: 'Olimpia Milano', value: 'Olimpia Milano' },
  { id: 'team_baskonia', type: 'team', label: 'Baskonia', value: 'Baskonia' },
  // Awards
  { id: 'award_mvp', type: 'award', label: 'NBA MVP', value: 'NBA MVP' },
  { id: 'award_champion', type: 'award', label: 'NBA Champion', value: 'NBA Champion' },
  { id: 'award_allstar', type: 'award', label: 'NBA All-Star', value: 'NBA All-Star' },
  { id: 'award_finalsmvp', type: 'award', label: 'Finals MVP', value: 'Finals MVP' },
  { id: 'award_dpoy', type: 'award', label: 'DPOY', value: 'DPOY' },
  { id: 'award_roty', type: 'award', label: 'Rookie of Year', value: 'Rookie of the Year' },
  { id: 'award_olympic', type: 'award', label: 'Olympic Gold', value: 'Olympic Gold' },
  { id: 'award_euroleague_mvp', type: 'award', label: 'EuroLeague MVP', value: 'EuroLeague MVP' },
  { id: 'award_euroleague_champ', type: 'award', label: 'EuroLeague Champ', value: 'EuroLeague Champion' },
  { id: 'award_fiba_world', type: 'award', label: 'FIBA World Cup', value: 'FIBA World Cup Champion' },
  // Nationality
  { id: 'nat_french', type: 'nationality', label: 'French', value: 'French' },
  { id: 'nat_serbian', type: 'nationality', label: 'Serbian', value: 'Serbian' },
  { id: 'nat_greek', type: 'nationality', label: 'Greek', value: 'Greek' },
  { id: 'nat_spanish', type: 'nationality', label: 'Spanish', value: 'Spanish' },
  { id: 'nat_slovenian', type: 'nationality', label: 'Slovenian', value: 'Slovenian' },
  { id: 'nat_german', type: 'nationality', label: 'German', value: 'German' },
  { id: 'nat_australian', type: 'nationality', label: 'Australian', value: 'Australian' },
  { id: 'nat_nigerian', type: 'nationality', label: 'Nigerian', value: 'Nigerian' },
  { id: 'nat_turkish', type: 'nationality', label: 'Turkish', value: 'Turkish' },
  { id: 'nat_lithuanian', type: 'nationality', label: 'Lithuanian', value: 'Lithuanian' },
  { id: 'nat_argentinian', type: 'nationality', label: 'Argentine', value: 'Argentine' },
  { id: 'nat_canadian', type: 'nationality', label: 'Canadian', value: 'Canadian' },
  { id: 'nat_croatian', type: 'nationality', label: 'Croatian', value: 'Croatian' },
  // Draft
  { id: 'draft_first', type: 'draft', label: '#1 Pick', value: 'First Overall Pick' },
  { id: 'draft_top5', type: 'draft', label: 'Top 5 Pick', value: 'Top 5 Pick' },
  // Position
  { id: 'pos_pg', type: 'position', label: 'Point Guard', value: 'Point Guard' },
  { id: 'pos_sg', type: 'position', label: 'Shooting Guard', value: 'Shooting Guard' },
  { id: 'pos_c', type: 'position', label: 'Center', value: 'Center' },
  // Era
  { id: 'era_90s', type: 'era', label: '1990s Player', value: '1990s' },
  { id: 'era_2000s', type: 'era', label: '2000s Player', value: '2000s' },
  { id: 'era_2010s', type: 'era', label: '2010s Player', value: '2010s' },
];

function getCriterionEras(players: Player[], criterion: Criterion): Set<string> {
  const eras = new Set<string>();
  players
    .filter(p => satisfiesCriterion(p, criterion))
    .forEach(p => (p.era || []).forEach(e => eras.add(e)));
  return eras;
}

function scorePuzzle(
  players: Player[],
  rowCriteria: Criterion[],
  colCriteria: Criterion[],
  eraCache: Map<string, Set<string>>
): number {
  let minCell = Infinity;
  let cellScore = 0;

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const count = getValidPlayers(players, rowCriteria[r], colCriteria[c]).length;
      if (count === 0) return -Infinity;
      minCell = Math.min(minCell, count);
      cellScore += Math.min(count, 8);
    }
  }

  // Prefer row/col pairs that share eras — avoids e.g. 1960s player × 2020s team
  let eraScore = 0;
  for (let r = 0; r < 3; r++) {
    const rowEras = eraCache.get(rowCriteria[r].id) ?? getCriterionEras(players, rowCriteria[r]);
    for (let c = 0; c < 3; c++) {
      const colEras = eraCache.get(colCriteria[c].id) ?? getCriterionEras(players, colCriteria[c]);
      eraScore += [...rowEras].filter(e => colEras.has(e)).length;
    }
  }

  return minCell * 100 + eraScore * 10 + cellScore;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function findBestPuzzle(players: Player[], baseSeed: number, attempts: number, date: string): DailyPuzzle | null {
  // Precompute era coverage for all criteria once
  const eraCache = new Map<string, Set<string>>();
  CRITERIA_POOL.forEach(c => eraCache.set(c.id, getCriterionEras(players, c)));

  let bestPuzzle: DailyPuzzle | null = null;
  let bestScore = -Infinity;

  for (let offset = 0; offset < attempts; offset++) {
    const rng = mulberry32(baseSeed + offset);
    const shuffled = shuffle(CRITERIA_POOL, rng);
    const rowCriteria = shuffled.slice(0, 3);
    const colCriteria = shuffled.slice(3, 6);

    const rowIds = new Set(rowCriteria.map(c => c.id));
    const colIds = new Set(colCriteria.map(c => c.id));
    if ([...rowIds].some(id => colIds.has(id))) continue;

    const score = scorePuzzle(players, rowCriteria, colCriteria, eraCache);
    if (score > bestScore) {
      bestScore = score;
      bestPuzzle = { date, rowCriteria, colCriteria };
    }
  }

  return bestPuzzle;
}

export function getRandomPuzzle(): DailyPuzzle {
  const players = Object.values(playersData) as Player[];
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const baseSeed = Math.floor(Math.random() * 2147483647);
  return findBestPuzzle(players, baseSeed, 200, date) ?? getDailyPuzzle();
}

export function getDailyPuzzle(dateStr?: string): DailyPuzzle {
  const today = dateStr || new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const players = Object.values(playersData) as Player[];

  const best = findBestPuzzle(players, dateToSeed(today), 200, today);
  if (best) return best;

  // Fallback hardcoded puzzle
  return {
    date: today,
    rowCriteria: [
      CRITERIA_POOL.find(c => c.id === 'team_lakers')!,
      CRITERIA_POOL.find(c => c.id === 'team_bulls')!,
      CRITERIA_POOL.find(c => c.id === 'award_mvp')!,
    ],
    colCriteria: [
      CRITERIA_POOL.find(c => c.id === 'award_champion')!,
      CRITERIA_POOL.find(c => c.id === 'nat_french')!,
      CRITERIA_POOL.find(c => c.id === 'award_allstar')!,
    ],
  };
}

export { CRITERIA_POOL };
