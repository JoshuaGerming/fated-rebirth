// js/dungeon.js

import {
  getMod,
  randomChoice,
  enemyPool,
  bossPool,
  specialGearList
} from "./utils.js";
import {
  showResult,
  nextRoom,
  endGame
} from "./combat.js";

/**
 * Entry point when clicking “Enter Dungeon”
 */
export function startNewRun() {
  if (!window.profile) {
    document.getElementById("context-panel").innerHTML =
      `<p>Load or create a profile first.</p>
       <button onclick="showMenu()">Back</button>`;
    return;
  }
  document.getElementById("context-panel").innerHTML = `
    <h2>Select Difficulty</h2>
    <button onclick="startDungeon('easy')">Easy (5 rooms)</button>
    <button onclick="startDungeon('medium')">Medium (8 rooms)</button>
    <button onclick="startDungeon('hard')">Hard (10 rooms)</button>
  `;
}

/**
 * Initialize dungeon state and show first room
 */
export function startDungeon(difficulty) {
  const roomCounts = { easy: 5, medium: 8, hard: 10 };
  window.dungeon = {
    profile: window.profile,
    difficulty,
    rooms: generateDungeonRooms(roomCounts[difficulty], difficulty),
    index: 0,
    currentHp: window.profile.stats.hp,
    goldRun: 0
  };
  showRoom();
}

/**
 * Generate an array of room descriptors
 */
export function generateDungeonRooms(count, difficulty) {
  const rareChance = { easy: 0.02, medium: 0.03, hard: 0.05 }[difficulty];
  const rooms = [];

  for (let i = 0; i < count; i++) {
// Boss on last medium/hard room
    if (i === count - 1 && (difficulty === "medium" || difficulty === "hard")) {
      const boss = randomChoice(bossPool);
      const scaledHp = Math.floor(boss.hp * (difficulty === "hard" ? 2.0 : 1.2));

      rooms.push({
        type: "Boss",
        enemy: {
          ...boss,
          maxHp:      scaledHp,
          currentHp:  scaledHp,
          dex:        boss.dex || 10
        }
      });
      continue;
    }

    // Rare special events
    if (Math.random() < rareChance) {
      rooms.push({ type: randomChoice(["RareShop", "RareShrine", "RareVault"]) });
      continue;
    }

    // Regular rooms
    const roll = Math.random();
    let type;
    if (roll < 0.05) type = "Trap";
    else if (roll < 0.40) type = "Enemy";
    else if (roll < 0.60) type = "Treasure";
    else if (roll < 0.75) type = "Event";
    else if (roll < 0.85) type = "Puzzle";
    else if (roll < 0.90) type = "Rest";
    else type = "Merchant";

    const room = { type };

    if (type === "Trap") {
      room.damage = Math.max(5, 20 - getMod(window.profile.stats.dex) * 5);
    }

    if (type === "Enemy") {
      // Weight stronger enemies by luck
      let totalPL = enemyPool.reduce((sum, e) => sum + e.powerLevel, 0)
                  + window.profile.stats.luck * 2;
      let pick = Math.random() * totalPL;
      let chosen = enemyPool[0];
      for (const e of enemyPool) {
        if (pick < e.powerLevel) { chosen = e; break; }
        pick -= e.powerLevel;
      }
      const scale = difficulty === "hard" ? 1.5
                    : difficulty === "medium" ? 1.2
                    : 1.0;
    
     const scaledHp = Math.max(10, Math.floor(chosen.hp * scale));
     const scaledStr = Math.max(10, Math.floor(chosen.str * scale));
     const scaledDex = Math.max(10, Math.floor(chosen.dex * scale) + 2);

     room.enemy = {
       name:        chosen.name,
       powerLevel:  chosen.powerLevel,
       maxHp:       scaledHp,       // new
       currentHp:   scaledHp,       // new
       str:         scaledStr,
       dex:         scaledDex
     };
    }

    if (type === "Treasure") {
       // 10% chance this chest is actually a Mimic!
     if (Math.random() < 0.10) {
        room.enemy = {
         name:        "Mimic",
         powerLevel:  3,
         maxHp:       30,            // new
         currentHp:   30,            // new
         str:         10,
         dex:         8,
         desc:        "A chest that bites back!"
       };
     } else {
       room.gold = Math.floor(Math.random() * 50) + 10;
     }
    }

    rooms.push(room);
  }

  return rooms;
}

/**
 * Render the current room’s UI
 */
