const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 50;
let dx = 2;
let dy = -2;
let ballSpeed = 2; // Base ball speed now 2 for level 1

const paddleHeight = 20;
const paddleWidth = 100; // Increased paddle width
let paddleX = (canvas.width - paddleWidth) / 2;
const paddleBottomY = canvas.height - paddleHeight - 10;

let rightPressed = false;
let leftPressed = false;

let brickRowCount = 5;
let brickColumnCount = 10;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 2; // Reduced brick padding
const brickOffsetTop = 50;
const brickOffsetLeft = (canvas.width - (brickColumnCount * (brickWidth + brickPadding) - brickPadding)) / 2;

let score = 0;
let lives = 5; // Changed to 5 lives
let level = 1;
let gameStarted = false;
let countdown = 3;
let bricksRemaining = brickRowCount * brickColumnCount;
let gameOverFlag = false; // Flag to indicate game over
let gamePaused = false; // Flag to indicate game paused
let gameStopped = false; // Flag to indicate game stopped

let bricks = [];

function initBricks() {
  bricks = [];
  bricksRemaining = brickRowCount * brickColumnCount;
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}

initBricks();

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);

function keyDownHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightPressed = true;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftPressed = false;
  } else if (!gameStarted && !gameOverFlag && !gamePaused && !gameStopped && (e.key === ' ' || e.key === 'Space' || e.key === 'Escape' || e.key === 'Esc')) {
    startGame();
  } else if (gameOverFlag && (e.key === ' ' || e.key === 'Space' || e.key === 'Escape' || e.key === 'Esc')) {
    resetGame(); // Reset and restart game on space or escape after game over
  }  else if ((e.key === 'Escape' || e.key === 'Esc') ) {
    if (gamePaused) {
      togglePauseGame(); // Resume game if paused
    } else if (gameStarted && !gameOverFlag && !gameStopped && !gamePaused) {
      togglePauseGame(); // Pause/Unpause game on Escape key
    } else if (!gameStarted && !gameOverFlag) {
      startGame(); // Start game if stopped or before game start
    }
  } else if ((e.key === ' ' || e.key === 'Space')) {
    if (gamePaused) {
      togglePauseGame(); // Resume game if paused
    } else if (gameStarted && !gameOverFlag && !gameStopped && !gamePaused) {
      togglePauseGame(); // Pause/Unpause game on Space key
    }
  }
}

function keyUpHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightPressed = false;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftPressed = false;
  }
}

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          bricksRemaining--;
          if (bricksRemaining === 0) {
            levelUp();
          }
        }
      }
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#0095DD';
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  const curveRadius = paddleWidth / 1.5; // Increased curve radius

  ctx.beginPath();

  // Left curve
  ctx.arc(paddleX + curveRadius, paddleBottomY + curveRadius, curveRadius, Math.PI, 0);

  // Right curve
  ctx.arc(paddleX + paddleWidth - curveRadius, paddleBottomY + curveRadius, curveRadius, 0, Math.PI);

  ctx.lineTo(paddleX + paddleWidth, paddleBottomY + paddleHeight);
  ctx.lineTo(paddleX, paddleBottomY + paddleHeight);
  ctx.closePath();


  ctx.fillStyle = '#0095DD';
  ctx.fill();
}


function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = '#0095DD';
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawScore() {
  ctx.font = '16px Arial';
  ctx.fillStyle = '#0095DD';
  ctx.fillText('Score: ' + score, 8, 20);
}

function drawLives() {
  ctx.font = '16px Arial';
  ctx.fillStyle = '#0095DD';
  ctx.fillText('Lives: ' + lives, canvas.width - 65, 20);
}

function drawLevel() {
  ctx.font = '16px Arial';
  ctx.fillStyle = '#0095DD';
  ctx.fillText('Level: ' + level, canvas.width / 2 - 30, 20);
}

function drawCountdown() {
  if (countdown > 0) {
    ctx.font = '48px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.textAlign = 'center';
    ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);
    ctx.textAlign = 'start';
  }
}

function resetBallPaddle() {
  paddleX = (canvas.width - paddleWidth) / 2; // Paddle reset to center
  x = paddleX + paddleWidth / 2; // Ball starts centered on paddle
  y = paddleBottomY - ballRadius;
  ballSpeed = 2 + (level - 1) * 0.1; // Speed increments by 0.1 per level, starting at 2
  dx = ballSpeed;
  dy = -ballSpeed;
}

function levelUp() {
  level++;
  brickRowCount += 1;
  if (brickRowCount > 10) brickRowCount = 10;
  initBricks();
  resetBallPaddle();
  gameStarted = false;
  countdown = 3;
  clearInterval(gameInterval);
  gameInterval = setInterval(updateCountdown, 1000);
}

