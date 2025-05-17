// frontend/js/menu.js

import { getMod, getEffectiveStat } from "./utils.js";
import { openIndex }                from "./indexPage.js";
import { startNewRun }              from "./dungeon.js";
import { openProgressionHub }       from "./progression.js";
import { openShop }                 from "./shop.js";
import { openInventory }            from "./inventory.js";

// at top of menu.js, alongside showAuth()
export function showLogin() {
  // simply delegate to showAuth (which shows both login and register)
  showAuth();
}

/** Show the login/register screen */
export function showAuth() {
  document.getElementById("context-panel").innerHTML = `
    <h2>Login or Register</h2>
    <div class="auth-section">
      <h3>Register</h3>
      <input id="reg-user"    placeholder="Username"><br>
      <input id="reg-pass" type="password" placeholder="Password"><br>
      <button onclick="doRegister()">Register</button>
    </div>
    <hr>
    <div class="auth-section">
      <h3>Login</h3>
      <input id="login-user"    placeholder="Username"><br>
      <input id="login-pass" type="password" placeholder="Password"><br>
      <button onclick="doLogin()">Login</button>
    </div>
  `;
}

/** Show the main in-game menu */
export function showMenu() {
  const p = window.profile;
  if (!p) {
    document.getElementById("context-panel").innerHTML =
      `<h2>Fated Rebirth</h2>
       <p>Please create or load a profile first.</p>`;
    return;
  }

  const strMod = getMod(getEffectiveStat("str"));
  const dexMod = getMod(getEffectiveStat("dex"));
  const intMod = getMod(getEffectiveStat("int"));

  document.getElementById("context-panel").innerHTML = `
    <h2>${p.name} the ${p.heroClass}</h2>
    <p><strong>Stats</strong> |
      HP: ${p.stats.hp} |
      STR: ${p.stats.str} (${strMod>=0 ? "+"+strMod : strMod}) |
      DEX: ${p.stats.dex} (${dexMod>=0 ? "+"+dexMod : dexMod}) |
      INT: ${p.stats.int} (${intMod>=0 ? "+"+intMod : intMod})
    </p>
    <p><strong>Resources</strong> |
      Essence: ${p.essence} |
      Gold: ${p.gold} |
      Potions: ${p.potions}
    </p>
    <button onclick="openIndex()">Index</button>
    <button onclick="startNewRun()">Enter Dungeon</button>
    <button onclick="openProgressionHub()">Progression Hub</button>
    <button onclick="openShop()">Shop</button>
    <button onclick="openInventory()">Inventory</button>
    <button onclick="showAuth()">Switch User</button>
    <button onclick="exitGame()">Logout</button>
  `;
}

/** Delegate to global profile.js */
export function createProfile() {
  window.createProfile();
}

export function loadRun() {
  window.loadRun();
}

/** Stub—will be overridden by script.js */
export function exitGame() {
  console.warn("exitGame() called before binding logout handler");
}

// ——— Re-export the navigation helpers ———
export {
  openIndex,
  startNewRun,
  openProgressionHub,
  openShop,
  openInventory
};