export function showRoom() {
  const D = window.dungeon;
  // check for death or completion
  if (D.currentHp <= 0) return endGame(false);
  if (D.index >= D.rooms.length) return endGame(true);

  const r = D.rooms[D.index];
  let html = `<h2>Room ${D.index + 1}: ${r.type}</h2>`;

  switch (r.type) {
    case "Trap":
      html += `
        <p>A trap lies ahead. Choose:</p>
        <button onclick="handleTrap('dodge')">Dodge</button>
        <button onclick="handleTrap('disarm')">Disarm</button>
        <button onclick="usePotion()">Use Potion</button>
      `;
      break;

    case "Enemy":
    case "Boss":
      html += `
        <p>${r.enemy.name} (PL${r.enemy.powerLevel})</p>
        <button onclick="handleCombat()">Attack</button>
        ${r.type === "Enemy" ? `<button onclick="handleCombat('flee')">Flee</button>` : ""}
        <button onclick="usePotion()">Use Potion</button>
      `;
      break;

    case "Treasure":
      html += `
        <p>A chest in the corner. Open?</p>
        <button onclick="handleTreasure('open')">Open</button>
        <button onclick="handleTreasure('leave')">Leave</button>
      `;
      break;

    case "Event":
      html += `
        <p>A mysterious event occurs. Investigate?</p>
        <button onclick="handleEvent()">Investigate</button>
      `;
      break;

    case "Puzzle":
      html += `
        <p>You encounter a puzzle. Choose:</p>
        <button onclick="handlePuzzle()">Attempt</button>
        <button onclick="skipPuzzle()">Skip</button>
        <button onclick="usePotion()">Use Potion</button>
      `;
      break;

    case "Rest":
      html += `
        <p>A safe alcove. Rest to recover 20 HP?</p>
        <button onclick="handleRest()">Rest</button>
        <button onclick="skipRest()">Move On</button>
      `;
      break;

    case "Merchant":
      html += `
        <p>A wandering merchant offers wares.</p>
        <button onclick="handleMerchant()">Trade</button>
        <button onclick="nextRoom()">Ignore</button>
      `;
      break;

    case "RareShop":
      {
        let shopHtml = `<h2>Special Merchant</h2><ul>`;
        specialGearList.forEach(item => {
          shopHtml += `
            <li>${item.name} — ${item.cost}g
              <button onclick="handleRarePurchase(${item.id})">Buy</button>
            </li>`;
        });
        shopHtml += `</ul><button onclick="nextRoom()">Leave</button>`;
        html = shopHtml;
      }
      break;

    case "RareShrine":
      html = `
        <h2>Sacred Shrine</h2>
        <p>A voice offers a boon...</p>
        <button onclick="handleRareShrine()">Receive Blessing</button>
      `;
      break;

    case "RareVault":
      html = `
        <h2>Hidden Vault</h2>
        <p>Glittering treasures beckon...</p>
        <button onclick="handleRareVault()">Claim Vault</button>
      `;
      break;
  }

  document.getElementById("context-panel").innerHTML = html;
}

/**
 * ===== HANDLERS =====
 */

export function handleTrap(action) {
  const D = window.dungeon;
  const baseRoll = Math.floor(Math.random() * 20) + 1;
  const mod = action === "dodge"
            ? getMod(window.profile.stats.dex)
            : getMod(window.profile.stats.str);
  const total = baseRoll + mod;
  let text = `You roll ${baseRoll} + ${mod} = ${total}. `;
  if (total >= 15) {
    text += action === "dodge" ? "You dodge the trap!" : "You disarm it!";
  } else {
    D.currentHp -= D.rooms[D.index].damage;
    text += `You fail and take ${D.rooms[D.index].damage} damage.`;
  }
  showResult(text);
}

export function handleTreasure(choice) {
  const D = window.dungeon;
  if (choice === "open") {
    const gold = D.rooms[D.index].gold;
    D.goldRun += gold;
    showResult(`You found ${gold} gold!`);
  } else {
    showResult("You leave the chest untouched.");
  }
}

export function handleEvent() {
  const D = window.dungeon;
  const roll = Math.floor(Math.random() * 20) + 1 + getMod(window.profile.stats.luck);
  if (roll >= 18) {
    window.profile.stats.luck += 1;
    showResult("A mysterious boon! Your luck has increased.");
  } else if (roll >= 15) {
    showResult("An unexpected ally appears and aids you!");
  } else {
    showResult("Nothing of note happens.");
  }
}

export function handlePuzzle() {
  const D = window.dungeon;
  const base = Math.floor(Math.random() * 20) + 1;
  const mod  = getMod(window.profile.stats.int);
  const tot  = base + mod;
  if (tot >= 15) {
    const gold = 20 + mod * 2;
    D.goldRun += gold;
    showResult(`Puzzle solved! You earn ${gold} gold.`);
  } else {
    D.currentHp -= 5;
    showResult("Puzzle failed! You lose 5 HP.");
  }
}

export function skipPuzzle() {
  showResult("You decide not to meddle with the puzzle.");
}

export function handleRest() {
  const D = window.dungeon;
  D.currentHp = Math.min(D.currentHp + 20, D.profile.stats.hp);
  showResult("You rest and recover 20 HP.");
}

export function skipRest() {
  showResult("You move on without resting.");
}

export function handleMerchant() {
  document.getElementById("context-panel").innerHTML = `
    <h2>Wandering Merchant</h2>
    <p>What would you like to buy?</p>
    <button onclick="buyPotionInDungeon()">Potion (50g)</button>
    <button onclick="buyScroll()">Scroll (+15 HP) (75g)</button>
    <button onclick="nextRoom()">Leave</button>
  `;
}

/**
 * ===== RARE HANDLERS =====
 */

export function handleRarePurchase(id) {
  const item = specialGearList.find(i => i.id === id);
  if (!item) return showResult("Item not found.");
  if (window.profile.gold < item.cost) {
    return showResult("Not enough gold for that item.");
  }
  window.profile.gold -= item.cost;
  window.profile.inventory.push(item);
  showResult(`You purchased ${item.name}!`);
}

export function handleRareShrine() {
  window.profile.stats.hp += 10;
  showResult("You feel invigorated! +10 max HP.");
}

export function handleRareVault() {
  const loot = Math.floor(Math.random() * 200) + 50;
  window.profile.gold += loot;
  showResult(`You siphon off ${loot} gold from the vault!`);
}
