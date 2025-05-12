const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const scoreElement = document.getElementById("score");
const modal = document.getElementById("gameOverModal");
const finalScoreElement = document.getElementById("finalScore");
const closeModalButton = document.getElementById("closeModal");

// Set canvas size
canvas.width = 450; // 15 columns * 30 pixels
canvas.height = 510; // 17 rows * 30 pixels

// Game constants
const gridWidth = 15; // 15 columns
const gridHeight = 17; // 17 rows
const tileSize = 30; // Each square is 30x30 pixels

// Load flower images, bee image, and honey pot image
const flowerImages = {
  blue: new Image(),
  green: new Image(),
  lavender: new Image(),
  pink: new Image(),
  purple: new Image(),
  turquoise: new Image(),
  yellow: new Image(),
};

const beeImage = new Image();
const potImage = new Image();

beeImage.src = "images/bee.png";
potImage.src = "images/pot1.png";

flowerImages.blue.src = "images/blue.png";
flowerImages.green.src = "images/green.png";
flowerImages.lavender.src = "images/lavender.png";
flowerImages.pink.src = "images/pink.png";
flowerImages.purple.src = "images/purple.png";
flowerImages.turquoise.src = "images/turquoise.png";
flowerImages.yellow.src = "images/yellow.png";

const flowerColors = ["blue", "green", "lavender", "pink", "purple", "turquoise", "yellow"];

// Game variables
let snake = [{ x: 7, y: 8 }]; // Start in middle
let food = { x: 12, y: 8, color: "pink" };
let dx = 0;
let dy = 0;
let score = 0;
let gameInterval;
let gameSpeed = 200; // Increased from 100 to 200 milliseconds (slower speed)
let gameRunning = false;
let gameStarted = false;

// Make sure all images are loaded before starting
let loadedImages = 0;
const totalImages = Object.keys(flowerImages).length + 2; // +2 for bee and pot images

function checkAllImagesLoaded() {
  loadedImages++;
  if (loadedImages === totalImages) {
    // Initial draw once all images are loaded
    draw();
  }
}

Object.values(flowerImages).forEach((img) => {
  img.onload = checkAllImagesLoaded;
});

beeImage.onload = checkAllImagesLoaded;
potImage.onload = checkAllImagesLoaded;

// Initialize game
function initGame() {
  snake = [{ x: 7, y: 8 }];
  // Set initial food at a fixed position
  food = { x: 12, y: 8, color: "pink" };
  dx = 0;
  dy = 0;
  score = 0;
  scoreElement.textContent = score;
  gameRunning = true;
  gameStarted = false;
}

// Generate random food position
function generateFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight),
      color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
    };
  } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
  return newFood;
}

// Draw flower function
function drawFlower(x, y, color) {
  const centerX = x * tileSize;
  const centerY = y * tileSize;
  ctx.drawImage(flowerImages[color], centerX, centerY, tileSize, tileSize);
}

// Draw bee function
function drawBee(x, y) {
  const centerX = x * tileSize;
  const centerY = y * tileSize;
  ctx.drawImage(beeImage, centerX, centerY, tileSize, tileSize);
}

// Draw honey pot function
function drawHoneyPot(x, y) {
  const centerX = x * tileSize;
  const centerY = y * tileSize;
  ctx.drawImage(potImage, centerX, centerY, tileSize, tileSize);
}

// Draw game elements
function draw() {
  // Clear canvas with light blue background
  ctx.fillStyle = "#B2E6FF"; // Light sky blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  snake.forEach((segment, index) => {
    if (index === 0) {
      // Draw bee head
      drawBee(segment.x, segment.y);
    } else {
      // Draw honey pot for body segments
      drawHoneyPot(segment.x, segment.y);
    }
  });

  // Draw flower food
  drawFlower(food.x, food.y, food.color);
}

// Update game state
function update() {
  // Move snake
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Check for collisions with walls
  if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
    gameOver();
    return;
  }

  // Check for collisions with self
  if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    gameOver();
    return;
  }

  // Add new head
  snake.unshift(head);

  // Check if food is eaten
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = score;
    food = generateFood();
  } else {
    snake.pop();
  }
}

// Game loop
function gameLoop() {
  if (!gameRunning) return;
  update();
  draw();
}

// Handle keyboard input
function handleKeyPress(e) {
  if (!gameRunning) return;

  let newDx = dx;
  let newDy = dy;

  switch (e.key) {
    case "ArrowUp":
      if (dy === 1) return; // Prevent moving in opposite direction
      newDx = 0;
      newDy = -1;
      break;
    case "ArrowDown":
      if (dy === -1) return;
      newDx = 0;
      newDy = 1;
      break;
    case "ArrowLeft":
      if (dx === 1) return;
      newDx = -1;
      newDy = 0;
      break;
    case "ArrowRight":
      if (dx === -1) return;
      newDx = 1;
      newDy = 0;
      break;
    default:
      return; // Ignore other keys
  }

  // Only start the game interval if it hasn't started yet
  if (!gameStarted) {
    gameStarted = true;
    gameInterval = setInterval(gameLoop, gameSpeed);
  }

  dx = newDx;
  dy = newDy;
}

// Game over function
function gameOver() {
  gameRunning = false;
  clearInterval(gameInterval);
  startButton.textContent = "Play Again";
  finalScoreElement.textContent = `You created ${score} pots of honey!`;
  modal.classList.add("show");
}

// Close modal and restart game
function closeModal() {
  modal.classList.remove("show");
  startGame();
}

// Start game
function startGame() {
  if (gameInterval) {
    clearInterval(gameInterval);
  }
  initGame();
  startButton.textContent = "Restart";
}

// Event listeners
document.addEventListener("keydown", handleKeyPress);
startButton.addEventListener("click", startGame);
closeModalButton.addEventListener("click", closeModal);

// Initial draw
draw();
