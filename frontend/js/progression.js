// progression.js
import { updateProfile } from "./profile.js";
import { showMenu }      from "./menu.js";

export function openProgressionHub() {
  const p = window.profile;
  document.getElementById("context-panel").innerHTML = `
    <h2>Progression Hub</h2>
    <p><strong>Stats</strong> |
      HP: ${p.stats.hp} | STR: ${p.stats.str} |
      DEX: ${p.stats.dex} | INT: ${p.stats.int} |
      LUCK: ${p.stats.luck}
    </p>
    <p><strong>Resources</strong> |
      Essence: ${p.essence} | Gold: ${p.gold} | Potions: ${p.potions}
    </p>
    <h3>Essence Upgrades (5 each)</h3>
    <button onclick="purchaseUpgrade('hp',5)">+10 HP</button>
    <button onclick="purchaseUpgrade('str',5)">+2 STR</button>
    <button onclick="purchaseUpgrade('dex',5)">+2 DEX</button>
    <button onclick="purchaseUpgrade('int',5)">+2 INT</button><br><br>
    <button onclick="showMenu()">Back</button>
  `;
}

export function purchaseUpgrade(stat, cost) {
  const p = window.profile;
  if (p.essence < cost) {
    openProgressionHub();
    return;
  }
  p.essence -= cost;
  if (stat === 'hp') p.stats.hp += 10;
  else p.stats[stat] += 2;

  fetch("/update-profile", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ name: p.name, updates: { essence: p.essence, stats: p.stats } })
  })
  .then(r=>r.json())
  .then(u=>{ window.profile = u; showMenu(); })
  .catch(()=>{ document.getElementById("context-panel").innerHTML =
    `<p>Upgrade failed to save.</p><button onclick="openProgressionHub()">Back</button>`; });
}
