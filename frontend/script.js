// ========== PROFILE CREATION ==========

function createProfile() {
    document.getElementById("context-panel").innerHTML = `
      <h2>Create Your Hero</h2>
      <form onsubmit="saveProfile(event)">
        <label for="name">Hero Name:</label><br>
        <input type="text" id="hero-name" required><br><br>
  
        <label for="class">Choose Class:</label><br>
        <select id="hero-class" required>
          <option value="Warrior">Warrior</option>
          <option value="Mage">Mage</option>
          <option value="Rogue">Rogue</option>
        </select><br><br>
  
        <button type="submit">Save Profile</button>
      </form>
    `;
  }
  
  function saveProfile(event) {
    event.preventDefault();
  
    const name = document.getElementById("hero-name").value;
    const heroClass = document.getElementById("hero-class").value;
  
    fetch("http://127.0.0.1:5000/save-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, heroClass }),
    })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("context-panel").innerHTML = `
          <h2>Profile Saved</h2>
          <p>Name: <strong>${name}</strong></p>
          <p>Class: <strong>${heroClass}</strong></p>
          <p>Server says: ${data.message}</p>
        `;
      })
      .catch((error) => {
        document.getElementById("context-panel").innerHTML = `
          <h2>Error</h2>
          <p>Failed to save profile. Is the backend running?</p>
        `;
        console.error("Error:", error);
      });
  }
  
  // ========== LOAD PROFILES ==========
  
  function loadRun() {
    fetch("http://127.0.0.1:5000/list-profiles")
      .then((res) => res.json())
      .then((profiles) => {
        if (profiles.length === 0) {
          document.getElementById("context-panel").innerHTML = `
            <h2>Load Run</h2>
            <p>No saved profiles found.</p>
          `;
          return;
        }
  
        let html = `<h2>Load Run</h2><ul>`;
        profiles.forEach((profile, index) => {
          html += `<li>
            <strong>${profile.name}</strong> - ${profile.heroClass}
            <button onclick="selectProfile(${index})">Load</button>
          </li>`;
        });
        html += `</ul>`;
  
        document.getElementById("context-panel").innerHTML = html;
        window.loadedProfiles = profiles;
      })
      .catch((err) => {
        console.error(err);
        document.getElementById("context-panel").innerHTML = `
          <h2>Error</h2>
          <p>Could not load profiles.</p>
        `;
      });
  }
  
  function selectProfile(index) {
    const profile = window.loadedProfiles[index];
    window.lastProfileIndex = index;
  
    document.getElementById("context-panel").innerHTML = `
      <h2>Profile Loaded</h2>
      <p><strong>Name:</strong> ${profile.name}</p>
      <p><strong>Class:</strong> ${profile.heroClass}</p>
      <p>Ready to enter the dungeon...</p>
      <button onclick="startNewRun()">Enter Dungeon</button>
    `;
  }
  
  // ========== START NEW RUN ==========
  
  function startNewRun() {
    if (!window.loadedProfiles || window.lastProfileIndex === undefined) {
      document.getElementById("context-panel").innerHTML = `
        <h2>No Profile Loaded</h2>
        <p>You must create or load a profile before starting a run.</p>
        <button onclick="createProfile()">Create Profile</button>
        <button onclick="loadRun()">Load Existing</button>
      `;
      return;
    }
  
    const profile = window.loadedProfiles[window.lastProfileIndex];
    const rooms = generateDungeonRooms(3);
    window.currentDungeon = { profile, rooms, index: 0 };
  
    showNextRoom();
  }
  
  function generateDungeonRooms(count) {
    const types = ["Trap", "Enemy", "Treasure"];
    const rooms = [];
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      rooms.push({ type });
    }
    return rooms;
  }
  
  // ========== DUNGEON ROOM LOGIC ==========
  
  function showNextRoom() {
    const dungeon = window.currentDungeon;
    if (dungeon.index >= dungeon.rooms.length) {
      document.getElementById("context-panel").innerHTML = `
        <h2>Victory!</h2>
        <p>${dungeon.profile.name} survived the dungeon run.</p>
      `;
      return;
    }
  
    const room = dungeon.rooms[dungeon.index];
    document.getElementById("context-panel").innerHTML = `
      <h2>Room ${dungeon.index + 1}</h2>
      <p>You encounter a <strong>${room.type}</strong>!</p>
      <button onclick="resolveRoom()">Continue</button>
    `;
  }
  
  function resolveRoom() {
    const dungeon = window.currentDungeon;
    const room = dungeon.rooms[dungeon.index];
  
    let resultText = "";
    switch (room.type) {
      case "Trap":
        resultText = "You dodged a deadly trap!";
        break;
      case "Enemy":
        resultText = "You fought bravely and defeated the enemy.";
        break;
      case "Treasure":
        resultText = "You found a hidden stash of gold!";
        break;
      default:
        resultText = "Nothing happened.";
    }
  
    document.getElementById("context-panel").innerHTML = `
      <h2>Room ${dungeon.index + 1} - Resolved</h2>
      <p>${resultText}</p>
      <button onclick="nextRoom()">Proceed</button>
    `;
  }
  
  function nextRoom() {
    window.currentDungeon.index++;
    showNextRoom();
  }
  