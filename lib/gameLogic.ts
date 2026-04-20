import { Player, Criterion } from '@/types/game';

export function satisfiesCriterion(player: Player, criterion: Criterion): boolean {
  switch (criterion.type) {
    case 'team':
      return player.teams.some(t => t.toLowerCase() === criterion.value.toLowerCase());
    case 'award':
      return player.awards.some(a => a.toLowerCase() === criterion.value.toLowerCase());
    case 'nationality':
      return player.nationality.toLowerCase() === criterion.value.toLowerCase();
    case 'draft':
      if (criterion.value === 'First Overall Pick') return player.draftPick === 1;
      if (criterion.value === 'Top 5 Pick') return player.draftPick !== undefined && player.draftPick <= 5;
      if (criterion.value === 'Top 10 Pick') return player.draftPick !== undefined && player.draftPick <= 10;
      if (criterion.value === 'Undrafted') return player.draftPick === undefined;
      return false;
    case 'position':
      return player.position.toLowerCase().includes(criterion.value.toLowerCase());
    case 'era':
      return player.era.includes(criterion.value);
    default:
      return false;
  }
}

export function getValidPlayers(players: Player[], rowCriterion: Criterion, colCriterion: Criterion): Player[] {
  return players.filter(p =>
    satisfiesCriterion(p, rowCriterion) && satisfiesCriterion(p, colCriterion)
  );
}

export function validateGrid(
  players: Player[],
  rowCriteria: Criterion[],
  colCriteria: Criterion[]
): boolean {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const valid = getValidPlayers(players, rowCriteria[r], colCriteria[c]);
      if (valid.length === 0) return false;
    }
  }
  return true;
}

export function getRarityScore(validCount: number): number {
  if (validCount <= 2) return 200;
  if (validCount <= 5) return 150;
  if (validCount <= 10) return 120;
  return 100;
}

export function calculateScore(cells: boolean[][], rarityScores: number[][]): number {
  let score = 0;
  let correctCount = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (cells[r][c]) {
        score += rarityScores[r][c];
        correctCount++;
      }
    }
  }
  if (correctCount === 9) score += 200; // Immaculate grid bonus
  return score;
}
