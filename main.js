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
const mapDragoniteStatus = document.getElementById("mapDragoniteStatus");
const mapProgressStatus = document.getElementById("mapProgressStatus");
const encounterList = document.getElementById("encounterList");
const encounterTitle = document.querySelector(".encounter-title");
const encounterScene = document.getElementById("encounterScene");
const gymScene = document.getElementById("gymScene");
const encSprite = document.getElementById("encSprite");
const encName = document.getElementById("encName");
const encRarity = document.getElementById("encRarity");
const encMsg = document.getElementById("encMsg");
const encFriendFill = document.getElementById("encFriendFill");
const encPartyCount = document.getElementById("encPartyCount");
const encTag = document.getElementById("encounterTag");
const encButtons = Array.from(document.querySelectorAll(".enc-btn"));
const gymTag = document.getElementById("gymTag");
const gymTitle = document.getElementById("gymTitle");
const gymAllyName = document.getElementById("gymAllyName");
const gymDragoniteMeta = document.getElementById("gymDragoniteMeta");
const gymDragoniteHpFill = document.getElementById("gymDragoniteHpFill");
const gymDragoniteHpText = document.getElementById("gymDragoniteHpText");
const gymEnemyName = document.getElementById("gymEnemyName");
const gymEnemyMeta = document.getElementById("gymEnemyMeta");
const gymEnemyHpFill = document.getElementById("gymEnemyHpFill");
const gymEnemyHpText = document.getElementById("gymEnemyHpText");
const gymMsg = document.getElementById("gymMsg");
const gymStatus = document.getElementById("gymStatus");
const gymButtons = Array.from(document.querySelectorAll(".gym-btn"));

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
  // 1號道路：真新鎮 → 常青市（水平）
  { x: 220, y: 925, w: 800, h: 56 },
  // 2號道路：常青市 → 尼比市方向（垂直北上）
  { x: 955, y: 495, w: 56, h: 486 },
  // 3號道路：尼比市 → 華藍市（水平東西向）
  { x: 720, y: 495, w: 780, h: 56 },
  // 4號道路：華藍市 → 道館區（垂直北上）
  { x: 1435, y: 275, w: 56, h: 276 },
  // 5號道路：尼比道館 ↔ 華藍道館（水平）
  { x: 1260, y: 275, w: 490, h: 56 },
  // 6號道路：常青市 → 南方（垂直南下）
  { x: 955, y: 925, w: 56, h: 240 },
  // 7號道路：南方 → 金黃市（水平東向）
  { x: 955, y: 1110, w: 625, h: 56 },
  // 8號道路：尼比市西側岔路（可往西探索）
  { x: 440, y: 495, w: 336, h: 56 },
  // 9號道路：真新鎮南方小路
  { x: 220, y: 925, w: 56, h: 200 },
];

const blockedZones = [
  { x: 0, y: 0, w: 360, h: 420 },
  { x: 1820, y: 1020, w: 380, h: 380 },
  { x: 0, y: 1200, w: 180, h: 200 },
];

const landmarks = [
  { id: "pallet", name: "真新鎮", type: "town", x: 260, y: 960, radius: 90 },
  { id: "viridian", name: "常青市", type: "town", x: 980, y: 940, radius: 92 },
  { id: "pewter", name: "尼比市", type: "town", x: 760, y: 520, radius: 92 },
  { id: "cerulean", name: "華藍市", type: "town", x: 1460, y: 520, radius: 92 },
  { id: "vermilion", name: "枯葉市", type: "town", x: 1700, y: 980, radius: 92 },
  { id: "celadon", name: "玉虹市", type: "town", x: 1260, y: 980, radius: 92 },
  { id: "fuchsia", name: "淺紅市", type: "town", x: 1650, y: 1260, radius: 92 },
  { id: "cinnabar", name: "紅蓮鎮", type: "town", x: 720, y: 1260, radius: 92 },
  { id: "saffron", name: "金黃市", type: "town", x: 1540, y: 1130, radius: 92 },
  { id: "pewter-gym", name: "尼比道館", type: "gym", x: 700, y: 430, radius: 86 },
  { id: "cerulean-gym", name: "華藍道館", type: "gym", x: 1540, y: 430, radius: 86 },
  { id: "vermilion-gym", name: "枯葉道館", type: "gym", x: 1770, y: 1040, radius: 86 },
  { id: "celadon-gym", name: "玉虹道館", type: "gym", x: 1180, y: 900, radius: 86 },
  { id: "fuchsia-gym", name: "淺紅道館", type: "gym", x: 1710, y: 1320, radius: 86 },
  { id: "saffron-gym", name: "金黃道館", type: "gym", x: 1460, y: 1050, radius: 86 },
  { id: "cinnabar-gym", name: "紅蓮道館", type: "gym", x: 640, y: 1320, radius: 86 },
  { id: "viridian-gym", name: "常青道館", type: "gym", x: 900, y: 860, radius: 86 },
];

const encounterPoolByTerrain = {
  wild: ["oddish", "bellsprout", "pikachu", "paras", "nidoran-m", "nidoran-f"],
  road: ["pidgey", "rattata", "spearow", "sandshrew", "growlithe", "ponyta"],
  town: ["eevee", "meowth", "jigglypuff", "psyduck", "abra", "machop"],
  gym: ["onix", "raichu", "kadabra", "machoke", "electabuzz", "hitmonlee"],
};

