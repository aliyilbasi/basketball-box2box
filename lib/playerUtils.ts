import { Player } from '@/types/game';
import playersData from '@/data/players.json';

const players = playersData as Player[];

export function getAllPlayers(): Player[] {
  return players;
}

export function searchPlayers(query: string): Player[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return players
    .filter(p => p.name.toLowerCase().includes(q))
    .slice(0, 10);
}

export function getPlayerById(id: string): Player | undefined {
  return players.find(p => p.id === id);
}

export function getPlayerByName(name: string): Player | undefined {
  return players.find(p => p.name.toLowerCase() === name.toLowerCase());
}

export function getPlayerImageUrl(player: Player): string | undefined {
  if (!player.nbaId) return undefined;
  return `https://cdn.nba.com/headshots/nba/latest/260x190/${player.nbaId}.png`;
}

export function getPlayerInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
