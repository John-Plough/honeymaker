// game.js

// ─── Configuration ────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:3000"; // change this to your deployed API URL

// ─── API Helper ───────────────────────────────────────────────────────────────

async function submitScore(scoreValue) {
  const token = localStorage.getItem("snakeToken");
  const resp = await fetch(`${API_BASE}/scores.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ value: scoreValue }),
  });

  if (!resp.ok) {
    console.error("Failed to save score", await resp.text());
  }
  return resp.json();
}

// ─── Canvas Setup ────────────────────────────────────────────────────────────

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const scoreElement = document.getElementById("score");
const modal = document.getElementById("gameOverModal");
const finalScoreElement = document.getElementById("finalScore");
const closeModalButton = document.getElementById("closeModal");

canvas.width = 450; // 15 cols × 30px
canvas.height = 510; // 17 rows × 30px

// ─── Game Constants & Assets ─────────────────────────────────────────────────

const gridWidth = 15,
  gridHeight = 17,
  tileSize = 30;

const flowerColors = ["blue", "green", "lavender", "pink", "purple", "turquoise", "yellow"];
const flowerImages = {},
  beeImage = new Image(),
  potImage = new Image();

beeImage.src = "images/bee.png";
potImage.src = "images/pot1.png";

flowerColors.forEach((color) => {
  flowerImages[color] = new Image();
  flowerImages[color].src = `images/${color}.png`;
});

// ─── Game State ──────────────────────────────────────────────────────────────

let snake,
  food,
  dx,
  dy,
  score,
  gameInterval,
  gameSpeed = 200,
  gameRunning,
  gameStarted;

// ─── Image Loader ────────────────────────────────────────────────────────────

let loadedImages = 0,
  totalImages = Object.keys(flowerImages).length + 2;
function checkAllImagesLoaded() {
  loadedImages++;
  if (loadedImages === totalImages) draw();
}

Object.values(flowerImages).forEach((img) => (img.onload = checkAllImagesLoaded));
beeImage.onload = checkAllImagesLoaded;
potImage.onload = checkAllImagesLoaded;

// ─── Game Initialization ──────────────────────────────────────────────────────

function initGame() {
  snake = [{ x: 7, y: 8 }];
  food = { x: 12, y: 8, color: "pink" };
  dx = dy = 0;
  score = 0;
  scoreElement.textContent = score;
  gameRunning = true;
  gameStarted = false;
}

function startGame() {
  clearInterval(gameInterval);
  initGame();
  startButton.textContent = "Restart";
}

// ─── Food Generation ─────────────────────────────────────────────────────────

function generateFood() {
  let f;
  do {
    f = {
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight),
      color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
    };
  } while (snake.some((seg) => seg.x === f.x && seg.y === f.y));
  return f;
}

// ─── Drawing Helpers ─────────────────────────────────────────────────────────

function drawFlower(x, y, color) {
  ctx.drawImage(flowerImages[color], x * tileSize, y * tileSize, tileSize, tileSize);
}
function drawBee(x, y) {
  ctx.drawImage(beeImage, x * tileSize, y * tileSize, tileSize, tileSize);
}
function drawHoneyPot(x, y) {
  ctx.drawImage(potImage, x * tileSize, y * tileSize, tileSize, tileSize);
}

// ─── Main Draw ──────────────────────────────────────────────────────────────

function draw() {
  ctx.fillStyle = "#B2E6FF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  snake.forEach((seg, i) => {
    if (i === 0) drawBee(seg.x, seg.y);
    else drawHoneyPot(seg.x, seg.y);
  });

  drawFlower(food.x, food.y, food.color);
}

// ─── Game Update ────────────────────────────────────────────────────────────

function update() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Wall collision
  if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
    gameOver();
    return;
  }
  // Self collision
  if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreElement.textContent = score;
    food = generateFood();
  } else {
    snake.pop();
  }
}

// ─── Game Loop & Input ─────────────────────────────────────────────────────

function gameLoop() {
  if (!gameRunning) return;
  update();
  draw();
}

function handleKeyPress(e) {
  if (!gameRunning) return;
  let [newDx, newDy] = [dx, dy];

  switch (e.key) {
    case "ArrowUp":
      if (dy !== 1) [newDx, newDy] = [0, -1];
      break;
    case "ArrowDown":
      if (dy !== -1) [newDx, newDy] = [0, 1];
      break;
    case "ArrowLeft":
      if (dx !== 1) [newDx, newDy] = [-1, 0];
      break;
    case "ArrowRight":
      if (dx !== -1) [newDx, newDy] = [1, 0];
      break;
    default:
      return;
  }

  if (!gameStarted) {
    gameStarted = true;
    gameInterval = setInterval(gameLoop, gameSpeed);
  }
  [dx, dy] = [newDx, newDy];
}

// ─── Game Over Handler ─────────────────────────────────────────────────────

function gameOver() {
  gameRunning = false;
  clearInterval(gameInterval);
  startButton.textContent = "Play Again";
  finalScoreElement.textContent = `You created ${score} pots of honey!`;

  // Send final score to backend
  submitScore(score).catch(console.error);

  modal.classList.add("show");
}

// ─── Modal Close ────────────────────────────────────────────────────────────

function closeModal() {
  modal.classList.remove("show");
  startGame();
}

// ─── Event Listeners & Initial Draw ────────────────────────────────────────

document.addEventListener("keydown", handleKeyPress);
startButton.addEventListener("click", startGame);
closeModalButton.addEventListener("click", closeModal);

draw();