const wildPokemonSpawns = [
  // 1號道路沿途
  { x: 380, y: 890, terrain: "road" },
  { x: 560, y: 970, terrain: "wild" },
  { x: 720, y: 895, terrain: "road" },
  // 常青市附近
  { x: 1060, y: 860, terrain: "wild" },
  { x: 880, y: 1020, terrain: "wild" },
  // 2號道路（北上）
  { x: 910, y: 720, terrain: "road" },
  { x: 1010, y: 610, terrain: "wild" },
  // 尼比市附近
  { x: 640, y: 460, terrain: "wild" },
  { x: 860, y: 570, terrain: "wild" },
  // 3號道路
  { x: 1100, y: 460, terrain: "road" },
  { x: 1250, y: 560, terrain: "wild" },
  // 華藍市附近
  { x: 1380, y: 450, terrain: "wild" },
  { x: 1560, y: 580, terrain: "wild" },
  // 道館區域
  { x: 1350, y: 230, terrain: "wild" },
  { x: 1600, y: 360, terrain: "wild" },
  // 南方道路往金黃市
  { x: 1100, y: 1070, terrain: "wild" },
  { x: 1300, y: 1150, terrain: "road" },
  { x: 1480, y: 1070, terrain: "wild" },
  // 西側岔路
  { x: 500, y: 440, terrain: "wild" },
  // 真新鎮南方
  { x: 280, y: 1060, terrain: "wild" },
];

const pokemonRarity = {
  pidgey: "common", rattata: "common", oddish: "common", bellsprout: "common",
  spearow: "common", sandshrew: "common", paras: "common",
  "nidoran-m": "uncommon", "nidoran-f": "uncommon", meowth: "uncommon",
  growlithe: "uncommon", ponyta: "uncommon", psyduck: "uncommon",
  machop: "uncommon", jigglypuff: "uncommon",
  pikachu: "rare", eevee: "rare", abra: "rare",
  onix: "rare", raichu: "rare", kadabra: "rare",
  machoke: "rare", electabuzz: "rare", hitmonlee: "rare",
};
const rarityBaseRate = { common: 55, uncommon: 35, rare: 15 };
const rarityFleeRate = { common: 10, uncommon: 18, rare: 30 };
const rarityLabels = { common: "常見", uncommon: "少見", rare: "稀有" };

const INTERACT_RANGE = 90;
const DRAGONITE_MAX_LEVEL = 100;
const DRAGONITE_INITIAL_LEVEL = 10;
const DRAGONITE_BASE_STATS = { hp: 68, attack: 22, defense: 16 };

