const SAVE_KEY = "dragonite-game-save";
const menuItems = Array.from(document.querySelectorAll(".menu-item"));
const statusText = document.getElementById("statusText");
const menuScene = document.getElementById("menuScene");
const storyScene = document.getElementById("storyScene");
const storyTitle = document.getElementById("storyTitle");
const storyText = document.getElementById("storyText");

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

let selectedIndex = 0;
let storyIndex = 0;
let isStoryPlaying = false;

function hasSaveData() {
  return Boolean(localStorage.getItem(SAVE_KEY));
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
    updatedAt: new Date().toISOString(),
  };
}

function startNewGame() {
  const gameData = createNewGameData();
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameData));
  startOpeningStory();
}

function loadGame() {
  const rawData = localStorage.getItem(SAVE_KEY);
  if (!rawData) {
    setStatus("沒有找到存檔，請先開始新遊戲。");
    return;
  }

  const data = JSON.parse(rawData);
  const badges = data?.progress?.badges ?? 0;
  setStatus(`讀取成功！目前徽章數：${badges} / 8`);
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
  menuScene.classList.toggle("is-hidden", !showMenu);
  storyScene.classList.toggle("is-hidden", showMenu);
  storyScene.setAttribute("aria-hidden", String(showMenu));
}

function renderStoryLine() {
  const current = openingStory[storyIndex];
  storyTitle.textContent = current.title;
  storyText.textContent = current.text;
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
    setSceneVisibility("menu");
    setStatus("旅程開始！目標：八道館 → 四天王 → 冠軍");
    renderMenuSelection();
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

if (!hasSaveData()) {
  setStatus("↑↓ 選擇　Enter 確認");
}

setSceneVisibility("menu");
renderMenuSelection();
