// profile.js
import { showMenu } from "./menu.js";
import { generateStats } from "./utils.js";

export function createProfile() {
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

export function saveProfile(ev) {
  ev.preventDefault();
  const name = document.getElementById("hero-name").value;
  const heroClass = document.getElementById("hero-class").value;
  const stats = generateStats(heroClass);

  fetch("/save-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, heroClass, stats })
  })
  .then(r => r.json())
  .then(() => {
    window.profile = { name, heroClass, stats,
      essence:0, gold:0, potions:0,
      inventory:[], equipped:{weapon:null,armor:null,accessory:null}
    };
    showMenu();
  })
  .catch(() => {
    document.getElementById("context-panel").innerHTML =
      `<p>Error saving profile.</p><button onclick="createProfile()">Back</button>`;
  });
}

export function loadRun() {
  // 1) fetch the list of profile names
  fetch("/list-profiles", { credentials: "include" })
    .then(res => res.json())
    .then(names => {
      if (!names.length) {
        document.getElementById("context-panel").innerHTML =
          `<p>No saved profiles.</p><button onclick="showMenu()">Back</button>`;
        return;
      }

      // 2) for each name, fetch its details
      return Promise.all(
        names.map(name =>
          fetch(`/get-profile/${encodeURIComponent(name)}`, { credentials: "include" })
            .then(r => r.json())
        )
      );
    })
    .then(profiles => {
      // 3) render the list of full profile objects
      let html = "<h2>Load Profile</h2><ul>";
      profiles.forEach((p, i) => {
        html += `<li>
          ${p.name} (${p.heroClass}) —
          HP: ${p.stats.hp}, Gold: ${p.gold}, Essence: ${p.essence}
          <button onclick="selectProfile(${i})">Load</button>
        </li>`;
      });
      html += "</ul>";
      document.getElementById("context-panel").innerHTML = html;
      window.loadedProfiles = profiles;
    })
    .catch(err => {
      console.error(err);
      document.getElementById("context-panel").innerHTML =
        `<p>Error loading profiles.</p><button onclick="showMenu()">Back</button>`;
    });
}

export function selectProfile(i) {
  const p = window.loadedProfiles[i];
  window.profile = {
    name:      p.name,
    heroClass: p.heroClass,
    stats:     p.stats,
    essence:   p.essence   || 0,
    gold:      p.gold      || 0,
    potions:   p.potions   || 0,
    inventory: p.inventory || [],
    equipped:  p.equipped  || {weapon:null,armor:null,accessory:null}
  };
  showMenu();
}

export function updateProfile(updates) {
  return fetch("/update-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: window.profile.name, updates })
  })
  .then(r => r.json())
  .then(updated => {
    window.profile = updated;
    return updated;
  });
}
