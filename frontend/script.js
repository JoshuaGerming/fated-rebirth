// ===== UTILITY =====
function getMod(stat) {
  return Math.floor((stat - 10) / 2);
}
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ===== GEAR LIST =====
const gearList = [
  { id: 1, name: "Iron Sword",    type: "weapon",    cost: 100, mods: { str: 2 } },
  { id: 2, name: "Steel Sword",   type: "weapon",    cost: 200, mods: { str: 4 } },
  { id: 3, name: "Leather Armor", type: "armor",     cost: 100, mods: { dex: 2 } },
  { id: 4, name: "Chain Mail",    type: "armor",     cost: 200, mods: { dex: 4 } },
  { id: 5, name: "Wizard Hat",    type: "accessory", cost: 150, mods: { int: 2 } },
  { id: 6, name: "Lucky Charm",   type: "accessory", cost: 250, mods: { luck: 2 } }
];

// ===== SPECIAL (RARE) GEAR =====
const specialGearList = [
  { id: 101, name: "Mythic Blade",    type: "weapon",    cost: 500, mods: { str: 6 } },
  { id: 102, name: "Phantom Cloak",   type: "armor",     cost: 500, mods: { dex: 6 } },
  { id: 103, name: "Arcane Talisman", type: "accessory", cost: 500, mods: { int: 6 } }
];

// ===== POTION =====
const potion = { id: 201, name: "Healing Potion", cost: 50, heal: 10 };

// ===== STAT GENERATION =====
function generateStats(heroClass) {
  switch (heroClass) {
    case "Warrior": return { hp:100, str:15, dex:8,  int:5,  luck:5 };
    case "Mage":    return { hp:60,  str:5,  dex:10, int:15, luck:7 };
    case "Rogue":   return { hp:80,  str:10, dex:15, int:8,  luck:10 };
    default:        return { hp:70,  str:10, dex:10, int:10, luck:5 };
  }
}

// ===== DIFFICULTY & ROOM COUNTS =====
const difficultyRooms = { easy:5, medium:8, hard:10 };

// ===== RARE EVENT CONFIG =====
const rareEventTypes = ["RareShop","RareShrine","RareVault"];
const rareChances    = { easy:0.02, medium:0.03, hard:0.05 };

// ===== ENEMY & BOSS POOLS =====
const enemyPool = [
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
const bossPool = [
  { name:"Minotaur",    hp:80,  str:18, dex:11, powerLevel:7, desc:"Man-bull hybrid." },
  { name:"Lich",        hp:70,  str:16, dex:13, powerLevel:6, desc:"Undead spellcaster." },
  { name:"Dragon",      hp:120, str:20, dex:15, powerLevel:8, desc:"Ancient fire wyrm." }
];

// ===== HELPERS =====
function powerLevel(e) { return e.powerLevel; }
function showMessage(msg) {
  document.getElementById("context-panel").innerHTML =
    `<p>${msg}</p><button onclick="showRoom()">Continue</button>`;
}
function getEnemyDice(pl) {
  if (pl <= 2) return 6;
  if (pl <= 4) return 8;
  if (pl <= 6) return 10;
  return 12;
}
function getEffectiveStat(stat) {
  const base = window.profile.stats[stat] || 0;
  const eq   = window.profile.equipped || {};
  return ["weapon","armor","accessory"].reduce((sum,slot) =>
    sum + ((eq[slot] && eq[slot].mods[stat]) || 0)
  , base);
}

// ===== PROFILE CREATION =====
function createProfile() {
  document.getElementById("context-panel").innerHTML = `
    <h2>Create Your Hero</h2>
    <form onsubmit="saveProfile(event)">
      <label>Name:</label><br>
      <input type="text" id="hero-name" required><br><br>
      <label>Class:</label><br>
      <select id="hero-class" required>
        <option>Warrior</option><option>Mage</option><option>Rogue</option>
      </select><br><br>
      <button type="submit">Save</button>
    </form>`;
}
function saveProfile(ev) {
  ev.preventDefault();
  const name      = document.getElementById("hero-name").value;
  const heroClass = document.getElementById("hero-class").value;
  const stats     = generateStats(heroClass);

  fetch("/save-profile", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ name, heroClass, stats })
  })
  .then(r => r.json())
  .then(()=>{
    window.profile = {
      name, heroClass, stats,
      essence:0, gold:0, potions:0,
      inventory:[], equipped:{ weapon:null, armor:null, accessory:null }
    };
    showMenu();
  })
  .catch(()=> showMessage("Error saving profile"));
}

