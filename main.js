const SAVE_KEY = "dragonite-game-save";
const menuItems = Array.from(document.querySelectorAll(".menu-item"));
const statusText = document.getElementById("statusText");
const menuScene = document.getElementById("menuScene");
const storyScene = document.getElementById("storyScene");
const storyTitle = document.getElementById("storyTitle");
const storyText = document.getElementById("storyText");
const mapScene = document.getElementById("mapScene");
const mapGrid = document.getElementById("mapGrid");
const mapStatus = document.getElementById("mapStatus");

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
  "MMMMMMMMMM",
  "MTRRRGGYYM",
  "MRGGGGGRRM",
  "MRGGTTGGRM",
  "MRRRGGGGRM",
  "MGGGGGGGRM",
  "MTRRRRGGGM",
  "MMMMMMMMMM",
];

const tileConfig = {
  M: { className: "tile-blocked", symbol: "#", label: "山脈" },
  G: { className: "tile-grass", symbol: ".", label: "草地" },
  R: { className: "tile-route", symbol: "=", label: "道路" },
  T: { className: "tile-town", symbol: "T", label: "城鎮" },
  Y: { className: "tile-gym", symbol: "Y", label: "道館" },
};

const namedLocations = {
  "1,6": "真新鎮",
  "1,1": "尼比市",
  "4,3": "華藍市",
  "5,3": "玉虹市",
  "7,1": "尼比道館",
  "8,1": "華藍道館",
  "2,1": "1 號道路",
  "3,1": "2 號道路",
  "2,4": "3 號道路",
};

const DEFAULT_POSITION = { x: 1, y: 6 };

let selectedIndex = 0;
let storyIndex = 0;
let isStoryPlaying = false;
let currentScene = "menu";
let playerPosition = { ...DEFAULT_POSITION };

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
      partner: "快龍",
    },
    progress: {
      badges: 0,
      eliteFourDefeated: false,
      championDefeated: false,
    },
    world: {
      position: { ...DEFAULT_POSITION },
      storyPlayed: false,
    },
    updatedAt: "",
  };
}

function startNewGame() {
  const gameData = createNewGameData();
  saveGameData(gameData);
  playerPosition = { ...gameData.world.position };
  startOpeningStory();
}

function loadGame() {
  const data = readGameData();
  if (!data) {
    setStatus("沒有找到存檔，請先開始新遊戲。");
    return;
  }

  const badges = data?.progress?.badges ?? 0;
  const loadedPosition = data?.world?.position;
  if (isValidPassablePosition(loadedPosition)) {
    playerPosition = { ...loadedPosition };
  } else {
    playerPosition = { ...DEFAULT_POSITION };
  }

  enterMapScene(
    `讀取成功！目前徽章數：${badges} / 8，位置：${getLocationName(
      playerPosition.x,
      playerPosition.y,
    )}`,
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

function getTileAt(x, y) {
  if (y < 0 || y >= mapLayout.length || x < 0 || x >= mapLayout[0].length) {
    return "M";
  }

  return mapLayout[y][x];
}

function isPassable(tileType) {
  return tileType !== "M";
}

function isValidPassablePosition(position) {
  if (!position || !Number.isInteger(position.x) || !Number.isInteger(position.y)) {
    return false;
  }

  return isPassable(getTileAt(position.x, position.y));
}

function getLocationName(x, y) {
  const locationKey = `${x},${y}`;
  if (namedLocations[locationKey]) {
    return namedLocations[locationKey];
  }

  const tileType = getTileAt(x, y);
  return tileConfig[tileType].label;
}

function setMapStatus(message) {
  mapStatus.textContent = message;
}

function buildLocationMessage(x, y) {
  const tileType = getTileAt(x, y);
  const locationName = getLocationName(x, y);

  if (tileType === "T") {
    return `抵達${locationName}，你可以補給並尋找新夥伴。`;
  }

  if (tileType === "Y") {
    return `快龍已到達${locationName}！準備挑戰館主。`;
  }

  if (tileType === "R") {
    return `正在${locationName}前進，下一站是道館。`;
  }

  return `快龍穿越${locationName}，持續朝聯盟目標前進。`;
}

function renderMap() {
  mapGrid.innerHTML = "";

  for (let y = 0; y < mapLayout.length; y += 1) {
    for (let x = 0; x < mapLayout[y].length; x += 1) {
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
  };

  saveGameData(data);
}

function enterMapScene(initialMessage) {
  isStoryPlaying = false;
  setSceneVisibility("map");
  renderMap();
  setMapStatus(initialMessage ?? buildLocationMessage(playerPosition.x, playerPosition.y));
}

function movePlayer(dx, dy) {
  const nextX = playerPosition.x + dx;
  const nextY = playerPosition.y + dy;
  const nextTile = getTileAt(nextX, nextY);

  if (!isPassable(nextTile)) {
    setMapStatus("前方是山脈，這裡無法通行。");
    return;
  }

  playerPosition = { x: nextX, y: nextY };
  renderMap();
  setMapStatus(buildLocationMessage(nextX, nextY));
  persistWorldState();
}

function inspectCurrentTile() {
  setMapStatus(buildLocationMessage(playerPosition.x, playerPosition.y));
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
    enterMapScene("旅程開始！前往城鎮、道路與道館，邁向八徽章之路。");
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
