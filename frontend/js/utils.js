// utils.js
export function getMod(stat) {
  return Math.floor((stat - 10) / 2);
}

export function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const potion = { id: 201, name: "Healing Potion", cost: 50, heal: 10 };

export const gearList = [
  { id: 1, name: "Iron Sword",    type: "weapon",    cost: 100, mods: { str: 2 } },
  { id: 2, name: "Steel Sword",   type: "weapon",    cost: 200, mods: { str: 4 } },
  { id: 3, name: "Leather Armor", type: "armor",     cost: 100, mods: { dex: 2 } },
  { id: 4, name: "Chain Mail",    type: "armor",     cost: 200, mods: { dex: 4 } },
  { id: 5, name: "Wizard Hat",    type: "accessory", cost: 150, mods: { int: 2 } },
  { id: 6, name: "Lucky Charm",   type: "accessory", cost: 250, mods: { luck: 2 } }
];

export const specialGearList = [
  { id:101, name:"Mythic Blade",    type:"weapon",    cost:500, mods:{ str:6 } },
  { id:102, name:"Phantom Cloak",   type:"armor",     cost:500, mods:{ dex:6 } },
  { id:103, name:"Arcane Talisman", type:"accessory", cost:500, mods:{ int:6 } }
];

export const enemyPool = [
  { name:"Goblin",      hp:20,  str:6,  dex:10, powerLevel:1, desc:"Small, cunning humanoids." },
  { name:"Skeleton",    hp:25,  str:8,  dex:12, powerLevel:2, desc:"Reanimated bones of warriors." },
  { name:"Bandit",      hp:22,  str:7,  dex:11, powerLevel:2, desc:"Opportunistic thieves." },
  { name:"Spider",      hp:18,  str:5,  dex:14, powerLevel:1, desc:"Venomous arachnids." },
  { name:"Orc",         hp:30,  str:10, dex:13, powerLevel:3, desc:"Brutish fighters." },
  { name:"Troll",       hp:40,  str:12, dex:9,  powerLevel:4, desc:"Huge brutes with regen." },
  { name:"Wraith",      hp:35,  str:9,  dex:12, powerLevel:3, desc:"Spectral undead." },
  { name:"Ogre",        hp:45,  str:13, dex:8,  powerLevel:4, desc:"Massive club-wielders." },
  { name:"Dark Knight", hp:50,  str:14, dex:10, powerLevel:5, desc:"Fallen paladin." }
];

export const bossPool = [
  { name:"Minotaur",    hp:80,  str:18, dex:11, powerLevel:7, desc:"Man-bull hybrid." },
  { name:"Lich",        hp:70,  str:16, dex:13, powerLevel:6, desc:"Undead spellcaster." },
  { name:"Dragon",      hp:120, str:20, dex:15, powerLevel:8, desc:"Ancient fire wyrm." }
];

export function getEnemyDice(pl) {
  if (pl <= 2) return 6;
  if (pl <= 4) return 8;
  if (pl <= 6) return 10;
  return 12;
}
// Returns base stat + any equipped gear modifiers
export function getEffectiveStat(stat) {
  const base = window.profile?.stats?.[stat] || 0;
  const eq   = window.profile?.equipped || {};
  // sum up any mods from weapon, armor, accessory
  const weaponMod    = eq.weapon?.mods?.[stat]    || 0;
  const armorMod     = eq.armor?.mods?.[stat]     || 0;
  const accessoryMod = eq.accessory?.mods?.[stat] || 0;
  return base + weaponMod + armorMod + accessoryMod;
}

// Generate base stats per class
export function generateStats(heroClass) {
   switch (heroClass) {
     case "Warrior": return { hp:100, str:15, dex:8,  int:5,  luck:5 };
     case "Mage":    return { hp:60,  str:5,  dex:10, int:15, luck:7 };
     case "Rogue":   return { hp:80,  str:10, dex:15, int:8,  luck:10 };
     default:        return { hp:70,  str:10, dex:10, int:10, luck:5 };
   }
 }