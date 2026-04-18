const SAVE_KEY = "dragonite-game-save";
const WORLD_VIEWPORT = { width: 11, height: 7 };

const menuItems = Array.from(document.querySelectorAll(".menu-item"));
const statusText = document.getElementById("statusText");
const menuScene = document.getElementById("menuScene");
const storyScene = document.getElementById("storyScene");
const storyTitle = document.getElementById("storyTitle");
const storyText = document.getElementById("storyText");
const mapScene = document.getElementById("mapScene");
const mapGrid = document.getElementById("mapGrid");
const mapStatus = document.getElementById("mapStatus");
const locationTitle = document.getElementById("locationTitle");
const locationMeta = document.getElementById("locationMeta");
const encounterList = document.getElementById("encounterList");

const openingStory = [
  {
    title: "旅程開始",
    text: "在關都地區的清晨，\n快龍決定踏上屬於自己的冠軍之路。",
  },
  {
    title: "夥伴集結",
    text: "牠將在旅途中遇見夥伴、組成隊伍，\n一起面對每場關鍵對戰。",
  },
  {
    title: "最終目標",
    text: "挑戰八大道館、突破四天王，\n最後站上聯盟舞台對決冠軍！",
  },
];

const mapLayout = [
  "MMMMMMMMMMMMMMMMMM",
  "MTRRRGGGGGGRRYYGGM",
  "MRGGGGGGRRRGGGGGRM",
  "MRGTTGGRGGRGTTGGRM",
  "MRRRGGGGGGRGGGGGRM",
  "MGGGGGGGRRRGGGGGRM",
  "MTRRRGGGGGGGGGRRGM",
  "MRGGGGGRMMMMRGGGRM",
  "MRGGTTGRGGGRGTTGRM",
  "MRRRGGGRRRRGGGGGRM",
  "MGGGGGGGGGGRRRRGRM",
  "MTRRGGGTTGGGGGRRGM",
  "MRGGGGGGGRGGGGGGRM",
  "MMMMMMMMMMMMMMMMMM",
];

const tileConfig = {
  M: { className: "tile-blocked", symbol: "#", label: "山脈" },
  G: { className: "tile-grass", symbol: ".", label: "草原" },
  R: { className: "tile-route", symbol: "=", label: "道路" },
  T: { className: "tile-town", symbol: "T", label: "城鎮" },
  Y: { className: "tile-gym", symbol: "G", label: "道館" },
};

const landmarks = {
  "1,11": { name: "真新鎮", type: "城鎮" },
  "1,1": { name: "尼比市", type: "城鎮" },
  "3,3": { name: "華藍市", type: "城鎮" },
  "12,3": { name: "玉虹市", type: "城鎮" },
  "8,11": { name: "紫苑鎮", type: "城鎮" },
  "14,8": { name: "淺紅市", type: "城鎮" },
  "13,1": { name: "尼比道館", type: "道館" },
  "14,1": { name: "華藍道館", type: "道館" },
};

const encounterPoolByTile = {
  G: ["bulbasaur", "oddish", "pikachu", "eevee", "bellsprout", "paras"],
  R: ["pidgey", "rattata", "growlithe", "ponyta", "sandshrew", "spearow"],
  T: ["meowth", "jigglypuff", "psyduck", "machop", "abra", "poliwag"],
  Y: ["onix", "raichu", "kadabra", "machoke", "hitmonlee", "electabuzz"],
};

const DEFAULT_POSITION = { x: 1, y: 11 };
const pokemonSpriteCache = new Map();

let selectedIndex = 0;
let storyIndex = 0;
let isStoryPlaying = false;
let currentScene = "menu";
let playerPosition = { ...DEFAULT_POSITION };
let discoveredTiles = new Set([toPositionKey(DEFAULT_POSITION.x, DEFAULT_POSITION.y)]);
let encounterRequestId = 0;

function toPositionKey(x, y) {
  return `${x},${y}`;
}

function hasSaveData() {
  return Boolean(localStorage.getItem(SAVE_KEY));
}