// ===== LOAD & SELECT PROFILE =====
function loadRun() {
  fetch("/list-profiles")
    .then(r=>r.json())
    .then(list=>{
      if (!list.length) return showMessage("No profiles.");
      let html = "<h2>Load Profile</h2><ul>";
      list.forEach((p,i)=>{
        html += `<li>${p.name} (${p.heroClass})
          <button onclick="selectProfile(${i})">Load</button></li>`;
      });
      html += "</ul>";
      document.getElementById("context-panel").innerHTML = html;
      window.loadedProfiles = list;
    })
    .catch(()=> showMessage("Error loading profiles"));
}
function selectProfile(i) {
  const p = window.loadedProfiles[i];
  window.profile = {
    name:      p.name,
    heroClass: p.heroClass,
    stats:     p.stats,
    essence:   p.essence   ?? 0,
    gold:      p.gold      ?? 0,
    potions:   p.potions   ?? 0,
    inventory: p.inventory ?? [],
    equipped:  p.equipped  ?? { weapon:null, armor:null, accessory:null }
  };
  showMenu();
}

// ===== MAIN MENU =====
function showMenu() {
  const p = window.profile;
  if (!p) {
    return document.getElementById("context-panel").innerHTML =
      `<h2>Fated Rebirth</h2><p>Create or load a profile.</p>`;
  }
  const strMod = getMod(getEffectiveStat("str")),
        dexMod = getMod(getEffectiveStat("dex")),
        intMod = getMod(getEffectiveStat("int"));

  document.getElementById("context-panel").innerHTML = `
    <h2>${p.name} the ${p.heroClass}</h2>
    <p><strong>Stats</strong> |
      HP: ${p.stats.hp} |
      STR: ${p.stats.str} (${strMod>=0? "+"+strMod:strMod}) |
      DEX: ${p.stats.dex} (${dexMod>=0? "+"+dexMod:dexMod}) |
      INT: ${p.stats.int} (${intMod>=0? "+"+intMod:intMod})
    </p>
    <p><strong>Resources</strong> |
      Essence: ${p.essence} |
      Gold: ${p.gold} |
      Potions: ${p.potions}
    </p>
    <button onclick="startNewRun()">Enter Dungeon</button>
    <button onclick="openProgressionHub()">Progression Hub</button>
    <button onclick="openShop()">Shop</button>
    <button onclick="openInventory()">Inventory</button>
  `;
}

// ===== USE POTION =====
function usePotion() {
  const p = window.profile, D = window.dungeon;
  if (!D) return;
  if (p.potions <= 0) {
    document.getElementById("context-panel").innerHTML = `
      <p>No potions!</p>
      <button onclick="showRoom()">Continue</button>
    `;
    return;
  }
  p.potions--;
  D.currentHp = Math.min(D.currentHp + potion.heal, p.stats.hp);
  fetch("/update-profile", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ name: p.name, updates:{ potions:p.potions } })
  })
  .then(r=>r.json())
  .then(updated=>{
    window.profile = updated;
    document.getElementById("context-panel").innerHTML = `
      <p>You drink a potion and recover ${potion.heal} HP.</p>
      <p>HP: ${D.currentHp}/${p.stats.hp}</p>
      <button onclick="showRoom()">Continue</button>
    `;
  })
  .catch(()=>{
    document.getElementById("context-panel").innerHTML = `
      <p>You drink a potion and recover ${potion.heal} HP.</p>
      <p>HP: ${D.currentHp}/${p.stats.hp}</p>
      <button onclick="showRoom()">Continue</button>
    `;
  });
}

// ===== DIFFICULTY SELECTION =====
function startNewRun() {
  if (!window.profile) return showMessage("Load/create profile first.");
  document.getElementById("context-panel").innerHTML = `
    <h2>Select Difficulty</h2>
    <button onclick="startDungeon('easy')">Easy (${difficultyRooms.easy})</button>
    <button onclick="startDungeon('medium')">Medium (${difficultyRooms.medium})</button>
    <button onclick="startDungeon('hard')">Hard (${difficultyRooms.hard})</button>
  `;
}