const gymConfigs = {
  "pewter-gym": {
    leader: "小剛",
    type: "rock",
    typeLabel: "岩石",
    badgeName: "灰色徽章",
    recommendedLevel: 12,
    requiredBadges: 0,
    badgeRewardExp: 120,
    enemyPower: 16,
    enemyMultiplier: 1.1,
    team: [
      { species: "geodude", level: 12 },
      { species: "onix", level: 14 },
    ],
  },
  "cerulean-gym": {
    leader: "小霞",
    type: "water",
    typeLabel: "水",
    badgeName: "藍色徽章",
    recommendedLevel: 20,
    requiredBadges: 1,
    badgeRewardExp: 180,
    enemyPower: 16,
    enemyMultiplier: 1.08,
    team: [
      { species: "staryu", level: 18 },
      { species: "starmie", level: 21 },
    ],
  },
  "vermilion-gym": {
    leader: "馬志士",
    type: "electric",
    typeLabel: "電",
    badgeName: "橘色徽章",
    recommendedLevel: 24,
    requiredBadges: 2,
    badgeRewardExp: 230,
    enemyPower: 17,
    enemyMultiplier: 1.1,
    team: [
      { species: "voltorb", level: 23 },
      { species: "pikachu", level: 24 },
      { species: "raichu", level: 26 },
    ],
  },
  "celadon-gym": {
    leader: "莉佳",
    type: "grass",
    typeLabel: "草",
    badgeName: "彩虹徽章",
    recommendedLevel: 30,
    requiredBadges: 3,
    badgeRewardExp: 300,
    enemyPower: 18,
    enemyMultiplier: 1.12,
    team: [
      { species: "tangela", level: 28 },
      { species: "victreebel", level: 29 },
      { species: "vileplume", level: 31 },
    ],
  },
  "fuchsia-gym": {
    leader: "阿桔",
    type: "poison",
    typeLabel: "毒",
    badgeName: "粉紅徽章",
    recommendedLevel: 37,
    requiredBadges: 4,
    badgeRewardExp: 390,
    enemyPower: 19,
    enemyMultiplier: 1.13,
    team: [
      { species: "koffing", level: 37 },
      { species: "muk", level: 39 },
      { species: "weezing", level: 40 },
    ],
  },
  "saffron-gym": {
    leader: "娜姿",
    type: "psychic",
    typeLabel: "超能力",
    badgeName: "金黃徽章",
    recommendedLevel: 43,
    requiredBadges: 5,
    badgeRewardExp: 470,
    enemyPower: 20,
    enemyMultiplier: 1.14,
    team: [
      { species: "kadabra", level: 41 },
      { species: "mr-mime", level: 42 },
      { species: "alakazam", level: 44 },
    ],
  },
  "cinnabar-gym": {
    leader: "夏伯",
    type: "fire",
    typeLabel: "火",
    badgeName: "深紅徽章",
    recommendedLevel: 47,
    requiredBadges: 6,
    badgeRewardExp: 560,
    enemyPower: 21,
    enemyMultiplier: 1.15,
    team: [
      { species: "growlithe", level: 45 },
      { species: "ponyta", level: 45 },
      { species: "rapidash", level: 47 },
      { species: "arcanine", level: 48 },
    ],
  },
  "viridian-gym": {
    leader: "坂木",
    type: "ground",
    typeLabel: "地面",
    badgeName: "綠色徽章",
    recommendedLevel: 50,
    requiredBadges: 7,
    badgeRewardExp: 650,
    enemyPower: 22,
    enemyMultiplier: 1.18,
    team: [
      { species: "dugtrio", level: 49 },
      { species: "nidoking", level: 50 },
      { species: "nidoqueen", level: 50 },
      { species: "rhydon", level: 52 },
    ],
  },
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
let activeWildPokemon = [];
let nearbyPokemon = null;
let encounterState = null;
let encActionIndex = 0;
let gymBattleState = null;
let gymActionIndex = 0;

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

function calculateDragoniteStats(level) {
  return {
    maxHp: DRAGONITE_BASE_STATS.hp + (level - 1) * 6,
    attack: DRAGONITE_BASE_STATS.attack + (level - 1) * 2,
    defense: DRAGONITE_BASE_STATS.defense + (level - 1),
  };
}

function speciesSeed(species) {
  return Array.from(species).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function calculatePartnerStats(species, level) {
  const seed = speciesSeed(species);
  return {
    maxHp: 40 + level * 4 + (seed % 8),
    attack: 12 + Math.round(level * 1.6) + (seed % 5),
    defense: 10 + Math.round(level * 1.2) + (seed % 4),
  };
}

function normalizePartyMember(member, fallbackLevel) {
  const level = clamp(
    Number.isFinite(member?.level) ? Math.floor(member.level) : fallbackLevel,
    5,
    DRAGONITE_MAX_LEVEL,
  );
  const stats = calculatePartnerStats(member.species, level);
  const currentHp = clamp(
    Number.isFinite(member?.currentHp) ? Math.floor(member.currentHp) : stats.maxHp,
    0,
    stats.maxHp,
  );
  return {
    ...member,
    level,
    exp: Math.max(0, Number.isFinite(member?.exp) ? Math.floor(member.exp) : 0),
    maxHp: stats.maxHp,
    currentHp,
    attack: stats.attack,
    defense: stats.defense,
  };
}

function ensurePartyState(gameData) {
  if (!Array.isArray(gameData.party)) {
    gameData.party = [];
    return;
  }
  const dragoniteLevel = gameData?.player?.dragonite?.level ?? DRAGONITE_INITIAL_LEVEL;
  const fallbackLevel = Math.max(6, dragoniteLevel - 2);
  gameData.party = gameData.party.map((member) => normalizePartyMember(member, fallbackLevel));
}

function expToNextLevel(level) {
  return 45 + Math.round(level * 16);
}

function ensureDragoniteState(gameData) {
  if (!gameData.player) {
    gameData.player = {};
  }
  if (!gameData.progress) {
    gameData.progress = {};
  }
  if (!gameData.progress.gymWins) {
    gameData.progress.gymWins = {};
  }

  const dragonite = gameData.player.dragonite ?? {};
  const level = clamp(
    Number.isFinite(dragonite.level) ? Math.floor(dragonite.level) : DRAGONITE_INITIAL_LEVEL,
    1,
    DRAGONITE_MAX_LEVEL,
  );
  const stats = calculateDragoniteStats(level);
  const currentHp = clamp(
    Number.isFinite(dragonite.currentHp) ? Math.floor(dragonite.currentHp) : stats.maxHp,
    0,
    stats.maxHp,
  );
  const exp = Math.max(0, Number.isFinite(dragonite.exp) ? Math.floor(dragonite.exp) : 0);

  gameData.player.dragonite = {
    level,
    exp,
    maxHp: stats.maxHp,
    currentHp,
    attack: stats.attack,
    defense: stats.defense,
  };
  ensurePartyState(gameData);

  return gameData.player.dragonite;
}

function gainDragoniteExp(amount) {
  const data = readGameData();
  if (!data) {
    return "";
  }

  const dragonite = ensureDragoniteState(data);
  let gain = Math.max(0, Math.floor(amount));
  if (!gain) {
    return "";
  }

  let leveled = 0;
  while (gain > 0 && dragonite.level < DRAGONITE_MAX_LEVEL) {
    const needed = expToNextLevel(dragonite.level) - dragonite.exp;
    const consume = Math.min(needed, gain);
    dragonite.exp += consume;
    gain -= consume;

    if (dragonite.exp >= expToNextLevel(dragonite.level)) {
      dragonite.level += 1;
      dragonite.exp = 0;
      const nextStats = calculateDragoniteStats(dragonite.level);
      dragonite.maxHp = nextStats.maxHp;
      dragonite.attack = nextStats.attack;
      dragonite.defense = nextStats.defense;
      dragonite.currentHp = dragonite.maxHp;
      leveled += 1;
    }
  }

  if (dragonite.level >= DRAGONITE_MAX_LEVEL) {
    dragonite.exp = 0;
  }

  saveGameData(data);

  if (leveled > 0) {
    return `\n快龍升級了！目前 Lv.${dragonite.level}`;
  }
  return `\n快龍獲得經驗，Lv.${dragonite.level}（${dragonite.exp}/${expToNextLevel(dragonite.level)}）`;
}

function getDragoniteSnapshot() {
  const data = readGameData();
  if (!data) {
    return null;
  }
  const dragonite = ensureDragoniteState(data);
  return {
    level: dragonite.level,
    exp: dragonite.exp,
    maxHp: dragonite.maxHp,
    currentHp: dragonite.currentHp,
    attack: dragonite.attack,
    defense: dragonite.defense,
  };
}

function createNewGameData() {
  const dragoniteStats = calculateDragoniteStats(DRAGONITE_INITIAL_LEVEL);
  return {
    player: {
      name: "快龍訓練家",
      partner: "dragonite",
      dragonite: {
        level: DRAGONITE_INITIAL_LEVEL,
        exp: 0,
        maxHp: dragoniteStats.maxHp,
        currentHp: dragoniteStats.maxHp,
        attack: dragoniteStats.attack,
        defense: dragoniteStats.defense,
      },
    },
    progress: {
      badges: 0,
      gymWins: {},
      eliteFourDefeated: false,
      championDefeated: false,
    },
    party: [],
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
  const dragonite = getDragoniteSnapshot();
  const badges = readGameData()?.progress?.badges ?? 0;
  locationTitle.textContent = getLocationName(playerPosition);
  const partySize = getParty().length;
  locationMeta.textContent = `座標 (${Math.round(playerPosition.x)}, ${Math.round(playerPosition.y)})・${terrainLabel(terrainType)}`;
  if (dragonite) {
    mapDragoniteStatus.textContent =
      `快龍 Lv.${dragonite.level}・HP ${dragonite.currentHp}/${dragonite.maxHp}・EXP ${dragonite.exp}/${expToNextLevel(dragonite.level)}`;
  } else {
    mapDragoniteStatus.textContent = "快龍 Lv.--・HP --/--";
  }
  mapProgressStatus.textContent = `徽章 ${badges}/8・夥伴 ${partySize} 隻・已探索 ${discoveredZones.size} 區`;

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

function populateWildPokemon() {
  activeWildPokemon = wildPokemonSpawns.map((spawn, index) => {
    const pool = encounterPoolByTerrain[spawn.terrain] ?? encounterPoolByTerrain.wild;
    const species = pool[index % pool.length];
    return { ...spawn, species, element: null, sprite: null };
  });
}

function renderWildPokemonOnMap() {
  const layer = document.getElementById("wildPokemonLayer");
  layer.innerHTML = "";
  activeWildPokemon.forEach((pokemon) => {
    const el = document.createElement("div");
    el.className = "wild-pokemon";
    el.style.left = `${pokemon.x}px`;
    el.style.top = `${pokemon.y}px`;
    const img = document.createElement("img");
    img.alt = pokemon.species;
    img.loading = "lazy";
    el.appendChild(img);
    const label = document.createElement("p");
    label.className = "wild-pokemon-name";
    label.textContent = pokemon.species;
    el.appendChild(label);
    layer.appendChild(el);
    pokemon.element = el;

    fetchPokemonSprite(pokemon.species)
      .then((url) => {
        img.src = url;
        pokemon.sprite = url;
      })
      .catch(() => {
        el.classList.add("wild-pokemon-missing");
      });
  });
}

function getNearestWildPokemon() {
  let nearest = null;
  let minDist = Infinity;
  for (const pokemon of activeWildPokemon) {
    const dist = getDistance(playerPosition, pokemon);
    if (dist < minDist) {
      minDist = dist;
      nearest = pokemon;
    }
  }
  return minDist <= INTERACT_RANGE ? nearest : null;
}

function updateWildPokemonHighlight() {
  const prev = nearbyPokemon;
  nearbyPokemon = getNearestWildPokemon();

  if (prev && prev !== nearbyPokemon && prev.element) {
    prev.element.classList.remove("wild-pokemon-nearby");
  }
  if (nearbyPokemon && nearbyPokemon.element) {
    nearbyPokemon.element.classList.add("wild-pokemon-nearby");
  }

  const mapHint = document.getElementById("mapHint");
  if (nearbyPokemon) {
    mapHint.textContent = `靠近了 ${nearbyPokemon.species}！按 Enter / Space 互動`;
  } else {
    mapHint.textContent = "長按 ↑↓←→ 連續移動快龍　Enter / Space 探索";
  }
}

function getParty() {
  const data = readGameData();
  return data?.party ?? [];
}

function addToParty(species, sprite) {
  const data = readGameData();
  if (!data) return;
  const dragonite = ensureDragoniteState(data);
  if (!Array.isArray(data.party)) data.party = [];
  const partnerLevel = Math.max(6, dragonite.level - 2);
  const partnerStats = calculatePartnerStats(species, partnerLevel);
  data.party.push({
    species,
    sprite,
    befriendedAt: new Date().toISOString(),
    level: partnerLevel,
    exp: 0,
    maxHp: partnerStats.maxHp,
    currentHp: partnerStats.maxHp,
    attack: partnerStats.attack,
    defense: partnerStats.defense,
  });
  saveGameData(data);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startEncounter(pokemon) {
  const rarity = pokemonRarity[pokemon.species] ?? "common";
  encounterState = {
    pokemon,
    rarity,
    friendliness: 0,
    fleeModifier: 0,
    turns: 0,
    maxTurns: 10,
    ended: false,
  };
  encActionIndex = 0;

  encSprite.src = pokemon.sprite ?? "";
  encName.textContent = pokemon.species;
  encRarity.textContent = `稀有度：${rarityLabels[rarity]}　基礎友好率 ${rarityBaseRate[rarity]}%`;
  encFriendFill.style.width = "0%";
  encMsg.textContent = `野生的 ${pokemon.species} 出現了！\n牠用好奇的眼神看著你。`;
  encPartyCount.textContent = `目前夥伴：${getParty().length} 隻`;
  encTag.textContent = "野生寶可夢出現！";
  setEncButtons(true);
  renderEncActionSelection();
  setSceneVisibility("encounter");
}

function setEncButtons(enabled) {
  encButtons.forEach((btn) => { btn.disabled = !enabled; });
}

function renderEncActionSelection() {
  encButtons.forEach((btn, i) => {
    btn.classList.toggle("is-selected", i === encActionIndex);
    if (i === encActionIndex) btn.focus();
  });
}

function endEncounter(message) {
  encounterState.ended = true;
  encMsg.textContent = message;
  setEncButtons(false);
  encTag.textContent = "結束";
  setTimeout(() => {
    returnToMapFromEncounter();
  }, 1800);
}

function returnToMapFromEncounter() {
  encounterState = null;
  setSceneVisibility("map");
  updateEncounterPanel();
  updateWildPokemonHighlight();
}

function updateFriendBar() {
  const pct = Math.min(encounterState.friendliness, 100);
  encFriendFill.style.width = `${pct}%`;
}

function checkFlee() {
  const { rarity, fleeModifier } = encounterState;
  const fleeChance = Math.max(0, rarityFleeRate[rarity] + fleeModifier);
  const roll = randomInt(1, 100);
  return roll <= fleeChance;
}

function performEncounterAction(action) {
  if (!encounterState || encounterState.ended) return;

  const state = encounterState;
  const name = state.pokemon.species;
  state.turns += 1;

  if (action === "run") {
    endEncounter(`你向 ${name} 揮揮手，轉身離開了。`);
    return;
  }

  if (action === "friend") {
    const baseRate = rarityBaseRate[state.rarity];
    const bonus = Math.floor(state.friendliness * 1.5);
    const successRate = Math.min(baseRate + bonus, 95);
    const roll = randomInt(1, 100);

    if (roll <= successRate) {
      // befriend success
      addToParty(name, state.pokemon.sprite);
      encPartyCount.textContent = `目前夥伴：${getParty().length} 隻`;
      const rarityExp = { common: 18, uncommon: 28, rare: 42 };
      const expMessage = gainDragoniteExp(rarityExp[state.rarity] ?? 18);

      // remove from map
      const idx = activeWildPokemon.indexOf(state.pokemon);
      if (idx !== -1) {
        state.pokemon.element?.remove();
        activeWildPokemon.splice(idx, 1);
      }
      nearbyPokemon = null;

      endEncounter(`${name} 成為了你的夥伴！\n牠開心地跳了起來！${expMessage}`);
      return;
    }

    encMsg.textContent = `${name} 似乎還沒準備好…\n（成功率 ${successRate}%，骰到 ${roll}）`;
  }

  if (action === "snack") {
    const gain = randomInt(15, 25);
    state.friendliness = Math.min(state.friendliness + gain, 100);
    state.fleeModifier -= 8;
    updateFriendBar();
    encMsg.textContent = `你給了 ${name} 一些零食！\n牠開心地吃了起來。友好度 +${gain}`;
  }

  if (action === "observe") {
    const gain = randomInt(5, 12);
    state.friendliness = Math.min(state.friendliness + gain, 100);
    updateFriendBar();
    encMsg.textContent = `你靜靜觀察 ${name}…\n牠似乎放鬆了一些。友好度 +${gain}`;
  }

  // check flee after action
  if (checkFlee()) {
    endEncounter(`${name} 突然跑掉了！\n下次再試試吧。`);
    return;
  }

  // check max turns
  if (state.turns >= state.maxTurns) {
    endEncounter(`時間太久了，${name} 漸漸走遠了…`);
    return;
  }

  encRarity.textContent =
    `稀有度：${rarityLabels[state.rarity]}　回合 ${state.turns}/${state.maxTurns}`;
}

function interactWithPokemon(pokemon) {
  startEncounter(pokemon);
}

function setGymButtons(enabled) {
  gymButtons.forEach((btn) => { btn.disabled = !enabled; });
}

function renderGymActionSelection() {
  gymButtons.forEach((btn, index) => {
    btn.classList.toggle("is-selected", index === gymActionIndex);
    if (index === gymActionIndex) {
      btn.focus();
    }
  });
}

function getMoveMultiplier(moveType, targetType) {
  if (moveType === "electric" && targetType === "water") return 1.8;
  if (moveType === "electric" && targetType === "ground") return 0.25;
  if (moveType === "electric" && targetType === "grass") return 0.7;
  if (moveType === "electric" && targetType === "electric") return 0.7;
  if (moveType === "electric" && targetType === "rock") return 0.7;
  if (moveType === "dragon" && targetType === "fire") return 1.1;
  if (moveType === "dragon" && targetType === "water") return 1.1;
  if (moveType === "dragon" && targetType === "grass") return 1.1;
  if (moveType === "dragon" && targetType === "electric") return 1.1;
  if (moveType === "dragon" && targetType === "rock") return 0.9;
  return 1;
}

function createGymEnemy(pokemon, gymType) {
  const level = pokemon.level;
  return {
    species: pokemon.species,
    level,
    type: gymType,
    maxHp: 34 + level * 4,
    hp: 34 + level * 4,
    attack: 10 + level * 2,
    defense: 8 + level,
  };
}

function updateGymHud() {
  if (!gymBattleState) {
    return;
  }
  const { enemy } = gymBattleState;
  const activeAlly = gymBattleState.playerTeam[gymBattleState.activeAllyIndex];
  const aliveCount = gymBattleState.playerTeam.filter((ally) => ally.hp > 0).length;
  gymAllyName.textContent = activeAlly.displayName;
  gymDragoniteMeta.textContent = `Lv.${activeAlly.level}・存活 ${aliveCount}/${gymBattleState.playerTeam.length}`;
  gymDragoniteHpFill.style.width = `${(activeAlly.hp / activeAlly.maxHp) * 100}%`;
  gymDragoniteHpText.textContent = `HP ${Math.max(0, Math.round(activeAlly.hp))} / ${activeAlly.maxHp}`;

  gymEnemyName.textContent = enemy.species;
  gymEnemyMeta.textContent = `${gymBattleState.gym.typeLabel}系・Lv.${enemy.level}`;
  gymEnemyHpFill.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
  gymEnemyHpText.textContent = `HP ${Math.max(0, Math.round(enemy.hp))} / ${enemy.maxHp}`;
}

function calcBattleDamage(attacker, defender, power, multiplier = 1) {
  const base = power + attacker.attack * 0.9 - defender.defense * 0.55;
  return Math.max(6, Math.round((base + randomInt(-3, 5)) * multiplier));
}

function finishGymBattle(message, mapMessage) {
  setGymButtons(false);
  gymMsg.textContent = message;
  gymTag.textContent = "道館戰結束";
  gymBattleState = null;
  setTimeout(() => {
    setSceneVisibility("map");
    updateMapHud();
    setMapStatus(mapMessage);
    updateEncounterPanel();
    updateWildPokemonHighlight();
  }, 1800);
}

function buildGymPlayerTeam(data) {
  const dragonite = ensureDragoniteState(data);
  ensurePartyState(data);
  const dragoniteMember = {
    slotType: "dragonite",
    displayName: "快龍",
    level: dragonite.level,
    maxHp: dragonite.maxHp,
    hp: Math.max(1, dragonite.currentHp),
    attack: dragonite.attack,
    defense: dragonite.defense,
  };
  const partners = data.party.map((member, index) => ({
    slotType: "party",
    partyIndex: index,
    displayName: `${member.species}`,
    level: member.level,
    maxHp: member.maxHp,
    hp: Math.max(0, member.currentHp),
    attack: member.attack,
    defense: member.defense,
  }));
  const roster = [dragoniteMember, ...partners];
  if (!roster.some((ally) => ally.hp > 0)) {
    roster.forEach((ally) => { ally.hp = ally.maxHp; });
  }
  return roster;
}

function persistGymPlayerTeam(playerTeam) {
  const data = readGameData();
  if (!data) return;
  const dragonite = ensureDragoniteState(data);
  ensurePartyState(data);
  playerTeam.forEach((ally) => {
    if (ally.slotType === "dragonite") {
      dragonite.currentHp = clamp(Math.round(ally.hp), 0, dragonite.maxHp);
      return;
    }
    const member = data.party[ally.partyIndex];
    if (!member) return;
    member.currentHp = clamp(Math.round(ally.hp), 0, member.maxHp);
  });
  saveGameData(data);
}

function handleGymVictory() {
  const data = readGameData();
  if (!data || !gymBattleState) {
    return;
  }

  ensureDragoniteState(data);
  const gymId = gymBattleState.landmark.id;
  const gym = gymBattleState.gym;
  if (!data.progress.gymWins[gymId]) {
    data.progress.gymWins[gymId] = true;
    data.progress.badges = Math.min(8, (data.progress.badges ?? 0) + 1);
  }
  ensurePartyState(data);
  data.player.dragonite.currentHp = data.player.dragonite.maxHp;
  data.party.forEach((member) => {
    member.currentHp = member.maxHp;
  });
  saveGameData(data);

  const expMessage = gainDragoniteExp(gym.badgeRewardExp);
  const badgeCount = readGameData()?.progress?.badges ?? 0;
  finishGymBattle(
    `你擊敗了館主 ${gym.leader}！\n獲得 ${gym.badgeName}。${expMessage}`,
    `獲勝！目前徽章 ${badgeCount} / 8。`,
  );
}

function nextGymEnemy() {
  if (!gymBattleState) return;
  gymBattleState.enemyIndex += 1;
  if (gymBattleState.enemyIndex >= gymBattleState.gym.team.length) {
    handleGymVictory();
    return;
  }
  const nextPokemon = gymBattleState.gym.team[gymBattleState.enemyIndex];
  gymBattleState.enemy = createGymEnemy(nextPokemon, gymBattleState.gym.type);
  updateGymHud();
  gymMsg.textContent = `${gymBattleState.gym.leader} 派出了 ${gymBattleState.enemy.species}！`;
}

function performGymAction(action) {
  if (!gymBattleState) return;
  const { enemy, gym } = gymBattleState;
  const ally = gymBattleState.playerTeam[gymBattleState.activeAllyIndex];

  function findNextAliveAllyIndex() {
    for (let step = 1; step <= gymBattleState.playerTeam.length; step += 1) {
      const nextIndex = (gymBattleState.activeAllyIndex + step) % gymBattleState.playerTeam.length;
      if (gymBattleState.playerTeam[nextIndex].hp > 0) {
        return nextIndex;
      }
    }
    return -1;
  }

  if (action === "retreat") {
    persistGymPlayerTeam(gymBattleState.playerTeam);
    finishGymBattle("你先撤退整備，準備下次再戰。", "你離開了道館，快龍仍可再次挑戰。");
    return;
  }

  let message = "";

  if (action === "claw") {
    const damage = calcBattleDamage(ally, enemy, 15, getMoveMultiplier("dragon", enemy.type));
    enemy.hp = Math.max(0, enemy.hp - damage);
    message = `${ally.displayName} 使出龍爪，造成 ${damage} 點傷害！`;
  } else if (action === "thunder") {
    const hitRoll = randomInt(1, 100);
    if (hitRoll <= 90) {
      const damage = calcBattleDamage(ally, enemy, 17, getMoveMultiplier("electric", enemy.type));
      enemy.hp = Math.max(0, enemy.hp - damage);
      message = `${ally.displayName} 使出雷電拳，造成 ${damage} 點傷害！`;
    } else {
      message = "雷電拳落空了！";
    }
  } else if (action === "heal") {
    const recover = 18 + Math.round(ally.level * 0.8);
    ally.hp = Math.min(ally.maxHp, ally.hp + recover);
    message = `${ally.displayName} 穩住節奏，回復 ${recover} HP。`;
  } else if (action === "switch") {
    const nextAllyIndex = findNextAliveAllyIndex();
    if (nextAllyIndex === -1 || nextAllyIndex === gymBattleState.activeAllyIndex) {
      gymMsg.textContent = "沒有可替換的夥伴了。";
      return;
    }
    gymBattleState.activeAllyIndex = nextAllyIndex;
    message = `你換上了 ${gymBattleState.playerTeam[nextAllyIndex].displayName}！`;
  }

  updateGymHud();

  if (enemy.hp <= 0) {
    const foeExp = Math.round(enemy.level * 14);
    const expMessage = gainDragoniteExp(foeExp);
    const freshDragonite = getDragoniteSnapshot();
    if (freshDragonite) {
      const dragoniteAlly = gymBattleState.playerTeam.find((member) => member.slotType === "dragonite");
      if (dragoniteAlly) {
        const existingHp = Math.max(1, Math.round(dragoniteAlly.hp));
        dragoniteAlly.level = freshDragonite.level;
        dragoniteAlly.maxHp = freshDragonite.maxHp;
        dragoniteAlly.hp = clamp(existingHp, 1, freshDragonite.maxHp);
        dragoniteAlly.attack = freshDragonite.attack;
        dragoniteAlly.defense = freshDragonite.defense;
      }
    }
    persistGymPlayerTeam(gymBattleState.playerTeam);
    gymMsg.textContent = `${message}\n${enemy.species} 倒下了！${expMessage}`;
    nextGymEnemy();
    return;
  }

  const currentAlly = gymBattleState.playerTeam[gymBattleState.activeAllyIndex];
  const enemyPower = gym.enemyPower ?? 15;
  const enemyMultiplier = gym.enemyMultiplier ?? 1;
  const enemyDamage = calcBattleDamage(enemy, currentAlly, enemyPower, enemyMultiplier);
  currentAlly.hp = Math.max(0, currentAlly.hp - enemyDamage);
  updateGymHud();
  message += `\n${enemy.species} 反擊造成 ${enemyDamage} 點傷害！`;

  if (currentAlly.hp <= 0) {
    const nextAllyIndex = findNextAliveAllyIndex();
    if (nextAllyIndex === -1 || gymBattleState.playerTeam[nextAllyIndex].hp <= 0) {
      persistGymPlayerTeam(gymBattleState.playerTeam);
      finishGymBattle(
        `${message}\n你的夥伴全數失去戰鬥能力，這次挑戰失敗了。`,
        "挑戰失敗，先練等再回來挑戰吧。",
      );
      return;
    }
    gymBattleState.activeAllyIndex = nextAllyIndex;
    message += `\n${currentAlly.displayName} 倒下了，你換上 ${gymBattleState.playerTeam[nextAllyIndex].displayName}！`;
  }

  persistGymPlayerTeam(gymBattleState.playerTeam);
  gymMsg.textContent = message;
}

function startGymBattle(landmark) {
  const gym = gymConfigs[landmark.id];
  if (!gym) {
    setMapStatus("這座道館尚未開放挑戰。");
    return;
  }

  const data = readGameData();
  if (!data) {
    return;
  }
  ensureDragoniteState(data);
  const badges = data.progress?.badges ?? 0;
  const gymWins = data.progress?.gymWins ?? {};

  if (gymWins[landmark.id]) {
    setMapStatus(`你已經拿過 ${gym.badgeName}，可以前往下一間道館。`);
    return;
  }
  if (Number.isFinite(gym.requiredBadges) && badges < gym.requiredBadges) {
    setMapStatus(`需要先拿到 ${gym.requiredBadges} 枚徽章，才能挑戰 ${gym.leader}。`);
    return;
  }

  ensurePartyState(data);
  saveGameData(data);

  const playerTeam = buildGymPlayerTeam(data);
  const firstAliveIndex = playerTeam.findIndex((allyEntry) => allyEntry.hp > 0);

  gymBattleState = {
    landmark,
    gym,
    enemyIndex: 0,
    playerTeam,
    activeAllyIndex: firstAliveIndex === -1 ? 0 : firstAliveIndex,
    enemy: createGymEnemy(gym.team[0], gym.type),
  };
  gymActionIndex = 0;

  gymTag.textContent = `館主：${gym.leader}`;
  gymTitle.textContent = `${landmark.name}・${gym.typeLabel}系道館`;
  gymStatus.textContent = `建議等級 Lv.${gym.recommendedLevel} 左右・可用夥伴 ${playerTeam.length} 隻`;
  gymMsg.textContent = `${gym.leader} 接受挑戰！對手屬性：${gym.typeLabel}系。`;
  setGymButtons(true);
  renderGymActionSelection();
  updateGymHud();
  setSceneVisibility("gym");
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

const ENCOUNTER_PANEL_RANGE = 300;

function updateEncounterPanel() {
  const nearby = activeWildPokemon
    .map((pokemon) => ({ pokemon, dist: getDistance(playerPosition, pokemon) }))
    .filter((entry) => entry.dist <= ENCOUNTER_PANEL_RANGE)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3)
    .map((entry) => entry.pokemon);

  const cards = nearby.map((p) => ({ name: p.species, sprite: p.sprite }));

  if (cards.length === 0) {
    renderEncounterCards([], "附近沒有發現寶可夢");
    return;
  }
  renderEncounterCards(cards, `附近夥伴（${cards.length} 隻）`);
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
    updateWildPokemonHighlight();

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
  const showEncounter = target === "encounter";
  const showGym = target === "gym";

  menuScene.classList.toggle("is-hidden", !showMenu);
  storyScene.classList.toggle("is-hidden", !showStory);
  mapScene.classList.toggle("is-hidden", !showMap);
  encounterScene.classList.toggle("is-hidden", !showEncounter);
  gymScene.classList.toggle("is-hidden", !showGym);
  storyScene.setAttribute("aria-hidden", String(!showStory));
  mapScene.setAttribute("aria-hidden", String(!showMap));
  encounterScene.setAttribute("aria-hidden", String(!showEncounter));
  gymScene.setAttribute("aria-hidden", String(!showGym));
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
  populateWildPokemon();
  renderWildPokemonOnMap();
  renderPlayerAndCamera();
  updateMapHud();
  setMapStatus(initialMessage ?? buildLocationMessage(playerPosition));
  updateEncounterPanel();
  updateWildPokemonHighlight();
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

  ensureDragoniteState(data);
  saveGameData(data);
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
  const currentLandmark = getCurrentLandmark(playerPosition);
  if (currentLandmark?.type === "gym") {
    startGymBattle(currentLandmark);
    return;
  }
  if (nearbyPokemon) {
    interactWithPokemon(nearbyPokemon);
    return;
  }
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

  if (currentScene === "encounter") {
    event.preventDefault();
    if (!encounterState || encounterState.ended) return;

    if (event.key === "1" || event.key === "2" || event.key === "3" || event.key === "4") {
      const actions = ["friend", "snack", "observe", "run"];
      encActionIndex = Number(event.key) - 1;
      renderEncActionSelection();
      performEncounterAction(actions[encActionIndex]);
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      encActionIndex = (encActionIndex - 1 + encButtons.length) % encButtons.length;
      renderEncActionSelection();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      encActionIndex = (encActionIndex + 1) % encButtons.length;
      renderEncActionSelection();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      const action = encButtons[encActionIndex].dataset.enc;
      performEncounterAction(action);
    }
    return;
  }

  if (currentScene === "gym") {
    event.preventDefault();
    if (!gymBattleState) return;

    if (event.key === "1" || event.key === "2" || event.key === "3" || event.key === "4" || event.key === "5") {
      const actions = ["claw", "thunder", "heal", "retreat", "switch"];
      gymActionIndex = Number(event.key) - 1;
      renderGymActionSelection();
      performGymAction(actions[gymActionIndex]);
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      gymActionIndex = (gymActionIndex - 1 + gymButtons.length) % gymButtons.length;
      renderGymActionSelection();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      gymActionIndex = (gymActionIndex + 1) % gymButtons.length;
      renderGymActionSelection();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      const action = gymButtons[gymActionIndex].dataset.gym;
      performGymAction(action);
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

encButtons.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    if (!encounterState || encounterState.ended) return;
    encActionIndex = index;
    renderEncActionSelection();
    performEncounterAction(btn.dataset.enc);
  });
});

gymButtons.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    if (!gymBattleState) return;
    gymActionIndex = index;
    renderGymActionSelection();
    performGymAction(btn.dataset.gym);
  });
});

buildWorldObjects();
loadDragoniteSprite();

if (!hasSaveData()) {
  setStatus("↑↓ 選擇　Enter 確認");
}

setSceneVisibility("menu");
renderMenuSelection();
