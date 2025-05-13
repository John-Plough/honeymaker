// game.js
import { API_BASE } from "./config.js";

// ─── Configuration ────────────────────────────────────────────────────────────

// ─── API Helper ───────────────────────────────────────────────────────────────

async function submitScore(scoreValue) {
  try {
    const resp = await fetch(`${API_BASE}/scores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: needed for cookies
      body: JSON.stringify({ score: { value: scoreValue } }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("Failed to save score", data.error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error saving score:", error);
    return null;
  }
}

// ─── Canvas Setup ────────────────────────────────────────────────────────────

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
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

let snake = null,
  food = null,
  dx = 0,
  dy = 0,
  score = 0,
  gameInterval = null,
  gameSpeed = 200,
  gameRunning = false,
  gameStarted = false;

// ─── Image Loader ────────────────────────────────────────────────────────────

let loadedImages = 0,
  totalImages = Object.keys(flowerImages).length + 2,
  allImagesLoaded = false;

function checkAllImagesLoaded() {
  loadedImages++;
  if (loadedImages === totalImages) {
    allImagesLoaded = true;
    initGame();
    draw();
  }
}

Object.values(flowerImages).forEach((img) => (img.onload = checkAllImagesLoaded));
beeImage.onload = checkAllImagesLoaded;
potImage.onload = checkAllImagesLoaded;

// ─── Game Initialization ──────────────────────────────────────────────────────

function initGame() {
  // Place bee in the middle of the board
  snake = [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }];
  food = null; // Don't generate food until first move
  dx = dy = 0;
  score = 0;
  scoreElement.textContent = score;
  gameRunning = true;
  gameStarted = false;
  draw(); // Draw initial state
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
  if (!allImagesLoaded || !snake) return;

  // Clear the canvas
  ctx.fillStyle = "#d7eeee";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake (bee and honey pots)
  snake.forEach((seg, i) => {
    if (i === 0) drawBee(seg.x, seg.y);
    else drawHoneyPot(seg.x, seg.y);
  });

  // Draw food (flower) if it exists
  if (food) {
    drawFlower(food.x, food.y, food.color);
  }
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
  // Check if it's an arrow key
  if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    return;
  }

  // Prevent default browser scrolling behavior for arrow keys
  e.preventDefault();

  // If game is over, restart on any arrow key
  if (!gameRunning) {
    modal.classList.remove("show");
    initGame();
    return;
  }

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
  }

  // Generate first food and start game loop on first valid key press
  if (!gameStarted) {
    gameStarted = true;
    food = generateFood();
    gameInterval = setInterval(gameLoop, gameSpeed);
  }
  [dx, dy] = [newDx, newDy];
}

// ─── Game Over Handler ─────────────────────────────────────────────────────

function gameOver() {
  gameRunning = false;
  clearInterval(gameInterval);
  finalScoreElement.textContent = `You created ${score} pots of honey!`;

  // Send final score to backend
  submitScore(score);

  modal.classList.add("show");
}

// ─── Modal Close ────────────────────────────────────────────────────────────

function closeModal() {
  modal.classList.remove("show");
  initGame();
}

function justCloseModal() {
  modal.classList.remove("show");
}

// ─── Event Listeners & Initial Draw ────────────────────────────────────────

document.addEventListener("keydown", handleKeyPress);
closeModalButton.addEventListener("click", closeModal);
document.getElementById("closeGameOverModal").addEventListener("click", justCloseModal);

// Initialize game on page load
initGame();
draw();