// ===== DUNGEON INITIALIZATION =====
function startDungeon(diff) {
  const count = difficultyRooms[diff];
  const rooms = generateDungeonRooms(count, diff);
  window.dungeon = {
    profile: window.profile,
    difficulty: diff,
    rooms,
    index: 0,
    currentHp: window.profile.stats.hp,
    goldRun: 0
  };
  showRoom();
}

// ===== ROOM GENERATION (WITH NEW TYPES) =====
function generateDungeonRooms(count, diff) {
  const rooms = [];
  for (let i = 0; i < count; i++) {
    // Boss on last room for medium/hard
    if (i === count - 1 && (diff === "medium" || diff === "hard")) {
      rooms.push({ type: "Boss", enemy: { ...randomChoice(bossPool) } });
      continue;
    }
    // Rare event
    if (Math.random() < rareChances[diff]) {
      rooms.push({ type: randomChoice(rareEventTypes) });
      continue;
    }
    // Weighted room-types including Puzzle, Rest, Merchant
    const roll = Math.random();
    let type;
    if (roll < 0.05)              type = "Trap";      // 5%
    else if (roll < 0.40)         type = "Enemy";     // 35%
    else if (roll < 0.60)         type = "Treasure";  // 20%
    else if (roll < 0.75)         type = "Event";     // 15%
    else if (roll < 0.85)         type = "Puzzle";    // 10%
    else if (roll < 0.90)         type = "Rest";      // 5%
    else                          type = "Merchant";  // 10%

    const r = { type };
    if (type === "Trap") {
      r.damage = Math.max(5, 20 - getMod(getEffectiveStat("dex")) * 5);
    }
    if (type === "Enemy") {
      let totalW = enemyPool.reduce((s,e)=>s+e.powerLevel,0)
                   + window.profile.stats.luck*2;
      let rr = Math.random()*totalW, chosen = enemyPool[0];
      for (let e of enemyPool) {
        if (rr < e.powerLevel) { chosen = e; break; }
        rr -= e.powerLevel;
      }
      const scale = diff==="hard"?1.5:diff==="medium"?1.2:1;
      r.enemy = {
        name: chosen.name,
        hp:   Math.max(10, Math.floor(chosen.hp*scale)),
        str:  Math.max(10, Math.floor(chosen.str*scale)),
        dex:  Math.max(10, Math.floor(chosen.dex*scale)+2),
        powerLevel: chosen.powerLevel
      };
    }
    if (type === "Treasure") {
      r.gold = Math.floor(Math.random()*50) + 10;
    }
    rooms.push(r);
  }
  return rooms;
}

// ===== ROOM RENDER =====
function showRoom() {
  const D = window.dungeon;
  if (D.currentHp <= 0) return endGame(false);
  if (D.index >= D.rooms.length) return endGame(true);

  const r = D.rooms[D.index];
  let html = `<h2>Room ${D.index+1}: ${r.type}</h2>`;

  switch (r.type) {
    case "Trap":
      html += `
        <p>A trap! Choose:</p>
        <button onclick="handleTrap('dodge')">Dodge</button>
        <button onclick="handleTrap('disarm')">Disarm</button>
        <button onclick="usePotion()">Use Potion</button>
      `;
      break;

    case "Enemy":
    case "Boss":
      html += `
        <p>${r.enemy.name} (PL${powerLevel(r.enemy)})</p>
        <button onclick="handleCombat()">Attack</button>
        ${r.type==="Enemy"?`<button onclick="handleCombat('flee')">Flee</button>`:""}
        <button onclick="usePotion()">Use Potion</button>
      `;
      break;

    case "Treasure":
      html += `
        <p>A chest. Open?</p>
        <button onclick="handleTreasure('open')">Open</button>
        <button onclick="handleTreasure('leave')">Leave</button>
      `;
      break;

    case "Event":
      html += `
        <p>A mysterious event. Investigate?</p>
        <button onclick="handleEvent()">Investigate</button>
      `;
      break;

    case "Puzzle":
      html += `
        <p>You encounter a mysterious puzzle.</p>
        <button onclick="handlePuzzle()">Attempt Puzzle</button>
        <button onclick="skipPuzzle()">Leave It</button>
        <button onclick="usePotion()">Use Potion</button>
      `;
      break;

    case "Rest":
      html += `
        <p>You find a safe alcove. Rest to recover 20 HP?</p>
        <button onclick="handleRest()">Rest</button>
        <button onclick="skipRest()">Move On</button>
      `;
      break;

    case "Merchant":
      html += `
        <p>A wandering merchant appears.</p>
        <button onclick="handleMerchant()">Trade</button>
        <button onclick="nextRoom()">Ignore</button>
      `;
      break;

    case "RareShop":
      let shopHtml = `<h2>🛍️ Special Merchant</h2><ul>`;
      specialGearList.forEach(item => {
        shopHtml += `
          <li>${item.name} — ${item.cost}g
            <button onclick="handleRarePurchase(${item.id})">Buy</button>
          </li>`;
      });
      shopHtml += `</ul><button onclick="nextRoom()">Leave Shop</button>`;
      html = shopHtml;
      break;

    case "RareShrine":
      html = `
        <h2>✨ Shrine</h2>
        <button onclick="handleRareShrine()">Receive Blessing</button>
      `;
      break;

    case "RareVault":
      html = `
        <h2>🗝️ Vault</h2>
        <button onclick="handleRareVault()">Claim Vault</button>
      `;
      break;
  }

  document.getElementById("context-panel").innerHTML = html;
}

