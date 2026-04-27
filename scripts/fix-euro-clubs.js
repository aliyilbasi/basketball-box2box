const fs = require('fs');
const path = require('path');

const playersPath = path.join(__dirname, '../data/players.json');
const data = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

const additions = {
  'Luka Doncic':   'Real Madrid Baloncesto',   // EuroLeague MVP & Champion 2018
  'Pau Gasol':     'FC Barcelona',              // EuroLeague Champion 2003 (pre-NBA)
  'Manu Ginobili': 'Virtus Bologna',            // EuroLeague Champion 2001 (Kinder Bologna era)
  'Toni Kukoc':    'Jugoplastika Split',        // EuroLeague Champion 1989, 1990, 1991
};

let fixed = 0;

// Add missing EuroLeague clubs
Object.entries(data).forEach(([key, player]) => {
  const club = additions[player.name];
  if (club && !player.teams?.includes(club)) {
    player.teams = [...(player.teams || []), club];
    console.log(`Added "${club}" to ${player.name}`);
    fixed++;
  }
});

// Remove the duplicate "Pau Gasol (Barcelona era)" entry and rekey
const deduped = {};
let idx = 0;
Object.values(data).forEach(player => {
  if (player.name === 'Pau Gasol (Barcelona era)') {
    console.log('Removed duplicate: Pau Gasol (Barcelona era)');
    return;
  }
  deduped[String(idx++)] = player;
});

fs.writeFileSync(playersPath, JSON.stringify(deduped, null, 2), 'utf8');
console.log(`\nDone. Fixed ${fixed} players. Total: ${Object.keys(deduped).length}`);
