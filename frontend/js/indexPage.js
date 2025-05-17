// js/indexPage.js

import { showMenu } from "./menu.js";

export function openIndex(page = "overview") {
  const sections = {
    overview: `
      <h2>Game Overview</h2>
      <p>
        <em>Fated Rebirth</em> is a text-based roguelite: you create a hero,
        explore procedurally generated dungeons, face traps, puzzles, enemies,
        merchants and rare events, earn gold & essence, then upgrade for your next run.
      </p>
    `,
    stats: `
      <h2>Stats</h2>
      <ul>
        <li><strong>HP</strong>: Hit Points. Fall to 0 → Run ends.</li>
        <li><strong>STR</strong>: Strength. + melee damage (d12 + mod).</li>
        <li><strong>DEX</strong>: Dexterity. + dodge chance & trap rolls.</li>
        <li><strong>INT</strong>: Intelligence. + puzzle success & magic.</li>
        <li><strong>LUCK</strong>: Hidden. + small bonus to all rolls & loot.</li>
      </ul>
    `,
    enemies: `
      <h2>Enemies</h2>

      <h3>Common Foes</h3>
      <table class="index-table">
        <thead>
          <tr><th>Name</th><th>PL</th><th>HP</th><th>STR</th><th>DEX</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td>Goblin</td><td>1</td><td>20</td><td>6</td><td>10</td><td>Small, cunning humanoids.</td></tr>
          <tr><td>Skeleton</td><td>2</td><td>25</td><td>8</td><td>12</td><td>Reanimated bones of the fallen.</td></tr>
          <tr><td>Bandit</td><td>2</td><td>22</td><td>7</td><td>11</td><td>Opportunistic thieves.</td></tr>
          <tr><td>Spider</td><td>1</td><td>18</td><td>5</td><td>14</td><td>Venomous, high dodge.</td></tr>
          <tr><td>Orc</td><td>3</td><td>30</td><td>10</td><td>13</td><td>Brutish fighters.</td></tr>
          <tr><td>Troll</td><td>4</td><td>40</td><td>12</td><td>9</td><td>Huge brutes with regen.</td></tr>
          <tr><td>Wraith</td><td>3</td><td>35</td><td>9</td><td>12</td><td>Spectral undead.</td></tr>
          <tr><td>Ogre</td><td>4</td><td>45</td><td>13</td><td>8</td><td>Massive club-wielder.</td></tr>
          <tr><td>Dark Knight</td><td>5</td><td>50</td><td>14</td><td>10</td><td>Fallen paladin.</td></tr>
        </tbody>
      </table>

      <h3>Bosses</h3>
      <table class="index-table boss-table">
        <thead>
          <tr><th>Name</th><th>PL</th><th>HP</th><th>STR</th><th>DEX</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td>Minotaur</td><td>7</td><td>80</td><td>18</td><td>11</td><td>Labyrinthine man-bull.</td></tr>
          <tr><td>Lich</td><td>6</td><td>70</td><td>16</td><td>13</td><td>Undead spellcaster.</td></tr>
          <tr><td>Dragon</td><td>8</td><td>120</td><td>20</td><td>15</td><td>Ancient fire wyrm.</td></tr>
        </tbody>
      </table>
    `,
    gear: `
      <h2>Gear & Equipment</h2>
      <ul>
        <li><strong>Iron Sword</strong>: +2 STR</li>
        <li><strong>Steel Sword</strong>: +4 STR</li>
        <li><strong>Leather Armor</strong>: +2 DEX</li>
        <li><strong>Chain Mail</strong>: +4 DEX</li>
        <li><strong>Wizard Hat</strong>: +2 INT</li>
        <li><strong>Lucky Charm</strong>: +2 LUCK</li>
      </ul>
      <p>Equip one weapon, one armor & one accessory each run.</p>
    `,
    potions: `
      <h2>Potions</h2>
      <ul>
        <li><strong>Healing Potion</strong> (50g): Restores 10 HP in-combat.</li>
      </ul>
      <p>Usable only inside dungeons, max 3 per run.</p>
    `,
    dungeon: `
      <h2>Dungeon Mechanics</h2>
      <ul>
        <li><strong>Trap</strong>: DEX to dodge or STR to disarm; failure deals damage.</li>
        <li><strong>Puzzle</strong>: INT roll; success grants gold, failure costs HP.</li>
        <li><strong>Rest</strong>: Recover 20 HP safely.</li>
        <li><strong>Merchant</strong>: Buy gear, potions, scrolls mid-run.</li>
        <li><strong>Rare Events</strong>: Shrine, Vault, Special Shop on 2–5% chance.</li>
        <li><strong>Difficulty</strong>: Easy=5 rooms, Medium=8, Hard=10 (last has boss).</li>
      </ul>
    `,
    combat: `
      <h2>Combat System</h2>
      <ul>
        <li><strong>To Hit</strong>: d20 + stat mod (STR for melee, INT for mage) vs AC≈12.</li>
        <li><strong>Damage</strong>: Weapon die (d12) + stat mod.</li>
        <li><strong>Enemy Damage</strong>: d6–d12 by PL + their STR mod.</li>
        <li><strong>Flee</strong>: DEX + LUCK vs 15; failure takes one hit.</li>
      </ul>
    `,
    shop: `
      <h2>Shop & Currency</h2>
      <p>Spend gold to buy gear, potions, or scrolls.</p>
      <ul>
        <li><strong>Potions</strong>: 50g each</li>
        <li><strong>Scrolls</strong>: 75g for +15 max HP</li>
        <li><strong>Gear</strong>: See Gear tab</li>
      </ul>
    `,
    progression: `
      <h2>Progression Hub</h2>
      <p>Convert leftover gold to Essence (Easy 1, Med 3, Hard 5).</p>
      <ul>
        <li>5 Essence → +10 HP</li>
        <li>5 Essence → +2 STR/DEX/INT</li>
      </ul>
      <p>Luck only increases via rare events.</p>
    `
  };

  const nav = `
    <button onclick="openIndex('overview')">Overview</button>
    <button onclick="openIndex('stats')">Stats</button>
    <button onclick="openIndex('enemies')">Enemies</button>
    <button onclick="openIndex('gear')">Gear</button>
    <button onclick="openIndex('potions')">Potions</button>
    <button onclick="openIndex('dungeon')">Dungeon</button>
    <button onclick="openIndex('combat')">Combat</button>
    <button onclick="openIndex('shop')">Shop</button>
    <button onclick="openIndex('progression')">Progression</button>
    <button onclick="showMenu()">Back</button>
  `;

  document.getElementById("context-panel").innerHTML = `
    <h2>Game Index</h2>
    <div class="index-nav">${nav}</div>
    <div class="index-content">${sections[page] || sections.overview}</div>
  `;
}