// ===== HANDLERS =====
function handleTrap(action) {
  const D = window.dungeon, room = D.rooms[D.index];
  const base = Math.floor(Math.random()*20)+1;
  const mod  = action==="dodge"
             ? getMod(getEffectiveStat("dex"))
             : getMod(getEffectiveStat("str"));
  const tot  = base + mod;
  let txt   = `Roll: ${base}+${mod}=${tot}. `;
  if (tot >= 15) txt += action==="dodge"? "You dodge it!" : "You disarm it!";
  else {
    txt += `You take ${room.damage} damage.`;
    D.currentHp -= room.damage;
  }
  showResult(txt);
}

function handleCombat(action) {
  const D = window.dungeon;
  const r = D.rooms[D.index];
  const enemy = r.enemy;

  // Initialize enemy HP on first hit
  if (!enemy.currentHp) enemy.currentHp = enemy.hp;

  // --- Flee logic ---
  if (action === "flee") {
    const roll = Math.floor(Math.random() * 20) + 1;
    const dm = getMod(getEffectiveStat("dex"));
    const tot = roll + dm;
    if (tot >= 15) {
      // Successful escape
      showMessage(`Flee: ${roll}+${dm}=${tot}. You escaped!`);
      D.index++;
      showRoom();
    } else {
      // Failed escape: enemy gets a free hit
      const dice = getEnemyDice(enemy.powerLevel);
      const eRoll = Math.floor(Math.random() * dice) + 1;
      const eMod = getMod(enemy.str);
      const eDmg = Math.max(1, eRoll + eMod);
      D.currentHp -= eDmg;
      const log = `Flee failed! Enemy strikes for ${eRoll}+${eMod}=${eDmg} HP.`;
      // Enter combat view with this log
      renderCombat(log);
    }
    return;
  }

  // --- Regular attack logic ---
  let log = "";
  const hitRoll = Math.floor(Math.random() * 20) + 1;
  const hitMod = D.profile.heroClass === "Mage"
               ? getMod(getEffectiveStat("int"))
               : getMod(getEffectiveStat("str"));
  log += `To Hit: ${hitRoll}+${hitMod}=${hitRoll + hitMod}. `;

  const dmgRoll = Math.floor(Math.random() * 12) + 1;
  const dmgVal = Math.max(1, dmgRoll + hitMod);
  enemy.currentHp -= dmgVal;
  log += `Damage: ${dmgRoll}+${hitMod}=${dmgVal}.\n`;

  if (enemy.currentHp > 0) {
    // Enemy turn
    const dodgeRoll = Math.floor(Math.random() * 20) + 1;
    const dMod = getMod(enemy.dex);
    if (dodgeRoll + dMod >= 18) {
      log += "Enemy misses.\n";
      renderCombat(log);
    } else {
      const dice = getEnemyDice(enemy.powerLevel);
      const eRoll = Math.floor(Math.random() * dice) + 1;
      const eMod = getMod(enemy.str);
      const eDmg = Math.max(1, eRoll + eMod);
      D.currentHp -= eDmg;
      log += `Enemy hits for ${eRoll}+${eMod}=${eDmg}.\n`;
      renderCombat(log);
    }
  } else {
    const reward = enemy.powerLevel * 10;
    D.goldRun += reward;
    log += `Enemy defeated! +${reward} gold.\n`;
    showResult(log);
  }
}

