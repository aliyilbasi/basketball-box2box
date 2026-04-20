export type CriterionType = 'team' | 'award' | 'nationality' | 'draft' | 'position' | 'era';

export interface Criterion {
  id: string;
  type: CriterionType;
  label: string;      // Display label e.g. "Los Angeles Lakers"
  value: string;      // Matching value used in logic
}

export interface Player {
  id: string;
  name: string;
  nationality: string;
  league: 'NBA' | 'EuroLeague' | 'ACB' | 'BSL' | 'LNB' | 'Serie A' | 'BBL' | 'VTB';
  teams: string[];           // All teams in career
  awards: string[];          // All awards won
  draftYear?: number;
  draftRound?: number;
  draftPick?: number;
  position: string;
  active: boolean;
  era: string[];             // e.g. ['1990s', '2000s']
  nbaId?: string;
}

export interface GridCell {
  row: number;    // 0-2
  col: number;    // 0-2
  playerId?: string;
  playerName?: string;
  playerImageUrl?: string;
  correct?: boolean;
  locked: boolean;
}

export interface DailyPuzzle {
  date: string;             // YYYYMMDD
  rowCriteria: Criterion[]; // 3 items
  colCriteria: Criterion[]; // 3 items
}

export interface GameState {
  puzzle: DailyPuzzle;
  cells: GridCell[][];      // 3x3 grid
  score: number;
  timeLeft: number;         // seconds
  gameOver: boolean;
  started: boolean;
}
