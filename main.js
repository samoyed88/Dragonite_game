const SAVE_KEY = "dragonite-game-save";
const WORLD_SIZE = { width: 2200, height: 1400 };
const PLAYER_SIZE = 72;
const PLAYER_SPEED = 280;
const LEGACY_TILE_SCALE = 120;

const menuItems = Array.from(document.querySelectorAll(".menu-item"));
const statusText = document.getElementById("statusText");
const menuScene = document.getElementById("menuScene");
const storyScene = document.getElementById("storyScene");
const storyTitle = document.getElementById("storyTitle");
const storyText = document.getElementById("storyText");
const mapScene = document.getElementById("mapScene");
const mapWorld = document.getElementById("mapWorld");
const roadsLayer = document.getElementById("roadsLayer");
const landmarksLayer = document.getElementById("landmarksLayer");
const playerElement = document.getElementById("player");
const playerSprite = document.getElementById("playerSprite");
const mapStatus = document.getElementById("mapStatus");
const locationTitle = document.getElementById("locationTitle");
const locationMeta = document.getElementById("locationMeta");
const encounterList = document.getElementById("encounterList");
const encounterTitle = document.querySelector(".encounter-title");

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

const roads = [
  { x: 160, y: 930, w: 920, h: 62 },
  { x: 1040, y: 760, w: 64, h: 240 },
  { x: 680, y: 540, w: 820, h: 58 },
  { x: 1460, y: 360, w: 60, h: 260 },
  { x: 1220, y: 300, w: 640, h: 56 },
  { x: 360, y: 1120, w: 1380, h: 56 },
];

const blockedZones = [
  { x: 0, y: 0, w: 360, h: 420 },
  { x: 1760, y: 0, w: 440, h: 380 },
  { x: 1820, y: 1020, w: 380, h: 380 },
  { x: 0, y: 1140, w: 320, h: 260 },
  { x: 880, y: 640, w: 240, h: 120 },
];

const landmarks = [
  { id: "pallet", name: "真新鎮", type: "town", x: 260, y: 960, radius: 90 },
  { id: "viridian", name: "常青市", type: "town", x: 980, y: 940, radius: 92 },
  { id: "pewter", name: "尼比市", type: "town", x: 760, y: 520, radius: 92 },
  { id: "cerulean", name: "華藍市", type: "town", x: 1460, y: 520, radius: 92 },
  { id: "saffron", name: "金黃市", type: "town", x: 1540, y: 1130, radius: 92 },
  { id: "pewter-gym", name: "尼比道館", type: "gym", x: 1290, y: 300, radius: 88 },
  { id: "cerulean-gym", name: "華藍道館", type: "gym", x: 1710, y: 300, radius: 88 },
];

const encounterPoolByTerrain = {
  wild: ["oddish", "bellsprout", "pikachu", "paras", "nidoran-m", "nidoran-f"],
  road: ["pidgey", "rattata", "spearow", "sandshrew", "growlithe", "ponyta"],
  town: ["eevee", "meowth", "jigglypuff", "psyduck", "abra", "machop"],
  gym: ["onix", "raichu", "kadabra", "machoke", "electabuzz", "hitmonlee"],
};

const DEFAULT_POSITION = { x: 260, y: 960 };
const activeKeys = { up: false, down: false, left: false, right: false };
const pokemonSpriteCache = new Map();

let selectedIndex = 0;
let storyIndex = 0;
let isStoryPlaying = false;
let currentScene = "menu";
let playerPosition = { ...DEFAULT_POSITION };
let discoveredZones = new Set([zoneKeyFromPosition(DEFAULT_POSITION.x, DEFAULT_POSITION.y)]);
let cameraPosition = { x: 0, y: 0 };
let loopRequestId = 0;
let lastFrameTime = 0;
let lastPersistTime = 0;
let encounterRequestId = 0;
let lastEncounterKey = "";

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
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

function setStatus(message) {
  statusText.textContent = message;
}

function setMapStatus(message) {
  mapStatus.textContent = message;
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
      discovered: [zoneKeyFromPosition(DEFAULT_POSITION.x, DEFAULT_POSITION.y)],
    },
    updatedAt: "",
  };
}

function getDistance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function isInsideZone(point, zone) {
  return (
    point.x + PLAYER_SIZE / 2 > zone.x &&
    point.x - PLAYER_SIZE / 2 < zone.x + zone.w &&
    point.y + PLAYER_SIZE / 2 > zone.y &&
    point.y - PLAYER_SIZE / 2 < zone.y + zone.h
  );
}

function isBlocked(point) {
  return blockedZones.some((zone) => isInsideZone(point, zone));
}