function renderCombat(log) {
  const D = window.dungeon, r = D.rooms[D.index];
  const htmlLog = log.split("\n").map(l=>`<p>${l}</p>`).join("");
  document.getElementById("context-panel").innerHTML = `
    ${htmlLog}
    <p>HP: ${D.currentHp}/${D.profile.stats.hp}
       | Enemy: ${r.enemy.currentHp}/${r.enemy.hp}</p>
    <button onclick="handleCombat()">Attack</button>
    ${r.type==="Enemy"? `<button onclick="handleCombat('flee')">Flee</button>` : ""}
    <button onclick="usePotion()">Use Potion</button>
  `;
}

function handleTreasure(choice) {
  const D = window.dungeon;
  if (choice === "open") {
    const base = Math.floor(Math.random()*20)+1;
    const iMod = getMod(getEffectiveStat("int"));
    const tot  = base + iMod;
    if (tot < 10) {
      D.rooms[D.index].type = "Enemy";
      D.rooms[D.index].enemy = { name:"Mimic",hp:30,str:10,dex:8,powerLevel:3 };
      return showRoom();
    }
    const g = Math.floor(Math.random()*50)+10;
    D.goldRun += g;
    showResult(`You found ${g} gold!`);
  } else showResult("You leave it.");
}

function handleEvent() {
  const D = window.dungeon;
  const base = Math.floor(Math.random()*20)+1;
  const iMod = getMod(getEffectiveStat("int"));
  const luck = getEffectiveStat("luck");
  const tot  = base + iMod + luck;
  let txt   = `Roll ${base}+${iMod}+${luck}=${tot}. `;
  if (tot >= 18)      { window.profile.stats.luck++; txt += "Luck +1!"; }
  else if (tot >= 15) { txt += "Ally aids you."; }
  else                { txt += "Nothing happens."; }
  showResult(txt);
}

// ===== NEW ROOM HANDLERS =====
function handlePuzzle() {
  const D = window.dungeon;
  const base = Math.floor(Math.random()*20)+1;
  const mod  = getMod(getEffectiveStat("int"));
  const tot  = base + mod;
  let txt;
  if (tot >= 15) {
    const gold = 20 + mod*2;
    D.goldRun += gold;
    txt = `You solve it! +${gold} gold.`;
  } else {
    const dmg = 5;
    D.currentHp -= dmg;
    txt = `You fail and trigger a shock: -${dmg} HP.`;
  }
  showResult(txt);
}
function skipPuzzle() {
  showResult("You leave the puzzle untouched.");
}
function handleRest() {
  const D = window.dungeon;
  const heal = 20;
  D.currentHp = Math.min(D.currentHp + heal, D.profile.stats.hp);
  showResult(`You rest and recover ${heal} HP.`);
}
function skipRest() {
  showResult("You press on, leaving the alcove.");
}
function handleMerchant() {
  const p = window.profile, D = window.dungeon;
  let html = `
    <h2>🛒 Dungeon Merchant</h2>
    <div id="merc-msg" style="margin-bottom:8px;color:lightgreen;"></div>
    <ul>
      <li>Healing Potion — ${potion.cost}g
        <button onclick="buyPotionInDungeon()">Buy</button>
      </li>
      <li>Small HP Scroll (+15 HP) — 75g
        <button onclick="buyScroll()">Buy</button>
      </li>
    </ul>
    <button onclick="nextRoom()">Done</button>
  `;
  document.getElementById("context-panel").innerHTML = html;
}
// ===== In‐Dungeon Merchant Purchases =====
function buyPotionInDungeon() {
  const p   = window.profile;
  const msg = document.getElementById("merc-msg");
  // validation
  if (p.potions >= 3) { msg.textContent = "Max 3 potions!"; return; }
  if (p.gold    < potion.cost) { msg.textContent = "Not enough gold!"; return; }
  // apply locally
  p.gold   -= potion.cost;
  p.potions++;
  // persist only gold & potions, but stay in merchant UI
  fetch("/update-profile", {
    method: "POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ 
      name: p.name, 
      updates: { gold: p.gold, potions: p.potions } 
    })
  })
  .then(res => res.json())
  .then(updated => {
    window.profile = updated;
    msg.textContent = `Purchased ${potion.name}! You now have ${updated.potions}.`;
  })
  .catch(() => {
    msg.textContent = "Potion added locally, but failed to save.";
  });
}

