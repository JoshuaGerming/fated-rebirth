// frontend/js/script.js

// ————— Utilities —————
import {
  getMod,
  randomChoice,
  potion,
  gearList,
  enemyPool,
  bossPool,
  specialGearList,
  getEnemyDice,
  getEffectiveStat,
  generateStats
} from "./utils.js";

// ————— Profile Management —————
import {
  createProfile,
  saveProfile,
  loadRun,
  selectProfile,
  updateProfile
} from "./profile.js";

// ————— Combat & Movement —————
import {
  attackWithAnimation,
  handleCombat,
  renderCombat,
  renderCombatResult,
  usePotion,
  nextRoom,
  endGame
} from "./combat.js";

// ————— Dungeon Flow —————
import {
  startNewRun,
  startDungeon,
  generateDungeonRooms,
  showRoom,
  handleTrap,
  handleTreasure,
  handleEvent,
  handlePuzzle,
  skipPuzzle,
  handleRest,
  skipRest,
  handleMerchant,

  // plus your rare‐event handlers:
  handleRarePurchase,
  handleRareShrine,
  handleRareVault
} from "./dungeon.js";

// ————— Shop, Inventory, Progression —————
import * as Shop      from "./shop.js";
import * as Inventory from "./inventory.js";
import * as Progress  from "./progression.js";

// ————— Index Page —————
import { openIndex } from "./indexPage.js";

// ————— Menu & Auth —————
import {
  showAuth,
  showMenu,
  createProfile as showCreateProfile,
  loadRun    as showLoadRun,
  openIndex  as menuOpenIndex,
  startNewRun as menuStartNewRun,
  openProgressionHub,
  openShop     as menuOpenShop,
  openInventory
} from "./menu.js";

// ————— Auth Handlers —————
async function doRegister() {
  const u = document.getElementById("reg-user").value.trim(),
        p = document.getElementById("reg-pass").value;
  const res = await fetch("/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: u, password: p })
  });
  if (res.ok) alert("Registered! You can now log in.");
  else {
    const { msg } = await res.json();
    alert("Register failed: " + msg);
  }
}

async function doLogin() {
  const u = document.getElementById("login-user").value.trim(),
        p = document.getElementById("login-pass").value;
  const res = await fetch("/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: u, password: p })
  });
  if (res.ok) {
    setLoginState(true);
    window.profile = null;
    showMenu();
  } else {
    const { msg } = await res.json();
    alert("Login failed: " + msg);
  }
}

async function doLogout() {
  const res = await fetch("/logout", {
    method: "POST",
    credentials: "include"
  });
  if (res.ok) {
    setLoginState(false);
    showAuth();
  } else {
    alert("Logout failed");
  }
}

function setLoginState(loggedIn) {
  document.body.classList.toggle("logged-in", loggedIn);
  document.body.classList.toggle("logged-out", !loggedIn);
}

// ————— Expose everything onto window —————
Object.assign(window, {
  // utilities
  getMod,
  randomChoice,
  potion,
  gearList,
  enemyPool,
  bossPool,
  specialGearList,
  getEnemyDice,
  getEffectiveStat,
  generateStats,

  // auth
  showAuth,
  doRegister,
  doLogin,
  exitGame: doLogout,

  // menu
  showMenu,
  createProfile: showCreateProfile,
  loadRun:      showLoadRun,
  openIndex:    menuOpenIndex,
  startNewRun:  menuStartNewRun,
  openProgressionHub,
  openShop:     menuOpenShop,
  openInventory,

  // profile
  createProfile,
  saveProfile,
  loadRun,
  selectProfile,
  updateProfile,

// dungeon:
  startNewRun,
  startDungeon,
  generateDungeonRooms,
  showRoom,

  // expose every handler so index.html can call them:
  handleTrap,
  handleTreasure,
  handleEvent,
  handlePuzzle,
  skipPuzzle,
  handleRest,
  skipRest,
  handleMerchant,
  handleRarePurchase,
  handleRareShrine,
  handleRareVault,

  // combat
  attackWithAnimation,
  handleCombat,
  renderCombat,
  renderCombatResult,
  usePotion,
  nextRoom,
  endGame,

  // shop/inventory/progression
  ...Shop,
  ...Inventory,
  ...Progress,

  // index
  openIndex
});

// ————— Bootstrap —————
setLoginState(false);
showAuth();