function readGameData() {
  const rawData = localStorage.getItem(SAVE_KEY);
  if (!rawData) {
    return null;
  }

  return JSON.parse(rawData);
}

function saveGameData(gameData) {
  gameData.updatedAt = new Date().toISOString();
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameData));
}

function renderMenuSelection() {
  menuItems.forEach((item, index) => {
    const isSelected = index === selectedIndex;
    item.classList.toggle("is-selected", isSelected);
    if (isSelected) {
      item.focus();
    }
  });
}

function setStatus(message) {
  statusText.textContent = message;
}

function createNewGameData() {
  return {
    player: {
      name: "快龍訓練家",
      partner: "dragonite",
    },
    progress: {
      badges: 0,
      eliteFourDefeated: false,
      championDefeated: false,
    },
    world: {
      position: { ...DEFAULT_POSITION },
      storyPlayed: false,
      discovered: [toPositionKey(DEFAULT_POSITION.x, DEFAULT_POSITION.y)],
    },
    updatedAt: "",
  };
}

function isPassable(tileType) {
  return tileType !== "M";
}

function getTileAt(x, y) {
  if (y < 0 || y >= mapLayout.length || x < 0 || x >= mapLayout[0].length) {
    return "M";
  }

  return mapLayout[y][x];
}

function isValidPassablePosition(position) {
  if (!position || !Number.isInteger(position.x) || !Number.isInteger(position.y)) {
    return false;
  }

  return isPassable(getTileAt(position.x, position.y));
}

function loadWorldStateFromData(data) {
  const loadedPosition = data?.world?.position;
  if (isValidPassablePosition(loadedPosition)) {
    playerPosition = { ...loadedPosition };
  } else {
    playerPosition = { ...DEFAULT_POSITION };
  }

  const discovered = Array.isArray(data?.world?.discovered) ? data.world.discovered : [];
  const passableDiscovered = discovered.filter((key) => {
    const [xText, yText] = key.split(",");
    const x = Number(xText);
    const y = Number(yText);
    return Number.isInteger(x) && Number.isInteger(y) && isPassable(getTileAt(x, y));
  });

  discoveredTiles = new Set(passableDiscovered);
  discoveredTiles.add(toPositionKey(playerPosition.x, playerPosition.y));
}

function startNewGame() {
  const gameData = createNewGameData();
  saveGameData(gameData);
  loadWorldStateFromData(gameData);
  startOpeningStory();
}

function loadGame() {
  const data = readGameData();
  if (!data) {
    setStatus("沒有找到存檔，請先開始新遊戲。");
    return;
  }

  const badges = data?.progress?.badges ?? 0;
  loadWorldStateFromData(data);
  enterMapScene(
    `讀取成功！徽章 ${badges} / 8，位於 ${getLocationName(playerPosition.x, playerPosition.y)}。`,
  );
}

function activateSelection() {
  const action = menuItems[selectedIndex].dataset.action;
  if (action === "new") {
    startNewGame();
    return;
  }

  loadGame();
}

function setSceneVisibility(target) {
  const showMenu = target === "menu";
  const showStory = target === "story";
  const showMap = target === "map";

  menuScene.classList.toggle("is-hidden", !showMenu);
  storyScene.classList.toggle("is-hidden", !showStory);
  mapScene.classList.toggle("is-hidden", !showMap);

  storyScene.setAttribute("aria-hidden", String(!showStory));
  mapScene.setAttribute("aria-hidden", String(!showMap));
  currentScene = target;
}

function renderStoryLine() {
  const current = openingStory[storyIndex];
  storyTitle.textContent = current.title;
  storyText.textContent = current.text;
}

function findNearestLandmark(x, y, type) {
  const entries = Object.entries(landmarks).filter(([, info]) => info.type === type);
  if (entries.length === 0) {
    return null;
  }

  let nearest = null;
  for (const [key, info] of entries) {
    const [lx, ly] = key.split(",").map(Number);
    const distance = Math.abs(lx - x) + Math.abs(ly - y);
    if (!nearest || distance < nearest.distance) {
      nearest = { ...info, distance };
    }
  }

  return nearest;
}