function buyScroll() {
  const p   = window.profile;
  const D   = window.dungeon;
  const msg = document.getElementById("merc-msg");
  const cost = 75, heal = 15;
  // validation
  if (p.gold < cost) { msg.textContent = "Not enough gold!"; return; }
  // apply locally
  p.gold -= cost;
  D.currentHp = Math.min(D.currentHp + heal, p.stats.hp);
  // persist only gold (scroll is one-time effect), then update message
  fetch("/update-profile", {
    method: "POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ 
      name: p.name, 
      updates: { gold: p.gold } 
    })
  })
  .then(res => res.json())
  .then(updated => {
    window.profile = updated;
    msg.textContent = `You use the scroll and recover ${heal} HP.`;
  })
  .catch(() => {
    msg.textContent = "Scroll used locally, but failed to save.";
  });
}

// ===== RARE HANDLERS =====
function handleRarePurchase(id) {
  const p = window.profile, itm = specialGearList.find(g=>g.id===id);
  const msg = document.getElementById("shop-message");
  if (!itm) return;
  if (p.gold < itm.cost) { showMessage("Not enough gold."); return; }
  if (p.inventory.some(i=>i.id===id)) { showMessage("Already own."); return; }
  p.gold -= itm.cost; p.inventory.push(itm);
  if (!p.equipped[itm.type]) p.equipped[itm.type] = itm;
  updateProfile({ gold:p.gold, inventory:p.inventory, equipped:p.equipped });
  showMessage(`Purchased ${itm.name}!`);
}
function handleRareShrine() {
  const stats = ["hp","str","dex","int","luck"], choice = randomChoice(stats);
  window.profile.stats[choice] += (choice==="hp"?10:1);
  showResult(`Shrine blesses you: +${choice.toUpperCase()}`);
}
function handleRareVault() {
  const D = window.dungeon;
  D.goldRun += 100;
  window.profile.essence += 2;
  showResult("You claim the vault: +100 gold & +2 essence!");
}

// ===== SHOW RESULT & CONTINUE =====
function showResult(log) {
  const D = window.dungeon;
  if (isNaN(D.currentHp) || D.currentHp==null) D.currentHp = D.profile.stats.hp;
  const htmlLog = log.split("\n").map(l=>`<p>${l}</p>`).join("");
  document.getElementById("context-panel").innerHTML = `
    ${htmlLog}
    <p>HP: ${D.currentHp}/${D.profile.stats.hp} | Gold This Run: ${D.goldRun}</p>
    <button onclick="nextRoom()">Continue</button>
  `;
}
function nextRoom() {
  window.dungeon.index++;
  showRoom();
}

// ===== ENDGAME & SAVE =====
function endGame(win) {
  const D = window.dungeon;
  const text = win?"You survived!":"You perished...";
  const earn = D.difficulty==="easy"?1:D.difficulty==="medium"?3:5;
  window.profile.gold    += D.goldRun;
  window.profile.essence += earn;
  document.getElementById("context-panel").innerHTML = `
    <h2>${text}</h2>
    <p>Gold +${D.goldRun} | Essence +${earn}</p>
    <button onclick="saveRun()">Save & Continue</button>
  `;
}
function saveRun() {
  updateProfile({
    gold: window.profile.gold,
    essence: window.profile.essence,
    potions: window.profile.potions,
    inventory: window.profile.inventory,
    equipped: window.profile.equipped
  });
}

// ===== PROGRESSION HUB =====
function openProgressionHub() {
  const p = window.profile;
  document.getElementById("context-panel").innerHTML = `
    <h2>Progression Hub</h2>
    <p><strong>Stats</strong> |
       HP:${p.stats.hp} | STR:${p.stats.str} | DEX:${p.stats.dex} | INT:${p.stats.int} | LUCK:${p.stats.luck}
    </p>
    <p><strong>Resources</strong> |
       Essence:${p.essence} | Gold:${p.gold} | Potions:${p.potions}
    </p>
    <h3>Essence Upgrades (5 Essence each)</h3>
    <button onclick="purchaseUpgrade('hp',5)">+10 HP</button>
    <button onclick="purchaseUpgrade('str',5)">+2 STR</button>
    <button onclick="purchaseUpgrade('dex',5)">+2 DEX</button>
    <button onclick="purchaseUpgrade('int',5)">+2 INT</button><br><br>
    <button onclick="showMenu()">Back</button>
  `;
}
function purchaseUpgrade(stat,cost) {
  const p = window.profile;
  if (p.essence < cost) return openProgressionHub();
  p.essence -= cost;
  if (stat==="hp") p.stats.hp +=10; else p.stats[stat]+=2;
  updateProfile({ essence:p.essence, stats:p.stats });
}

