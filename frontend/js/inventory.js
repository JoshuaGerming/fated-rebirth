// inventory.js
export function openInventory() {
  const p = window.profile;
  const inv = p.inventory || [];
  if (!inv.length) {
    document.getElementById("context-panel").innerHTML =
      `<h2>Inventory</h2><p>(empty)</p><button onclick="showMenu()">Back</button>`;
    return;
  }
  let html = `<h2>Inventory</h2><ul>`;
  inv.forEach((item, idx) => {
    const isEq = p.equipped[item.type]?.id === item.id;
    html += `<li>${item.name} (${item.type})${isEq? " (Equipped)":""}
      ${!isEq
        ? `<button onclick="equipItem(${idx})">Equip</button>`
        : `<button onclick="unequipItem('${item.type}')">Unequip</button>`}
    </li>`;
  });
  html += `</ul><button onclick="showMenu()">Back</button>`;
  document.getElementById("context-panel").innerHTML = html;
}

export function equipItem(idx) {
  const p = window.profile;
  const item = p.inventory[idx];
  p.equipped[item.type] = item;
  fetch("/update-profile", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ name: p.name, updates: { equipped: p.equipped } })
  })
  .then(r=>r.json())
  .then(u=>{ window.profile = u; openInventory(); });
}

export function unequipItem(slot) {
  const p = window.profile;
  p.equipped[slot] = null;
  fetch("/update-profile", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ name: p.name, updates: { equipped: p.equipped } })
  })
  .then(r=>r.json())
  .then(u=>{ window.profile = u; openInventory(); });
}
