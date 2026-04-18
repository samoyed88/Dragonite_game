const SAVE_KEY = "dragonite-game-save";
const menuItems = Array.from(document.querySelectorAll(".menu-item"));
const statusText = document.getElementById("statusText");
let selectedIndex = 0;

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
  setStatus("新遊戲已開始！第一站：尼比道館");
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

document.addEventListener("keydown", (event) => {
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

if (!hasSaveData()) {
  setStatus("↑↓ 選擇　Enter 確認");
}

renderMenuSelection();