// ===== SHOP =====
function openShop() {
  const p = window.profile;
  let html = `
    <h2>Shop</h2>
    <div id="shop-message" style="margin-bottom:8px;color:yellow;"></div>
    <ul>
  `;
  gearList.forEach(item => {
    html += `
      <li>${item.name} (${item.type}) — ${item.cost}g
        <button onclick="purchaseGear(${item.id})">Buy</button>
      </li>`;
  });
  html += `
      <li>${potion.name} — ${potion.cost}g (Max 3)
        <button onclick="buyPotion()">Buy</button>
      </li>
    </ul>
    <button onclick="showMenu()">Back</button>
  `;
  document.getElementById("context-panel").innerHTML = html;
}
function purchaseGear(id) {
  const p = window.profile, item = gearList.find(g=>g.id===id);
  const msg = document.getElementById("shop-message");
  if (!item) return msg.textContent = "Invalid item.";
  if (p.inventory.some(i=>i.id===id)) return msg.textContent = "Already own that item!";
  if (p.gold < item.cost) return msg.textContent = "Not enough gold!";
  p.gold -= item.cost;
  p.inventory.push(item);
  if (!p.equipped[item.type]) p.equipped[item.type] = item;
  fetch("/update-profile", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ name:p.name, updates:{ gold:p.gold, inventory:p.inventory, equipped:p.equipped } })
  })
  .then(r=>r.json())
  .then(updated => {
    window.profile = updated;
    msg.textContent = `Purchased ${item.name}!`;
  })
  .catch(()=> msg.textContent = "Purchase saved locally but failed to sync.");
}
function buyPotion() {
  const p = window.profile, msg = document.getElementById("shop-message");
  if (p.potions >= 3) return msg.textContent = "Max 3 potions!";
  if (p.gold < potion.cost) return msg.textContent = "Not enough gold!";
  p.gold -= potion.cost; p.potions++;
  fetch("/update-profile", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ name:p.name, updates:{ gold:p.gold, potions:p.potions } })
  })
  .then(r=>r.json())
  .then(updated => {
    window.profile = updated;
    msg.textContent = `Purchased ${potion.name}! You now have ${updated.potions}.`;
  })
  .catch(()=> msg.textContent = "Bought locally but failed to sync.");
}

// ===== INVENTORY =====
function openInventory() {
  const p = window.profile, inv = p.inventory;
  if (!inv.length) {
    document.getElementById("context-panel").innerHTML =
      `<h2>Inventory</h2><p>(empty)</p><button onclick="showMenu()">Back</button>`;
    return;
  }
  let html = `<h2>Inventory</h2><ul>`;
  inv.forEach((item,idx) => {
    const isEq = p.equipped[item.type]?.id === item.id;
    html += `<li>${item.name} (${item.type})${isEq?" (Equipped)":""}
      ${!isEq
        ? `<button onclick="equipItem(${idx})">Equip</button>`
        : `<button onclick="unequipItem('${item.type}')">Unequip</button>`}
    </li>`;
  });
  html += `</ul><button onclick="showMenu()">Back</button>`;
  document.getElementById("context-panel").innerHTML = html;
}
function equipItem(idx) {
  const p = window.profile, item = p.inventory[idx];
  p.equipped[item.type] = item;
  updateProfile({ equipped:p.equipped });
}
function unequipItem(slot) {
  const p = window.profile;
  p.equipped[slot] = null;
  updateProfile({ equipped:p.equipped });
}

// ===== BACKEND UPDATE =====
function updateProfile(updates) {
  fetch("/update-profile", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ name: window.profile.name, updates })
  })
  .then(r=>r.json())
  .then(updated => { window.profile = updated; showMenu(); })
  .catch(()=> showMessage("Error updating profile"));
}

// ===== UNUSED STUBS =====
function multiplayer(){ showMessage("Multiplayer coming soon"); }
function challengeMode(){ showMessage("Challenge mode coming soon"); }
function openSettings(){ showMessage("Settings coming soon"); }
function exitGame(){ showMessage("Thanks for playing!"); }