function getNearestLandmark(point, type) {
  const candidates = landmarks.filter((landmark) => landmark.type === type);
  if (candidates.length === 0) {
    return null;
  }

  let nearest = null;
  for (const landmark of candidates) {
    const distance = getDistance(point, landmark);
    if (!nearest || distance < nearest.distance) {
      nearest = { ...landmark, distance };
    }
  }
  return nearest;
}

function getCurrentLandmark(point) {
  return (
    landmarks.find((landmark) => {
      return getDistance(point, landmark) <= landmark.radius;
    }) ?? null
  );
}

function isOnRoad(point) {
  return roads.some((road) => {
    return (
      point.x + PLAYER_SIZE / 2 > road.x &&
      point.x - PLAYER_SIZE / 2 < road.x + road.w &&
      point.y + PLAYER_SIZE / 2 > road.y &&
      point.y - PLAYER_SIZE / 2 < road.y + road.h
    );
  });
}

function getTerrainType(point) {
  const currentLandmark = getCurrentLandmark(point);
  if (currentLandmark?.type === "gym") {
    return "gym";
  }
  if (currentLandmark?.type === "town") {
    return "town";
  }
  return isOnRoad(point) ? "road" : "wild";
}

function getLocationName(point) {
  const currentLandmark = getCurrentLandmark(point);
  if (currentLandmark) {
    return currentLandmark.name;
  }
  if (isOnRoad(point)) {
    return "旅行道路";
  }
  return "野外平原";
}

function terrainLabel(terrainType) {
  if (terrainType === "road") {
    return "道路";
  }
  if (terrainType === "town") {
    return "城鎮";
  }
  if (terrainType === "gym") {
    return "道館";
  }
  return "野外";
}

function buildLocationMessage(point) {
  const terrainType = getTerrainType(point);
  const locationName = getLocationName(point);

  if (terrainType === "town") {
    return `抵達 ${locationName}，這裡可以補給並招募夥伴。`;
  }
  if (terrainType === "gym") {
    return `你已踏進 ${locationName}，準備挑戰館主。`;
  }
  if (terrainType === "road") {
    return `快龍沿著道路前進，更多城市與道館在前方。`;
  }
  return `快龍正在野外探索，注意周邊夥伴動向。`;
}

function zoneKeyFromPosition(x, y) {
  return `${Math.floor(x / 220)}-${Math.floor(y / 220)}`;
}

function updateMapHud() {
  const terrainType = getTerrainType(playerPosition);
  const nearestTown = getNearestLandmark(playerPosition, "town");
  const nearestGym = getNearestLandmark(playerPosition, "gym");
  locationTitle.textContent = getLocationName(playerPosition);
  locationMeta.textContent = `座標 (${Math.round(playerPosition.x)}, ${Math.round(
    playerPosition.y,
  )})・${terrainLabel(terrainType)}・已探索 ${discoveredZones.size} 區`;

  if (nearestTown && nearestGym) {
    setMapStatus(
      `${nearestTown.name} ${Math.round(nearestTown.distance)}m・最近道館 ${nearestGym.name} ${Math.round(
        nearestGym.distance,
      )}m`,
    );
  }
}

function buildWorldObjects() {
  roadsLayer.innerHTML = "";
  landmarksLayer.innerHTML = "";

  roads.forEach((road) => {
    const element = document.createElement("div");
    element.className = "road-segment";
    element.style.left = `${road.x}px`;
    element.style.top = `${road.y}px`;
    element.style.width = `${road.w}px`;
    element.style.height = `${road.h}px`;
    roadsLayer.append(element);
  });

  landmarks.forEach((landmark) => {
    const element = document.createElement("div");
    element.className = `landmark landmark-${landmark.type}`;
    element.style.left = `${landmark.x}px`;
    element.style.top = `${landmark.y}px`;
    element.innerHTML =
      '<div class="landmark-core"></div>' + `<p class="landmark-label">${landmark.name}</p>`;
    landmarksLayer.append(element);
  });
}

