// js/combat.js

import { getMod, getEnemyDice } from "./utils.js";
import { showRoom }             from "./dungeon.js";
import { updateProfile }        from "./profile.js";
import { showMenu }             from "./menu.js";

/**
 * Animate a quick “shake” then perform an attack.
 */
export function attackWithAnimation() {
  const heroEl  = document.getElementById("hero-portrait");
  const enemyEl = document.getElementById("enemy-portrait");
  heroEl.classList.add("shake");
  enemyEl.classList.add("shake");
  setTimeout(() => {
    heroEl.classList.remove("shake");
    enemyEl.classList.remove("shake");
    handleCombat();
  }, 300);
}

/**
 * Render ongoing combat turn with portraits and buttons.
 */
export function renderCombat(messages = []) {
  const D     = window.dungeon;
  const p     = window.profile;
  const enemy = D.rooms[D.index].enemy;

  // build src paths (absolute to Flask’s /static folder)
  const heroSrc  = `/static/assets/hero.png`;
  // lowercase & remove spaces, fallback to placeholder if missing
  const fileName = enemy.name.toLowerCase().replace(/\s+/g, "");
  const enemySrc = `/static/assets/${fileName}.png`;

  document.getElementById("context-panel").innerHTML = `
    <div class="combat-portraits">
      <img
        id="hero-portrait"
        src="${heroSrc}"
        alt="Hero"
        onerror="this.src='/static/assets/placeholder.png'"
      />
      <img
        id="enemy-portrait"
        src="${enemySrc}"
        alt="${enemy.name}"
        onerror="this.src='/static/assets/placeholder.png'"
      />
    </div>
    ${messages.map(m => `<p>${m}</p>`).join("")}
    <p>HP: ${D.currentHp}/${p.stats.hp}</p>
    <p>Enemy HP: ${enemy.currentHp}/${enemy.maxHp}</p>
    <button onclick="attackWithAnimation()">Attack</button>
    <button onclick="handleCombat('flee')">Flee</button>
    <button onclick="usePotion()">Use Potion</button>
  `;
}

/**
 * Core combat/flee logic.
 */
export function handleCombat(action) {
  const D     = window.dungeon;
  const p     = window.profile;
  const enemy = D.rooms[D.index].enemy;
  const isMage = p.heroClass === "Mage";
  let msgs = [];

  // —— FLEE ATTEMPT ——
  if (action === "flee") {
    const roll = Math.floor(Math.random() * 20) + 1;
    const mod  = getMod(p.stats.dex) + getMod(p.stats.luck);
    const total = roll + mod;
    msgs.push(`Flee Roll: ${roll} + ${mod} = ${total}`);
    if (total >= 15) {
      return showResult("You successfully fled!");
    }
    // failed: one free enemy attack
    const eRoll = Math.floor(Math.random() * 20) + 1;
    const eMod  = getMod(enemy.dex);
    const eTot  = eRoll + eMod;
    msgs.push(`Enemy To Hit: ${eRoll} + ${eMod} = ${eTot}`);
    if (eTot >= 12) {
      const dmg = getEnemyDice(enemy.powerLevel) + getMod(enemy.str);
      D.currentHp -= dmg;
      if (D.currentHp <= 0) return endGame(false);
      return renderCombatResult(msgs, `Enemy hits you for ${dmg}.`);
    } else {
      return renderCombatResult(msgs, "Enemy misses you.");
    }
  }

  // —— PLAYER ATTACK ——
  const mainStat = isMage ? p.stats.int : p.stats.str;
  const mainMod  = getMod(mainStat);
  const atkRoll  = Math.floor(Math.random() * 20) + 1;
  const atkTot   = atkRoll + mainMod;
  msgs.push(`To Hit Roll: ${atkRoll} + ${mainMod} = ${atkTot}`);
  if (atkTot >= 12) {
    const die     = Math.floor(Math.random() * 12) + 1; // d12
    const dmg     = die + mainMod;
    enemy.currentHp -= dmg;
    msgs.push(`You deal ${die} + ${mainMod} = ${dmg} damage.`);
  } else {
    msgs.push("You miss.");
  }

  // —— ENEMY DEFEATED? ——
  if (enemy.currentHp <= 0) {
    const goldEarned = enemy.powerLevel * 10;
    p.gold += goldEarned;
    msgs.push(`Enemy defeated! +${goldEarned} gold.`);
    return renderCombatResult(msgs);
  }

  // —— ENEMY ATTACK ——
  const eRoll = Math.floor(Math.random() * 20) + 1;
  const eMod  = getMod(enemy.dex);
  const eTot  = eRoll + eMod;
  msgs.push(`Enemy To Hit: ${eRoll} + ${eMod} = ${eTot}`);
  if (eTot >= 12) {
    const dmg = getEnemyDice(enemy.powerLevel) + getMod(enemy.str);
    D.currentHp -= dmg;
    msgs.push(`Enemy hits you for ${dmg}.`);
  } else {
    msgs.push("Enemy misses you.");
  }

  // —— CHECK DEATH ——
  if (D.currentHp <= 0) {
    return endGame(false);
  }

  // —— CONTINUE FIGHT ——
  return renderCombat(msgs);
}

