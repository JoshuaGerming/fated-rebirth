// shop.js
import { potion, gearList, specialGearList } from "./utils.js";


export function openShop() {
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
      </li>
    `;
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

export function purchaseGear(id) {
  const p = window.profile;
  const item = gearList.find(g => g.id === id);
  const msg = document.getElementById("shop-message");
  if (!item) return msg.textContent = "Invalid item.";
  if (p.inventory.some(i => i.id === id)) return msg.textContent = "Already own!";
  if (p.gold < item.cost) return msg.textContent = "Not enough gold!";
  p.gold -= item.cost;
  p.inventory.push(item);
  if (!p.equipped[item.type]) p.equipped[item.type] = item;

  fetch("/update-profile", {
    method: "POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      name: p.name,
      updates: {
        gold: p.gold,
        inventory: p.inventory,
        equipped: p.equipped
      }
    })
  })
  .then(r=>r.json())
  .then(u=>{ window.profile = u; msg.textContent = `Purchased ${item.name}!`; })
  .catch(()=> msg.textContent = "Local buy ok, save failed.");
}

export function buyPotion() {
  const p = window.profile;
  const msg = document.getElementById("shop-message");
  if (p.potions >= 3) return msg.textContent = "Max 3 potions!";
  if (p.gold < potion.cost) return msg.textContent = "Not enough gold!";
  p.gold -= potion.cost; p.potions++;

  fetch("/update-profile", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      name: p.name,
      updates: { gold: p.gold, potions: p.potions }
    })
  })
  .then(r=>r.json())
  .then(u=>{ window.profile = u; msg.textContent = `Purchased ${potion.name}!`; })
  .catch(()=> msg.textContent = "Local buy ok, save failed.");
}

export function handleMerchant() {
  const html = `
    <h2>🛒 Dungeon Merchant</h2>
    <div id="merc-msg" style="margin-bottom:8px;color:lightgreen;"></div>
    <ul>
      <li>${potion.name} — ${potion.cost}g
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

export function buyPotionInDungeon() {
  const p = window.profile;
  const msg = document.getElementById("merc-msg");
  if (p.potions >= 3) return msg.textContent = "Max 3 potions!";
  if (p.gold < potion.cost) return msg.textContent = "Not enough gold!";
  p.gold -= potion.cost; p.potions++;

  fetch("/update-profile", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      name: p.name,
      updates: { gold: p.gold, potions: p.potions }
    })
  })
  .then(r=>r.json())
  .then(u=>{ window.profile = u; msg.textContent = `Got potion! (${u.potions})`; })
  .catch(()=> msg.textContent = "Local only, save failed.");
}

export function buyScroll() {
  const p = window.profile;
  const D = window.dungeon;
  const msg = document.getElementById("merc-msg");
  if (p.gold < 75) return msg.textContent = "Not enough gold!";
  p.gold -= 75;
  D.currentHp = Math.min(D.currentHp + 15, p.stats.hp);

  fetch("/update-profile", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ name: p.name, updates: { gold: p.gold } })
  })
  .then(r=>r.json())
  .then(u=>{ window.profile = u; msg.textContent = "Used scroll +15 HP"; })
  .catch(()=> msg.textContent = "Local only, save failed.");
}