function normalizePosition(rawPosition) {
  if (
    !rawPosition ||
    !Number.isFinite(rawPosition.x) ||
    !Number.isFinite(rawPosition.y) ||
    Number.isNaN(rawPosition.x) ||
    Number.isNaN(rawPosition.y)
  ) {
    return { ...DEFAULT_POSITION };
  }

  const mightBeLegacyGrid = rawPosition.x <= 40 && rawPosition.y <= 40;
  if (mightBeLegacyGrid) {
    return {
      x: clamp(
        rawPosition.x * LEGACY_TILE_SCALE + 120,
        PLAYER_SIZE / 2,
        WORLD_SIZE.width - PLAYER_SIZE / 2,
      ),
      y: clamp(
        rawPosition.y * LEGACY_TILE_SCALE + 120,
        PLAYER_SIZE / 2,
        WORLD_SIZE.height - PLAYER_SIZE / 2,
      ),
    };
  }

  return {
    x: clamp(rawPosition.x, PLAYER_SIZE / 2, WORLD_SIZE.width - PLAYER_SIZE / 2),
    y: clamp(rawPosition.y, PLAYER_SIZE / 2, WORLD_SIZE.height - PLAYER_SIZE / 2),
  };
}

function loadWorldStateFromData(data) {
  playerPosition = normalizePosition(data?.world?.position);
  const discovered = Array.isArray(data?.world?.discovered) ? data.world.discovered : [];
  discoveredZones = new Set(discovered);
  discoveredZones.add(zoneKeyFromPosition(playerPosition.x, playerPosition.y));
}

function persistWorldState(overrides = {}) {
  const data = readGameData();
  if (!data) {
    return;
  }

  data.world = {
    ...(data.world ?? {}),
    ...overrides,
    position: {
      x: Number(playerPosition.x.toFixed(1)),
      y: Number(playerPosition.y.toFixed(1)),
    },
    discovered: Array.from(discoveredZones),
  };
  saveGameData(data);
}

function renderPlayerAndCamera() {
  const viewportWidth = mapScene.querySelector(".map-viewport").clientWidth;
  const viewportHeight = mapScene.querySelector(".map-viewport").clientHeight;
  const cameraX = clamp(
    playerPosition.x - viewportWidth / 2,
    0,
    Math.max(0, WORLD_SIZE.width - viewportWidth),
  );
  const cameraY = clamp(
    playerPosition.y - viewportHeight / 2,
    0,
    Math.max(0, WORLD_SIZE.height - viewportHeight),
  );

  cameraPosition = { x: cameraX, y: cameraY };
  mapWorld.style.transform = `translate(${-cameraPosition.x}px, ${-cameraPosition.y}px)`;
  playerElement.style.left = `${playerPosition.x}px`;
  playerElement.style.top = `${playerPosition.y}px`;
}