function startGame() {
  if (!gameStarted && !gamePaused && !gameStopped) { //Game can't start if paused or stopped
    gameStarted = true;
    gameStopped = false; // Reset gameStopped flag when starting a new game
    clearInterval(gameInterval);
  } else if (gamePaused) {
    gamePaused = false; //Unpause if game was paused
  }
}

function updateCountdown() {
  countdown--;
  if (countdown <= 0) {
    clearInterval(gameInterval);
    startGame();
  }
}

function gameOver() {
  gameOverFlag = true; // Set game over flag
  gameStarted = false;
  gamePaused = false; // Game is not paused on game over
  gameStopped = false; // Game is not stopped on game over
  clearInterval(gameInterval); // Stop countdown if running
}

function resetGame() {
  gameOverFlag = false;
  gamePaused = false;
  gameStopped = false;
  level = 1;
  score = 0;
  lives = 5;
  ballSpeed = 2; // Reset ballSpeed to base speed for level 1 (2)
  brickRowCount = 5;
  brickColumnCount = 10;
  initBricks();
  resetBallPaddle();
  countdown = 3;
  gameInterval = setInterval(updateCountdown, 1000);
}

function togglePauseGame() {
  gamePaused = !gamePaused;
}

function stopGame() {
  gameStopped = true;
  gamePaused = false; // Ensure game is unpaused when stopped
  gameStarted = false; // Stop ball movement
  clearInterval(gameInterval); // Stop countdown if running
}


function drawGameOver() {
  ctx.font = '30px Arial';
  ctx.fillStyle = '#0095DD';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 40);
  ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 );
  ctx.font = '16px Arial';
  ctx.fillText('Press SPACE or ESC to play again', canvas.width / 2, canvas.height / 2 + 40);
  ctx.textAlign = 'start';
}

function drawPauseScreen() {
  ctx.font = '30px Arial';
  ctx.fillStyle = 'rgba(0, 149, 221, 0.75)'; // Slightly transparent blue
  ctx.textAlign = 'center';
  ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
  ctx.font = '16px Arial';
  ctx.fillText('Press ESC or SPACE to continue', canvas.width / 2, canvas.height / 2 + 40);
  ctx.textAlign = 'start';
}

function drawStopScreen() {
  ctx.font = '30px Arial';
  ctx.fillStyle = 'rgba(0, 149, 221, 0.75)'; // Slightly transparent blue
  ctx.textAlign = 'center';
  ctx.fillText('Game Stopped', canvas.width / 2, canvas.height / 2);
  ctx.font = '16px Arial';
  ctx.fillText('Press SPACE or ESC to play', canvas.width / 2, canvas.height / 2 + 40);

  ctx.textAlign = 'start';
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
  drawLevel();
  if (!gameStarted && !gameOverFlag && !gamePaused && !gameStopped) {
    drawCountdown();
  }

  if (gameOverFlag) {
    drawGameOver(); // Draw game over screen
    return; // Stop game loop if game is over
  }

  if (gamePaused) {
    drawPauseScreen(); // Draw pause screen
    return; // Stop game loop if game is paused
  }

  if (gameStopped) {
    drawStopScreen(); // Draw stop screen
    return; // Stop game loop if game is stopped
  }


  collisionDetection();

  // Paddle movement always active
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }


  if (gameStarted && !gamePaused && !gameStopped) { // Only update game elements if not paused or stopped
    x += dx; // Ball moves only when gameStarted is true
    y += dy;

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
      dx = -dx;
    }
    if (y + dy < ballRadius) {
      dy = -dy;
    } else if (y + dy > canvas.height - ballRadius - 10 ) { // Detect ball hitting bottom of curved paddle

      if (x > paddleX && x < paddleX + paddleWidth) {
        let paddleCenter = paddleX + paddleWidth / 2;
        let collisionPoint = x - paddleCenter;
        let normalizedCollisionPoint = collisionPoint / (paddleWidth / 2);
        let bounceAngle = normalizedCollisionPoint * Math.PI / 2; // Adjusted bounce angle

        dx = ballSpeed * Math.sin(bounceAngle); // Use ballSpeed
        dy = -ballSpeed * Math.cos(bounceAngle); // keep speed consistent

      } else {
        lives--;
        if (!lives) {
          gameOver();
        } else {
          resetBallPaddle();
          gameStarted = false;
          countdown = 3;
          clearInterval(gameInterval);
          gameInterval = setInterval(updateCountdown, 1000);
        }
      }
    }
  } else {
    x = paddleX + paddleWidth / 2; // Ball follows paddle during countdown
    y = paddleBottomY - ballRadius;
  }


  requestAnimationFrame(draw);
}

let gameInterval = setInterval(updateCountdown, 1000);
draw();