/**
 * Render a one-off result then Continue into next room.
 */
export function showResult(text) {
  const D = window.dungeon;
  document.getElementById("context-panel").innerHTML = `
    <p>${text}</p>
    <p>HP: ${D.currentHp}/${D.profile.stats.hp} | Gold: ${window.profile.gold}</p>
    <button onclick="nextRoom()">Continue</button>
  `;
}

/**
 * Helper for combat turn results (+Continue button).
 */
export function renderCombatResult(msgs, extra = "") {
  const D     = window.dungeon;
  const handler = D.rooms[D.index].enemy.currentHp <= 0 ? "nextRoom()" : "renderCombat()";
  document.getElementById("context-panel").innerHTML = `
    ${msgs.map(m => `<p>${m}</p>`).join("")}
    ${extra ? `<p>${extra}</p>` : ""}
    <p>HP: ${D.currentHp}/${D.profile.stats.hp} | Gold: ${window.profile.gold}</p>
    <button onclick="${handler}">Continue</button>
  `;
}

/** Move on to next room in the dungeon */
export function nextRoom() {
  window.dungeon.index++;
  showRoom();
}

/**
 * End-of-dungeon summary + Save & Continue.
 */
export function endGame(win) {
  const D = window.dungeon;
  const p = window.profile;
  const text    = win ? "You survived!" : "You perished...";
  const essence = win
    ? (D.difficulty === "easy"   ? 1
     : D.difficulty === "medium" ? 3
     : 5)
    : 0;
  if (win) p.essence += essence;

  document.getElementById("context-panel").innerHTML = `
    <h2>${text}</h2>
    <p>Gold: ${p.gold} | Essence: +${essence}</p>
    <button id="save-continue">Save & Continue</button>
  `;
  document.getElementById("save-continue")
          .addEventListener("click", saveRun);
}

/**
 * Use a potion in-dungeon to heal 10 HP (no turn cost).
 */
export function usePotion() {
  const D = window.dungeon;
  const p = window.profile;
  if (!D) return showMenu();
  if (p.potions <= 0) {
    // no potions: re-render current context
    const room = D.rooms[D.index];
    return room?.enemy ? renderCombat([`No potions left!`]) : showRoom();
  }
  // consume one, restore 10
  p.potions--;
  D.currentHp = Math.min(D.currentHp + 10, p.stats.hp);
  const room = D.rooms[D.index];
  return room?.enemy
    ? renderCombat([`You drink a potion and recover 10 HP.`])
    : showResult("You drink a potion and recover 10 HP.");
}

/**
 * Persist gold & essence back to server, then Main Menu.
 */
function saveRun() {
  const p = window.profile;
  updateProfile({ gold: p.gold, essence: p.essence })
    .then(() => {
      window.dungeon = null;
      showMenu();
    })
    .catch(() => {
      alert("Failed to save run");
      showMenu();
    });
}
