const fs = require('fs');
const path = require('path');

const POS_MAP = {
  PG: 'Point Guard',
  SG: 'Shooting Guard',
  SF: 'Small Forward',
  PF: 'Power Forward',
  C: 'Center',
  G: 'Guard',
  F: 'Forward',
  FC: 'Forward-Center',
  GF: 'Guard-Forward',
};

function getEra(birthYear) {
  if (!birthYear) return [];
  const decade = Math.floor(birthYear / 10) * 10;
  const map = {
    1940: ['1950s', '1960s'],
    1950: ['1960s', '1970s'],
    1960: ['1970s', '1980s', '1990s'],
    1970: ['1980s', '1990s', '2000s'],
    1980: ['1990s', '2000s', '2010s'],
    1990: ['2000s', '2010s'],
    2000: ['2010s', '2020s'],
  };
  return map[decade] || [];
}

function extractNbaId(imgURL) {
  if (!imgURL) return null;
  const m = imgURL.match(/\/(\d+)\.png$/);
  return m ? m[1] : null;
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

const playersPath = path.join(__dirname, '../data/players.json');
const sourcePath = 'C:/Users/egund/Downloads/1on1.json';

const existing = JSON.parse(fs.readFileSync(playersPath, 'utf8'));
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const sourcePlayers = source.players;

// Build name→index map for existing players
const existingByName = {};
Object.entries(existing).forEach(([key, p]) => {
  existingByName[p.name] = key;
});

let enriched = 0;
let added = 0;
let nextKey = Object.keys(existing).length;

for (const p of sourcePlayers) {
  if (!p.name) continue;
  const existingKey = existingByName[p.name];

  if (existingKey !== undefined) {
    // Enrich existing entry
    const entry = existing[existingKey];
    if (!entry.nbaId) {
      const id = extractNbaId(p.imgURL);
      if (id) { entry.nbaId = id; enriched++; }
    }
    if (!entry.draftYear && p.draft?.year) {
      entry.draftYear = p.draft.year;
      enriched++;
    }
  } else {
    // Add new entry in players.json format
    const newEntry = {
      id: slugify(p.name),
      name: p.name,
      nationality: 'American',
      league: 'NBA',
      teams: [],
      awards: [],
      draftYear: p.draft?.year ?? null,
      draftRound: null,
      draftPick: null,
      position: POS_MAP[p.pos] || p.pos || null,
      active: !p.retiredYear,
      era: getEra(p.born?.year),
      nbaId: extractNbaId(p.imgURL),
    };
    existing[String(nextKey)] = newEntry;
    existingByName[p.name] = String(nextKey);
    nextKey++;
    added++;
  }
}

fs.writeFileSync(playersPath, JSON.stringify(existing, null, 2), 'utf8');

console.log(`Done. Enriched: ${enriched} existing players, Added: ${added} new players.`);
console.log(`Total players now: ${Object.keys(existing).length}`);