function getLocationName(x, y) {
  const key = toPositionKey(x, y);
  if (landmarks[key]) {
    return landmarks[key].name;
  }

  return tileConfig[getTileAt(x, y)].label;
}

function updateMapHud() {
  const tileType = getTileAt(playerPosition.x, playerPosition.y);
  const nearestTown = findNearestLandmark(playerPosition.x, playerPosition.y, "城鎮");
  const nearestGym = findNearestLandmark(playerPosition.x, playerPosition.y, "道館");
  locationTitle.textContent = getLocationName(playerPosition.x, playerPosition.y);
  locationMeta.textContent = `座標 (${playerPosition.x}, ${playerPosition.y})・${
    tileConfig[tileType].label
  }・已探索 ${discoveredTiles.size} 格`;

  if (nearestTown && nearestGym) {
    setMapStatus(
      `${nearestTown.name} ${nearestTown.distance} 格・最近道館 ${nearestGym.name} ${nearestGym.distance} 格`,
    );
  }
}

function setMapStatus(message) {
  mapStatus.textContent = message;
}

function buildLocationMessage(x, y) {
  const tileType = getTileAt(x, y);
  const locationName = getLocationName(x, y);

  if (tileType === "T") {
    return `抵達${locationName}，城鎮裡有訓練家與補給站。`;
  }

  if (tileType === "Y") {
    return `快龍已到達${locationName}，館主戰即將開始！`;
  }

  if (tileType === "R") {
    return `你正在${locationName}上旅行，前方還有更多區域可探索。`;
  }

  return `快龍穿越${locationName}，野外冒險持續進行。`;
}

function renderMap() {
  const halfWidth = Math.floor(WORLD_VIEWPORT.width / 2);
  const halfHeight = Math.floor(WORLD_VIEWPORT.height / 2);
  mapGrid.innerHTML = "";

  for (let y = playerPosition.y - halfHeight; y <= playerPosition.y + halfHeight; y += 1) {
    for (let x = playerPosition.x - halfWidth; x <= playerPosition.x + halfWidth; x += 1) {
      const tileType = getTileAt(x, y);
      const tile = document.createElement("div");
      const config = tileConfig[tileType];
      const isPlayer = playerPosition.x === x && playerPosition.y === y;
      tile.className = `map-tile ${config.className}${isPlayer ? " tile-player" : ""}`;
      tile.textContent = isPlayer ? "D" : config.symbol;
      tile.setAttribute("aria-label", isPlayer ? `快龍在${getLocationName(x, y)}` : config.label);
      mapGrid.append(tile);
    }
  }
}

function persistWorldState(overrides = {}) {
  const data = readGameData();
  if (!data) {
    return;
  }

  data.world = {
    ...(data.world ?? {}),
    ...overrides,
    position: { ...playerPosition },
    discovered: Array.from(discoveredTiles),
  };

  saveGameData(data);
}

function getEncounterSpecies(tileType, x, y) {
  const pool = encounterPoolByTile[tileType] ?? encounterPoolByTile.G;
  const picked = [];

  for (let i = 0; i < 3; i += 1) {
    const index = (x * 17 + y * 13 + i * 5) % pool.length;
    const name = pool[index];
    if (!picked.includes(name)) {
      picked.push(name);
    }
  }

  return picked;
}

async function fetchPokemonSprite(name) {
  if (pokemonSpriteCache.has(name)) {
    return pokemonSpriteCache.get(name);
  }

  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  if (!response.ok) {
    throw new Error(`PokéAPI ${response.status}`);
  }

  const data = await response.json();
  const sprite =
    data?.sprites?.other?.["official-artwork"]?.front_default ?? data?.sprites?.front_default;
  if (!sprite) {
    throw new Error(`${name} 缺少圖片`);
  }

  pokemonSpriteCache.set(name, sprite);
  return sprite;
}