function renderEncounterCards(cards, titleText = "附近夥伴候選（PokéAPI）") {
  encounterTitle.textContent = titleText;
  encounterList.innerHTML = "";
  cards.forEach((card) => {
    const item = document.createElement("article");
    item.className = "encounter-card";
    const imageHtml = card.sprite
      ? `<img src="${card.sprite}" alt="${card.name}" loading="lazy" />`
      : '<div class="encounter-name">載入失敗</div>';
    item.innerHTML = `${imageHtml}<p class="encounter-name">${card.name}</p>`;
    encounterList.append(item);
  });
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

async function loadDragoniteSprite() {
  try {
    const sprite = await fetchPokemonSprite("dragonite");
    playerSprite.src = sprite;
  } catch (error) {
    playerElement.innerHTML = '<div class="player-placeholder">DRAGONITE</div>';
    setMapStatus("快龍圖片載入失敗，已使用替代顯示。");
  }
}

function getEncounterSpecies(point) {
  const terrainType = getTerrainType(point);
  const pool = encounterPoolByTerrain[terrainType] ?? encounterPoolByTerrain.wild;
  const seedA = Math.floor(point.x / 90);
  const seedB = Math.floor(point.y / 90);
  const picked = [];
  for (let i = 0; i < 3; i += 1) {
    const index = (seedA * 11 + seedB * 7 + i * 3) % pool.length;
    const candidate = pool[index];
    if (!picked.includes(candidate)) {
      picked.push(candidate);
    }
  }
  return picked;
}

async function updateEncounterPanel() {
  const terrainType = getTerrainType(playerPosition);
  const zoneKey = `${terrainType}-${Math.floor(playerPosition.x / 180)}-${Math.floor(
    playerPosition.y / 180,
  )}`;
  if (zoneKey === lastEncounterKey) {
    return;
  }
  lastEncounterKey = zoneKey;

  const species = getEncounterSpecies(playerPosition);
  const requestId = ++encounterRequestId;
  renderEncounterCards(species.map((name) => ({ name, sprite: null })), "正在連線 PokéAPI...");

  const results = await Promise.allSettled(species.map((name) => fetchPokemonSprite(name)));
  if (requestId !== encounterRequestId) {
    return;
  }

  const cards = results.map((result, index) => {
    return {
      name: species[index],
      sprite: result.status === "fulfilled" ? result.value : null,
    };
  });
  const loadedCount = cards.filter((card) => Boolean(card.sprite)).length;
  const titleText =
    loadedCount === cards.length ? "附近夥伴候選（PokéAPI）" : "PokéAPI 部分失敗，已顯示可用資料";
  renderEncounterCards(cards, titleText);
}

function updateExplorationState() {
  discoveredZones.add(zoneKeyFromPosition(playerPosition.x, playerPosition.y));
}

function movePlayer(deltaTime) {
  const horizontal = Number(activeKeys.right) - Number(activeKeys.left);
  const vertical = Number(activeKeys.down) - Number(activeKeys.up);
  if (horizontal === 0 && vertical === 0) {
    return false;
  }

  const length = Math.hypot(horizontal, vertical) || 1;
  const stepX = (horizontal / length) * PLAYER_SPEED * deltaTime;
  const stepY = (vertical / length) * PLAYER_SPEED * deltaTime;

  let moved = false;
  const nextX = clamp(playerPosition.x + stepX, PLAYER_SIZE / 2, WORLD_SIZE.width - PLAYER_SIZE / 2);
  const horizontalCandidate = { x: nextX, y: playerPosition.y };
  if (!isBlocked(horizontalCandidate)) {
    playerPosition.x = nextX;
    moved = true;
  }

  const nextY = clamp(playerPosition.y + stepY, PLAYER_SIZE / 2, WORLD_SIZE.height - PLAYER_SIZE / 2);
  const verticalCandidate = { x: playerPosition.x, y: nextY };
  if (!isBlocked(verticalCandidate)) {
    playerPosition.y = nextY;
    moved = true;
  }

  return moved;
}

function gameLoop(timestamp) {
  if (currentScene !== "map") {
    loopRequestId = 0;
    return;
  }

  if (!lastFrameTime) {
    lastFrameTime = timestamp;
  }
  const deltaTime = (timestamp - lastFrameTime) / 1000;
  lastFrameTime = timestamp;

  const moved = movePlayer(deltaTime);
  if (moved) {
    updateExplorationState();
    updateMapHud();
    setMapStatus(buildLocationMessage(playerPosition));
    updateEncounterPanel();

    if (timestamp - lastPersistTime > 900) {
      persistWorldState();
      lastPersistTime = timestamp;
    }
  }

  renderPlayerAndCamera();
  loopRequestId = requestAnimationFrame(gameLoop);
}

function startMapLoop() {
  if (!loopRequestId) {
    lastFrameTime = 0;
    loopRequestId = requestAnimationFrame(gameLoop);
  }
}

function stopMapLoop() {
  if (loopRequestId) {
    cancelAnimationFrame(loopRequestId);
    loopRequestId = 0;
  }
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

  if (showMap) {
    startMapLoop();
  } else {
    stopMapLoop();
  }
}

function renderStoryLine() {
  const current = openingStory[storyIndex];
  storyTitle.textContent = current.title;
  storyText.textContent = current.text;
}

function enterMapScene(initialMessage) {
  isStoryPlaying = false;
  setSceneVisibility("map");
  renderPlayerAndCamera();
  updateMapHud();
  setMapStatus(initialMessage ?? buildLocationMessage(playerPosition));
  updateEncounterPanel();
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
  enterMapScene(`讀取成功！徽章 ${badges} / 8，位於 ${getLocationName(playerPosition)}。`);
}

function activateSelection() {
  const action = menuItems[selectedIndex].dataset.action;
  if (action === "new") {
    startNewGame();
    return;
  }
  loadGame();
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
    enterMapScene("開放世界展開！控制快龍前往城鎮、道路與道館。");
    return;
  }

  renderStoryLine();
}

function inspectCurrentPosition() {
  updateMapHud();
  setMapStatus(buildLocationMessage(playerPosition));
  updateEncounterPanel();
}

function setMovementKey(key, pressed) {
  if (key === "ArrowUp") {
    activeKeys.up = pressed;
  } else if (key === "ArrowDown") {
    activeKeys.down = pressed;
  } else if (key === "ArrowLeft") {
    activeKeys.left = pressed;
  } else if (key === "ArrowRight") {
    activeKeys.right = pressed;
  }
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
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      setMovementKey(event.key, true);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inspectCurrentPosition();
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

document.addEventListener("keyup", (event) => {
  if (currentScene === "map") {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      setMovementKey(event.key, false);
      persistWorldState();
    }
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
  inspectCurrentPosition();
});

buildWorldObjects();
loadDragoniteSprite();

if (!hasSaveData()) {
  setStatus("↑↓ 選擇　Enter 確認");
}

setSceneVisibility("menu");
renderMenuSelection();