function renderEncounterCards(cards, title = "附近夥伴候選（PokéAPI）") {
  const titleElement = mapScene.querySelector(".encounter-title");
  titleElement.textContent = title;
  encounterList.innerHTML = "";

  cards.forEach((card) => {
    const item = document.createElement("article");
    item.className = "encounter-card";
    const imageHtml = card.sprite
      ? `<img src="${card.sprite}" alt="${card.name}" loading="lazy" />`
      : `<div class="encounter-name">載入失敗</div>`;
    item.innerHTML = `${imageHtml}<p class="encounter-name">${card.name}</p>`;
    encounterList.append(item);
  });
}

async function updateEncounterPanel(x, y) {
  const tileType = getTileAt(x, y);
  const species = getEncounterSpecies(tileType, x, y);
  const requestId = ++encounterRequestId;

  renderEncounterCards(species.map((name) => ({ name, sprite: null })), "正在連線 PokéAPI...");
  const results = await Promise.allSettled(species.map((name) => fetchPokemonSprite(name)));
  if (requestId !== encounterRequestId) {
    return;
  }

  const cards = results.map((result, index) => ({
    name: species[index],
    sprite: result.status === "fulfilled" ? result.value : null,
  }));
  const loadedCount = cards.filter((card) => Boolean(card.sprite)).length;
  const title =
    loadedCount === cards.length
      ? "附近夥伴候選（PokéAPI）"
      : "PokéAPI 部分失敗，已顯示可用資料";
  renderEncounterCards(cards, title);
}

function refreshMapScene(message) {
  renderMap();
  updateMapHud();
  setMapStatus(message);
  updateEncounterPanel(playerPosition.x, playerPosition.y);
}

function enterMapScene(initialMessage) {
  isStoryPlaying = false;
  setSceneVisibility("map");
  refreshMapScene(initialMessage ?? buildLocationMessage(playerPosition.x, playerPosition.y));
}

function movePlayer(dx, dy) {
  const nextX = playerPosition.x + dx;
  const nextY = playerPosition.y + dy;
  const nextTile = getTileAt(nextX, nextY);

  if (!isPassable(nextTile)) {
    setMapStatus("前方是山脈，繞路探索看看。");
    return;
  }

  playerPosition = { x: nextX, y: nextY };
  discoveredTiles.add(toPositionKey(nextX, nextY));
  refreshMapScene(buildLocationMessage(nextX, nextY));
  persistWorldState();
}

function inspectCurrentTile() {
  refreshMapScene(buildLocationMessage(playerPosition.x, playerPosition.y));
}

function startOpeningStory() {
  isStoryPlaying = true;
  storyIndex = 0;
  setSceneVisibility("story");
  renderStoryLine();
}

function advanceOpeningStory() {
  if (!isStoryPlaying) {
    return;
  }

  storyIndex += 1;
  if (storyIndex >= openingStory.length) {
    isStoryPlaying = false;
    persistWorldState({ storyPlayed: true });
    enterMapScene("開放世界展開！去城鎮、道路與道館找夥伴吧。");
    return;
  }

  renderStoryLine();
}

document.addEventListener("keydown", (event) => {
  if (isStoryPlaying) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      advanceOpeningStory();
    }
    return;
  }

  if (currentScene === "map") {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      movePlayer(0, 1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      movePlayer(0, -1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      movePlayer(-1, 0);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      movePlayer(1, 0);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inspectCurrentTile();
    }
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    selectedIndex = (selectedIndex + 1) % menuItems.length;
    renderMenuSelection();
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length;
    renderMenuSelection();
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    activateSelection();
  }
});

menuItems.forEach((button, index) => {
  button.addEventListener("click", () => {
    selectedIndex = index;
    renderMenuSelection();
    activateSelection();
  });
});

storyScene.addEventListener("click", () => {
  advanceOpeningStory();
});

mapScene.addEventListener("click", () => {
  inspectCurrentTile();
});

if (!hasSaveData()) {
  setStatus("↑↓ 選擇　Enter 確認");
}

setSceneVisibility("menu");
renderMenuSelection();
